from pydantic import BaseModel, Field


class RAGQueryRequest(BaseModel):
    site_id: str = Field(
        ...,
        description="Heritage site ID",
        examples=["DEL001"],
    )

    question: str = Field(
        ...,
        min_length=1,
        description="Question asked by the tourist",
        examples=["Who built this monument and why?"],
    )

    language: str = Field(
        default="English",
        description="Response language",
        examples=["English"],
    )