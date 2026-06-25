export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function formatAuditTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatSeasonRange(start: string, end: string) {
  const fmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  return `${fmt.format(new Date(start))} – ${fmt.format(new Date(end))}`
}

export function seasonProgress(start: string, end: string) {
  const now = Date.now()
  const startMs = new Date(start).getTime()
  const endMs = new Date(end).getTime()
  if (endMs <= startMs) return 0
  return Math.min(100, Math.max(0, ((now - startMs) / (endMs - startMs)) * 100))
}

export function daysRemaining(end: string) {
  const diff = new Date(end).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export interface DashboardStats {
  userCount: number
  activeBets: number
  forumPosts: number
  enabledLeagues: number
  activeSeason: {
    id: string
    name: string
    startDate: string
    endDate: string
  } | null
  recentAudit: Array<{
    id: string
    action: string
    entityType: string
    createdAt: string
    admin: { displayName: string; email: string }
  }>
}
