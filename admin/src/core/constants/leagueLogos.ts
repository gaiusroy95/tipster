export const LEAGUE_LOGO_DIR = '/assets/Leagues'
export const COUNTRY_FLAG_DIR = '/assets/Countries'

/** Maps curated/Overtime league names to SVG filenames in public/assets/Leagues. */
const LEAGUE_LOGO_ALIASES: Record<string, string> = {
  'England Premier League': 'Premier League',
}

const COUNTRY_MATCHERS: { slug: string; names: string[] }[] = [
  { slug: 'united-states-of-america', names: ['United States of America', 'United States', 'USA'] },
  { slug: 'united-arab-emirates', names: ['United Arab Emirates', 'UAE'] },
  { slug: 'united-kingdom', names: ['United Kingdom', 'UK', 'Great Britain'] },
  { slug: 'northern-ireland', names: ['Northern Ireland'] },
  { slug: 'north-macedonia', names: ['North Macedonia'] },
  { slug: 'czech-republic', names: ['Czech Republic', 'Czechia'] },
  { slug: 'south-africa', names: ['South Africa'] },
  { slug: 'south-korea', names: ['South Korea'] },
  { slug: 'south-america', names: ['South America'] },
  { slug: 'costa-rica', names: ['Costa Rica'] },
  { slug: 'saudi-arabia', names: ['Saudi Arabia'] },
  { slug: 'new-zealand', names: ['New Zealand'] },
  { slug: 'england', names: ['England'] },
  { slug: 'scotland', names: ['Scotland'] },
  { slug: 'wales', names: ['Wales'] },
  { slug: 'ireland', names: ['Ireland'] },
  { slug: 'germany', names: ['Germany'] },
  { slug: 'france', names: ['France'] },
  { slug: 'spain', names: ['Spain'] },
  { slug: 'italy', names: ['Italy'] },
  { slug: 'portugal', names: ['Portugal'] },
  { slug: 'netherlands', names: ['Netherlands', 'Holland'] },
  { slug: 'belgium', names: ['Belgium'] },
  { slug: 'switzerland', names: ['Switzerland'] },
  { slug: 'austria', names: ['Austria'] },
  { slug: 'poland', names: ['Poland'] },
  { slug: 'croatia', names: ['Croatia'] },
  { slug: 'serbia', names: ['Serbia'] },
  { slug: 'slovenia', names: ['Slovenia'] },
  { slug: 'slovakia', names: ['Slovakia'] },
  { slug: 'hungary', names: ['Hungary'] },
  { slug: 'romania', names: ['Romania'] },
  { slug: 'bulgaria', names: ['Bulgaria'] },
  { slug: 'greece', names: ['Greece'] },
  { slug: 'turkey', names: ['Turkey', 'Türkiye'] },
  { slug: 'russia', names: ['Russia'] },
  { slug: 'ukraine', names: ['Ukraine'] },
  { slug: 'belarus', names: ['Belarus'] },
  { slug: 'georgia', names: ['Georgia'] },
  { slug: 'kazakhstan', names: ['Kazakhstan'] },
  { slug: 'uzbekistan', names: ['Uzbekistan'] },
  { slug: 'finland', names: ['Finland'] },
  { slug: 'sweden', names: ['Sweden'] },
  { slug: 'norway', names: ['Norway'] },
  { slug: 'denmark', names: ['Denmark'] },
  { slug: 'iceland', names: ['Iceland'] },
  { slug: 'estonia', names: ['Estonia'] },
  { slug: 'latvia', names: ['Latvia'] },
  { slug: 'lithuania', names: ['Lithuania'] },
  { slug: 'malta', names: ['Malta'] },
  { slug: 'cyprus', names: ['Cyprus'] },
  { slug: 'brazil', names: ['Brazil'] },
  { slug: 'argentina', names: ['Argentina'] },
  { slug: 'mexico', names: ['Mexico'] },
  { slug: 'canada', names: ['Canada'] },
  { slug: 'chile', names: ['Chile'] },
  { slug: 'colombia', names: ['Colombia'] },
  { slug: 'peru', names: ['Peru'] },
  { slug: 'ecuador', names: ['Ecuador'] },
  { slug: 'venezuela', names: ['Venezuela'] },
  { slug: 'bolivia', names: ['Bolivia'] },
  { slug: 'paraguay', names: ['Paraguay'] },
  { slug: 'uruguay', names: ['Uruguay'] },
  { slug: 'australia', names: ['Australia'] },
  { slug: 'japan', names: ['Japan'] },
  { slug: 'china', names: ['China'] },
  { slug: 'india', names: ['India'] },
  { slug: 'indonesia', names: ['Indonesia'] },
  { slug: 'malaysia', names: ['Malaysia'] },
  { slug: 'singapore', names: ['Singapore'] },
  { slug: 'thailand', names: ['Thailand'] },
  { slug: 'vietnam', names: ['Vietnam'] },
  { slug: 'philippines', names: ['Philippines'] },
  { slug: 'taiwan', names: ['Taiwan'] },
  { slug: 'pakistan', names: ['Pakistan'] },
  { slug: 'israel', names: ['Israel'] },
  { slug: 'iran', names: ['Iran'] },
  { slug: 'qatar', names: ['Qatar'] },
  { slug: 'egypt', names: ['Egypt'] },
  { slug: 'algeria', names: ['Algeria'] },
  { slug: 'europe', names: ['Europe'] },
  { slug: 'world', names: ['World', 'International'] },
]

const MATCHERS_BY_NAME_LENGTH = [...COUNTRY_MATCHERS].sort(
  (a, b) =>
    Math.max(...b.names.map((n) => n.length)) - Math.max(...a.names.map((n) => n.length)),
)

function normalizeForMatch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function slugToDisplay(slug: string) {
  return slug.replace(/-/g, ' ')
}

export function getLeagueLogoSrc(leagueName: string): string {
  const fileBase = LEAGUE_LOGO_ALIASES[leagueName] ?? leagueName
  return `${LEAGUE_LOGO_DIR}/${encodeURIComponent(fileBase)}.svg`
}

export function getCountryFlagSrc(slug: string): string {
  return `${COUNTRY_FLAG_DIR}/${slug}.svg`
}

export function resolveCountrySlug(country?: string, leagueName?: string): string | undefined {
  if (country) {
    const normalizedCountry = normalizeForMatch(country)
    for (const matcher of COUNTRY_MATCHERS) {
      if (matcher.names.some((name) => normalizeForMatch(name) === normalizedCountry)) {
        return matcher.slug
      }
      if (normalizeForMatch(slugToDisplay(matcher.slug)) === normalizedCountry) {
        return matcher.slug
      }
    }
  }

  if (!leagueName) return undefined

  const normalizedLeague = normalizeForMatch(leagueName)
  for (const matcher of MATCHERS_BY_NAME_LENGTH) {
    for (const name of [...matcher.names].sort((a, b) => b.length - a.length)) {
      const normalizedName = normalizeForMatch(name)
      if (normalizedLeague.includes(normalizedName)) {
        return matcher.slug
      }
    }
  }

  return undefined
}

export function resolveLeagueLogoCandidates(leagueName: string, country?: string): string[] {
  const candidates: string[] = [getLeagueLogoSrc(leagueName)]
  const countrySlug = resolveCountrySlug(country, leagueName)
  if (countrySlug) {
    const flagSrc = getCountryFlagSrc(countrySlug)
    if (!candidates.includes(flagSrc)) {
      candidates.push(flagSrc)
    }
  }
  return candidates
}
