import httpx


async def get_glances_stats(base_url: str) -> dict:
    """Fetch /api/4/all from a Glances REST API instance."""
    async with httpx.AsyncClient(timeout=5) as client:
        r = await client.get(f"{base_url}/api/4/all")
        r.raise_for_status()
        return r.json()


async def get_glances_prometheus(metrics_url: str) -> str:
    """Fetch raw Prometheus text metrics from a Glances exporter."""
    async with httpx.AsyncClient(timeout=5) as client:
        r = await client.get(metrics_url)
        r.raise_for_status()
        return r.text
