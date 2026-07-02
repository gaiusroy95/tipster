import { useEffect, useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { queryKeys } from '@/core/constants/queryKeys'
import { fetchMatchFromApi } from '@/features/fixtures/api/sportsApi'
import { isMatchBettable } from '@/features/betting/lib/betSlipUtils'
import { useBetSlipStore } from '@/features/betting/stores/betSlipStore'

const PRUNE_POLL_MS = 60_000

/**
 * Drops bet-slip selections when their match has finished or is otherwise not bettable.
 * Unplaced picks persist in localStorage — without this they never leave the slip.
 */
export function useBetSlipPruneFinished() {
  const selections = useBetSlipStore((s) => s.selections)
  const pruneSelections = useBetSlipStore((s) => s.pruneSelections)

  const matchIds = useMemo(
    () => [...new Set(selections.map((s) => s.matchId))],
    [selections],
  )

  const queries = useQueries({
    queries: matchIds.map((matchId) => ({
      queryKey: queryKeys.fixtures.detail(matchId),
      queryFn: () => fetchMatchFromApi(matchId),
      enabled: matchIds.length > 0,
      staleTime: 30_000,
      refetchInterval: PRUNE_POLL_MS,
    })),
  })

  const statusKey = queries
    .map((q) => {
      if (q.isPending || q.isLoading) return 'pending'
      if (q.isError) return 'error'
      return q.data?.status ?? 'missing'
    })
    .join('|')

  useEffect(() => {
    if (matchIds.length === 0) return

    const expired: string[] = []
    matchIds.forEach((matchId, index) => {
      const query = queries[index]
      if (!query || query.isPending || query.isLoading || query.isError) return
      if (!isMatchBettable(query.data?.status)) {
        expired.push(matchId)
      }
    })

    if (expired.length > 0) {
      pruneSelections(expired)
    }
  }, [matchIds, statusKey, queries, pruneSelections])
}
