import type { Node, K3sData } from '../types'

interface Props {
  nodes: Node[]
  k3s: K3sData | null
}

export default function Hero({ nodes, k3s }: Props) {
  const onlineCount = nodes.filter(n => n.online).length
  const totalCount = nodes.length

  return (
    <section className="relative rounded-2xl overflow-hidden border border-indigo-900/60 bg-gray-900 shadow-[0_0_80px_rgba(99,102,241,0.08)]">

      {/* colored glow blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-cyan-600/10 blur-3xl" />

      {/* dot grid background */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle, #818cf8 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* top gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-transparent to-gray-900" />

      <div className="relative px-8 pt-14 pb-10">

        {/* live badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-xs text-gray-500 font-mono">live — {onlineCount}/{totalCount} nodes online</span>
        </div>

        {/* title */}
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-cyan-400">
            homelab
          </span>
        </h1>

        <p className="text-gray-400 text-base mb-8 max-w-xl leading-relaxed">
          Self-hosted infrastructure running on physical hardware, OCI free-tier cloud,
          and a Raspberry Pi — connected over a{' '}
          <span className="text-gray-200">Tailscale</span> mesh, exposed publicly through{' '}
          <span className="text-gray-200">Cloudflare</span> and a{' '}
          <span className="text-gray-200">k3s</span> cluster.
        </p>

        {/* stats row */}
        <div className="flex flex-wrap gap-6">
          <Stat value={totalCount || '—'} label="nodes" />
          <Divider />
          <Stat value={k3s ? k3s.pods.running : '—'} label="pods running" highlight />
          <Divider />
          <Stat value={k3s ? k3s.nodes.length : '—'} label="k3s nodes" />
          <Divider />
          <Stat value="6" label="public projects" />
        </div>

      </div>
    </section>
  )
}

function Stat({ value, label, highlight }: { value: number | string; label: string; highlight?: boolean }) {
  return (
    <div>
      <div className={`text-2xl font-bold ${highlight ? 'text-green-400' : 'text-white'}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  )
}

function Divider() {
  return <div className="w-px bg-gray-800 self-stretch" />
}
