import type { Node } from '../types'

function fmt(v: number | null, unit: string) {
  if (v === null || v === undefined || typeof v !== 'number') return '—'
  return `${v.toFixed(1)}${unit}`
}

function uptimeStr(s: number | null) {
  if (s === null) return '—'
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  return d > 0 ? `${d}d ${h}h` : `${h}h`
}

export default function NodeCard({ node }: { node: Node }) {
  return (
    <div className={`rounded-lg border p-4 ${node.online ? 'border-gray-700 bg-gray-900' : 'border-red-900 bg-red-950/30'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${node.online ? 'bg-green-400' : 'bg-red-500'}`} />
        <span className="font-semibold text-white">{node.name}</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">{node.role}</p>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <div className="text-gray-500">CPU</div>
          <div className="text-gray-200">{fmt(node.cpu_percent, '%')}</div>
        </div>
        <div>
          <div className="text-gray-500">RAM</div>
          <div className="text-gray-200">{fmt(node.ram_percent, '%')}</div>
        </div>
        <div>
          <div className="text-gray-500">Uptime</div>
          <div className="text-gray-200">{uptimeStr(node.uptime_seconds)}</div>
        </div>
      </div>
    </div>
  )
}
