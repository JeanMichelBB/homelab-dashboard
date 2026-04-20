import type { Node } from '../types'

interface Props {
  nodes: Record<string, Node>
}

export default function NetworkTopology({ nodes }: Props) {
  return (
    <div className="space-y-4">

      {/* Network path */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-white dark:bg-gray-900 font-mono text-sm">
        <div className="flex flex-row items-center gap-0 flex-wrap">
          <FlowNode label="Internet" icon="🌐" dim />
          <Arrow />
          <FlowNode label="ISP Router" sub="DHCP / gateway" icon="📡" />
          <Arrow />
          <FlowNode label="OPNsense" sub="Protectli V1210" icon="🛡️" badge="firewall" online={nodes['tsopnsense']?.online} />
          <Arrow />
          <FlowNode label="Switch" sub="Netgear MS305E" icon="🔀" />
          <Arrow />
          <FlowNode label="LAN" sub="physical nodes" icon="🖥️" />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-4 leading-relaxed">
          All physical machines sit on the same LAN behind OPNsense. Internet-bound traffic
          from the media stack routes exclusively through Gluetun (ProtonVPN WireGuard) on elitedesk —
          nothing else has a direct outbound internet path.
        </p>
      </div>

      {/* Physical nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <PhysicalNode
          name="Ubuntu"
          hw="HP EliteDesk 800 G2"
          services={['Media stack', 'OpenClaw (gpu-proxy)', 'Minecraft', 'k3s control plane']}
          online={nodes['tselitedesk']?.online}
        />
        <PhysicalNode
          name="Windows 11"
          hw="Gaming PC — RTX 5070"
          services={['Ollama (RTX 5070)', 'GPU inference — OpenClaw backend']}
          online={nodes['tswindows11']?.online}
        />
        <PhysicalNode
          name="TrueNAS Scale"
          hw="Beelink ME Pro 2 Intel N95"
          services={['ZFS mirror RAID1', '4 TB storage', 'NFS for k3s']}
          online={nodes['tstruenas']?.online}
        />
      </div>

    </div>
  )
}

function FlowNode({ label, sub, icon, badge, dim, online }: {
  label: string; sub?: string; icon: string; badge?: string; dim?: boolean; online?: boolean
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${dim ? 'border-gray-200 dark:border-gray-800 bg-transparent' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950'}`}>
      <span>{icon}</span>
      <div>
        <div className={`font-semibold text-xs ${dim ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-200'}`}>{label}</div>
        {sub && <div className="text-xs text-gray-400 dark:text-gray-600">{sub}</div>}
      </div>
      {badge && <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">{badge}</span>}
      {online !== undefined && (
        <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-400' : 'bg-red-500'}`} />
      )}
    </div>
  )
}

function Arrow() {
  return <div className="text-gray-300 dark:text-gray-700 px-1 text-xs">──▶</div>
}

function PhysicalNode({ name, hw, services, online }: {
  name: string; hw: string; services: string[]; online?: boolean
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg px-4 py-3">
      <div className="flex items-center gap-2 mb-0.5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${online === true ? 'bg-green-400' : online === false ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
        <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{hw}</span>
      </div>
      <div className="text-xs text-gray-500 mb-2 ml-4">{name}</div>
      <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-0.5">
        {services.map(s => <li key={s}>· {s}</li>)}
      </ul>
    </div>
  )
}
