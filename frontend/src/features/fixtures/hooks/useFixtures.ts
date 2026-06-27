import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/core/constants/queryKeys'
import {
  fetchCuratedSportCategories,
  fetchFixturesFromApi,
  fetchLeaguesFromApi,
  fetchMatchFromApi,
} from '@/features/fixtures/api/sportsApi'
import { SPORT_CATEGORIES } from '@/core/constants/sports'

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
    staleTime: 0,
  })
}

export function useCuratedSportCategories() {
  return useQuery({
    queryKey: queryKeys.fixtures.curatedSports(),
    queryFn: fetchCuratedSportCategories,
    staleTime: 0,
    placeholderData: SPORT_CATEGORIES,
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
