import type { AdminUser } from '@/core/types/api'

export function formatBalance(value: number) {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value)
}

export function formatJoinedDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function summarizeUsers(users: AdminUser[], total: number) {
  const admins = users.filter((u) => u.role === 'ADMIN').length
  const banned = users.filter((u) => u.isBanned).length
  return { total, admins, banned, loaded: users.length }
}

export type UserFilter = 'all' | 'admin' | 'banned'

export type UserSort =
  | 'newest'
  | 'oldest'
  | 'name-asc'
  | 'name-desc'
  | 'balance-desc'
  | 'balance-asc'
  | 'rank-asc'

export const USER_SORT_OPTIONS: { id: UserSort; label: string }[] = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'name-asc', label: 'Name A → Z' },
  { id: 'name-desc', label: 'Name Z → A' },
  { id: 'balance-desc', label: 'Balance high → low' },
  { id: 'balance-asc', label: 'Balance low → high' },
  { id: 'rank-asc', label: 'Rank best first' },
]

export function filterParams(filter: UserFilter) {
  if (filter === 'admin') return { role: 'ADMIN' as const }
  if (filter === 'banned') return { banned: true }
  return {}
}

export function sortParams(sort: UserSort) {
  switch (sort) {
    case 'newest':
      return { sortBy: 'createdAt' as const, sortOrder: 'desc' as const }
    case 'oldest':
      return { sortBy: 'createdAt' as const, sortOrder: 'asc' as const }
    case 'name-asc':
      return { sortBy: 'displayName' as const, sortOrder: 'asc' as const }
    case 'name-desc':
      return { sortBy: 'displayName' as const, sortOrder: 'desc' as const }
    case 'balance-desc':
      return { sortBy: 'balance' as const, sortOrder: 'desc' as const }
    case 'balance-asc':
      return { sortBy: 'balance' as const, sortOrder: 'asc' as const }
    case 'rank-asc':
      return { sortBy: 'rank' as const, sortOrder: 'asc' as const }
  }
}
