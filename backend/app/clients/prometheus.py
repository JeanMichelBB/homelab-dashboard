import httpx
from ..config import settings


async def query(promql: str) -> list:
    async with httpx.AsyncClient(timeout=5) as client:
        r = await client.get(
            f"{settings.prometheus_url}/api/v1/query",
            params={"query": promql},
        )
        r.raise_for_status()
        data = r.json()
        return data.get("data", {}).get("result", [])


async def get_alerts() -> list:
    async with httpx.AsyncClient(timeout=5) as client:
        r = await client.get(f"{settings.prometheus_url}/api/v1/alerts")
        r.raise_for_status()
        return r.json().get("data", {}).get("alerts", [])
