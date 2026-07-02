export interface AdminAuditEntry {
  id: string
  action: string
  entityType: string
  entityId?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: string
  admin: {
    id: string
    email: string
    displayName: string
    username: string
  }
}

export type AuditEntityFilter = 'all' | string

export const AUDIT_ENTITY_FILTERS: { value: AuditEntityFilter; label: string }[] = [
  { value: 'all', label: 'All domains' },
  { value: 'user', label: 'Users' },
  { value: 'curated_league', label: 'Leagues' },
  { value: 'season', label: 'Seasons' },
  { value: 'prize_tier', label: 'Prizes' },
  { value: 'bet', label: 'Bets' },
  { value: 'forum_post', label: 'Forum' },
  { value: 'forum_comment', label: 'Comments' },
]

type ActionCategory = 'user' | 'platform' | 'season' | 'moderation' | 'system'

const ACTION_LABELS: Record<string, string> = {
  'leagues.sync': 'Synced league catalog',
  'league.update': 'Updated league settings',
  'leagues.reorder': 'Reordered league priority',
  'user.update': 'Modified user account',
  'user.verify_email': 'Verified user email',
  'season.create': 'Created season',
  'season.update': 'Updated season',
  'season.activate': 'Activated season',
  'prize.create': 'Created prize tier',
  'prize.update': 'Updated prize tier',
  'prize.delete': 'Removed prize tier',
  'bet.void': 'Voided bet slip',
  'forum.post.update': 'Moderated forum post',
  'forum.post.delete': 'Deleted forum post',
  'forum.comment.delete': 'Deleted forum comment',
}

const ENTITY_LABELS: Record<string, string> = {
  user: 'User',
  curated_league: 'League',
  season: 'Season',
  prize_tier: 'Prize tier',
  bet: 'Bet slip',
  forum_post: 'Forum post',
  forum_comment: 'Comment',
}

const DESTRUCTIVE_ACTIONS = new Set([
  'bet.void',
  'forum.post.delete',
  'forum.comment.delete',
  'prize.delete',
])

export function humanizeAction(action: string) {
  return ACTION_LABELS[action] ?? action.replace(/\./g, ' · ').replace(/_/g, ' ')
}

export function humanizeEntityType(entityType: string) {
  return ENTITY_LABELS[entityType] ?? entityType.replace(/_/g, ' ')
}

export function isDestructiveAction(action: string) {
  return DESTRUCTIVE_ACTIONS.has(action) || action.includes('delete') || action.includes('void')
}

export function getActionCategory(action: string): ActionCategory {
  if (action.startsWith('user.')) return 'user'
  if (action.startsWith('season.') || action.startsWith('prize.')) return 'season'
  if (action.startsWith('bet.') || action.startsWith('forum.')) return 'moderation'
  if (action.startsWith('league') || action === 'leagues.sync' || action === 'leagues.reorder') {
    return 'platform'
  }
  return 'system'
}

export function getCategoryStyle(category: ActionCategory) {
  const styles = {
    user: {
      label: 'Identity',
      dot: 'bg-accent-secondary',
      ring: 'border-accent-secondary/30 bg-accent-secondary/10',
      text: 'text-accent-secondary',
    },
    platform: {
      label: 'Platform',
      dot: 'bg-accent-primary',
      ring: 'border-accent-primary/30 bg-accent-primary/10',
      text: 'text-accent-primary',
    },
    season: {
      label: 'Seasons',
      dot: 'bg-accent-win',
      ring: 'border-accent-win/30 bg-accent-win/10',
      text: 'text-accent-win',
    },
    moderation: {
      label: 'Moderation',
      dot: 'bg-accent-live',
      ring: 'border-accent-live/30 bg-accent-live/10',
      text: 'text-accent-live',
    },
    system: {
      label: 'System',
      dot: 'bg-cyan-400',
      ring: 'border-cyan-400/30 bg-cyan-400/10',
      text: 'text-cyan-300',
    },
  }
  return styles[category]
}

export function formatAuditTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatAuditClock(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function formatTimelineDay(iso: string) {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}

export function summarizeAuditEntries(entries: AdminAuditEntry[], total: number) {
  const now = Date.now()
  const dayMs = 86_400_000
  const recent24h = entries.filter((e) => now - new Date(e.createdAt).getTime() < dayMs).length
  const admins = new Set(entries.map((e) => e.admin.id)).size
  const critical = entries.filter((e) => isDestructiveAction(e.action)).length

  return {
    total,
    loaded: entries.length,
    recent24h,
    admins,
    critical,
  }
}

export function filterAuditEntries(entries: AdminAuditEntry[], search: string) {
  const q = search.trim().toLowerCase()
  if (!q) return entries

  return entries.filter((entry) => {
    const haystack = [
      entry.action,
      humanizeAction(entry.action),
      entry.entityType,
      humanizeEntityType(entry.entityType),
      entry.entityId,
      formatAuditEntityRef(entry),
      entry.admin.displayName,
      entry.admin.email,
      entry.admin.username,
      JSON.stringify(entry.metadata ?? {}),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return haystack.includes(q)
  })
}

export function groupAuditByDay(entries: AdminAuditEntry[]) {
  const groups: { day: string; entries: AdminAuditEntry[] }[] = []

  for (const entry of entries) {
    const day = formatTimelineDay(entry.createdAt)
    const last = groups[groups.length - 1]
    if (last?.day === day) {
      last.entries.push(entry)
    } else {
      groups.push({ day, entries: [entry] })
    }
  }

  return groups
}

export function formatMetadata(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata || Object.keys(metadata).length === 0) return null
  try {
    return JSON.stringify(metadata, null, 2)
  } catch {
    return String(metadata)
  }
}

export function truncateEntityId(id: string | null | undefined, length = 10) {
  if (!id) return '—'
  if (id.length <= length) return id
  return `${id.slice(0, length)}…`
}

/** Human-readable target for timeline rows (ticket ref, username, etc.). */
export function formatAuditEntityRef(entry: AdminAuditEntry) {
  const metadata = entry.metadata ?? {}
  const ticketReference =
    typeof metadata.ticketReference === 'string' ? metadata.ticketReference : undefined
  const username = typeof metadata.username === 'string' ? metadata.username : undefined

  if (entry.entityType === 'bet' && ticketReference) {
    return ticketReference
  }
  if (username) {
    return `@${username}`
  }
  if (entry.entityId) {
    return truncateEntityId(entry.entityId, 16)
  }
  return '—'
}

export function auditApiEntityType(filter: AuditEntityFilter): string | undefined {
  if (filter === 'all') return undefined
  return filter
}

export function getAuditFilterLabel(filter: AuditEntityFilter) {
  return AUDIT_ENTITY_FILTERS.find((item) => item.value === filter)?.label ?? 'Domain'
}

export function getAuditEmptyMessage(filter: AuditEntityFilter) {
  if (filter === 'all') {
    return 'No audit events yet. Admin actions will appear here the moment they occur.'
  }

  const label = getAuditFilterLabel(filter).toLowerCase()
  return `No ${label} audit events yet. Actions in this area will be recorded here.`
}
