from fastapi import APIRouter
from ..cache import cache_get, cache_set
from ..clients import k3s as k3s_client

router = APIRouter()
_KEY = "k3s"
_TTL = 60


@router.get("/k3s")
async def get_k3s():
    cached = await cache_get(_KEY)
    if cached:
        return cached

    try:
        import asyncio
        nodes_raw, pods_raw = await asyncio.gather(
            k3s_client.get_nodes(),
            k3s_client.get_pods(),
            return_exceptions=True,
        )
    except Exception:
        return {"nodes": [], "pods": {"total": 0, "running": 0, "pending": 0, "failed": 0}}

    nodes = []
    if not isinstance(nodes_raw, Exception):
        for item in nodes_raw.get("items", []):
            name = item["metadata"]["name"]
            conditions = item.get("status", {}).get("conditions", [])
            ready = next((c for c in conditions if c["type"] == "Ready"), {})
            status = "Ready" if ready.get("status") == "True" else "NotReady"
            labels = item["metadata"].get("labels", {})
            role = "control-plane" if "node-role.kubernetes.io/control-plane" in labels else "worker"
            nodes.append({"name": name, "status": status, "role": role})

    pods = {"total": 0, "running": 0, "pending": 0, "failed": 0}
    if not isinstance(pods_raw, Exception):
        for item in pods_raw.get("items", []):
            phase = item.get("status", {}).get("phase", "")
            pods["total"] += 1
            if phase == "Running":
                pods["running"] += 1
            elif phase == "Pending":
                pods["pending"] += 1
            elif phase == "Failed":
                pods["failed"] += 1

    result = {"nodes": nodes, "pods": pods}
    await cache_set(_KEY, result, _TTL)
    return result
