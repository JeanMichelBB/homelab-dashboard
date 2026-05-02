import type { Node } from '../types'
import { LiveDot } from './Skeleton'

interface Props {
  nodes: Record<string, Node>
  loading?: boolean
}

const REMOTE_NODES = [
  {
    key: 'tspi',
    os: 'Raspberry Pi OS',
    hw: 'Raspberry Pi 4',
    role: 'Monitoring',
    services: ['Prometheus', 'Grafana', 'Alertmanager'],
  },
  {
    key: 'oci-node-1',
    os: 'Ubuntu',
    hw: 'OCI VM.Standard.A1 (ARM)',
    role: 'k3s worker 1',
    services: ['k3s agent', 'OCI free tier'],
  },
  {
    key: 'oci-node-2',
    os: 'Ubuntu',
    hw: 'OCI VM.Standard.A1 (ARM)',
    role: 'k3s worker 2',
    services: ['k3s agent', 'OCI free tier'],
  },
]

export default function TailscaleSection({ nodes, loading }: Props) {
  return (
    <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-5 bg-gray-50/60 dark:bg-gray-900/40">
      <div className="text-xs font-mono text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        tailscale mesh — remote nodes
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {REMOTE_NODES.map(node => {
          const live = nodes[node.key]
          return (
            <div key={node.key} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl px-4 py-3.5">
              <div className="flex items-center gap-2 mb-0.5">
                <LiveDot online={live?.online} loading={loading} />
                <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{node.hw}</span>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-0.5 ml-4">{node.os}</div>
              <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-2.5 ml-4">{node.role}</div>
              <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                {node.services.map(s => <li key={s} className="flex gap-1.5"><span className="text-gray-300 dark:text-gray-700">·</span>{s}</li>)}
              </ul>
            </div>
          )
        })}
      </div>

      <p className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-600 leading-relaxed">
        The HomeLab nodes also join the same tailnet — enabling remote nodes to reach internal
        services without any additional firewall rules. All traffic is encrypted WireGuard point-to-point.
      </p>
    </div>
  )
}
