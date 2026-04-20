import asyncio
from fastapi import APIRouter
from ..cache import cache_get, cache_set
from ..clients import gluetun

router = APIRouter()
_KEY = "network"
_TTL = 30


@router.get("/network")
async def get_network():
    cached = await cache_get(_KEY)
    if cached:
        return cached

    status_data, ip_data = await asyncio.gather(
        gluetun.get_vpn_status(),
        gluetun.get_public_ip(),
        return_exceptions=True,
    )

    vpn_status = "unknown"
    public_ip = "unknown"
    provider = "ProtonVPN"

    if not isinstance(status_data, Exception):
        vpn_status = status_data.get("status", "unknown")

    if not isinstance(ip_data, Exception):
        public_ip = ip_data.get("public_ip", "unknown")
        provider = ip_data.get("provider") or ip_data.get("organization", "ProtonVPN")

    result = {"vpn": {"status": vpn_status, "public_ip": public_ip, "provider": provider}}
    await cache_set(_KEY, result, _TTL)
    return result
