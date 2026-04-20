import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Node, MonitoringData, K3sData, GpuData } from '../types'
import NodeCard from '../components/NodeCard'
import AlertBanner from '../components/AlertBanner'

export default function Overview() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [monitoring, setMonitoring] = useState<MonitoringData | null>(null)
  const [k3s, setK3s] = useState<K3sData | null>(null)
  const [gpu, setGpu] = useState<GpuData | null>(null)

  useEffect(() => {
    api.nodes().then(setNodes).catch(console.error)
    api.monitoring().then(setMonitoring).catch(console.error)
    api.k3s().then(setK3s).catch(console.error)
    api.gpu().then(setGpu).catch(console.error)

    const interval = setInterval(() => {
      api.nodes().then(setNodes).catch(console.error)
      api.monitoring().then(setMonitoring).catch(console.error)
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Overview</h1>

      {monitoring && <AlertBanner data={monitoring} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Pods Running" value={k3s ? `${k3s.pods.running}/${k3s.pods.total}` : '—'} />
        <StatCard label="Alerts" value={monitoring ? String(monitoring.total) : '—'} warn={monitoring ? monitoring.total > 1 : false} />
        <StatCard label="GPU" value={gpu ? (gpu.windows_online ? (gpu.active_model ?? 'online') : 'offline') : '—'} ok={gpu?.windows_online} />
      </div>

      <h2 className="text-lg font-semibold text-gray-300 mb-4">Nodes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nodes.map(n => <NodeCard key={n.name} node={n} />)}
      </div>
    </div>
  )
}

function StatCard({ label, value, ok, warn }: { label: string; value: string; ok?: boolean; warn?: boolean }) {
  const color = ok === false ? 'text-red-400' : ok ? 'text-green-400' : warn ? 'text-yellow-400' : 'text-white'
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  )
}
