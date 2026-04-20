import httpx
from ..config import settings


def _headers():
    return {"X-Api-Key": settings.sonarr_api_key}


async def get_series() -> list:
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(f"{settings.sonarr_url}/api/v3/series", headers=_headers())
        r.raise_for_status()
        return r.json()


async def health() -> bool:
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(f"{settings.sonarr_url}/ping")
            return r.status_code == 200
    except Exception:
        return False
