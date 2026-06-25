import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { ApiResponse } from '@/core/types/api'
import { LeagueCatalogPanel } from '@/features/leagues/components/LeagueCatalogPanel'
import { LeaguesPageHeader } from '@/features/leagues/components/LeaguesPageHeader'
import {
  buildLeagueRankMap,
  filterLeagues,
  listSportFilterOptions,
  sortLeagues,
  summarizeLeagues,
  type CuratedLeague,
  type LeagueFilter,
  type LeagueSort,
  type LeagueSportFilter,
} from '@/features/leagues/lib/leagueUtils'
import { Skeleton } from '@/shared/components/ui/Card'

export function LeaguesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<LeagueFilter>('all')
  const [sportFilter, setSportFilter] = useState<LeagueSportFilter>('all')
  const [sort, setSort] = useState<LeagueSort>('rank')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.leagues(),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<CuratedLeague[]>>('/leagues')
      return res.data.data
    },
  })

  const leagues = data ?? []
  const sportOptions = useMemo(() => listSportFilterOptions(leagues), [leagues])
  const rankMap = useMemo(() => buildLeagueRankMap(leagues), [leagues])
  const summary = summarizeLeagues(leagues)

  const visibleLeagues = useMemo(() => {
    const filtered = filterLeagues(leagues, filter, search, sportFilter)
    return sortLeagues(filtered, sort)
  }, [leagues, filter, search, sportFilter, sort])

  const syncMutation = useMutation({
    mutationFn: async () => {
      await adminClient.post('/leagues/sync')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.leagues() }),
  })

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      setTogglingId(id)
      await adminClient.patch(`/leagues/${id}`, { isEnabled })
    },
    onSettled: () => setTogglingId(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.leagues() }),
  })

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {isLoading && !data ? (
        <Skeleton className="h-48 rounded-3xl" />
      ) : (
        <LeaguesPageHeader
          total={summary.total}
          enabled={summary.enabled}
          disabled={summary.disabled}
          onSync={() => syncMutation.mutate()}
          isSyncing={syncMutation.isPending}
        />
      )}

      <LeagueCatalogPanel
        leagues={visibleLeagues}
        rankMap={rankMap}
        matchCount={visibleLeagues.length}
        totalCount={summary.total}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        sportOptions={sportOptions}
        sportFilter={sportFilter}
        onSportFilterChange={setSportFilter}
        sort={sort}
        onSortChange={setSort}
        togglingId={togglingId}
        onToggle={(league, isEnabled) => toggleMutation.mutate({ id: league.id, isEnabled })}
      />
    </div>
  )
}
