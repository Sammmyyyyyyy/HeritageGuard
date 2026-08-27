from fastapi import APIRouter, HTTPException

from app.schemas.site import SiteCreate, SiteResponse
from app.repositories.site_repository import SiteRepository

router = APIRouter(
    prefix="/api/sites",
    tags=["Sites"],
)

repository = SiteRepository()


@router.post(
    "",
    response_model=SiteResponse,
    status_code=201,
)
def create_site(site: SiteCreate):
    try:
        return repository.create(site)

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    except Exception as e:
        print(f"CREATE SITE ERROR: {e}")

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )


@router.get(
    "",
    response_model=list[SiteResponse],
)
def get_sites():
    try:
        return repository.get_all()

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch sites",
        )


@router.get(
    "/{site_id}",
    response_model=SiteResponse,
)
def get_site(site_id: str):
    try:
        site = repository.get_by_site_id(site_id)

        if not site:
            raise HTTPException(
                status_code=404,
                detail="Site not found",
            )

        return site

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch site",
        )