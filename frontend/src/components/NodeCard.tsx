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
    <div className={`rounded-xl border p-4 ${
      node.online
        ? 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
        : 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20'
    }`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${node.online ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{node.name}</span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 ml-4">{node.role}</p>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <Metric label="CPU" value={fmt(node.cpu_percent, '%')} />
        <Metric label="RAM" value={fmt(node.ram_percent, '%')} />
        <Metric label="Uptime" value={uptimeStr(node.uptime_seconds)} />
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-gray-400 dark:text-gray-600 mb-0.5">{label}</div>
      <div className="text-gray-700 dark:text-gray-300 font-medium">{value}</div>
    </div>
  )
}
