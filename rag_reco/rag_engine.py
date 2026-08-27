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
    Handles multilingual queries across heritage sites with strict metadata filtering.
    """
    try:
        # 1. Zero-Cost Multilingual Search Strategy
        search_query = question
        if language.lower() != "english":
            translation_prompt = f"Translate the following tourist question into simple English. Return ONLY the translated text: {question}"
            translated_res = llm.invoke(translation_prompt)
            search_query = translated_res.content.strip()

        # 2. Vector search with Metadata Filter (ONLY retrieve requested site_id)
        docs = vector_db.similarity_search(
            query=search_query,
            k=4,
            filter={"site_id": site_id}
        )

        print("🔎 SITE ID FILTER:", site_id)
        print("🔎 SEARCH QUERY:", search_query)
        print("📚 DOCS FOUND:", len(docs))

        for d in docs:
            print("📄 SOURCE METADATA:", d.metadata)
            print("📝 TEXT:", d.page_content[:300])
        
        if not docs:
            return {
                "site_id": site_id,
                "answer": "The historical records do not contain this information.",
                "language": language,
                "sources": []
            }
            
        # 3. Format context
        formatted_context = ""
        for d in docs:
            filename = d.metadata.get('file_name', 'heritage_guide.pdf')
            page = d.metadata.get('page', 1) 
            formatted_context += f"---\nSource: {filename} (Page {page})\nText: {d.page_content}\n"
            
        print("🔥 FORMATTED CONTEXT:\n", formatted_context)
        print("🔥 QUESTION:", question)
        print("🔥 LANGUAGE:", language)

        # 4. Invoke LLM Chain
        chain = prompt_template | structured_llm
        result = chain.invoke({
            "context": formatted_context,
            "question": question,
            "language": language
        })
        
        print("🔥 LLM RESULT:", result)
        print("🔥 LLM ANSWER:", result.answer)
        print("🔥 LLM SOURCES:", result.sources)
        
        return {
            "site_id": site_id,
            "answer": result.answer,
            "language": language,
            "sources": [source.model_dump() if hasattr(source, "model_dump") else source.dict() for source in result.sources]
        }
        
    except Exception as e:
        print(f"Error during RAG: {e}")
        return {"error": f"Internal AI failure: {str(e)}"}