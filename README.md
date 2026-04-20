# homelab-dashboard

Live dashboard for my homelab infrastructure at `homelab.sacenpapier.org`.

A full-stack app that aggregates real-time status from all homelab nodes, services, and systems into a single view — without exposing any credentials to the browser.

---

## What it shows

**Overview** — node grid with CPU/RAM/uptime per machine, quick stats (pods running, active alerts, GPU status), alert banner when Prometheus fires critical/warning alerts.

**Infrastructure** — all nodes with Tailscale IPs and roles, k3s cluster status (node readiness, pod counts), GPU/Ollama proxy status with request counts.

**Services** — live up/down status for every service (Sonarr, Radarr, Prowlarr, qBittorrent, Jellyfin, Portainer, Grafana, Prometheus, gpu-proxy), grouped by category.

---

## Architecture

```
Browser
  └── homelab.sacenpapier.org       (React SPA — nginx, k3s ingress)
        └── /api/*                  (FastAPI — k3s deployment)
              ├── Redis              TTL-based cache (15s–5min per endpoint)
              ├── Prometheus         100.76.60.40:9090
              ├── Glances (tspi)     100.76.60.40:61208
              ├── Glances (elitedesk) 100.109.234.126:61208
              ├── Glances (Windows)  100.71.171.120:9091 (Prometheus metrics)
              ├── TrueNAS API        100.74.128.46
              ├── gpu-proxy          100.109.234.126:11435
              ├── Gluetun            100.109.234.126:8000
              └── k3s API            https://100.109.234.126:6443
```

**Security model:** all credentials live in k8s Secrets — never exposed to the browser. React only sees aggregated JSON from FastAPI. Redis is ClusterIP-only (not reachable outside the cluster).

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | FastAPI (Python 3.12) + httpx async |
| Cache | Redis 7 — TTL-based, no persistence needed |
| Deploy | k3s (OCI free tier workers + elitedesk control plane) |
| Ingress | Traefik — `homelab.sacenpapier.org` |
| Secrets | k8s Secrets — API keys never leave the cluster |
| CI/CD | GitHub Actions → Docker Hub → kubectl rollout restart |

---

## API endpoints

| Endpoint | TTL | Sources |
|---|---|---|
| `GET /api/nodes` | 15s | Glances REST (tspi, elitedesk), Prometheus node metrics (OCI, Windows), TrueNAS API |
| `GET /api/services` | 30s | HTTP health checks (`/ping`, `/health`, `/-/healthy`) |
| `GET /api/monitoring` | 15s | Prometheus `/api/v1/alerts` |
| `GET /api/gpu` | 30s | gpu-proxy `/health` + `/stats` |
| `GET /api/network` | 30s | Gluetun control server `/v1/vpn/status` + `/v1/publicip/ip` |
| `GET /api/storage` | 2min | TrueNAS API `/api/v2.0/pool` |
| `GET /api/k3s` | 1min | k3s API `/api/v1/nodes` + `/api/v1/pods` |

---

## Project structure

```
homelab-dashboard/
  frontend/               React + Vite app (served by nginx)
    src/
      pages/
        Overview.tsx
        Infrastructure.tsx
        Services.tsx
      components/
        NodeCard.tsx
        AlertBanner.tsx
      api/client.ts       all fetch calls to FastAPI
      types/index.ts      shared TypeScript types
    Dockerfile
    default.conf          nginx — serves SPA + proxies /api to backend

  backend/                FastAPI app
    app/
      main.py             FastAPI + CORS
      config.py           settings from env vars
      cache.py            Redis get/set with TTL
      routers/            one file per endpoint
      clients/            one file per external service
    Dockerfile
    requirements.txt

  k3s/                    Kubernetes manifests
    namespace.yaml
    frontend-deployment.yaml
    backend-deployment.yaml
    redis-deployment.yaml
    backend-configmap.yaml
    backend-secret.example.yaml
    ingress.yaml          Traefik — homelab.sacenpapier.org

  docker-compose.yml      local dev (frontend + backend + redis)
  .env.example            env var template
  .github/workflows/
    deploy.yml            build → Docker Hub → kubectl rollout restart
```

---

## Local development

```bash
# 1. Clone and setup env
git clone <repo>
cd homelab-dashboard
cp .env.example .env
# Fill in: TRUENAS_API_KEY, SONARR_API_KEY, RADARR_API_KEY, K3S_BEARER_TOKEN

# 2. Start backend + redis in Docker
docker compose up -d backend redis

# 3. Run frontend with hot reload
cd frontend && npm install && npm run dev
# → http://localhost:5173
# Vite proxies /api/* → http://localhost:8000
```

Or run everything in Docker (no hot reload):
```bash
docker compose up --build
# → http://localhost:3000
```

---

## k3s deployment

```bash
# Apply manifests (first time)
kubectl apply -f k3s/namespace.yaml
kubectl apply -f k3s/redis-deployment.yaml
kubectl apply -f k3s/backend-configmap.yaml
kubectl apply -f k3s/backend-secret.yaml      # real secrets, gitignored
kubectl apply -f k3s/backend-deployment.yaml
kubectl apply -f k3s/frontend-deployment.yaml
kubectl apply -f k3s/ingress.yaml
```

The k3s service account used by the backend needs read access:
```bash
kubectl create serviceaccount homelab-dashboard -n default
kubectl create clusterrolebinding homelab-dashboard-read \
  --clusterrole=cluster-admin \
  --serviceaccount=default:homelab-dashboard
kubectl create token homelab-dashboard -n default --duration=8760h
```

---

## CI/CD

Push to `main` triggers GitHub Actions:
1. Builds `jeanmichelbb/homelab-fe:latest` and `jeanmichelbb/homelab-be:latest` (linux/amd64 + arm64)
2. SSH into tselitedesk and runs `kubectl rollout restart` for each deployment

Required GitHub secrets: `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`

---

## Homelab nodes

| Node | Role | Tailscale IP |
|---|---|---|
| tselitedesk | Main server — media stack, k3s control plane, gpu-proxy | 100.109.234.126 |
| tspi | Monitoring — Prometheus, Grafana, Alertmanager | 100.76.60.40 |
| tswindows11 | Gaming PC — Ollama GPU inference (RTX 5070) | 100.71.171.120 |
| tstruenas | NAS — TrueNAS Scale, ZFS mirror (4TB) | 100.74.128.46 |
| oci-node-1 | k3s worker (OCI free tier) | 100.104.232.105 |
| oci-node-2 | k3s worker (OCI free tier) | 100.67.187.71 |

All nodes communicate over Tailscale mesh. No direct internet exposure except through Gluetun (ProtonVPN WireGuard) on tselitedesk.

---

## Ideas / future work

- **Glances on tselitedesk** — install and run Glances on elitedesk so CPU/RAM shows for the main node (currently offline in the nodes view)
- **tswindows11 metrics** — Windows Glances exports Prometheus metrics on port 9091 but requires the PC to be awake; currently shows offline when sleeping
- **GPU wake integration** — add a "Wake" button on the Infrastructure page that calls `POST gpu-proxy/wake` to SSH-start Ollama on Windows
- **Alert detail drawer** — click an alert on Overview to expand the full Prometheus alert with description and labels
- **Historical graphs** — embed Grafana panel iframes or use Prometheus query API to show sparklines on node cards
- **Dark/light mode toggle**
- **DNS setup** — point `homelab.sacenpapier.org` to the k3s ingress IP once ready to deploy
- **OPNsense node** — add firewall status (currently monitored via Prometheus but not shown in the dashboard)
- **Storage page** — TrueNAS pool usage, ZFS health, disk temperatures (data is available via API, just not exposed in the frontend yet)
