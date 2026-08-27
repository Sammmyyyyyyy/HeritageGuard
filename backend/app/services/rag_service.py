from typing import Any, Dict

from app.integrations.rag.client import RAGAIClient


class RAGService:

    def __init__(
        self,
        ai_client: RAGAIClient,
    ):
        self.ai_client = ai_client

    async def ask(
        self,
        site_id: str,
        question: str,
        language: str = "English",
    ) -> Dict[str, Any]:

        result = await self.ai_client.ask(
            site_id=site_id,
            question=question,
            language=language,
        )

        return result