/** Normalized sports news item — shared contract between frontend and backend. */
export interface SportsNewsItem {
  id: string
  headline: string
  description?: string
  imageUrl?: string
  imageCredit?: string
  source: string
  publishedAt: string
  url: string
  section?: string
}

export interface SportsNewsFeed {
  items: SportsNewsItem[]
  total: number
  limit: number
  offset: number
}

export type SportsNewsSport = 'soccer' | 'all'

export interface SportsNewsQuery {
  sport?: SportsNewsSport
  limit?: number
  offset?: number
}
