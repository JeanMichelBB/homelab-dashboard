export function Skeleton({ className = '' }: { className?: string }) {
  return <span className={`inline-block rounded bg-gray-200 dark:bg-gray-800 animate-pulse ${className}`} />
}

export function LiveDot({ online, loading }: { online?: boolean; loading?: boolean }) {
  if (loading) return <span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse flex-shrink-0" />
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${online === true ? 'bg-green-400' : online === false ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
}
