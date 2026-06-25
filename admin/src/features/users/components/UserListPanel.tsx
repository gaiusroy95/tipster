import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import type { AdminUser } from '@/core/types/api'
import { formatBalance, USER_SORT_OPTIONS, type UserFilter, type UserSort } from '@/features/users/lib/userUtils'
import { Badge } from '@/shared/components/Badge'
import { PanelCard } from '@/shared/components/PanelCard'
import { UserAvatar } from '@/shared/components/UserAvatar'
import { Input } from '@/shared/components/ui/Input'
import { Skeleton } from '@/shared/components/ui/Card'
import { cn } from '@/shared/utils/cn'

const FILTERS: { id: UserFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'admin', label: 'Admins' },
  { id: 'banned', label: 'Banned' },
]

export function UserListPanel({
  users,
  total,
  isLoading,
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  selectedId,
  onSelect,
}: {
  users: AdminUser[]
  total: number
  isLoading: boolean
  search: string
  onSearchChange: (value: string) => void
  filter: UserFilter
  onFilterChange: (filter: UserFilter) => void
  sort: UserSort
  onSortChange: (sort: UserSort) => void
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <PanelCard
      title="Directory"
      subtitle={`${total} account${total === 1 ? '' : 's'} match your filters`}
      className="flex h-full flex-col lg:max-h-[calc(100vh-12rem)]"
      bodyClassName="flex min-h-0 flex-1 flex-col gap-4 p-0 sm:p-0"
    >
      <div className="space-y-3 border-b border-border-default/60 px-4 py-4 sm:px-5">
        <div className="relative">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <Input
            placeholder="Search email, username, display name…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onFilterChange(item.id)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  filter === item.id
                    ? 'border-accent-secondary/40 bg-accent-secondary/15 text-text-primary'
                    : 'border-border-default bg-bg-elevated/50 text-text-muted hover:border-border-strong hover:text-text-primary',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-auto sm:min-w-[180px]">
            <label htmlFor="user-sort" className="sr-only">
              Sort users
            </label>
            <select
              id="user-sort"
              value={sort}
              onChange={(e) => onSortChange(e.target.value as UserSort)}
              className={cn(
                'h-9 w-full appearance-none rounded-full border border-border-default bg-bg-elevated/50',
                'pl-3 pr-9 text-xs font-semibold text-text-primary transition-colors',
                'hover:border-border-strong focus:border-accent-secondary focus:outline-none focus:ring-1 focus:ring-accent-secondary/30',
              )}
            >
              {USER_SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id} className="bg-bg-surface text-text-primary">
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto admin-sidebar-scroll px-2 pb-3 sm:px-3">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <p className="font-display text-base font-semibold">No users found</p>
            <p className="mt-2 text-sm text-text-muted">Try a different search, filter, or sort.</p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {users.map((user) => {
              const selected = selectedId === user.id
              return (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(user.id)}
                    className={cn(
                      'group relative flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all',
                      selected
                        ? 'border-accent-secondary/40 bg-accent-secondary/10 shadow-[0_0_24px_rgba(99,102,241,0.12)]'
                        : 'border-transparent bg-transparent hover:border-border-default/70 hover:bg-bg-elevated/40',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full transition-opacity',
                        selected ? 'bg-accent-primary opacity-100' : 'opacity-0',
                      )}
                      aria-hidden="true"
                    />
                    <UserAvatar
                      name={user.displayName}
                      avatarUrl={user.avatarUrl}
                      size="md"
                      className="shrink-0"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-semibold">{user.displayName}</span>
                        {user.role === 'ADMIN' ? <Badge variant="secondary">Admin</Badge> : null}
                        {user.isBanned ? <Badge variant="loss">Banned</Badge> : null}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-text-muted">{user.email}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-mono text-sm font-semibold tabular-nums">
                        {formatBalance(user.balance)}
                      </span>
                      <span className="block text-[10px] uppercase tracking-wider text-text-muted">
                        credits
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </PanelCard>
  )
}
