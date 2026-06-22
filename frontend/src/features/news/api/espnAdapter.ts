import type { SportsNewsFeed, SportsNewsItem } from '@/features/news/types/news'

/** Minimal ESPN Now API shape used for mapping (backend can reuse this adapter). */
interface EspnNewsImage {
  url?: string
  credit?: string
  type?: string
}

interface EspnNewsHeadline {
  id: number | string
  headline?: string
  title?: string
  description?: string
  published?: string
  lastModified?: string
  section?: string
  images?: EspnNewsImage[]
  links?: {
    web?: { href?: string }
    mobile?: { href?: string }
  }
}

export interface EspnNewsApiResponse {
  resultsCount?: number
  resultsLimit?: number
  resultsOffset?: number
  headlines?: EspnNewsHeadline[]
}

const ESPN_SOURCE = 'ESPN'

function pickImage(images: EspnNewsImage[] | undefined): EspnNewsImage | undefined {
  if (!images?.length) return undefined
  const header = images.find((img) => img.type === 'header')
  return header ?? images[0]
}

export function mapEspnNewsResponse(data: EspnNewsApiResponse): SportsNewsFeed {
  const headlines = data.headlines ?? []

  const items: SportsNewsItem[] = headlines.map((item) => {
    const image = pickImage(item.images)
    const url = item.links?.web?.href ?? item.links?.mobile?.href ?? '#'

    return {
      id: String(item.id),
      headline: item.headline ?? item.title ?? 'Untitled story',
      description: item.description,
      imageUrl: image?.url,
      imageCredit: image?.credit,
      source: ESPN_SOURCE,
      publishedAt: item.published ?? item.lastModified ?? new Date().toISOString(),
      url,
      section: item.section,
    }
  })

  return {
    items,
    total: data.resultsCount ?? items.length,
    limit: data.resultsLimit ?? items.length,
    offset: data.resultsOffset ?? 0,
  }
}

export function buildEspnNewsUrl(sport: 'soccer' | 'all', limit: number, offset: number): string {
  const base =
    sport === 'all'
      ? 'https://now.core.api.espn.com/v1/sports/news'
      : 'https://now.core.api.espn.com/v1/sports/soccer/news'

  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })

  return `${base}?${params.toString()}`
}
