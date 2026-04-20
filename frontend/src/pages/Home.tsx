import { useEffect, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import type { Node, K3sData, PodInfo } from '../types/index'
import Hero from '../components/Hero'
import Header from '../components/Header'
import NetworkTopology from '../components/NetworkTopology'
import TailscaleSection from '../components/TailscaleSection'
import K3sSection from '../components/K3sSection'
import CloudflareSection from '../components/CloudflareSection'


export default function Home({ toggleTheme, dark }: { toggleTheme: () => void; dark: boolean }) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [k3s, setK3s] = useState<K3sData | null>(null)
  const [pod, setPod] = useState<PodInfo | null>(null)

  const refreshNodes = () => {
    api.nodes().then(setNodes).catch(console.error)
    api.k3s().then(setK3s).catch(console.error)
    api.pod().then(setPod).catch(console.error)
  }

  useEffect(() => {
    refreshNodes()
    api.pod().then(setPod).catch(console.error)
    const interval = setInterval(refreshNodes, 30000)
    return () => clearInterval(interval)
  }, [])

  const byName = Object.fromEntries(nodes.map(n => [n.name, n]))

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Header toggleTheme={toggleTheme} dark={dark} />
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-20">

        {/* Hero */}
        <Hero nodes={nodes} k3s={k3s} />

        {/* Physical network */}
        <section id="network">
          <SectionHeader number="01" title="Physical Network"
            description="All physical machines sit behind OPNsense on a home LAN. Internet traffic leaving the HomeLab goes exclusively through Gluetun (ProtonVPN WireGuard) on elitedesk — nothing else has a direct outbound internet path."
          />
          <NetworkTopology nodes={byName} />
        </section>

        {/* Tailscale */}
        <section id="tailscale">
          <SectionHeader number="02" title="Tailscale Overlay"
            description="Tailscale connects the remote nodes — the monitoring Pi and two OCI cloud workers — back to the HomeLab without any firewall rules or VPN tunnels to configure. The HomeLab machines join the same tailnet, making the entire setup reachable from anywhere as a flat private network."
          />
          <TailscaleSection nodes={byName} />
        </section>

        {/* k3s */}
        <section id="k3s">
          <SectionHeader number="03" title="k3s Cluster"
            description="A lightweight Kubernetes cluster spanning the HomeLab and OCI cloud. elitedesk acts as the control plane. The two OCI free-tier ARM nodes are workers — together they provide enough capacity to run the dashboard, several web apps, and supporting services."
          />
          <K3sSection nodes={byName} k3s={k3s} pod={pod} onRefresh={refreshNodes} />
        </section>

        {/* Cloudflare */}
        <section id="cloudflare">
          <SectionHeader number="04" title="Public Exposure via Cloudflare"
            description="All public-facing projects are routed through Cloudflare before reaching the cluster. Cloudflare handles DNS, TLS certificates, and acts as a reverse proxy — the OCI nodes' public IPs are never directly exposed to browsers. Traefik inside the cluster routes each hostname to its service."
          />
          <CloudflareSection />
        </section>

      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-600">
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-6">

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">

            <div className="col-span-2 sm:col-span-1">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">HomeLab</div>
              <p className="leading-relaxed mb-3">Self-hosted infrastructure running on physical hardware, OCI free-tier cloud, and a Raspberry Pi.</p>
              <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                live · refreshes every 30s
              </div>
            </div>

            <div>
              <div className="text-gray-700 dark:text-gray-400 font-semibold mb-3">infrastructure</div>
              <ul className="space-y-1.5">
                <li>· HP EliteDesk 800 G2</li>
                <li>· Raspberry Pi 4</li>
                <li>· Beelink ME Pro 2</li>
                <li>· Gaming PC RTX 5070</li>
                <li>· OCI VM.A1 × 2</li>
              </ul>
            </div>

            <div>
              <div className="text-gray-700 dark:text-gray-400 font-semibold mb-3">stack</div>
              <ul className="space-y-1.5">
                <li>· <A href="https://fastapi.tiangolo.com">FastAPI</A> + Redis</li>
                <li>· <A href="https://react.dev">React</A> + <A href="https://tailwindcss.com">Tailwind</A></li>
                <li>· <A href="https://k3s.io">k3s</A> + <A href="https://traefik.io">Traefik</A></li>
                <li>· <A href="https://cloudflare.com">Cloudflare</A></li>
                <li>· <A href="https://tailscale.com">Tailscale</A></li>
              </ul>
            </div>

            <div>
              <div className="text-gray-700 dark:text-gray-400 font-semibold mb-3">links</div>
              <ul className="space-y-1.5">
                <li>· <a href="https://sacenpapier.org" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">sacenpapier.org</a></li>
                <li>· <a href="https://github.com/JeanMichelBB" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">github.com/JeanMichelBB</a></li>
                <li>· <a href="https://github.com/JeanMichelBB/homelab-dashboard" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">homelab-dashboard</a></li>
                <li>· <a href="https://homelab.sacenpapier.org" className="hover:text-gray-900 dark:hover:text-gray-300 transition-colors">homelab.sacenpapier.org</a></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-gray-400 dark:text-gray-700">
            <span>HomeLab · self-hosted infrastructure showcase</span>
            <span>built with FastAPI + React + k3s</span>
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

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors underline underline-offset-2 decoration-gray-300 dark:decoration-gray-700">
      {children}
    </a>
  )
}

function SectionHeader({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-xs font-mono text-gray-400 dark:text-gray-600">{number}</span>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">{description}</p>
    </div>
  )
}
