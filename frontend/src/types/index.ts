export interface Node {
  name: string
  role: string
  tailscale_ip: string
  online: boolean
  cpu_percent: number | null
  ram_percent: number | null
  uptime_seconds: number | null
}

export interface Service {
  name: string
  category: string
  status: 'up' | 'down' | 'unknown'
  url: string
}

export interface Alert {
  name: string
  severity: string
  state: string
  summary: string
}

export interface MonitoringData {
  alerts: Alert[]
  total: number
  critical: number
  warning: number
}

export interface MediaData {
  sonarr: { series: number; episodes_monitored: number; missing: number }
  radarr: { movies: number; missing: number }
}

export interface StoragePool {
  name: string
  status: string
  used_gb: number
  total_gb: number
}

export interface StorageData {
  pools: StoragePool[]
  uptime_seconds: number
}

export interface GpuData {
  windows_online: boolean
  ollama_ready: boolean
  active_model: string | null
  requests: { ollama: number; groq: number; gemini: number }
}

export interface NetworkData {
  vpn: { status: string; public_ip: string; provider: string }
}

export interface K3sNode {
  name: string
  status: string
  role: string
}

export interface K3sData {
  nodes: K3sNode[]
  pods: { total: number; running: number; pending: number; failed: number }
}
