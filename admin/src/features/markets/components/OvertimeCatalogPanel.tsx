import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import {
  CATEGORY_BADGE_VARIANT,
  filterCatalog,
  type ArenaMarketCategory,
  type OvertimeMarketTypeRow,
} from '@/features/markets/lib/marketUtils'
import { Badge } from '@/shared/components/Badge'
import { PanelCard } from '@/shared/components/PanelCard'
import { Input } from '@/shared/components/ui/Input'
import { Skeleton } from '@/shared/components/ui/Card'
import { cn } from '@/shared/utils/cn'

const CATEGORY_FILTERS: { id: 'all' | ArenaMarketCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'winner', label: '1X2' },
  { id: 'handicap', label: 'Handicap' },
  { id: 'over_under', label: 'O/U' },
  { id: 'extended', label: 'Extended' },
]

export function OvertimeCatalogPanel({
  catalog,
  isLoading,
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
}: {
  catalog: OvertimeMarketTypeRow[]
  isLoading: boolean
  search: string
  onSearchChange: (value: string) => void
  categoryFilter: 'all' | ArenaMarketCategory
  onCategoryFilterChange: (value: 'all' | ArenaMarketCategory) => void
}) {
  const visible = filterCatalog(catalog, search, categoryFilter)

  return (
    <PanelCard
      title="Overtime market catalog"
      subtitle={
        catalog.length > 0
          ? `${visible.length} of ${catalog.length} types · props and period markets map into arena categories when supported`
          : 'Run sync to load every market type from the Overtime API'
      }
      className="overflow-hidden"
      bodyClassName="p-0 sm:p-0"
    >
      <div className="space-y-3 border-b border-border-default/60 px-4 py-4 sm:px-5">
        <div className="relative">
          <MagnifyingGlassIcon
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <Input
            placeholder="Search by name, key, or Overtime ID…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((filter) => {
            const active = categoryFilter === filter.id
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onCategoryFilterChange(filter.id)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  active
                    ? 'border-accent-primary/40 bg-accent-primary/10 text-accent-primary'
                    : 'border-border-default bg-bg-elevated/40 text-text-muted hover:border-border-default/80 hover:text-text-primary',
                )}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>

      {isLoading && !catalog.length ? (
        <div className="space-y-2 p-4 sm:p-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="px-4 py-12 text-center sm:px-5">
          <p className="text-sm font-medium text-text-primary">No market types match your filters</p>
          <p className="mt-1 text-xs text-text-muted">
            Sync the Overtime catalog or adjust search and category filters.
          </p>
        </div>
      ) : (
        <div className="max-h-[32rem] overflow-auto admin-sidebar-scroll">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-border-default/60 bg-bg-surface/95 backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted sm:px-5">
                  Market
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted sm:px-5">
                  Overtime key
                </th>
                <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted sm:px-5">
                  Arena category
                </th>
                <th className="hidden px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted sm:table-cell sm:px-5">
                  Type ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/50">
              {visible.map((row) => (
                <tr key={row.key} className="transition-colors hover:bg-bg-elevated/30">
                  <td className="px-4 py-3.5 sm:px-5">
                    <p className="font-medium text-text-primary">{row.name}</p>
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <code className="rounded-md bg-bg-primary/50 px-2 py-1 text-[11px] text-text-muted">
                      {row.key}
                    </code>
                  </td>
                  <td className="px-4 py-3.5 sm:px-5">
                    <Badge variant={CATEGORY_BADGE_VARIANT[row.category]}>{row.categoryLabel}</Badge>
                  </td>
                  <td className="hidden px-4 py-3.5 tabular-nums text-text-muted sm:table-cell sm:px-5">
                    {row.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PanelCard>
  )
}
