import asyncio
import httpx
from fastapi import APIRouter
from ..cache import cache_get, cache_set
from ..clients import prometheus
from ..config import settings

router = APIRouter()
_KEY = "nodes"
_TTL = 15


async def _glances_node(name: str, url: str, role: str, tailscale_ip: str) -> dict:
    base = {
        "name": name, "role": role, "tailscale_ip": tailscale_ip,
        "online": False, "cpu_percent": None, "ram_percent": None, "uptime_seconds": None,
    }
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            cpu_r = await client.get(f"{url}/api/4/cpu/total")
            mem_r = await client.get(f"{url}/api/4/mem/percent")
            uptime_r = await client.get(f"{url}/api/4/uptime")
            base["online"] = True
            cpu_val = cpu_r.json() if cpu_r.status_code == 200 else None
            mem_val = mem_r.json() if mem_r.status_code == 200 else None
            base["cpu_percent"] = round(float(cpu_val["total"]), 1) if isinstance(cpu_val, dict) else (round(float(cpu_val), 1) if cpu_val is not None else None)
            base["ram_percent"] = round(float(mem_val["percent"]), 1) if isinstance(mem_val, dict) else (round(float(mem_val), 1) if mem_val is not None else None)
            raw_uptime = uptime_r.json() if uptime_r.status_code == 200 else None
            if isinstance(raw_uptime, (int, float)):
                base["uptime_seconds"] = raw_uptime
    except Exception:
        pass
    return base


async def _prometheus_node(name: str, role: str, tailscale_ip: str, instance: str) -> dict:
    base = {
        "name": name, "role": role, "tailscale_ip": tailscale_ip,
        "online": False, "cpu_percent": None, "ram_percent": None, "uptime_seconds": None,
    }
    try:
        cpu_res = await prometheus.query(f'100 - avg by(instance)(rate(node_cpu_seconds_total{{mode="idle",instance="{instance}"}}[2m])) * 100')
        mem_res = await prometheus.query(f'(1 - node_memory_MemAvailable_bytes{{instance="{instance}"}} / node_memory_MemTotal_bytes{{instance="{instance}"}}) * 100')
        uptime_res = await prometheus.query(f'node_time_seconds{{instance="{instance}"}} - node_boot_time_seconds{{instance="{instance}"}}')
        if cpu_res:
            base["online"] = True
            base["cpu_percent"] = round(float(cpu_res[0]["value"][1]), 1)
        if mem_res:
            base["ram_percent"] = round(float(mem_res[0]["value"][1]), 1)
        if uptime_res:
            base["uptime_seconds"] = int(float(uptime_res[0]["value"][1]))
    except Exception:
        pass
    return base


async def _truenas_node() -> dict:
    ip = settings.tailscale_ip_truenas
    base = {
        "name": "tstruenas", "role": "NAS — TrueNAS Scale, ZFS mirror",
        "tailscale_ip": ip,
        "online": False, "cpu_percent": None, "ram_percent": None, "uptime_seconds": None,
    }
    try:
        import httpx as hx
        async with hx.AsyncClient(timeout=10, verify=False) as client:
            r = await client.get(
                f"{settings.truenas_url}/api/v2.0/system/info",
                headers={"Authorization": f"Bearer {settings.truenas_api_key}"},
            )
            if r.status_code == 200:
                data = r.json()
                base["online"] = True
                base["uptime_seconds"] = data.get("uptime_seconds")
    except Exception:
        pass
    return base


@router.get("/nodes")
async def get_nodes():
    cached = await cache_get(_KEY)
    if cached:
        return cached

    ip_e = settings.tailscale_ip_elitedesk
    ip_pi = settings.tailscale_ip_tspi
    ip_win = settings.tailscale_ip_windows
    ip_o1 = settings.tailscale_ip_oci1
    ip_o2 = settings.tailscale_ip_oci2

    results = await asyncio.gather(
        _glances_node("tselitedesk", settings.glances_elitedesk_url,
                      "Main server — media, k3s control plane, gpu-proxy", ip_e),
        _glances_node("tspi", settings.glances_tspi_url,
                      "Monitoring — Prometheus, Grafana", ip_pi),
        _prometheus_node("tswindows11", "Gaming PC — Ollama RTX 5070", ip_win, f"{ip_win}:9091"),
        _truenas_node(),
        _prometheus_node("oci-node-1", "k3s worker (OCI free tier)", ip_o1, f"{ip_o1}:9100"),
        _prometheus_node("oci-node-2", "k3s worker (OCI free tier)", ip_o2, f"{ip_o2}:9100"),
    )

    await cache_set(_KEY, results, _TTL)
    return results
