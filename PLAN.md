# Homelab Dashboard — Plan

Live dashboard for `homelab.sacenpapier.org` — shows real-time status of the homelab infrastructure.

---

## Architecture

```
Browser
  └── homelab.sacenpapier.org          (React SPA — static, k3s ingress)
        └── /api/*                     (FastAPI — k3s deployment, ClusterIP)
              ├── Redis                 homelab-redis:6379  (cache layer)
              │     ├── /api/nodes      TTL 15s
              │     ├── /api/services   TTL 30s
              │     ├── /api/monitoring TTL 15s
              │     ├── /api/gpu        TTL 30s
              │     ├── /api/network    TTL 30s
              │     ├── /api/storage    TTL 2min
              │     └── /api/media      TTL 5min
              ├── Prometheus            100.76.60.40:9090
              ├── Glances (tspi)        100.76.60.40:61208
              ├── Glances (Windows)     100.71.171.120:9091  (Prometheus metrics)
              ├── TrueNAS API           100.74.128.46 (API key → k8s Secret)
              ├── Sonarr API            100.109.234.126:8989 (API key → k8s Secret)
              ├── Radarr API            100.109.234.126:7878 (API key → k8s Secret)
              ├── gpu-proxy             100.109.234.126:11435
              ├── Gluetun               100.109.234.126:8000
              └── k3s API               https://100.109.234.126:6443 (bearer token → k8s Secret)
```

**All credentials live in k8s Secrets — never exposed to the browser.**
React only sees aggregated, sanitized JSON from FastAPI.

### Cache Flow

```
Browser → FastAPI
              ↓
         Redis.get(key)
              ↓ hit         ↓ miss
         return cached    call real service
                               ↓
                          Redis.set(key, ttl)
                               ↓
                          return fresh data
```

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React + TypeScript + Vite | Lightweight, fast dev, matches existing projects |
| Styling | Tailwind CSS | Matches hub style |
| Backend | FastAPI (Python) | Fast to write, async HTTP calls, already used in other projects |
| Cache | Redis | Prevents hammering services on every request, TTL-based per endpoint |
| Deploy | k3s (frontend + backend + redis) | Already running, free OCI nodes |
| Ingress | Traefik | Already configured in k3s |
| Secrets | k8s Secrets | API keys never leave the cluster |
| HTTP client | httpx (async) | Native async in FastAPI |
| Redis client | redis-py (async) | `redis.asyncio` — non-blocking cache reads/writes |

---

## Repository Structure

```
homelab-dashboard/
  PLAN.md                     ← this file
  frontend/                   ← React + Vite app
    src/
      pages/
        Overview.tsx
        Infrastructure.tsx
        Services.tsx
        Media.tsx
      components/
        NodeCard.tsx
        ServiceBadge.tsx
        AlertBanner.tsx
        InfraMap.tsx
      api/
        client.ts             ← all fetch calls to FastAPI
      types/
        index.ts              ← shared TypeScript types
    Dockerfile
    vite.config.ts

  backend/                    ← FastAPI app
    app/
      main.py                 ← FastAPI app + CORS
      routers/
        nodes.py
        services.py
        media.py
        storage.py
        gpu.py
        monitoring.py
        network.py
      clients/
        prometheus.py         ← Prometheus HTTP client
        glances.py            ← Glances HTTP client
        truenas.py            ← TrueNAS API client
        sonarr.py             ← Sonarr API client
        radarr.py             ← Radarr API client
        gluetun.py            ← Gluetun control server client
        gpuproxy.py           ← gpu-proxy client
      models.py               ← Pydantic response models
      config.py               ← settings from env vars (k8s Secrets)
      cache.py                ← Redis client + get/set helpers with TTL
    Dockerfile
    requirements.txt          ← includes: fastapi, httpx, redis[asyncio], pydantic

  k3s/
    namespace.yaml
    frontend-deployment.yaml
    backend-deployment.yaml
    redis-deployment.yaml     ← Redis + ClusterIP service
    backend-secret.yaml       ← gitignored (contains real keys)
    backend-secret.example.yaml ← safe to commit (empty values)
    ingress.yaml              ← homelab.sacenpapier.org
```

---

## API Endpoints (FastAPI)

All endpoints return JSON. All errors return `{ "status": "error", "message": "..." }`.

### `GET /api/nodes`
Returns status of all machines.

```json
[
  {
    "name": "tselitedesk",
    "role": "Main server — media, k3s control plane, gpu-proxy",
    "tailscale_ip": "100.109.234.126",
    "online": true,
    "cpu_percent": 12.4,
    "ram_percent": 54.2,
    "uptime_seconds": 432000
  },
  {
    "name": "tspi",
    "role": "Monitoring — Prometheus, Grafana",
    "tailscale_ip": "100.76.60.40",
    "online": true,
    "cpu_percent": 3.1,
    "ram_percent": 28.7,
    "uptime_seconds": 981234
  },
  {
    "name": "tswindows11",
    "role": "Gaming PC — Ollama RTX 5070",
    "tailscale_ip": "100.71.171.120",
    "online": true,
    "cpu_percent": 8.2,
    "ram_percent": 34.1,
    "uptime_seconds": 194644
  },
  {
    "name": "tstruenas",
    "role": "NAS — TrueNAS Scale, ZFS mirror",
    "tailscale_ip": "100.74.128.46",
    "online": true,
    "cpu_percent": 2.1,
    "ram_percent": 61.0,
    "uptime_seconds": 314411
  },
  {
    "name": "oci-node-1",
    "role": "k3s worker (OCI free tier)",
    "tailscale_ip": "100.104.232.105",
    "online": true,
    "cpu_percent": 5.3,
    "ram_percent": 44.0,
    "uptime_seconds": 120000
  },
  {
    "name": "oci-node-2",
    "role": "k3s worker (OCI free tier)",
    "tailscale_ip": "100.67.187.71",
    "online": true,
    "cpu_percent": 4.8,
    "ram_percent": 41.2,
    "uptime_seconds": 119000
  }
]
```
**Sources:** Glances API (tspi, Windows), Prometheus node metrics (OCI nodes), TrueNAS API (tstruenas), k3s kubelet (tselitedesk)

---

### `GET /api/services`
Returns up/down status of all services.

```json
[
  { "name": "Sonarr",      "category": "media",      "status": "up", "url": "http://100.109.234.126:8989" },
  { "name": "Radarr",      "category": "media",      "status": "up", "url": "http://100.109.234.126:7878" },
  { "name": "Prowlarr",    "category": "media",      "status": "up", "url": "http://100.109.234.126:9696" },
  { "name": "qBittorrent", "category": "media",      "status": "up", "url": "http://100.109.234.126:8085" },
  { "name": "Jellyfin",    "category": "media",      "status": "up", "url": "http://100.109.234.126:8096" },
  { "name": "Portainer",   "category": "management", "status": "up", "url": "http://100.109.234.126:9000" },
  { "name": "Grafana",     "category": "monitoring", "status": "up", "url": "http://100.76.60.40:3000" },
  { "name": "Prometheus",  "category": "monitoring", "status": "up", "url": "http://100.76.60.40:9090" },
  { "name": "gpu-proxy",   "category": "ai",         "status": "up", "url": "http://100.109.234.126:11435" }
]
```
**Sources:** HTTP health checks against each service's `/ping`, `/health`, or `/api/v3/system/status`

---

### `GET /api/media`
Returns media library stats.

```json
{
  "sonarr": {
    "series": 42,
    "episodes_monitored": 1203,
    "missing": 14
  },
  "radarr": {
    "movies": 318,
    "missing": 3
  }
}
```
**Sources:** Sonarr API `/api/v3/series`, Radarr API `/api/v3/movie`

---

### `GET /api/storage`
Returns TrueNAS pool and disk info.

```json
{
  "pools": [
    { "name": "main",      "status": "ONLINE", "used_gb": 1420, "total_gb": 3600 },
    { "name": "boot-pool", "status": "ONLINE", "used_gb": 12,   "total_gb": 60 }
  ],
  "uptime_seconds": 314411
}
```
**Sources:** TrueNAS API `/api/v2.0/pool`, Prometheus `truenas_arcstats`

---

### `GET /api/gpu`
Returns GPU proxy and Ollama status.

```json
{
  "windows_online": true,
  "ollama_ready": true,
  "active_model": "gemma4:e4b",
  "requests": {
    "ollama": 142,
    "groq": 23,
    "gemini": 7
  }
}
```
**Sources:** gpu-proxy `/health`, `/stats`

---

### `GET /api/network`
Returns VPN and network status.

```json
{
  "vpn": {
    "status": "running",
    "public_ip": "x.x.x.x",
    "provider": "ProtonVPN"
  }
}
```
**Sources:** Gluetun control server `http://100.109.234.126:8000/v1/vpn/status`

---

### `GET /api/monitoring`
Returns active Prometheus alerts.

```json
{
  "alerts": [
    {
      "name": "Watchdog",
      "severity": "info",
      "state": "firing",
      "summary": "Alertmanager watchdog"
    }
  ],
  "total": 1,
  "critical": 0,
  "warning": 0
}
```
**Sources:** Prometheus `/api/v1/alerts`

---

### `GET /api/k3s`
Returns k3s cluster status.

```json
{
  "nodes": [
    { "name": "elitedesk",  "status": "Ready", "role": "control-plane" },
    { "name": "oci-node-1", "status": "Ready", "role": "worker" },
    { "name": "oci-node-2", "status": "Ready", "role": "worker" }
  ],
  "pods": {
    "total": 34,
    "running": 33,
    "pending": 0,
    "failed": 1
  }
}
```
**Sources:** k3s API server `/api/v1/nodes`, `/api/v1/pods`

---

## Frontend Pages

### `/` — Overview
- Alert banner (if any critical/warning alerts firing)
- Node cards grid: one per machine — hostname, role, CPU%, RAM%, online indicator
- Quick stats bar: pods running, VPN status, active alerts count

### `/infrastructure`
- Visual map of machines connected by Tailscale mesh
- Click a node → expands to show services running on it

### `/services`
- Grid of all services grouped by category (Media, AI, Monitoring, Management)
- Each card: name, icon, status dot (green/red), link to service

### `/media`
- Sonarr: series count, missing episodes
- Radarr: movie count, missing movies
- VPN public IP (since media stack routes through it)

---

## k3s Deployment

```
namespace: homelab-dashboard

Deployments:
  homelab-frontend    ← React static files served by nginx
  homelab-backend     ← FastAPI uvicorn
  homelab-redis       ← Redis 7 (no persistence needed, cache only)

Services:
  homelab-frontend    ClusterIP :80
  homelab-backend     ClusterIP :8000
  homelab-redis       ClusterIP :6379   (internal only, not exposed)

Ingress (Traefik):
  homelab.sacenpapier.org       → homelab-frontend :80
  homelab.sacenpapier.org/api/* → homelab-backend :8000

Secret: homelab-backend-secrets
  TRUENAS_API_KEY
  SONARR_API_KEY
  RADARR_API_KEY
  K3S_BEARER_TOKEN

ConfigMap: homelab-backend-config
  REDIS_URL=redis://homelab-redis:6379
  PROMETHEUS_URL=http://100.76.60.40:9090
  GLANCES_TSPI_URL=http://100.76.60.40:61208
  GLANCES_WIN_URL=http://100.71.171.120:9091
  TRUENAS_URL=http://100.74.128.46
  SONARR_URL=http://100.109.234.126:8989
  RADARR_URL=http://100.109.234.126:7878
  GPUPROXY_URL=http://100.109.234.126:11435
  GLUETUN_URL=http://100.109.234.126:8000
  K3S_URL=https://100.109.234.126:6443
```

---

## Security Model

- All API keys live in k8s Secret `homelab-backend-secrets`
- Non-sensitive URLs live in k8s ConfigMap `homelab-backend-config`
- FastAPI reads both via env vars at startup
- React has zero access to credentials — only calls `/api/*`
- CORS on FastAPI: only allow `homelab.sacenpapier.org`
- Redis is ClusterIP only — not reachable outside the cluster
- Gluetun, Glances, gpu-proxy have no auth — safe since they're Tailscale-only
- TrueNAS, Sonarr, Radarr require API keys — backend only

---

## Build Order

1. Backend scaffolding — FastAPI + config + `cache.py` (Redis client)
2. `/api/nodes` — Glances + Prometheus sources (TTL 15s)
3. `/api/services` — HTTP health checks (TTL 30s)
4. `/api/monitoring` — Prometheus alerts (TTL 15s)
5. Frontend scaffolding — Vite + Tailwind + routing
6. Overview page — node cards + alert banner
7. Services page
8. `/api/media` + Media page (TTL 5min)
9. `/api/storage` + `/api/gpu` + `/api/network` (TTL 2min / 30s / 30s)
10. Infrastructure map
11. k3s manifests — namespace, backend, frontend, redis, ingress, secret, configmap
12. DNS: `homelab.sacenpapier.org`

---

## Cache TTL Reference

| Endpoint | TTL | Why |
|---|---|---|
| `/api/nodes` | 15s | CPU/RAM changes fast |
| `/api/monitoring` | 15s | Alerts need to surface quickly |
| `/api/services` | 30s | Status check, near-real-time |
| `/api/gpu` | 30s | Model/online status |
| `/api/network` | 30s | VPN status |
| `/api/storage` | 2min | Pool status rarely changes |
| `/api/k3s` | 1min | Pod counts, node status |
| `/api/media` | 5min | Library counts change slowly |
