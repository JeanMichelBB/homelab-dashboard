import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { Service } from '../types'

const CATEGORIES = ['media', 'ai', 'monitoring', 'management']

export default function Services() {
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    api.services().then(setServices).catch(console.error)
    const interval = setInterval(() => api.services().then(setServices).catch(console.error), 30000)
    return () => clearInterval(interval)
  }, [])

  const byCategory = CATEGORIES.map(cat => ({
    cat,
    items: services.filter(s => s.category === cat),
  })).filter(g => g.items.length > 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Services</h1>
      <div className="space-y-8">
        {byCategory.map(({ cat, items }) => (
          <div key={cat}>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-3">{cat}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map(s => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center gap-3 hover:border-gray-600 transition-colors"
                >
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.status === 'up' ? 'bg-green-400' : s.status === 'down' ? 'bg-red-500' : 'bg-gray-500'}`} />
                  <span className="text-sm font-medium text-gray-200">{s.name}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
