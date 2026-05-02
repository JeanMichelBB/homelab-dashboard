import { Link } from 'react-router-dom'
import type { Node } from '../types'
import { LiveDot } from './Skeleton'

interface Props {
  nodes: Record<string, Node>
  loading?: boolean
}

const REMOTE_NODES = [
  {
    key: 'tspi',
    display: 'Raspberry Pi OS',
    hw: 'Raspberry Pi 4',
    role: 'Monitoring',
    services: ['Prometheus', 'Grafana', 'Alertmanager'],
  },
  {
    key: 'oci-node-1',
    display: 'Ubuntu',
    hw: 'OCI VM.Standard.A1 (ARM)',
    role: 'k3s worker 1',
    services: ['k3s agent', 'OCI free tier'],
  },
  {
    key: 'oci-node-2',
    display: 'Ubuntu',
    hw: 'OCI VM.Standard.A1 (ARM)',
    role: 'k3s worker 2',
    services: ['k3s agent', 'OCI free tier'],
  },
]

export default function TailscaleSection({ nodes, loading }: Props) {
  return (
    <div className="space-y-4">
      <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-5 bg-gray-50/40 dark:bg-gray-900/40">
        <div className="text-xs font-mono text-gray-400 dark:text-gray-500 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500/60" />
          tailscale mesh — remote nodes
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {REMOTE_NODES.map(node => {
            const live = nodes[node.key]
            return (
              <div key={node.key} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 mb-0.5">
                  <LiveDot online={live?.online} loading={loading} />
                  <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{node.hw}</span>
                </div>
                <div className="text-xs text-gray-500 mb-1 ml-4">{node.display}</div>
                <div className="text-xs text-gray-400 dark:text-gray-600 mb-1">{node.role}</div>
                <ul className="text-xs text-gray-500 space-y-0.5">
                  {node.services.map(s => <li key={s}>· {s}</li>)}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-600 leading-relaxed">
          The HomeLab nodes (tselitedesk, tswindows11, tstruenas, <Link to="/opnsense" className="text-blue-600 dark:text-blue-400 hover:underline">OPNsense</Link>) also join the same tailnet —
          enabling the remote nodes to reach internal services without any additional configuration.
          All traffic between nodes is encrypted WireGuard point-to-point.
        </div>
      </div>
    </div>
  )
}
