from app.exceptions.base import AppException


class AIServiceUnavailable(AppException):

    def __init__(
        self,
        message: str = "AI service is unavailable",
    ):
        super().__init__(
            code="AI_SERVICE_UNAVAILABLE",
            message=message,
            status_code=503,
        )


class AIServiceTimeout(AppException):

    def __init__(
        self,
        message: str = "AI service request timed out",
    ):
        super().__init__(
            code="AI_SERVICE_TIMEOUT",
            message=message,
            status_code=504,
        )


class InvalidAIResponse(AppException):

    def __init__(
        self,
        message: str = "Invalid response received from AI service",
    ):
        super().__init__(
            code="INVALID_AI_RESPONSE",
            message=message,
            status_code=502,
        )


class AIModelNotReady(AppException):

    def __init__(
        self,
        message: str = "AI model is not integrated yet",
    ):
        super().__init__(
            code="AI_MODEL_NOT_READY",
            message=message,
            status_code=503,
        )