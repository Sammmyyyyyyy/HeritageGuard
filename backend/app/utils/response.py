def success_response(
    data=None,
    message: str = "Success",
):
    return {
        "success": True,
        "message": message,
        "data": data,
    }


def error_response(
    code: str,
    message: str,
):
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
        },
    }