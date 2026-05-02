import type { Node, K3sData } from '../types/index'
import { Skeleton } from './Skeleton'

interface Props {
  nodes: Node[]
  k3s: K3sData | null
  loading?: boolean
}

export default function Hero({ nodes, k3s, loading }: Props) {
  const onlineCount = nodes.filter(n => n.online).length
  const totalCount = nodes.length

  return (
    <section className="border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 px-8 pt-12 pb-10">

      <div className="flex items-center gap-2 mb-8">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
          live —{' '}
          {loading ? <Skeleton className="inline-block w-16 h-3 align-middle" /> : `${onlineCount}/${totalCount} nodes online`}
        </span>
      </div>

      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-none mb-4 text-gray-900 dark:text-white">
        HomeLab
      </h1>

      <p className="text-gray-500 dark:text-gray-400 text-base mb-10 max-w-xl leading-relaxed">
        Self-hosted infrastructure on physical hardware, OCI free-tier cloud, and a Raspberry Pi —
        connected over a <span className="text-gray-800 dark:text-gray-200 font-medium">Tailscale</span> mesh,
        exposed publicly through <span className="text-gray-800 dark:text-gray-200 font-medium">Cloudflare</span> and
        a <span className="text-gray-800 dark:text-gray-200 font-medium">k3s</span> cluster.
      </p>

      <div className="flex flex-wrap gap-8">
        <Stat value={loading ? null : (totalCount || '—')} label="nodes" />
        <Divider />
        <Stat value={loading ? null : (k3s ? k3s.pods.running : '—')} label="pods running" highlight />
        <Divider />
        <Stat value={loading ? null : (k3s ? k3s.nodes.length : '—')} label="k3s nodes" />
        <Divider />
        <Stat value="6" label="public projects" />
      </div>

    </section>
  )
}

function Stat({ value, label, highlight }: { value: number | string | null; label: string; highlight?: boolean }) {
  return (
    <div>
      <div className={`text-2xl font-bold font-mono tabular-nums ${highlight ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
        {value === null
          ? <span className="inline-block w-8 h-7 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
          : value}
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-600 mt-0.5 font-mono">{label}</div>
    </div>
  )
}

function Divider() {
  return <div className="w-px bg-gray-100 dark:bg-gray-800 self-stretch" />
}
