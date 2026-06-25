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
    default:
      return MATCH_STATUS.SCHEDULED
  }
}

function isOnCupTab(pathname: string, searchParams: URLSearchParams): boolean {
  return pathname === ROUTES.HOME && searchParams.get('tab') === 'cup'
}

function isOnMatchesPage(pathname: string): boolean {
  return pathname === ROUTES.FIXTURES
}

function buildFixtureSearchParams(
  base: URLSearchParams,
  view: FixtureView,
  sportId: string,
  leagueId?: string,
  includeCupTab = false,
): URLSearchParams {
  const next = new URLSearchParams(base)
  if (includeCupTab) next.set('tab', 'cup')
  next.set('view', view)
  next.set('sport', sportId)
  if (leagueId) next.set('league', leagueId)
  else next.delete('league')
  return next
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
    const onCupTab = isOnCupTab(location.pathname, params)
    const onMatchesPage = isOnMatchesPage(location.pathname)

    const resolvedView =
      patch.view !== undefined && isFixtureView(patch.view) ? patch.view : view
    const resolvedSport = patch.sport ?? sportId
    const resolvedLeague =
      patch.league !== undefined ? patch.league || undefined : leagueId

    if (onCupTab) {
      const next = buildFixtureSearchParams(
        params,
        resolvedView,
        resolvedSport,
        resolvedLeague,
        true,
      )
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === '') next.delete(key)
        else next.set(key, value)
      })
      next.set('tab', 'cup')
      setParams(next, { replace: true })
      return
    }

    if (onMatchesPage) {
      const next = buildFixtureSearchParams(params, resolvedView, resolvedSport, resolvedLeague)
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined || value === '') next.delete(key)
        else next.set(key, value)
      })
      setParams(next, { replace: true })
      return
    }

    const next = buildFixtureSearchParams(
      new URLSearchParams(),
      resolvedView,
      resolvedSport,
      resolvedLeague,
    )
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === '') next.delete(key)
      else next.set(key, value)
    })
    navigate({ pathname: ROUTES.FIXTURES, search: next.toString() })
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
