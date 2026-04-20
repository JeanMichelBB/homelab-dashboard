import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Node, K3sData, GpuData } from '../types'

export default function Infrastructure() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [k3s, setK3s] = useState<K3sData | null>(null)
  const [gpu, setGpu] = useState<GpuData | null>(null)

  useEffect(() => {
    api.nodes().then(setNodes).catch(console.error)
    api.k3s().then(setK3s).catch(console.error)
    api.gpu().then(setGpu).catch(console.error)
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Infrastructure</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {nodes.map(node => (
          <div key={node.name} className={`rounded-lg border p-5 ${node.online ? 'border-gray-700 bg-gray-900' : 'border-red-900 bg-red-950/30'}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${node.online ? 'bg-green-400' : 'bg-red-500'}`} />
              <span className="font-semibold text-white">{node.name}</span>
              <span className="ml-auto text-xs text-gray-500">{node.tailscale_ip}</span>
            </div>
            <p className="text-sm text-gray-400">{node.role}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {k3s && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h2 className="text-base font-semibold text-gray-300 mb-4">k3s Cluster</h2>
            <div className="space-y-2 mb-4">
              {k3s.nodes.map(n => (
                <div key={n.name} className="flex justify-between text-sm">
                  <span className="text-gray-300">{n.name}</span>
                  <span className="flex gap-3">
                    <span className="text-gray-500">{n.role}</span>
                    <span className={n.status === 'Ready' ? 'text-green-400' : 'text-red-400'}>{n.status}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs text-center">
              {(['total', 'running', 'pending', 'failed'] as const).map(k => (
                <div key={k} className="bg-gray-800 rounded p-2">
                  <div className={k === 'failed' && k3s.pods.failed > 0 ? 'text-red-400 font-bold text-base' : 'text-white font-bold text-base'}>{k3s.pods[k]}</div>
                  <div className="text-gray-500">{k}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {gpu && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h2 className="text-base font-semibold text-gray-300 mb-4">GPU / AI</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Windows" value={gpu.windows_online ? 'online' : 'offline'} ok={gpu.windows_online} />
              <Row label="Ollama" value={gpu.ollama_ready ? 'ready' : 'not ready'} ok={gpu.ollama_ready} />
              <Row label="Active model" value={gpu.active_model ?? 'none'} />
              <Row label="Requests (Ollama)" value={gpu.requests.ollama} />
              <Row label="Requests (Groq)" value={gpu.requests.groq} />
              <Row label="Requests (Gemini)" value={gpu.requests.gemini} />
            </dl>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value, ok }: { label: string; value: string | number; ok?: boolean }) {
  const color = ok === true ? 'text-green-400' : ok === false ? 'text-red-400' : 'text-gray-200'
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className={`font-medium ${color}`}>{value}</dd>
    </div>
  )
}
