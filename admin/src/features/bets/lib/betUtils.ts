export interface AdminBet {
  id: string
  userId: string
  user: { id: string; email: string; username: string; displayName: string }
  matchId: string
  marketType: string
  selectionId: string
  selectionLabel: string
  odds: number
  stake: number
  potentialReturn: number
  betSize: string
  status: string
  profitLoss: number | null
  placedAt: string
  settledAt?: string | null
  homeTeamName: string
  awayTeamName: string
  leagueName?: string | null
}

export type BetStatusFilter = 'all' | 'active' | 'won' | 'lost' | 'void' | 'cancelled'

export const BET_STATUS_FILTERS: { id: BetStatusFilter; label: string }[] = [
  { id: 'all', label: 'All slips' },
  { id: 'active', label: 'Live' },
  { id: 'won', label: 'Won' },
  { id: 'lost', label: 'Lost' },
  { id: 'void', label: 'Void' },
  { id: 'cancelled', label: 'Cancelled' },
]

export function formatStake(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value)
}

export function formatOdds(value: number) {
  return value.toFixed(2)
}

export function formatPlacedTime(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatPlacedDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function getBetStatusStyle(status: string) {
  switch (status) {
    case 'active':
      return {
        rail: 'bg-accent-win',
        badge: 'win' as const,
        label: 'Live',
        glow: 'shadow-[inset_3px_0_0_0_var(--color-accent-win)]',
      }
    case 'won':
      return {
        rail: 'bg-accent-primary',
        badge: 'primary' as const,
        label: 'Won',
        glow: 'shadow-[inset_3px_0_0_0_var(--color-accent-primary)]',
      }
    case 'lost':
      return {
        rail: 'bg-accent-loss',
        badge: 'loss' as const,
        label: 'Lost',
        glow: 'shadow-[inset_3px_0_0_0_var(--color-accent-loss)]',
      }
    case 'void':
      return {
        rail: 'bg-text-muted',
        badge: 'default' as const,
        label: 'Void',
        glow: 'shadow-[inset_3px_0_0_0_var(--color-text-muted)]',
      }
    case 'cancelled':
      return {
        rail: 'bg-amber-500/80',
        badge: 'secondary' as const,
        label: 'Cancelled',
        glow: 'shadow-[inset_3px_0_0_0_rgba(245,158,11,0.8)]',
      }
    default:
      return {
        rail: 'bg-border-default',
        badge: 'default' as const,
        label: status,
        glow: 'shadow-[inset_3px_0_0_0_var(--color-border-default)]',
      }
  }
}

export function summarizeBets(bets: AdminBet[], total: number) {
  const active = bets.filter((b) => b.status === 'active').length
  const volume = bets.reduce((sum, b) => sum + b.stake, 0)
  const avgOdds =
    bets.length > 0 ? bets.reduce((sum, b) => sum + b.odds, 0) / bets.length : 0
  const exposure = bets
    .filter((b) => b.status === 'active')
    .reduce((sum, b) => sum + b.potentialReturn, 0)

  return { total, loaded: bets.length, active, volume, avgOdds, exposure }
}

export function groupBetsByDay(bets: AdminBet[]) {
  const groups = new Map<string, AdminBet[]>()

  for (const bet of bets) {
    const key = new Date(bet.placedAt).toDateString()
    const list = groups.get(key) ?? []
    list.push(bet)
    groups.set(key, list)
  }

  return [...groups.entries()].map(([day, items]) => ({
    day,
    label: formatPlacedDate(items[0].placedAt),
    items,
  }))
}

export function matchLabel(bet: AdminBet) {
  return `${bet.homeTeamName} vs ${bet.awayTeamName}`
}
