import type { Node, K3sData } from '../types'

interface Props {
  nodes: Record<string, Node>
  k3s: K3sData | null
}

export default function K3sSection({ nodes, k3s }: Props) {
  const elitedesk = nodes['tselitedesk']
  const oci1 = nodes['oci-node-1']
  const oci2 = nodes['oci-node-2']

  return (
    <div className="space-y-4">

      {/* Cluster diagram */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-white dark:bg-gray-900">
        <div className="text-xs font-mono text-gray-400 dark:text-gray-500 mb-5">k3s cluster</div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <K3sNode
            name="Ubuntu"
            role="control-plane"
            online={elitedesk?.online}
            hw="HP EliteDesk 800 G2"
          />
          <K3sNode
            name="Ubuntu"
            role="worker 1"
            online={oci1?.online}
            hw="OCI VM.Standard.A1 (ARM)"
          />
          <K3sNode
            name="Ubuntu"
            role="worker 2"
            online={oci2?.online}
            hw="OCI VM.Standard.A1 (ARM)"
          />
        </div>
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

      <p className="text-xs text-gray-400 dark:text-gray-600 leading-relaxed">
        The OCI free-tier ARM nodes provide compute at no cost. Combined with the HomeLab control plane,
        the cluster runs the dashboard, several web apps, and supporting services like cert-manager,
        kube-state-metrics, and an NFS provisioner backed by TrueNAS.
      </p>

    </div>
  )
}

function K3sNode({ name, role, online, hw }: {
  name: string; role: string; online?: boolean; hw: string
}) {
  const isControl = role === 'control-plane'
  return (
    <div className={`border rounded-lg px-4 py-3 min-w-52 ${isControl ? 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950'}`}>
      <div className="flex items-center gap-2 mb-0.5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${online === true ? 'bg-green-400' : online === false ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{hw}</span>
      </div>
      <div className="text-xs text-gray-500 mb-2 ml-4">{name}</div>
      <div className={`text-xs px-1.5 py-0.5 rounded inline-block ${isControl ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
        {role}
      </div>
    </div>
  )
}
