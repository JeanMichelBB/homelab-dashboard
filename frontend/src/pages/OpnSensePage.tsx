import { Link } from 'react-router-dom'
import Header from '../components/Header'

interface Props {
  dark: boolean
  toggleTheme: () => void
}

const SECTIONS = [
  {
    title: 'Device Info',
    items: [
      'Model: Protectli V1210',
      'Role: Primary firewall, router, gateway',
      'Location: Home LAN',
    ],
  },
  {
    title: 'Network Roles',
    items: [
      'WAN: Internet uplink handling',
      'LAN: Internal network gateway',
      'DHCP server for local subnet',
      'NAT / Firewall protection',
    ],
  },
  {
    title: 'Security',
    items: [
      'Stateful packet inspection',
      'Intrusion detection / prevention',
      'DNS over HTTPS (DoH)',
      'ACL-based traffic filtering',
    ],
  },
  {
    title: 'Monitoring',
    items: [
      'Tailscale gateway for remote access',
      'Firewall logs via Tailscale',
      'Traffic monitoring (if enabled)',
    ],
  },
]

export default function OpnSensePage({ dark, toggleTheme }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Header toggleTheme={toggleTheme} dark={dark} />
      <main className="max-w-4xl mx-auto px-6 py-16">

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-8"
        >
          ← back to dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">OPNsense</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Protectli V1210 — primary firewall &amp; gateway</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SECTIONS.map(section => (
            <div key={section.title} className="border border-gray-200 dark:border-gray-800 rounded-xl px-5 py-4 bg-white dark:bg-gray-900">
              <h2 className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-3 uppercase tracking-wider">{section.title}</h2>
              <ul className="space-y-1.5">
                {section.items.map(item => (
                  <li key={item} className="flex gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-gray-300 dark:text-gray-700 select-none">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 border border-gray-200 dark:border-gray-800 rounded-xl px-5 py-4 bg-white dark:bg-gray-900">
          <h2 className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-3 uppercase tracking-wider">Access</h2>
          <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex gap-1.5">
              <span className="text-gray-300 dark:text-gray-700 select-none">·</span>
              WebUI: <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-700 dark:text-gray-300">https://tsopnsense</code>
            </li>
            <li className="flex gap-1.5">
              <span className="text-gray-300 dark:text-gray-700 select-none">·</span>
              SSH access available
            </li>
          </ul>
        </div>

      </main>
    </div>
  )
}
