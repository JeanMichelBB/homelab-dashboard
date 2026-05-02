import type { ReactNode } from 'react'
import type { Node } from '../types'
import { LiveDot } from './Skeleton'

interface Props {
  nodes: Record<string, Node>
  loading?: boolean
}

export default function NetworkTopology({ nodes, loading }: Props) {
  return (
    <div className="space-y-3">

      <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-white dark:bg-gray-900">
        <div className="flex flex-row items-center gap-0 flex-wrap font-mono text-sm">
          <FlowNode label="Internet" sub="WAN" dim />
          <Arrow />
          <FlowNode label="ISP Router" sub="DHCP / gateway" />
          <Arrow />
          <FlowNode label="OPNsense" sub="Protectli V1210" badge="firewall" online={nodes['tsopnsense']?.online} loading={loading} />
          <Arrow />
          <FlowNode label="Switch" sub="Netgear MS305E" />
          <Arrow />
          <FlowNode label="LAN" sub="physical nodes" />
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-4 leading-relaxed">
          All physical machines sit on the same LAN behind OPNsense. Internet-bound traffic
          from the media stack routes exclusively through Gluetun (ProtonVPN WireGuard) on elitedesk —
          nothing else has a direct outbound internet path.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <PhysicalNode
          hw="HP EliteDesk 800 G2"
          os="Ubuntu"
          services={['Media stack', 'OpenClaw (gpu-proxy)', 'Minecraft', 'k3s control plane']}
          online={nodes['tselitedesk']?.online}
          loading={loading}
        />
        <PhysicalNode
          hw="Gaming PC — RTX 5070"
          os="Windows 11"
          services={['Ollama (RTX 5070)', 'GPU inference — OpenClaw backend']}
          online={nodes['tswindows11']?.online}
          loading={loading}
        />
        <PhysicalNode
          hw="Beelink ME Pro 2 · N95"
          os="TrueNAS Scale"
          services={['ZFS mirror RAID1', '4 TB storage', 'NFS for k3s']}
          online={nodes['tstruenas']?.online}
          loading={loading}
        />
      </div>

    </div>
  )
}

function FlowNode({ label, sub, badge, dim, online, loading }: {
  label: ReactNode; sub?: string; badge?: string; dim?: boolean; online?: boolean; loading?: boolean
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
      dim
        ? 'border-transparent bg-transparent'
        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60'
    }`}>
      <div>
        <div className={`font-semibold text-xs ${dim ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-200'}`}>{label}</div>
        {sub && <div className="text-xs text-gray-400 dark:text-gray-600">{sub}</div>}
      </div>
      {badge && (
        <span className="text-xs px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium">
          {badge}
        </span>
      )}
      {online !== undefined && <LiveDot online={online} loading={loading} />}
    </div>
  )
}

function Arrow() {
  return <div className="text-gray-300 dark:text-gray-700 px-1 text-xs select-none">──▶</div>
}

function PhysicalNode({ hw, os, services, online, loading }: {
  hw: string; os: string; services: string[]; online?: boolean; loading?: boolean
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-xl px-4 py-3.5 transition-colors hover:border-gray-300 dark:hover:border-gray-700">
      <div className="flex items-center gap-2 mb-0.5">
        <LiveDot online={online} loading={loading} />
        <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{hw}</span>
      </div>
      <div className="text-xs font-mono text-gray-400 dark:text-gray-500 mb-2.5 ml-4">{os}</div>
      <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
        {services.map(s => (
          <li key={s} className="flex gap-1.5">
            <span className="text-gray-300 dark:text-gray-700 select-none">·</span>{s}
          </li>
        ))}
      </ul>
    </div>
  )
}
