export function formatMatchTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date))
}

export function formatMatchDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffMs = then - now
  const diffMins = Math.round(diffMs / 60000)

  if (Math.abs(diffMins) < 60) {
    if (diffMins > 0) return `in ${diffMins}m`
    return `${Math.abs(diffMins)}m ago`
  }

  const diffHours = Math.round(diffMins / 60)
  if (Math.abs(diffHours) < 24) {
    if (diffHours > 0) return `in ${diffHours}h`
    return `${Math.abs(diffHours)}h ago`
  }

  return formatMatchDate(date)
}
