import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { MediaData, NetworkData } from '../types'

export default function Media() {
  const [media, setMedia] = useState<MediaData | null>(null)
  const [network, setNetwork] = useState<NetworkData | null>(null)

  useEffect(() => {
    api.media().then(setMedia).catch(console.error)
    api.network().then(setNetwork).catch(console.error)
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Media</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h2 className="text-base font-semibold text-gray-300 mb-4">Sonarr</h2>
          {media ? (
            <dl className="space-y-2 text-sm">
              <Row label="Series" value={media.sonarr.series} />
              <Row label="Episodes monitored" value={media.sonarr.episodes_monitored} />
              <Row label="Missing" value={media.sonarr.missing} warn={media.sonarr.missing > 0} />
            </dl>
          ) : <Skeleton />}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
          <h2 className="text-base font-semibold text-gray-300 mb-4">Radarr</h2>
          {media ? (
            <dl className="space-y-2 text-sm">
              <Row label="Movies" value={media.radarr.movies} />
              <Row label="Missing" value={media.radarr.missing} warn={media.radarr.missing > 0} />
            </dl>
          ) : <Skeleton />}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
        <h2 className="text-base font-semibold text-gray-300 mb-4">VPN</h2>
        {network ? (
          <dl className="space-y-2 text-sm">
            <Row label="Status" value={network.vpn.status} ok={network.vpn.status === 'running'} />
            <Row label="Provider" value={network.vpn.provider} />
            <Row label="Public IP" value={network.vpn.public_ip} />
          </dl>
        ) : <Skeleton />}
      </div>
    </div>
  )
}

function Row({ label, value, ok, warn }: { label: string; value: string | number; ok?: boolean; warn?: boolean }) {
  const color = ok ? 'text-green-400' : warn ? 'text-yellow-400' : 'text-gray-200'
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className={`font-medium ${color}`}>{value}</dd>
    </div>
  )
}

function Skeleton() {
  return <div className="animate-pulse h-16 bg-gray-800 rounded" />
}
