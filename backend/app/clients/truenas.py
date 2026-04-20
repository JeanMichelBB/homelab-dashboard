import httpx
from ..config import settings


def _headers():
    return {"Authorization": f"Bearer {settings.truenas_api_key}"}


async def get_pools() -> list:
    async with httpx.AsyncClient(timeout=10, verify=False) as client:
        r = await client.get(f"{settings.truenas_url}/api/v2.0/pool", headers=_headers())
        r.raise_for_status()
        return r.json()


async def get_system_info() -> dict:
    async with httpx.AsyncClient(timeout=10, verify=False) as client:
        r = await client.get(f"{settings.truenas_url}/api/v2.0/system/info", headers=_headers())
        r.raise_for_status()
        return r.json()
