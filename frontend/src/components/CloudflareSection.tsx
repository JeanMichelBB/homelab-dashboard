import { useState } from 'react'

const PROJECTS = [
  {
    name: 'sacenpapier.org',
    description: 'Personal hub & portfolio',
    hosts: ['sacenpapier.org', 'www.sacenpapier.org'],
    url: 'https://sacenpapier.org',
  },
  {
    name: 'Apercu',
    description: 'Full-stack web app',
    hosts: ['apercu.sacenpapier.org', 'apercuapi.sacenpapier.org'],
    url: 'https://apercu.sacenpapier.org',
  },
  {
    name: 'BotWhy',
    description: 'Discord bot dashboard',
    hosts: ['botwhy.sacenpapier.org', 'botwhyapi.sacenpapier.org'],
    url: 'https://botwhy.sacenpapier.org',
  },
  {
    name: 'PopRoom',
    description: 'Full-stack web app',
    hosts: ['poproom.sacenpapier.org', 'poproomapi.sacenpapier.org'],
    url: 'https://poproom.sacenpapier.org',
  },
  {
    name: 'X Clone',
    description: 'Twitter/X clone project',
    hosts: ['x.sacenpapier.org', 'xapi.sacenpapier.org'],
    url: 'https://x.sacenpapier.org',
  },
  {
    name: 'HomeLab Dashboard',
    description: 'This — live HomeLab infrastructure overview',
    hosts: ['homelab.sacenpapier.org', 'homelabapi.sacenpapier.org'],
    url: 'https://homelab.sacenpapier.org',
  },
]

export default function CloudflareSection() {
  const [selected, setSelected] = useState(PROJECTS.find(p => p.name === 'PopRoom')!)

  return (
    <div className="space-y-4">

      {/* Traffic flow diagram */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-5 bg-white dark:bg-gray-900 font-mono text-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
          <FlowNode label="Internet" icon="🌐" dim />
          <Arrow />
          <FlowNode label="Cloudflare" sub="DNS + TLS proxy" icon="🟠" highlight />
          <Arrow />
          <FlowNode label="Traefik" sub="k3s ingress" icon="⚖️" />
          <Arrow />
          <FlowNode label="Services" sub="k3s pods" icon="📦" />
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-600 mt-4 leading-relaxed">
          Cloudflare sits in front of all public-facing projects — handling DNS, TLS termination,
          and DDoS protection. OCI nodes have public IPs that Cloudflare proxies to.
          Traefik inside the cluster routes each hostname to the correct service.
        </p>
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PROJECTS.map(project => (
          <button
            key={project.name}
            onClick={() => setSelected(project)}
            className={`text-left border rounded-lg px-4 py-3 transition-colors ${
              selected.name === project.name
                ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${selected.name === project.name ? 'bg-indigo-400' : 'bg-orange-400'}`} />
              <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{project.name}</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{project.description}</p>
            <ul className="space-y-0.5">
              {project.hosts.map(h => (
                <li key={h} className="text-xs text-gray-400 dark:text-gray-600 font-mono">· {h}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* Preview window */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400/60" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/60" />
              <span className="w-3 h-3 rounded-full bg-green-400/60" />
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-600 font-mono ml-2">{selected.url}</span>
          </div>
          <a
            href={selected.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            open ↗
          </a>
        </div>
        <div className="relative overflow-hidden" style={{ height: '32rem' }}>
          <iframe
            key={selected.url}
            src={selected.url}
            title={selected.name}
            style={{
              width: `${100 / 0.65}%`,
              height: `${32 / 0.65}rem`,
              transform: 'scale(0.65)',
              transformOrigin: 'top left',
              border: 'none',
            }}
          />
        </div>
      </div>

    </div>
  )
}

function FlowNode({ label, sub, icon, dim, highlight }: {
  label: string; sub?: string; icon: string; dim?: boolean; highlight?: boolean
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${highlight ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40' : dim ? 'border-gray-200 dark:border-gray-800 bg-transparent' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950'}`}>
      <span>{icon}</span>
      <div>
        <div className={`font-semibold text-xs ${dim ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-200'}`}>{label}</div>
        {sub && <div className="text-xs text-gray-400 dark:text-gray-600">{sub}</div>}
      </div>
    </div>
  )
}

function Arrow() {
  return (
    <div className="text-gray-300 dark:text-gray-700 px-1 text-xs hidden sm:block">──▶</div>
  )
}
