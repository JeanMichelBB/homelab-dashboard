import httpx
from ..config import settings


async def get_vpn_status() -> dict:
    async with httpx.AsyncClient(timeout=5) as client:
        r = await client.get(f"{settings.gluetun_url}/v1/vpn/status")
        r.raise_for_status()
        return r.json()


async def get_public_ip() -> dict:
    async with httpx.AsyncClient(timeout=5) as client:
        r = await client.get(f"{settings.gluetun_url}/v1/publicip/ip")
        r.raise_for_status()
        return r.json()
