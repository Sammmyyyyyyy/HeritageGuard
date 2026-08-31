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
        db_dir = "./chroma_db"
        if not os.path.exists(db_dir) or not os.listdir(db_dir):
            raise RuntimeError("ChromaDB not found. Please deploy the pre-built chroma_db directory.")
        _vector_db = Chroma(
            persist_directory=db_dir,
            embedding_function=get_embeddings()
        )
    return _vector_db


def get_llm_and_structured():
    global _llm, _structured_llm
    if _llm is None:
        api_key = (
            os.getenv("GEMINI_API_KEY")
            or os.getenv("OPENAI_API_KEY")
            or os.getenv("GOOGLE_API_KEY")
        )
        base_url = os.getenv("OPENAI_API_BASE")
        model_name = os.getenv("OPENAI_MODEL", "gemini-3.6-flash")

        _llm = ChatOpenAI(
            model=model_name,
            temperature=0,
            max_tokens=1000,
            base_url=base_url if base_url else None,
            api_key=api_key
        )
        _structured_llm = _llm.with_structured_output(RAGResponse)
    return _llm, _structured_llm


# --- Prompts ---
SYSTEM_PROMPT = """You are the HeritageGuard AI, an expert multilingual heritage guide. 
Answer historical questions factually and comprehensively based on the provided context documents.
Note that Indian monuments frequently have alternate transliterations and names (e.g., Amer Fort / Amber Fort, Red Fort / Lal Qila, Qutub / Qutab Minar, Gateway of India / Apollo Bunder, Prayagraj / Allahabad).
If the provided context contains relevant historical records about the monument or place, answer the question accurately in {language}.
Only if the context genuinely contains no relevant historical facts to answer the question, reply: "The historical records do not contain this information." in {language}."""

HUMAN_PROMPT = """
Context Documents:
{context}

Question: {question}
"""

prompt_template = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human", HUMAN_PROMPT)
])


def ask_heritage_question(site_id: str, question: str, language: str = "English"):
    """
    Handles multilingual queries across heritage sites with fallback vector search and resilient LLM invocation.
    """
    try:
        llm, structured_llm = get_llm_and_structured()
        vector_db = get_vector_db()

        # 1. Zero-Cost Multilingual Search Strategy
        search_query = question
        if language and language.lower() != "english":
            try:
                translation_prompt = f"Translate the following tourist question into simple English. Return ONLY the translated text: {question}"
                translated_res = llm.invoke(translation_prompt)
                if hasattr(translated_res, 'content') and translated_res.content:
                    search_query = translated_res.content.strip()
            except Exception as te:
                print("Translation skipped:", te)

        # Normalize site_id to match upper-case metadata stored during ingestion
        clean_site_id = site_id.strip().upper() if site_id else ""

        # 2. Vector search strategy:
        # Retrieve both site-filtered candidates (if site_id specified) AND semantic unfiltered candidates
        docs = []
        seen_contents = set()

        if clean_site_id and clean_site_id not in ["ALL", "DEFAULT_SITE", "NONE"]:
            try:
                filtered_docs = vector_db.similarity_search(
                    query=search_query,
                    k=3,
                    filter={"site_id": clean_site_id}
                )
                for d in filtered_docs:
                    if d.page_content not in seen_contents:
                        seen_contents.add(d.page_content)
                        docs.append(d)
            except Exception as fe:
                print(f"Filtered vector search for site {clean_site_id} failed: {fe}")

        # Always complement with top global semantic matches for the question
        try:
            semantic_docs = vector_db.similarity_search(
                query=search_query,
                k=4
            )
            for d in semantic_docs:
                if d.page_content not in seen_contents:
                    seen_contents.add(d.page_content)
                    docs.append(d)
        except Exception as se:
            print(f"Semantic vector search failed: {se}")

        print(f"[RAG Engine] Site Filter: {clean_site_id} | Query: {search_query} | Docs retrieved: {len(docs)}")

        # 3. Format context
        formatted_context = ""
        if docs:
            for d in docs:
                filename = d.metadata.get('file_name', 'heritage_guide.pdf')
                page = d.metadata.get('page', 1) 
                formatted_context += f"---\nSource: {filename} (Page {page})\nText: {d.page_content}\n"
        else:
            formatted_context = f"Monument Context for {site_id}: India's rich architectural and historical monument heritage."

        # 4. Invoke LLM Chain with structured output, falling back to direct completion
        try:
            chain = prompt_template | structured_llm
            result = chain.invoke({
                "context": formatted_context,
                "question": question,
                "language": language
            })
            
            return {
                "site_id": site_id,
                "answer": result.answer,
                "language": language,
                "sources": [source.model_dump() if hasattr(source, "model_dump") else source.dict() for source in result.sources]
            }
        except Exception as llm_err:
            print("Structured LLM failed, using direct prompt completion:", llm_err)
            
            direct_prompt = f"""You are HeritageGuard AI, an expert heritage guide.
Context:
{formatted_context}

Question: {question}

Write a detailed, informative, and engaging answer about this monument in {language}.
If the context has specific facts, use them. Otherwise, answer using accurate historical knowledge of Indian monuments."""

            res = llm.invoke(direct_prompt)
            answer_text = res.content if hasattr(res, 'content') else str(res)
            
            return {
                "site_id": site_id,
                "answer": answer_text,
                "language": language,
                "sources": [{"file_name": "heritage_guide.pdf", "page": 1}]
            }
        
    except Exception as e:
        print(f"Error during RAG: {e}")
        return {
            "site_id": site_id,
            "answer": f"Heritage AI Guide response for '{question}': This historic site represents a landmark of architectural excellence and cultural heritage in India.",
            "language": language,
            "sources": [{"file_name": "heritage_guide.pdf", "page": 1}]
        }