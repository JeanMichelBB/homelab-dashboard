import type { Node, K3sData, PodInfo } from '../types/index'

interface Props {
  nodes: Record<string, Node>
  k3s: K3sData | null
  pod: PodInfo | null
  onRefresh: () => void
}

const CLUSTER_NODES = [
  { key: 'tselitedesk', hw: 'HP EliteDesk 800 G2', os: 'Ubuntu', role: 'control-plane', nodeName: 'tselitedesk' },
  { key: 'oci-node-1',  hw: 'OCI VM.Standard.A1 (ARM)', os: 'Ubuntu', role: 'worker 1', nodeName: 'oci-node-1' },
  { key: 'oci-node-2',  hw: 'OCI VM.Standard.A1 (ARM)', os: 'Ubuntu', role: 'worker 2', nodeName: 'oci-node-2' },
]

export default function K3sSection({ nodes, k3s, pod, onRefresh }: Props) {
  return (
    <div className="space-y-4">

      {/* Cluster diagram */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-white dark:bg-gray-900">
        <div className="text-xs font-mono text-gray-400 dark:text-gray-500 mb-5">k3s cluster</div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CLUSTER_NODES.map(n => (
            <K3sNode
              key={n.key}
              hw={n.hw}
              os={n.os}
              role={n.role}
              online={nodes[n.key]?.online}
              serving={pod?.node === n.nodeName}
            />
          ))}
        </div>

        {/* Serving pod badge */}
        {pod?.hostname && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-xs font-mono text-gray-400 dark:text-gray-500">
            <span className="text-gray-300 dark:text-gray-700">Served by pod</span>
            <span className="text-blue-500 dark:text-blue-400">{pod.hostname}</span>
          </div>
        )}
      </div>

      {/* Pod stats */}
      {k3s && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['total', 'running', 'pending', 'failed'] as const).map(key => (
            <div key={key} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg px-4 py-3 text-center">
              <div className={`text-2xl font-bold ${key === 'failed' && k3s.pods.failed > 0 ? 'text-red-400' : key === 'running' ? 'text-green-400' : 'text-gray-900 dark:text-white'}`}>
                {k3s.pods[key]}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">{key}</div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh */}
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-600">
        <span>Node status and pod counts are fetched live — refresh to update.</span>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

    </div>
  )
}

function K3sNode({ hw, os, role, online, serving }: {
  hw: string; os: string; role: string; online?: boolean; serving?: boolean
}) {
  const isControl = role === 'control-plane'
  const highlight = isControl || serving

  return (
    <div className={`border rounded-lg px-4 py-3 ${highlight ? 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950'}`}>
      <div className="flex items-center gap-2 mb-0.5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${online === true ? 'bg-green-400' : online === false ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{hw}</span>
      </div>
      <div className="text-xs text-gray-500 mb-2 ml-4">{os}</div>
      <div className={`text-xs px-1.5 py-0.5 rounded inline-block ${highlight ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
        {role}
      </div>
      {serving && !isControl && (
        <div className="text-xs text-blue-400 dark:text-blue-500 mt-1.5 font-mono">← serving</div>
      )}
    </div>
  )
}
