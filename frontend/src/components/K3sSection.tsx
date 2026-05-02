import { useState, useEffect, useRef } from 'react'
import { api } from '../api/client'
import type { Node, K3sData, PodInfo } from '../types/index'
import { LiveDot, Skeleton } from './Skeleton'

interface Props {
  nodes: Record<string, Node>
  k3s: K3sData | null
  pod: PodInfo | null
  onRefresh: () => void
  loading?: boolean
}

const CLUSTER_NODES = [
  { key: 'tselitedesk', hw: 'HP EliteDesk 800 G2',      os: 'Ubuntu', role: 'control-plane', nodeName: 'elitedesk' },
  { key: 'oci-node-1',  hw: 'OCI VM.Standard.A1 (ARM)', os: 'Ubuntu', role: 'worker 1',      nodeName: 'oci-node-1' },
  { key: 'oci-node-2',  hw: 'OCI VM.Standard.A1 (ARM)', os: 'Ubuntu', role: 'worker 2',      nodeName: 'oci-node-2' },
]

export default function K3sSection({ nodes, k3s, pod: initialPod, loading }: Props) {
  const [pod, setPod] = useState<PodInfo | null>(null)
  const [spinning, setSpinning] = useState(false)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialPod && !initialized.current) {
      setPod(initialPod)
      initialized.current = true
    }
  }, [initialPod])

  const rotatePod = () => {
    setSpinning(true)
    api.pod().then(setPod).catch(console.error).finally(() => setSpinning(false))
  }

  return (
    <div className="space-y-3">

      {/* Cluster nodes */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-mono text-gray-400 dark:text-gray-500">k3s cluster</span>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 dark:text-gray-600 hidden sm:block">
              Each request is served by one of three replicas — rotate to re-route and see which node picks it up.
            </span>
            <button
              onClick={rotatePod}
              disabled={spinning}
              title="Re-route to a different pod"
              className="rounded-full border border-gray-200 dark:border-gray-800 p-1.5 text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-800 hover:text-emerald-500 dark:hover:text-emerald-400 disabled:opacity-40 transition-colors"
            >
              <svg className={`w-3 h-3 ${spinning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 3v5h-5" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CLUSTER_NODES.map(n => (
            <K3sNode
              key={n.key}
              hw={n.hw}
              os={n.os}
              role={n.role}
              online={nodes[n.key]?.online}
              serving={pod?.node === n.nodeName}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* Pod stats */}
      {(k3s || loading) && (
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl px-6 py-4 bg-white dark:bg-gray-900">
          <div className="flex flex-wrap gap-8">
            <PodStat label="total"   value={loading ? null : (k3s?.pods.total   ?? '—')} />
            <StatDivider />
            <PodStat label="running" value={loading ? null : (k3s?.pods.running ?? '—')} highlight="emerald" />
            <StatDivider />
            <PodStat label="pending" value={loading ? null : (k3s?.pods.pending ?? '—')} />
            <StatDivider />
            <PodStat label="failed"  value={loading ? null : (k3s?.pods.failed  ?? '—')} highlight={!loading && k3s && k3s.pods.failed > 0 ? 'red' : undefined} />
          </div>
        </div>
      )}

    </div>
  )
}

function PodStat({ label, value, highlight }: {
  label: string
  value: number | string | null
  highlight?: 'emerald' | 'red'
}) {
  const color = highlight === 'emerald'
    ? 'text-emerald-500 dark:text-emerald-400'
    : highlight === 'red'
    ? 'text-red-400'
    : 'text-gray-900 dark:text-white'

  return (
    <div>
      <div className={`text-2xl font-bold font-mono tabular-nums ${color}`}>
        {value === null
          ? <span className="inline-block w-8 h-7 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          : value}
      </div>
      <div className="text-xs font-mono text-gray-400 dark:text-gray-600 mt-0.5">{label}</div>
    </div>
  )
}

function StatDivider() {
  return <div className="w-px bg-gray-100 dark:bg-gray-800 self-stretch" />
}

function K3sNode({ hw, os, role, online, serving, loading }: {
  hw: string; os: string; role: string; online?: boolean; serving?: boolean; loading?: boolean
}) {
  return (
    <div className={`border rounded-xl px-4 py-3.5 transition-colors ${
      serving
        ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/20'
        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
    }`}>
      <div className="flex items-center gap-2 mb-0.5">
        <LiveDot online={online} loading={loading} />
        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{hw}</span>
      </div>
      <div className="text-xs font-mono text-gray-400 dark:text-gray-500 mb-2.5 ml-4">{os}</div>
      <div className={`text-xs font-mono px-1.5 py-0.5 rounded-md inline-block ${
        serving
          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500'
      }`}>
        {role}
      </div>
      {serving && (
        <div className="text-xs font-mono text-emerald-500 dark:text-emerald-400 mt-1.5">← serving</div>
      )}
    </div>
  )
}
