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
    file_name: str = Field(description="The name of the source file (e.g., delhi_guide.pdf)")
    page: int = Field(description="The page number where the fact was found")

class RAGResponse(BaseModel):
    answer: str = Field(description="The factual answer to the question in the requested language")
    sources: List[SourceCitation] = Field(description="List of sources used")

# --- Database & LLM Initialization ---
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vector_db = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)

# Uses your Gemini-via-OpenAI-compatible endpoint setup
llm = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "gemini-2.5-flash"), 
    temperature=0, 
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
    Handles multilingual queries across all 4 cities (Delhi, Mumbai, Jaipur, Prayagraj) 
    using a zero-cost translation step for vector search and native multilingual generation.
    """
    try:
        # 1. Zero-Cost Multilingual Search Strategy:
        # If the user asks in Hindi (or any non-English language), translate the question 
        # to English first so the English embedding model (all-MiniLM-L6-v2) can match it perfectly.
        search_query = question
        if language.lower() != "english":
            translation_prompt = f"Translate the following tourist question into simple English. Return ONLY the translated text: {question}"
            translated_res = llm.invoke(translation_prompt)
            search_query = translated_res.content.strip()

        # 2. Combine the monument's site_id (e.g., DEL001, BOM001, JAI001, PRA005) and the translated query
        final_query = f"{site_id} {search_query}"
        
        # 3. Retrieve matching context chunks from ChromaDB
        retriever = vector_db.as_retriever(search_kwargs={"k": 4})
        docs = retriever.invoke(final_query)
        
        if not docs:
            return {
                "site_id": site_id,
                "answer": "The historical records do not contain this information.",
                "language": language,
                "sources": []
            }
            
        # 4. Format context with file names and page numbers for citations
        formatted_context = ""
        for d in docs:
            filename = d.metadata.get('file_name', 'heritage_guide.pdf')
            page = d.metadata.get('page', 0) + 1 
            formatted_context += f"---\nSource: {filename} (Page {page})\nText: {d.page_content}\n"
            
        # 5. Generate structured response in the target language using original question
        chain = prompt_template | structured_llm
        result = chain.invoke({
            "context": formatted_context,
            "question": question, # Original Hindi/native question passed so Gemini responds in that language
            "language": language
        })
        
        return {
            "site_id": site_id,
            "answer": result.answer,
            "language": language,
            "sources": [source.model_dump() if hasattr(source, "model_dump") else source.dict() for source in result.sources]
        }
        
    except Exception as e:
        print(f"Error during RAG: {e}")
        return {"error": f"Internal AI failure: {str(e)}"}