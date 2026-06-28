import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import { clearCuratedLeaguesCache } from '@/features/fixtures/api/sportsApi'
import { queryKeys } from '@/core/constants/queryKeys'
import type { ApiResponse } from '@/core/types/api'

const REVISION_POLL_MS = 3_000

/**
 * Polls admin curation revision and refetches fixture queries when it changes,
 * so arena sidebar/leagues update without a manual page refresh.
 */
export function useCurationRevisionSync() {
  const queryClient = useQueryClient()
  const lastRevision = useRef<string | null>(null)

  const { data: revision } = useQuery({
    queryKey: queryKeys.fixtures.curationRevision(),
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<{ revision: string }>>(
        '/leagues/curated/revision',
      )
      return data.data?.revision ?? ''
    },
    staleTime: 0,
    refetchInterval: REVISION_POLL_MS,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  })

  useEffect(() => {
    if (!revision) return

    if (lastRevision.current === null) {
      lastRevision.current = revision
      return
    }

    if (lastRevision.current === revision) return

    lastRevision.current = revision
    clearCuratedLeaguesCache()
    void queryClient.invalidateQueries({ queryKey: queryKeys.fixtures.all() })
  }, [revision, queryClient])
}
