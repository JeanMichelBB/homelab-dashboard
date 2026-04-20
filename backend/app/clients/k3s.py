import httpx
from ..config import settings


def _headers():
    return {"Authorization": f"Bearer {settings.k3s_bearer_token}"}


async def get_nodes() -> dict:
    async with httpx.AsyncClient(timeout=10, verify=False) as client:
        r = await client.get(f"{settings.k3s_url}/api/v1/nodes", headers=_headers())
        r.raise_for_status()
        return r.json()


async def get_pods() -> dict:
    async with httpx.AsyncClient(timeout=10, verify=False) as client:
        r = await client.get(f"{settings.k3s_url}/api/v1/pods", headers=_headers())
        r.raise_for_status()
        return r.json()
