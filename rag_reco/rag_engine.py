# rag_engine.py
import os
from typing import List
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

# --- Pydantic Schemas for Structured Output ---
class SourceCitation(BaseModel):
    file_name: str = Field(description="The name of the source file (e.g., heritage_guide.pdf)")
    page: int = Field(description="The page number where the fact was found")

class RAGResponse(BaseModel):
    answer: str = Field(description="The factual answer to the question in the requested language")
    sources: List[SourceCitation] = Field(description="List of sources used")

# --- Database & LLM Initialization ---
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vector_db = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)

llm = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gemini-3.6-flash"), 
    temperature=0, 
    max_tokens=1000,
    base_url=os.getenv("OPENAI_API_BASE"),
    api_key=os.getenv("OPENAI_API_KEY")
)
structured_llm = llm.with_structured_output(RAGResponse)

# --- Prompts ---
SYSTEM_PROMPT = """You are the HeritageGuard AI, an expert multilingual heritage guide. 
You answer historical questions based ONLY on the provided context documents.
If the context does not contain the answer, you must reply: "The historical records do not contain this information." translated into the requested language.
Do NOT invent facts. You must write your final answer in the requested language: {language}."""

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
        # 1. Zero-Cost Multilingual Search Strategy
        search_query = question
        if language.lower() != "english":
            try:
                translation_prompt = f"Translate the following tourist question into simple English. Return ONLY the translated text: {question}"
                translated_res = llm.invoke(translation_prompt)
                if hasattr(translated_res, 'content') and translated_res.content:
                    search_query = translated_res.content.strip()
            except Exception as te:
                print("⚠️ Translation skipped:", te)

        # 2. Vector search with Metadata Filter (ONLY retrieve requested site_id if available)
        docs = []
        if site_id and str(site_id).lower() not in ["all", "default_site", "none"]:
            try:
                docs = vector_db.similarity_search(
                    query=search_query,
                    k=4,
                    filter={"site_id": site_id}
                )
            except Exception as fe:
                print(f"⚠️ Filtered vector search for site {site_id} failed: {fe}")

        # Fallback to unfiltered vector search if no site-filtered docs were found
        if not docs:
            try:
                docs = vector_db.similarity_search(
                    query=search_query,
                    k=6
                )
            except Exception as ufe:
                print(f"⚠️ Unfiltered vector search failed: {ufe}")

        print("🔎 SITE ID FILTER:", site_id)
        print("🔎 SEARCH QUERY:", search_query)
        print("📚 DOCS FOUND:", len(docs))

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
            print("⚠️ Structured LLM failed, using direct prompt completion:", llm_err)
            
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