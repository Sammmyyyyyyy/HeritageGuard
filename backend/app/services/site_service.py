from app.exceptions.site import SiteNotFound
from app.repositories.site_repository import (
    SiteRepository,
)


class SiteService:

    def __init__(
        self,
        repository: SiteRepository,
    ):
        self.repository = repository

    def get_sites(self):
        return self.repository.get_all()

    def get_site(
        self,
        site_id: str,
    ):
        site = self.repository.get_by_site_id(
            site_id
        )

        if not site:
            raise SiteNotFound(site_id)

        return site