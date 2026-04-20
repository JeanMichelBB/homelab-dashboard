import httpx
from ..config import settings


async def get_health() -> dict:
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(f"{settings.gpuproxy_url}/health")
        r.raise_for_status()
        return r.json()


async def get_stats() -> dict:
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(f"{settings.gpuproxy_url}/stats")
        r.raise_for_status()
        return r.json()
