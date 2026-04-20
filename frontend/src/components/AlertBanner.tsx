import type { MonitoringData } from '../types'

export default function AlertBanner({ data }: { data: MonitoringData }) {
  if (data.critical === 0 && data.warning === 0) return null

  return (
    <div className={`rounded-lg px-4 py-3 mb-6 flex items-center gap-3 ${data.critical > 0 ? 'bg-red-950 border border-red-700' : 'bg-yellow-950 border border-yellow-700'}`}>
      <span className="text-lg">{data.critical > 0 ? '🔴' : '🟡'}</span>
      <span className="text-sm font-medium">
        {data.critical > 0 && `${data.critical} critical`}
        {data.critical > 0 && data.warning > 0 && ', '}
        {data.warning > 0 && `${data.warning} warning`}
        {' '}alert{data.total > 1 ? 's' : ''} firing
      </span>
    </div>
  )
}
