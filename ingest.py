# ingest.py
import os
from pathlib import Path
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

DATA_DIR = "./data"
DB_DIR = "./chroma_db"
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

def ingest_documents():
    print("Starting ingestion...")
    Path(DATA_DIR).mkdir(exist_ok=True, parents=True)

    # 1. Load ALL PDFs in the directory at once (No for-loop needed!)
    print(f"Scanning for PDF files in {DATA_DIR}...")
    try:
        loader = PyPDFDirectoryLoader(DATA_DIR)
        documents = loader.load()
    except Exception as e:
        print(f"Failed to load documents: {e}")
        return

    if not documents:
        print(f"No PDF documents found. Please put your PDF(s) in the '{DATA_DIR}' folder.")
        return

    print(f"Loaded {len(documents)} pages from PDFs.")

    # 2. Enrich metadata so rag_engine.py can accurately cite the file name
    for doc in documents:
        source_path = doc.metadata.get("source", "")
        # Extracts just the filename (e.g., 'delhi_guide.pdf') from the full path
        doc.metadata["file_name"] = os.path.basename(source_path)

    # 3. Split the text into AI-readable chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=150)
    all_chunks = text_splitter.split_documents(documents)

    print(f"Saving {len(all_chunks)} chunks to vector database...")
    
    # 4. Save to ChromaDB
    Chroma.from_documents(
        documents=all_chunks,
        embedding=embeddings,
        persist_directory=DB_DIR
    )
    print("✅ Ingestion complete! Database is ready.")

if __name__ == "__main__":
    ingest_documents()