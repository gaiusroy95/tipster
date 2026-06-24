import { FIXTURE_VIEWS, type FixtureView } from '@/core/constants/sports'

const SPORT_IMAGES_BASE = '/assets/sport-images'

/** Live / Upcoming filter icons in public/assets/sport-images */
export const FIXTURE_VIEW_ICON_SRC: Record<FixtureView, string> = {
  [FIXTURE_VIEWS.LIVE]: `${SPORT_IMAGES_BASE}/live.png`,
  [FIXTURE_VIEWS.UPCOMING]: `${SPORT_IMAGES_BASE}/upcoming.png`,
}

export function getFixtureViewIconSrc(view: FixtureView): string {
  return FIXTURE_VIEW_ICON_SRC[view]
}

/** Maps sport category ids to PNG assets in public/assets/sport-images */
export const SPORT_ICON_SRC: Record<string, string> = {
  soccer: `${SPORT_IMAGES_BASE}/Soccer.png`,
  basketball: `${SPORT_IMAGES_BASE}/Basketball.png`,
  volleyball: `${SPORT_IMAGES_BASE}/Volleyball.png`,
  tennis: `${SPORT_IMAGES_BASE}/Tennis.png`,
  hockey: `${SPORT_IMAGES_BASE}/Hockey.png`,
  baseball: `${SPORT_IMAGES_BASE}/Baseball.png`,
  mma: `${SPORT_IMAGES_BASE}/Fighting.png`,
  esports: `${SPORT_IMAGES_BASE}/eSports.png`,
  football: `${SPORT_IMAGES_BASE}/Football.png`,
  cricket: `${SPORT_IMAGES_BASE}/Cricket.png`,
  rugby: `${SPORT_IMAGES_BASE}/Rugby.png`,
  golf: `${SPORT_IMAGES_BASE}/Golf.png`,
  handball: `${SPORT_IMAGES_BASE}/Handball.png`,
  motorsport: `${SPORT_IMAGES_BASE}/Motosport.png`,
  'table-tennis': `${SPORT_IMAGES_BASE}/TableTennis.png`,
  waterpolo: `${SPORT_IMAGES_BASE}/Waterpolo.png`,
  'aussie-rules': `${SPORT_IMAGES_BASE}/AussieRules.png`,
  curling: `${SPORT_IMAGES_BASE}/Curling.png`,
  darts: `${SPORT_IMAGES_BASE}/Darts.png`,
  lacrosse: `${SPORT_IMAGES_BASE}/Lacrosse.png`,
  snooker: `${SPORT_IMAGES_BASE}/Snooker.png`,
  politics: `${SPORT_IMAGES_BASE}/Politics.png`,
}

export function getSportIconSrc(sportId: string): string | undefined {
  return SPORT_ICON_SRC[sportId]
}
