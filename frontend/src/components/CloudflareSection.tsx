const PROJECTS = [
  {
    name: 'sacenpapier.org',
    description: 'Personal hub & portfolio',
    hosts: ['sacenpapier.org', 'www.sacenpapier.org'],
  },
  {
    name: 'Apercu',
    description: 'Full-stack web app',
    hosts: ['apercu.sacenpapier.org', 'apercuapi.sacenpapier.org'],
  },
  {
    name: 'BotWhy',
    description: 'Discord bot dashboard',
    hosts: ['botwhy.sacenpapier.org', 'botwhyapi.sacenpapier.org'],
  },
  {
    name: 'PopRoom',
    description: 'Full-stack web app',
    hosts: ['poproom.sacenpapier.org', 'poproomapi.sacenpapier.org'],
  },
  {
    name: 'X Clone',
    description: 'Twitter/X clone project',
    hosts: ['x.sacenpapier.org', 'xapi.sacenpapier.org'],
  },
  {
    name: 'Homelab Dashboard',
    description: 'This — live homelab infrastructure overview',
    hosts: ['homelab.sacenpapier.org', 'homelabapi.sacenpapier.org'],
  },
]

export default function CloudflareSection() {
  return (
    <div className="space-y-4">

      {/* Traffic flow diagram */}
      <div className="border border-gray-800 rounded-xl p-5 bg-gray-900 font-mono text-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">

          <FlowNode label="Internet" icon="🌐" dim />
          <Arrow />
          <FlowNode label="Cloudflare" sub="DNS + TLS proxy" icon="🟠" highlight />
          <Arrow />
          <FlowNode label="Traefik" sub="k3s ingress" icon="⚖️" />
          <Arrow />
          <FlowNode label="Services" sub="k3s pods" icon="📦" />

        </div>

        <p className="text-xs text-gray-600 mt-4 leading-relaxed">
          Cloudflare sits in front of all public-facing projects — handling DNS, TLS termination,
          and DDoS protection. OCI nodes have public IPs that Cloudflare proxies to.
          Traefik inside the cluster routes each hostname to the correct service.
        </p>
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PROJECTS.map(project => (
          <div key={project.name} className="border border-gray-800 bg-gray-900 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
              <span className="font-semibold text-gray-200 text-sm">{project.name}</span>
            </div>
            <p className="text-xs text-gray-500 mb-2">{project.description}</p>
            <ul className="space-y-0.5">
              {project.hosts.map(h => (
                <li key={h} className="text-xs text-gray-600 font-mono">· {h}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

    </div>
  )
}

function FlowNode({ label, sub, icon, dim, highlight }: {
  label: string; sub?: string; icon: string; dim?: boolean; highlight?: boolean
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${highlight ? 'border-orange-800 bg-orange-950/40' : dim ? 'border-gray-800 bg-transparent' : 'border-gray-800 bg-gray-950'}`}>
      <span>{icon}</span>
      <div>
        <div className={`font-semibold text-xs ${dim ? 'text-gray-600' : 'text-gray-200'}`}>{label}</div>
        {sub && <div className="text-xs text-gray-600">{sub}</div>}
      </div>
    </div>
  )
}

function Arrow() {
  return (
    <div className="text-gray-700 px-1 text-xs hidden sm:block">──▶</div>
  )
}
