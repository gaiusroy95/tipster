import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/core/constants/queryKeys'
import {
  fetchFixturesFromApi,
  fetchLeaguesFromApi,
  fetchMatchFromApi,
} from '@/features/fixtures/api/sportsApi'

export type { MatchWithTeams } from '@/features/fixtures/types/fixture'

export interface FixtureFilters {
  leagueId?: string
  status?: string
  sportId?: string
}

export function useLeagues(sportId?: string) {
  return useQuery({
    queryKey: queryKeys.fixtures.leagues(sportId),
    queryFn: () => fetchLeaguesFromApi(sportId),
    staleTime: 5 * 60 * 1000,
  })
}

export function useFixtures(filters?: FixtureFilters) {
  return useQuery({
    queryKey: queryKeys.fixtures.list(filters),
    queryFn: () => fetchFixturesFromApi(filters),
    staleTime: 30 * 1000,
  })
}

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: queryKeys.fixtures.detail(matchId),
    queryFn: async () => {
      const match = await fetchMatchFromApi(matchId)
      if (!match) throw new Error('Match not found')
      return match
    },
    enabled: !!matchId,
    staleTime: 30 * 1000,
  })
}
