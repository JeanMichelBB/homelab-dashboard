from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import nodes, services, monitoring, media, storage, gpu, network, k3s

app = FastAPI(title="homelab-dashboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://homelab.sacenpapier.org", "http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(nodes.router, prefix="/api")
app.include_router(services.router, prefix="/api")
app.include_router(monitoring.router, prefix="/api")
app.include_router(media.router, prefix="/api")
app.include_router(storage.router, prefix="/api")
app.include_router(gpu.router, prefix="/api")
app.include_router(network.router, prefix="/api")
app.include_router(k3s.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
