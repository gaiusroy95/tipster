import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminClient } from '@/core/api/client'
import { queryKeys } from '@/core/constants/queryKeys'
import type { ApiResponse, Paginated } from '@/core/types/api'
import { BetsCommandBar } from '@/features/bets/components/BetsCommandBar'
import { BetsFeedPanel } from '@/features/bets/components/BetsFeedPanel'
import {
  summarizeBets,
  type AdminBet,
  type BetStatusFilter,
} from '@/features/bets/lib/betUtils'
import { Skeleton } from '@/shared/components/ui/Card'

const PAGE_SIZE = 20

export function BetsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<BetStatusFilter>('all')
  const [page, setPage] = useState(1)
  const [voidingId, setVoidingId] = useState<string | null>(null)
  const [accumulated, setAccumulated] = useState<AdminBet[]>([])

  const queryParams = {
    status: status === 'all' ? undefined : status,
    search: search || undefined,
    limit: PAGE_SIZE,
    page,
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: queryKeys.bets(queryParams),
    queryFn: async () => {
      const res = await adminClient.get<ApiResponse<Paginated<AdminBet>>>('/bets', {
        params: queryParams,
      })
      return res.data.data
    },
  })

  useEffect(() => {
    if (!data) return
    setAccumulated((prev) => {
      if (page === 1) return data.items
      const ids = new Set(prev.map((b) => b.id))
      const next = data.items.filter((b) => !ids.has(b.id))
      return [...prev, ...next]
    })
  }, [data, page])

  useEffect(() => {
    setPage(1)
    setAccumulated([])
  }, [status, search])

  const voidMutation = useMutation({
    mutationFn: async (betId: string) => {
      setVoidingId(betId)
      await adminClient.post(`/bets/${betId}/void`, { reason: 'Voided by admin' })
    },
    onSettled: () => setVoidingId(null),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'bets'] }),
  })

  const bets = accumulated
  const total = data?.total ?? 0
  const summary = useMemo(() => summarizeBets(bets, total), [bets, total])
  const hasMore = bets.length < total

  const handleStatusChange = (next: BetStatusFilter) => {
    setStatus(next)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {isLoading && !data ? (
        <Skeleton className="h-56 rounded-3xl" />
      ) : (
        <BetsCommandBar
          total={summary.total}
          loaded={summary.loaded}
          active={summary.active}
          volume={summary.volume}
          exposure={summary.exposure}
          avgOdds={summary.avgOdds}
          search={search}
          onSearchChange={handleSearchChange}
          status={status}
          onStatusChange={handleStatusChange}
        />
      )}

      <BetsFeedPanel
        bets={bets}
        total={total}
        isLoading={isLoading}
        voidingId={voidingId}
        onVoid={(bet) => voidMutation.mutate(bet.id)}
        hasMore={hasMore}
        onLoadMore={() => setPage((p) => p + 1)}
        isLoadingMore={isFetching && page > 1}
      />
    </div>
  )
}
