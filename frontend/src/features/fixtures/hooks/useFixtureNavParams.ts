import { useSearchParams } from 'react-router-dom'
import {
  DEFAULT_FIXTURE_VIEW,
  DEFAULT_SPORT_ID,
  FIXTURE_VIEWS,
  isFixtureView,
  type FixtureView,
} from '@/core/constants/sports'
import { MATCH_STATUS } from '@/core/constants/markets'

export interface FixtureNavParams {
  view: FixtureView
  sportId: string
  leagueId?: string
}

export function fixtureViewToStatus(view: FixtureView): string {
  switch (view) {
    case FIXTURE_VIEWS.LIVE:
      return MATCH_STATUS.LIVE
    case FIXTURE_VIEWS.FINISHED:
      return MATCH_STATUS.FINISHED
    default:
      return MATCH_STATUS.SCHEDULED
  }
}

export function useFixtureNavParams(): FixtureNavParams & {
  setView: (view: FixtureView) => void
  setSportId: (sportId: string) => void
  setLeagueId: (leagueId?: string) => void
} {
  const [params, setParams] = useSearchParams()

  const viewParam = params.get('view')
  const view = isFixtureView(viewParam) ? viewParam : DEFAULT_FIXTURE_VIEW
  const sportId = params.get('sport') || DEFAULT_SPORT_ID
  const leagueId = params.get('league') || undefined

  const merge = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === '') next.delete(key)
      else next.set(key, value)
    })
    setParams(next, { replace: true })
  }

  return {
    view,
    sportId,
    leagueId,
    setView: (v) => merge({ view: v }),
    setSportId: (id) => merge({ sport: id, league: undefined }),
    setLeagueId: (id) => merge({ league: id }),
  }
}
