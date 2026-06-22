import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '@/core/constants/routes'
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

function isOnMatchesHub(pathname: string, searchParams: URLSearchParams): boolean {
  return pathname === ROUTES.HOME && searchParams.get('tab') === 'cup'
}

export function useFixtureNavParams(): FixtureNavParams & {
  setView: (view: FixtureView) => void
  setSportId: (sportId: string) => void
  setLeagueId: (leagueId?: string) => void
} {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  const viewParam = params.get('view')
  const view = isFixtureView(viewParam) ? viewParam : DEFAULT_FIXTURE_VIEW
  const sportId = params.get('sport') || DEFAULT_SPORT_ID
  const leagueId = params.get('league') || undefined

  const applyParams = (patch: Record<string, string | undefined>) => {
    const onMatchesHub = isOnMatchesHub(location.pathname, params)

    const next = onMatchesHub
      ? new URLSearchParams(params)
      : new URLSearchParams({
          tab: 'cup',
          view,
          sport: sportId,
          ...(leagueId ? { league: leagueId } : {}),
        })

    next.set('tab', 'cup')

    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === '') next.delete(key)
      else next.set(key, value)
    })

    if (onMatchesHub) {
      setParams(next, { replace: true })
    } else {
      navigate({ pathname: ROUTES.HOME, search: next.toString() })
    }
  }

  return {
    view,
    sportId,
    leagueId,
    setView: (v) => applyParams({ view: v }),
    setSportId: (id) => applyParams({ sport: id, league: undefined }),
    setLeagueId: (id) => applyParams({ league: id }),
  }
}
