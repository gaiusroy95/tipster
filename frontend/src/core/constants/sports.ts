export const FIXTURE_VIEWS = {
  LIVE: 'live',
  UPCOMING: 'upcoming',
  FINISHED: 'finished',
} as const

export type FixtureView = (typeof FIXTURE_VIEWS)[keyof typeof FIXTURE_VIEWS]

export interface SportCategory {
  id: string
  name: string
}

export const SPORT_CATEGORIES: SportCategory[] = [
  { id: 'soccer', name: 'Soccer' },
  { id: 'basketball', name: 'Basketball' },
  { id: 'volleyball', name: 'Volleyball' },
  { id: 'tennis', name: 'Tennis' },
  { id: 'hockey', name: 'Hockey' },
  { id: 'baseball', name: 'Baseball' },
  { id: 'mma', name: 'MMA' },
  { id: 'esports', name: 'Esports' },
]

export const DEFAULT_SPORT_ID = 'soccer'
export const DEFAULT_FIXTURE_VIEW: FixtureView = FIXTURE_VIEWS.UPCOMING

export function isFixtureView(value: string | null): value is FixtureView {
  return value === FIXTURE_VIEWS.LIVE || value === FIXTURE_VIEWS.UPCOMING || value === FIXTURE_VIEWS.FINISHED
}
