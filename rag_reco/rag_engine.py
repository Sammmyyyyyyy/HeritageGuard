# rag_engine.py
import os
from typing import List
from pathlib import Path
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate

# Explicitly load .env from rag_reco directory
_env_path = Path(__file__).resolve().parent / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path, override=True)
else:
    load_dotenv()

# --- Pydantic Schemas for Structured Output ---
class SourceCitation(BaseModel):
    file_name: str = Field(description="The name of the source file (e.g., heritage_guide.pdf)")
    page: int = Field(description="The page number where the fact was found")

class RAGResponse(BaseModel):
    answer: str = Field(description="The factual answer to the question in the requested language")
    sources: List[SourceCitation] = Field(description="List of sources used")

# --- Lazy Singletons for Memory & Startup Optimization ---
_embeddings = None
_vector_db = None
_llm = None
_structured_llm = None


def get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"}
        )
    return _embeddings


def get_vector_db():
    global _vector_db
    if _vector_db is None:
        base_dir = Path(__file__).resolve().parent
        candidate_dirs = [
            base_dir / "chroma_db",
            Path.cwd() / "chroma_db",
            Path.cwd() / "rag_reco" / "chroma_db",
        ]
        db_dir = None
        for d in candidate_dirs:
            if d.exists() and d.is_dir() and any(d.iterdir()):
                db_dir = str(d)
                break
                
        if not db_dir:
            raise RuntimeError("ChromaDB not found. Please ensure the pre-built chroma_db directory is deployed.")
            
        _vector_db = Chroma(
            persist_directory=db_dir,
            embedding_function=get_embeddings()
        )
    return _vector_db


def get_llm():
    global _llm
    if _llm is None:
        api_key = (
            os.getenv("GEMINI_API_KEY")
            or os.getenv("OPENAI_API_KEY")
            or os.getenv("GOOGLE_API_KEY")
        )
        base_url = os.getenv("OPENAI_API_BASE")
        model_name = os.getenv("OPENAI_MODEL", "google/gemini-2.5-flash")

        _llm = ChatOpenAI(
            model=model_name,
            temperature=0.1,
            max_tokens=450,
            base_url=base_url if base_url else None,
            api_key=api_key
        )
    return _llm


def ask_heritage_question(site_id: str, question: str, language: str = "English"):
    """
    Ultra-fast, accurate RAG execution across heritage sites using direct vector retrieval and single-hop LLM answering.
    """
    try:
        llm = get_llm()
        vector_db = get_vector_db()

        # Normalize site_id
        clean_site_id = site_id.strip().upper() if site_id else ""
        is_hindi = bool(language and language.lower().startswith("hi"))
        no_info_message = "ऐतिहासिक अभिलेखों में यह जानकारी उपलब्ध नहीं है।" if is_hindi else "The historical records do not contain this information."

        # Vector similarity search (Hybrid semantic + site-filtered retrieval)
        docs = []
        seen_contents = set()

        # 1. Semantic search across database
        try:
            semantic_docs = vector_db.similarity_search(
                query=question,
                k=4
            )
            for d in semantic_docs:
                if d.page_content not in seen_contents:
                    seen_contents.add(d.page_content)
                    docs.append(d)
        except Exception as se:
            print(f"Semantic search failed: {se}")

        # 2. Site-filtered search if site_id provided
        if clean_site_id and clean_site_id not in ["ALL", "DEFAULT_SITE", "NONE"]:
            try:
                filtered_docs = vector_db.similarity_search(
                    query=question,
                    k=3,
                    filter={"site_id": clean_site_id}
                )
                for d in filtered_docs:
                    if d.page_content not in seen_contents:
                        seen_contents.add(d.page_content)
                        docs.append(d)
            except Exception:
                pass

        if not docs:
            return {
                "site_id": site_id,
                "answer": no_info_message,
                "language": language,
                "sources": []
            }

        # Format retrieved context
        formatted_context = ""
        sources = []
        for d in docs:
            filename = d.metadata.get('file_name', 'heritage_guide.pdf')
            page = d.metadata.get('page', 1)
            sources.append({"file_name": filename, "page": page})
            formatted_context += f"- Source: {filename} (Page {page}): {d.page_content}\n"

        # Direct, fast single-hop prompt
        prompt = f"""You are HeritageGuard AI, an authoritative multilingual heritage guide.
Context Records:
{formatted_context}

Question: {question}

Instructions:
1. Answer the question factually, clearly, and concisely in {language} based on the Context Records above.
2. If the Context Records do NOT contain the answer, reply EXACTLY with: "{no_info_message}"."""

        res = llm.invoke(prompt)
        answer_text = res.content if hasattr(res, 'content') else str(res)
        answer_text = answer_text.strip()

        return {
            "site_id": site_id,
            "answer": answer_text,
            "language": language,
            "sources": sources[:2]
        }

    except Exception as e:
        print(f"Error during RAG: {e}")
        is_hindi = bool(language and language.lower().startswith("hi"))
        return {
            "site_id": site_id,
            "answer": "ऐतिहासिक अभिलेखों में यह जानकारी उपलब्ध नहीं है।" if is_hindi else "The historical records do not contain this information.",
            "language": language,
            "sources": []
        }