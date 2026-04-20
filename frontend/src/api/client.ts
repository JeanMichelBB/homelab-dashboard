import type { Node, Service, MonitoringData, MediaData, StorageData, GpuData, NetworkData, K3sData, PodInfo } from '../types/index'

const BASE = import.meta.env.VITE_API_URL ?? '/api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`${path} ${res.status}`)
  return res.json()
}

export const api = {
  nodes: () => get<Node[]>('/nodes'),
  services: () => get<Service[]>('/services'),
  monitoring: () => get<MonitoringData>('/monitoring'),
  media: () => get<MediaData>('/media'),
  storage: () => get<StorageData>('/storage'),
  gpu: () => get<GpuData>('/gpu'),
  network: () => get<NetworkData>('/network'),
  k3s: () => get<K3sData>('/k3s'),
  pod: () => fetch(`/pod.json?t=${Date.now()}`).then(r => r.ok ? r.json() : Promise.reject()) as Promise<PodInfo>,
}
