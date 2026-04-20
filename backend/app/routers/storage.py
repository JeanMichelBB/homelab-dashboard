from fastapi import APIRouter
from ..cache import cache_get, cache_set
from ..clients import truenas

router = APIRouter()
_KEY = "storage"
_TTL = 120


@router.get("/storage")
async def get_storage():
    cached = await cache_get(_KEY)
    if cached:
        return cached

    try:
        pools_raw, info = await __import__("asyncio").gather(
            truenas.get_pools(),
            truenas.get_system_info(),
            return_exceptions=True,
        )
    except Exception:
        return {"pools": [], "uptime_seconds": None}

    pools = []
    if not isinstance(pools_raw, Exception):
        for p in pools_raw:
            total = p.get("size") or 0
            allocated = p.get("allocated") or 0
            pools.append({
                "name": p.get("name", ""),
                "status": p.get("status", "UNKNOWN"),
                "used_gb": round(allocated / 1e9, 1),
                "total_gb": round(total / 1e9, 1),
            })

    uptime = None
    if not isinstance(info, Exception):
        uptime = info.get("uptime_seconds")

    result = {"pools": pools, "uptime_seconds": uptime}
    await cache_set(_KEY, result, _TTL)
    return result
