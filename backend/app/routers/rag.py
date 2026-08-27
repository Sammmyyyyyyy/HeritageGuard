from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.integrations.rag.client import RAGAIClient
from app.services.rag_service import RAGService


router = APIRouter(
    prefix="/api/rag",
    tags=["RAG"],
)


rag_service = RAGService(
    ai_client=RAGAIClient()
)


class QueryRequest(BaseModel):

    site_id: str = Field(
        ...,
        example="DEL001",
    )

    question: str = Field(
        ...,
        example="Who built this monument and why?",
    )

    language: str = Field(
        default="English",
        example="English",
    )


@router.post("/query")
async def query_heritage(
    request: QueryRequest,
):

    return await rag_service.ask(
        site_id=request.site_id,
        question=request.question,
        language=request.language,
    )