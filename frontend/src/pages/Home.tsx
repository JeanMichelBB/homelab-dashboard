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
  const [nodesLoading, setNodesLoading] = useState(true)
  const [k3sLoading, setK3sLoading] = useState(true)

  const refreshNodes = () => {
    api.nodes().then(setNodes).catch(console.error)
    api.k3s().then(setK3s).catch(console.error)
    api.pod().then(setPod).catch(console.error)
  }

  useEffect(() => {
    api.nodes().then(setNodes).catch(console.error).finally(() => setNodesLoading(false))
    api.k3s().then(setK3s).catch(console.error).finally(() => setK3sLoading(false))
    api.pod().then(setPod).catch(console.error)
    const interval = setInterval(refreshNodes, 30000)
    return () => clearInterval(interval)
  }, [])

  const byName = Object.fromEntries(nodes.map(n => [n.name, n]))

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Header toggleTheme={toggleTheme} dark={dark} />
      <main className="max-w-5xl mx-auto px-6 py-16 space-y-24">

        <Hero nodes={nodes} k3s={k3s} loading={nodesLoading || k3sLoading} />

        <section id="network" className="scroll-mt-16">
          <SectionHeader
            number="01"
            title="Physical Network"
            description="All physical machines sit behind OPNsense on a home LAN. Internet traffic leaving the HomeLab goes exclusively through Gluetun (ProtonVPN WireGuard) on elitedesk — nothing else has a direct outbound internet path."
          />
          <NetworkTopology nodes={byName} loading={nodesLoading} />
        </section>

        <section id="tailscale" className="scroll-mt-16">
          <SectionHeader
            number="02"
            title="Tailscale Overlay"
            description="Tailscale connects the remote nodes — the monitoring Pi and two OCI cloud workers — back to the HomeLab without any firewall rules or VPN tunnels to configure. All machines join the same tailnet, making the entire setup reachable from anywhere as a flat private network."
          />
          <TailscaleSection nodes={byName} loading={nodesLoading} />
        </section>

        <section id="k3s" className="scroll-mt-16">
          <SectionHeader
            number="03"
            title="k3s Cluster"
            description="A lightweight Kubernetes cluster spanning the HomeLab and OCI cloud. elitedesk acts as the control plane. The two OCI free-tier ARM nodes are workers — together they provide enough capacity to run the dashboard, several web apps, and supporting services."
          />
          <K3sSection nodes={byName} k3s={k3s} pod={pod} onRefresh={refreshNodes} loading={k3sLoading} />
        </section>

        <section id="cloudflare" className="scroll-mt-16">
          <SectionHeader
            number="04"
            title="Public Exposure via Cloudflare"
            description="All public-facing projects are routed through Cloudflare before reaching the cluster. Cloudflare handles DNS, TLS certificates, and acts as a reverse proxy — the OCI nodes' public IPs are never directly exposed to browsers. Traefik inside the cluster routes each hostname to its service."
          />
          <CloudflareSection />
        </section>

      </main>

      <footer className="mt-24 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400 dark:text-gray-600">
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-8">

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-10">

            <div className="col-span-2 sm:col-span-1">
              <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 tracking-tight">HomeLab</div>
              <p className="leading-relaxed mb-4 text-gray-500 dark:text-gray-500">
                Self-hosted infrastructure running on physical hardware, OCI free-tier cloud, and a Raspberry Pi.
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                live · refreshes every 30s
              </div>
            </div>

            <div>
              <div className="text-gray-700 dark:text-gray-400 font-semibold mb-3">infrastructure</div>
              <ul className="space-y-2">
                <li>· HP EliteDesk 800 G2</li>
                <li>· Raspberry Pi 4</li>
                <li>· Beelink ME Pro 2</li>
                <li>· Gaming PC RTX 5070</li>
                <li>· OCI VM.A1 × 2</li>
              </ul>
            </div>

            <div>
              <div className="text-gray-700 dark:text-gray-400 font-semibold mb-3">stack</div>
              <ul className="space-y-2">
                <li>· <A href="https://fastapi.tiangolo.com">FastAPI</A> + Redis</li>
                <li>· <A href="https://react.dev">React</A> + <A href="https://tailwindcss.com">Tailwind</A></li>
                <li>· <A href="https://k3s.io">k3s</A> + <A href="https://traefik.io">Traefik</A></li>
                <li>· <A href="https://cloudflare.com">Cloudflare</A></li>
                <li>· <A href="https://tailscale.com">Tailscale</A></li>
              </ul>
            </div>

            <div>
              <div className="text-gray-700 dark:text-gray-400 font-semibold mb-3">links</div>
              <ul className="space-y-2">
                <li>· <FooterLink href="https://sacenpapier.org">sacenpapier.org</FooterLink></li>
                <li>· <FooterLink href="https://github.com/JeanMichelBB">github.com/JeanMichelBB</FooterLink></li>
                <li>· <FooterLink href="https://github.com/JeanMichelBB/homelab-dashboard">homelab-dashboard</FooterLink></li>
                <li>· <FooterLink href="https://homelab.sacenpapier.org">homelab.sacenpapier.org</FooterLink></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>HomeLab · self-hosted infrastructure showcase</span>
            <span>built with FastAPI + React + k3s</span>
          </div>

        </div>
      </footer>
    </div>
  )
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors underline underline-offset-2 decoration-gray-300 dark:decoration-gray-700"
    >
      {children}
    </a>
  )
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
      {children}
    </a>
  )
}

function SectionHeader({ number, title, description }: { number: string; title: string; description: ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-xs font-mono text-gray-400 dark:text-gray-600 tabular-nums">{number}</span>
        <h2 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">{title}</h2>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl ml-9">{description}</p>
    </div>
  )
}
