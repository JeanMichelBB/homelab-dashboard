from fastapi import APIRouter
from ..cache import cache_get, cache_set
from ..clients import prometheus

router = APIRouter()
_KEY = "monitoring"
_TTL = 15


@router.get("/monitoring")
async def get_monitoring():
    cached = await cache_get(_KEY)
    if cached:
        return cached

    try:
        raw_alerts = await prometheus.get_alerts()
    except Exception:
        raw_alerts = []

    alerts = [
        {
            "name": a.get("labels", {}).get("alertname", ""),
            "severity": a.get("labels", {}).get("severity", ""),
            "state": a.get("state", ""),
            "summary": a.get("annotations", {}).get("summary", ""),
        }
        for a in raw_alerts
    ]

    critical = sum(1 for a in alerts if a["severity"] == "critical" and a["state"] == "firing")
    warning = sum(1 for a in alerts if a["severity"] == "warning" and a["state"] == "firing")

    result = {"alerts": alerts, "total": len(alerts), "critical": critical, "warning": warning}
    await cache_set(_KEY, result, _TTL)
    return result
