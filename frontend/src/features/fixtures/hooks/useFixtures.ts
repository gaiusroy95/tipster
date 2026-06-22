import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/core/api/client'
import type { ApiResponse } from '@/core/types/api'
import type { League, Match, Team } from '@/mocks/data/types'
import { queryKeys } from '@/core/constants/queryKeys'

export type MatchWithTeams = Match & { homeTeam: Team; awayTeam: Team; league: League }

export interface FixtureFilters {
  leagueId?: string
  status?: string
  sportId?: string
}

export function useLeagues(sportId?: string) {
  return useQuery({
    queryKey: queryKeys.fixtures.leagues(sportId),
    queryFn: async () => {
      const params = sportId ? { sportId } : {}
      const res = await apiClient.get<ApiResponse<League[]>>('/fixtures/leagues', { params })
      return res.data.data
    },
  })
}

export function useFixtures(filters?: FixtureFilters) {
  return useQuery({
    queryKey: queryKeys.fixtures.list(filters),
    queryFn: async () => {
      const params: Record<string, string> = {}
      if (filters?.leagueId) params.leagueId = filters.leagueId
      if (filters?.status) params.status = filters.status
      if (filters?.sportId) params.sportId = filters.sportId
      const res = await apiClient.get<ApiResponse<MatchWithTeams[]>>('/fixtures', { params })
      return res.data.data
    },
  })
}

export function useMatch(matchId: string) {
  return useQuery({
    queryKey: queryKeys.fixtures.detail(matchId),
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<MatchWithTeams>>(`/fixtures/${matchId}`)
      return res.data.data
    },
    enabled: !!matchId,
  })
}
