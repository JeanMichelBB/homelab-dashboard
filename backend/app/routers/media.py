import asyncio
from fastapi import APIRouter
from ..cache import cache_get, cache_set
from ..clients import sonarr, radarr

router = APIRouter()
_KEY = "media"
_TTL = 300


@router.get("/media")
async def get_media():
    cached = await cache_get(_KEY)
    if cached:
        return cached

    series_data, movies_data = await asyncio.gather(
        sonarr.get_series(),
        radarr.get_movies(),
        return_exceptions=True,
    )

    sonarr_result = {"series": 0, "episodes_monitored": 0, "missing": 0}
    if not isinstance(series_data, Exception):
        sonarr_result["series"] = len(series_data)
        sonarr_result["episodes_monitored"] = sum(s.get("episodeCount", 0) for s in series_data)
        sonarr_result["missing"] = sum(1 for s in series_data if s.get("statistics", {}).get("episodeFileCount", 1) == 0)

    radarr_result = {"movies": 0, "missing": 0}
    if not isinstance(movies_data, Exception):
        radarr_result["movies"] = len(movies_data)
        radarr_result["missing"] = sum(1 for m in movies_data if not m.get("hasFile", True))

    result = {"sonarr": sonarr_result, "radarr": radarr_result}
    await cache_set(_KEY, result, _TTL)
    return result
