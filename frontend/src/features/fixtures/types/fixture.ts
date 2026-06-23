import type { League, Match, Team } from '@/mocks/data/types'

export type MatchWithTeams = Match & { homeTeam: Team; awayTeam: Team; league: League }
