import asyncio
import httpx
from fastapi import APIRouter
from ..cache import cache_get, cache_set
from ..config import settings

router = APIRouter()
_KEY = "services"
_TTL = 30

SERVICES = [
    {"name": "Sonarr",      "category": "media",      "url": f"{settings.sonarr_url}/ping"},
    {"name": "Radarr",      "category": "media",      "url": f"{settings.radarr_url}/ping"},
    {"name": "Prowlarr",    "category": "media",      "url": f"{settings.prowlarr_url}/ping"},
    {"name": "qBittorrent", "category": "media",      "url": f"{settings.qbittorrent_url}"},
    {"name": "Jellyfin",    "category": "media",      "url": f"{settings.jellyfin_url}/health"},
    {"name": "Portainer",   "category": "management", "url": f"{settings.portainer_url}/api/status"},
    {"name": "Grafana",     "category": "monitoring", "url": f"{settings.grafana_url}/api/health"},
    {"name": "Prometheus",  "category": "monitoring", "url": f"{settings.prometheus_url}/-/healthy"},
    {"name": "gpu-proxy",   "category": "ai",         "url": f"{settings.gpuproxy_url}/health"},
]


async def _check(svc: dict) -> dict:
    display_url = svc["url"].rsplit("/", 1)[0] if svc["url"].endswith(("/ping", "/health", "/api/health", "/api/status", "/-/healthy")) else svc["url"]
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(svc["url"])
            status = "up" if r.status_code < 400 else "down"
    except Exception:
        status = "down"
    return {"name": svc["name"], "category": svc["category"], "status": status, "url": display_url}


@router.get("/services")
async def get_services():
    cached = await cache_get(_KEY)
    if cached:
        return cached

    results = await asyncio.gather(*[_check(s) for s in SERVICES])
    await cache_set(_KEY, results, _TTL)
    return results
