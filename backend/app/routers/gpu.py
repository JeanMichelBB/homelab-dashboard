import asyncio
from fastapi import APIRouter
from ..cache import cache_get, cache_set
from ..clients import gpuproxy

router = APIRouter()
_KEY = "gpu"
_TTL = 30


@router.get("/gpu")
async def get_gpu():
    cached = await cache_get(_KEY)
    if cached:
        return cached

    health_data, stats_data = await asyncio.gather(
        gpuproxy.get_health(),
        gpuproxy.get_stats(),
        return_exceptions=True,
    )

    windows_online = False
    ollama_ready = False
    active_model = None

    if not isinstance(health_data, Exception):
        windows_online = health_data.get("windows_online", False)
        ollama_ready = health_data.get("ollama_ready", False)
        active_model = health_data.get("active_model")

    requests = {"ollama": 0, "groq": 0, "gemini": 0}
    if not isinstance(stats_data, Exception):
        ollama_reqs = stats_data.get("ollama", {})
        requests["ollama"] = sum(ollama_reqs.values()) if isinstance(ollama_reqs, dict) else 0
        requests["groq"] = stats_data.get("groq", {}).get("requests", 0)
        requests["gemini"] = stats_data.get("gemini", {}).get("requests", 0)

    result = {
        "windows_online": windows_online,
        "ollama_ready": ollama_ready,
        "active_model": active_model,
        "requests": requests,
    }
    await cache_set(_KEY, result, _TTL)
    return result
