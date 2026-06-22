const SVG_BASE = '/assets/SVG'

export interface SportsSliderItem {
  id: string
  name: string
  iconSrc: string
}

/** Sports shown in the horizontal category slider (Tipster Cup). */
export const SPORTS_SLIDER_ITEMS: SportsSliderItem[] = [
  { id: 'soccer', name: 'Soccer', iconSrc: `${SVG_BASE}/Soccer.svg` },
  { id: 'esports', name: 'eSports', iconSrc: `${SVG_BASE}/eSports.svg` },
  { id: 'basketball', name: 'Basketball', iconSrc: `${SVG_BASE}/Basketball.svg` },
  { id: 'tennis', name: 'Tennis', iconSrc: `${SVG_BASE}/Tennis.svg` },
  { id: 'hockey', name: 'Ice Hockey', iconSrc: `${SVG_BASE}/IceHockey.svg` },
  { id: 'volleyball', name: 'Volleyball', iconSrc: `${SVG_BASE}/Volleyball.svg` },
  { id: 'baseball', name: 'Baseball', iconSrc: `${SVG_BASE}/Baseball.svg` },
  { id: 'mma', name: 'MMA', iconSrc: `${SVG_BASE}/MMA.svg` },
  { id: 'football', name: 'Football', iconSrc: `${SVG_BASE}/American-football.svg` },
  { id: 'cricket', name: 'Cricket', iconSrc: `${SVG_BASE}/Cricket.svg` },
  { id: 'rugby', name: 'Rugby', iconSrc: `${SVG_BASE}/Rugby.svg` },
  { id: 'golf', name: 'Golf', iconSrc: `${SVG_BASE}/Golf.svg` },
  { id: 'handball', name: 'Handball', iconSrc: `${SVG_BASE}/Handball.svg` },
  { id: 'table-tennis', name: 'Table Tennis', iconSrc: `${SVG_BASE}/TableTennis.svg` },
  { id: 'waterpolo', name: 'Waterpolo', iconSrc: `${SVG_BASE}/Waterpolo.svg` },
  { id: 'darts', name: 'Darts', iconSrc: `${SVG_BASE}/Darts.svg` },
  { id: 'curling', name: 'Curling', iconSrc: `${SVG_BASE}/Curling.svg` },
  { id: 'boxing', name: 'Boxing', iconSrc: `${SVG_BASE}/Boxing.svg` },
  { id: 'aussie-rules', name: 'AFL', iconSrc: `${SVG_BASE}/AFL.svg` },
  { id: 'snooker', name: 'Snooker', iconSrc: `${SVG_BASE}/Snooker.svg` },
  { id: 'lacrosse', name: 'Lacrosse', iconSrc: `${SVG_BASE}/Lacrosse.svg` },
  { id: 'futsal', name: 'Futsal', iconSrc: `${SVG_BASE}/Futsal.svg` },
]
