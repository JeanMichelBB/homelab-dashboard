import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Node, K3sData } from '../types'
import Hero from '../components/Hero'
import NetworkTopology from '../components/NetworkTopology'
import TailscaleSection from '../components/TailscaleSection'
import K3sSection from '../components/K3sSection'
import CloudflareSection from '../components/CloudflareSection'


export default function Home() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [k3s, setK3s] = useState<K3sData | null>(null)

  useEffect(() => {
    api.nodes().then(setNodes).catch(console.error)
    api.k3s().then(setK3s).catch(console.error)
    const interval = setInterval(() => {
      api.nodes().then(setNodes).catch(console.error)
      api.k3s().then(setK3s).catch(console.error)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const byName = Object.fromEntries(nodes.map(n => [n.name, n]))

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-20">

        {/* Hero */}
        <Hero nodes={nodes} k3s={k3s} />

        {/* Physical network */}
        <section id="network">
          <SectionHeader number="01" title="Physical Network"
            description="All physical machines sit behind OPNsense on a home LAN. Internet traffic leaving the homelab goes exclusively through Gluetun (ProtonVPN WireGuard) on elitedesk — nothing else has a direct outbound internet path."
          />
          <NetworkTopology nodes={byName} />
        </section>

        {/* Tailscale */}
        <section id="tailscale">
          <SectionHeader number="02" title="Tailscale Overlay"
            description="Tailscale connects the remote nodes — the monitoring Pi and two OCI cloud workers — back to the homelab without any firewall rules or VPN tunnels to configure. The homelab machines join the same tailnet, making the entire setup reachable from anywhere as a flat private network."
          />
          <TailscaleSection nodes={byName} />
        </section>

        {/* k3s */}
        <section id="k3s">
          <SectionHeader number="03" title="k3s Cluster"
            description="A lightweight Kubernetes cluster spanning the homelab and OCI cloud. elitedesk acts as the control plane. The two OCI free-tier ARM nodes are workers — together they provide enough capacity to run the dashboard, several web apps, and supporting services."
          />
          <K3sSection nodes={byName} k3s={k3s} />
        </section>

        {/* Cloudflare */}
        <section id="cloudflare">
          <SectionHeader number="04" title="Public Exposure via Cloudflare"
            description="All public-facing projects are routed through Cloudflare before reaching the cluster. Cloudflare handles DNS, TLS certificates, and acts as a reverse proxy — the OCI nodes' public IPs are never directly exposed to browsers. Traefik inside the cluster routes each hostname to its service."
          />
          <CloudflareSection />
        </section>

      </main>

      <footer className="border-t border-gray-800 px-6 py-10 text-xs text-gray-600">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">

          <div>
            <div className="text-gray-400 font-semibold mb-2">homelab</div>
            <p className="leading-relaxed">Self-hosted infrastructure running on physical hardware, OCI free-tier cloud, and a Raspberry Pi.</p>
          </div>

          <div>
            <div className="text-gray-400 font-semibold mb-2">stack</div>
            <ul className="space-y-1">
              <li>· FastAPI + Redis (backend)</li>
              <li>· React + Tailwind (frontend)</li>
              <li>· k3s on OCI + elitedesk</li>
              <li>· Cloudflare DNS + TLS</li>
              <li>· Tailscale overlay mesh</li>
            </ul>
          </div>

          <div>
            <div className="text-gray-400 font-semibold mb-2">links</div>
            <ul className="space-y-1">
              <li>· <a href="https://sacenpapier.org" className="hover:text-gray-300 transition-colors">sacenpapier.org</a></li>
              <li>· <a href="https://github.com/JeanMichelBB" className="hover:text-gray-300 transition-colors">github.com/JeanMichelBB</a></li>
              <li className="mt-3 text-gray-700">live data · refreshes every 30s</li>
            </ul>
          </div>

        </div>
      </footer>
    </div>
  )
}

function NavCard({ href, icon, label, stat }: { href: string; icon: string; label: string; stat: string }) {
  return (
    <a href={href} className="group border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800 transition-colors rounded-xl p-4 flex flex-col gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{label}</div>
        <div className="text-xs text-gray-500 mt-0.5">{stat}</div>
      </div>
    </a>
  )
}

function SectionHeader({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-xs font-mono text-gray-600">{number}</span>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">{description}</p>
    </div>
  )
}
