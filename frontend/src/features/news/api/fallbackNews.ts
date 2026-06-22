import type { SportsNewsFeed } from '@/features/news/types/news'

export function getFallbackSportsNewsFeed(limit = 10): SportsNewsFeed {
  const items = [
    {
      id: 'fallback-1',
      headline: 'World Cup 2026: Underdogs shine in opening group matches',
      description: 'Several nations pulled off surprise results in the latest round of fixtures.',
      imageUrl: 'https://a.espncdn.com/photo/2026/0615/r1673756_608x342_16-9.jpg',
      source: 'ESPN',
      publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      url: 'https://www.espn.com/soccer/',
      section: 'Soccer',
    },
    {
      id: 'fallback-2',
      headline: 'Premier League transfer window: clubs chase summer targets',
      description: 'Top clubs across England are lining up moves before the window closes.',
      imageUrl: 'https://a.espncdn.com/photo/2026/0613/r1672212_608x342_16-9.jpg',
      source: 'ESPN',
      publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      url: 'https://www.espn.com/soccer/',
      section: 'Soccer',
    },
    {
      id: 'fallback-3',
      headline: 'Champions League draw sets up blockbuster knockout ties',
      description: 'Europe\'s elite clubs discover their opponents for the next round.',
      imageUrl: 'https://a.espncdn.com/photo/2026/0615/r1673756_608x342_16-9.jpg',
      source: 'ESPN',
      publishedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
      url: 'https://www.espn.com/soccer/',
      section: 'Soccer',
    },
  ]

  return {
    items: items.slice(0, limit),
    total: items.length,
    limit,
    offset: 0,
  }
}
