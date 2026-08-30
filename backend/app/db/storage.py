from app.core.config import settings
from app.db.supabase import supabase


def upload_image(
    file_bytes: bytes,
    path: str,
    content_type: str,
) -> str:

    bucket = settings.SUPABASE_STORAGE_BUCKET

    try:
        supabase.storage.from_(bucket).upload(
            path,
            file_bytes,
            {
                "content-type": content_type,
                "upsert": "true",
            },
        )
    except Exception as e:
        print(f"Storage upload notice for path '{path}': {e}")

    return supabase.storage.from_(bucket).get_public_url(
        path
    )