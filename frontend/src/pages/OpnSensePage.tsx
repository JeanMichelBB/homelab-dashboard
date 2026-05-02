import { Link } from 'react-router-dom'
import Header from '../components/Header'

interface Props {
  dark: boolean
  toggleTheme: () => void
}

export default function OpnSensePage({ dark, toggleTheme }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Header toggleTheme={toggleTheme} dark={dark} />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="border border-gray-200 dark:border-gray-800 rounded-xl p-8 bg-white dark:bg-gray-900 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🛡️</span>
            <h1 className="text-2xl font-semibold">OPNsense Firewall</h1>
          </div>

          <div className="space-y-6 text-sm text-gray-600 dark:text-gray-400">
            <section>
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Device Info</h2>
              <ul className="space-y-1.5">
                <li>• Model: Protectli V1210</li>
                <li>• Role: Primary firewall, router, gateway</li>
                <li>• Location: Home LAN</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Network Roles</h2>
              <ul className="space-y-1.5">
                <li>• WAN: Internet uplink handling</li>
                <li>• LAN: Internal network gateway</li>
                <li>• DHCP server for local subnet</li>
                <li>• NAT/Firewall protection</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Security</h2>
              <ul className="space-y-1.5">
                <li>• Stateful packet inspection</li>
                <li>• Intrusion detection/prevention</li>
                <li>• DNS over HTTPS (DoH)</li>
                <li>• ACL-based traffic filtering</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Monitoring</h2>
              <ul className="space-y-1.5">
                <li>• Tailscale gateway for remote access</li>
                <li>• Firewall logs via Tailscale</li>
                <li>• Traffic monitoring (if enabled)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Access</h2>
              <ul className="space-y-1.5">
                <li>• WebUI: <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">https://tsopnsense</code></li>
                <li>• SSH access available</li>
                <li>• API endpoints (if configured)</li>
              </ul>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex gap-4">
            <Link
              to="/"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
