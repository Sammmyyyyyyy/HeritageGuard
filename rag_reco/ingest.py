import os
import re
import shutil
from pathlib import Path

from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma


DATA_DIR = "./data"
DB_DIR = "./chroma_db"

embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


def ingest_documents():
    print("🚀 Starting ingestion...")

    Path(DATA_DIR).mkdir(exist_ok=True, parents=True)

    print(f"📂 Scanning for PDF files in {DATA_DIR}...")

    try:
        loader = PyPDFDirectoryLoader(DATA_DIR)
        documents = loader.load()
    except Exception as e:
        print(f"❌ Failed to load documents: {e}")
        return

    if not documents:
        print(f"❌ No PDF documents found in '{DATA_DIR}'.")
        return

    print(f"📄 Loaded {len(documents)} PDF pages.")

    # Combine all PDF page text into one large text block.
    full_text = "\n".join(doc.page_content for doc in documents)

    # Regex to capture heritage site IDs (DEL001, BOM002, JAI003, PRA001 etc.)
    pattern = r"(?=(?:DEL|BOM|JAI|PRA)\d{3}\s*:)"
    records = re.split(pattern, full_text)

    site_documents = []

    for record in records:
        record = record.strip()

        if not record:
            continue

        match = re.match(r"((?:DEL|BOM|JAI|PRA)\d{3})\s*:\s*(.*)", record, re.DOTALL)

        if not match:
            continue

        site_id = match.group(1)
        content = match.group(2).strip()

        # Keep the site ID inside the searchable content.
        page_content = f"{site_id}: {content}"

        site_documents.append(
            Document(
                page_content=page_content,
                metadata={
                    "site_id": site_id,
                    "file_name": "heritage_guide.pdf",
                    "page": 1
                }
            )
        )

    print(f"🏛️ Found {len(site_documents)} heritage site records.")

    if not site_documents:
        print("❌ No site records found. Check the DEL/BOM/JAI/PRA IDs in your PDF.")
        return

    # Remove the old Chroma database to prevent outdated chunk collisions.
    if os.path.exists(DB_DIR):
        print("🗑️ Removing old ChromaDB...")
        shutil.rmtree(DB_DIR)

    print("💾 Creating new ChromaDB with site_id metadata...")

    Chroma.from_documents(
        documents=site_documents,
        embedding=embeddings,
        persist_directory=DB_DIR
    )

    print("✅ Ingestion complete!")
    print(f"✅ Stored {len(site_documents)} site records in ChromaDB.")

    print("\n📋 Sites indexed successfully:")
    for doc in site_documents:
        print(f"   - {doc.metadata['site_id']}")


if __name__ == "__main__":
    ingest_documents()