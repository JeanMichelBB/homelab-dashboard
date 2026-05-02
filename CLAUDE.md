# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Frontend dev (hot reload)
cd frontend && npm run dev          # http://localhost:5173

# Backend dev
cd backend
source venv/bin/activate
./venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Full stack (Docker)
docker compose up --build           # http://localhost:3000

# Frontend build/lint
cd frontend && npm run build
cd frontend && npm run lint
```

Always use `./venv/bin/uvicorn` (not `uvicorn`) — the system has a conflicting Python 3.13 uvicorn that takes PATH priority over the venv.

## Architecture

```
Browser → React SPA (Vite + Tailwind)
            └── /api/* → FastAPI (Python 3.14, venv at backend/venv/)
                            └── Redis (TTL cache, 15s–5min per endpoint)
                            └── External: Glances, Prometheus, TrueNAS, Sonarr, Radarr, gpu-proxy, Gluetun, k3s API
```

All nodes communicate over **Tailscale mesh** (100.x.x.x IPs). No credentials ever reach the browser — FastAPI reads API keys from env vars (k8s Secrets in prod, `.env` locally).

## Frontend Structure

**Active routes** (in `src/router.tsx`):
- `/` → `pages/Home.tsx` — main dashboard
- `/opnsense` → `pages/OpnSensePage.tsx`

**Unused pages** (not routed): `Infrastructure.tsx`, `Overview.tsx`, `Services.tsx`, `Media.tsx` — exist as files but unreachable.

**Design system:**
- Font: `Outfit` (UI) + `JetBrains Mono` (data/labels) — loaded via Google Fonts in `index.html`
- Accent: `emerald` only — indigo/purple is banned (AI slop pattern)
- No emojis anywhere in components
- Cards: `border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl`
- Dark mode: class-based, toggled in `App.tsx`, persisted to localStorage

**Installed design skills** (`.agents/skills/`):
- `design-taste-frontend` — anti-slop rules, typography, layout directives
- `redesign-existing-projects` — audit checklist for upgrading existing UI

## Backend Structure

`app/routers/` — one file per API endpoint (`nodes.py`, `k3s.py`, `monitoring.py`, etc.)
`app/clients/` — one file per external service (Glances, Prometheus, TrueNAS, etc.)
`app/cache.py` — Redis async get/set with TTL
`app/config.py` — all settings from env vars via pydantic-settings

## Key Data Flow

`api/client.ts` → `src/types/index.ts` — all fetch calls typed, single source of truth for API shape.

`Home.tsx` fetches `nodes` and `k3s` independently with separate loading states so skeleton sections resolve as data arrives.

## Local env vars needed

Copy `.env.example` → `.env` and fill: `TRUENAS_API_KEY`, `SONARR_API_KEY`, `RADARR_API_KEY`, `K3S_BEARER_TOKEN`.

## Deployment

Push to `main` → GitHub Actions builds Docker images (`jeanmichelbb/homelab-fe`, `jeanmichelbb/homelab-be`) → SSH into tselitedesk → `kubectl rollout restart`.

k3s manifests in `k3s/` — `backend-secret.yaml` is gitignored (use `backend-secret.example.yaml` as template).
