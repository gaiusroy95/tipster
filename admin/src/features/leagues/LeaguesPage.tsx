import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { ApiResponse } from '@/core/types/api'
import { LeagueCatalogPanel } from '@/features/leagues/components/LeagueCatalogPanel'
import { LeaguesPageHeader } from '@/features/leagues/components/LeaguesPageHeader'
import {
  filterLeagues,
  sortLeagues,
  summarizeLeagues,
  type CuratedLeague,
  type LeagueFilter,
  type LeagueSort,
} from '@/features/leagues/lib/leagueUtils'
import { Skeleton } from '@/shared/components/ui/Card'

export function LeaguesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<LeagueFilter>('all')
  const [sort, setSort] = useState<LeagueSort>('order')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.leagues(),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<CuratedLeague[]>>('/leagues', {
        params: { sportId: 'soccer' },
      })
      return res.data.data
    },
  })

  const leagues = data ?? []
  const summary = summarizeLeagues(leagues)

  const visibleLeagues = useMemo(() => {
    const filtered = filterLeagues(leagues, filter, search)
    return sortLeagues(filtered, sort)
  }, [leagues, filter, search, sort])

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
        matchCount={visibleLeagues.length}
        totalCount={summary.total}
        isLoading={isLoading}
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortChange={setSort}
        togglingId={togglingId}
        onToggle={(league, isEnabled) => toggleMutation.mutate({ id: league.id, isEnabled })}
      />
    </div>
  )
}
