from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    redis_url: str = "redis://localhost:6379"
    prometheus_url: str = ""
    glances_elitedesk_url: str = ""
    glances_tspi_url: str = ""
    glances_win_url: str = ""
    truenas_url: str = ""
    truenas_api_key: str = ""
    sonarr_url: str = ""
    sonarr_api_key: str = ""
    radarr_url: str = ""
    radarr_api_key: str = ""
    prowlarr_url: str = ""
    qbittorrent_url: str = ""
    jellyfin_url: str = ""
    portainer_url: str = ""
    grafana_url: str = ""
    gpuproxy_url: str = ""
    gluetun_url: str = ""
    k3s_url: str = ""
    k3s_bearer_token: str = ""
    tailscale_ip_elitedesk: str = ""
    tailscale_ip_tspi: str = ""
    tailscale_ip_windows: str = ""
    tailscale_ip_truenas: str = ""
    tailscale_ip_oci1: str = ""
    tailscale_ip_oci2: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
