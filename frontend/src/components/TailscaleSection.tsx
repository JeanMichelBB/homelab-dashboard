import type { Node } from '../types'

interface Props {
  nodes: Record<string, Node>
}

const REMOTE_NODES = [
  {
    key: 'tspi',
    display: 'pi',
    role: 'Monitoring',
    services: ['Prometheus', 'Grafana', 'Alertmanager'],
    note: 'Raspberry Pi 4',
  },
  {
    key: 'oci-node-1',
    display: 'oci-node-1',
    role: 'k3s worker',
    services: ['k3s agent', 'OCI free tier (ARM)'],
  },
  {
    key: 'oci-node-2',
    display: 'oci-node-2',
    role: 'k3s worker',
    services: ['k3s agent', 'OCI free tier (ARM)'],
  },
]

export default function TailscaleSection({ nodes }: Props) {
  return (
    <div className="space-y-4">
      <div className="border border-dashed border-gray-700 rounded-xl p-5 bg-gray-900/40">
        <div className="text-xs font-mono text-gray-500 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500/60" />
          tailscale mesh — remote nodes
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {REMOTE_NODES.map(node => {
            const live = nodes[node.key]
            return (
              <div key={node.key} className="border border-gray-800 bg-gray-900 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${live?.online === true ? 'bg-green-400' : live?.online === false ? 'bg-red-500' : 'bg-gray-600'}`} />
                  <span className="font-semibold text-gray-200 text-sm">{node.display}</span>
                </div>
                {node.note && <div className="text-xs text-gray-500 mb-1">{node.note}</div>}
                <ul className="text-xs text-gray-500 space-y-0.5">
                  {node.services.map(s => <li key={s}>· {s}</li>)}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-600 leading-relaxed">
          The homelab nodes (tselitedesk, tswindows11, tstruenas, OPNsense) also join the same tailnet —
          enabling the remote nodes to reach internal services without any additional configuration.
          All traffic between nodes is encrypted WireGuard point-to-point.
        </div>
      </div>
    </div>
  )
}
