import axios from 'axios';

type EspnNewsImage = {
  url?: string;
  credit?: string;
  type?: string;
};

type EspnNewsHeadline = {
  id: number | string;
  headline?: string;
  title?: string;
  description?: string;
  published?: string;
  lastModified?: string;
  section?: string;
  images?: EspnNewsImage[];
  links?: {
    web?: { href?: string };
    mobile?: { href?: string };
  };
};

type EspnNewsApiResponse = {
  resultsCount?: number;
  resultsLimit?: number;
  resultsOffset?: number;
  headlines?: EspnNewsHeadline[];
};

const FALLBACK_ITEMS = [
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
    description: "Europe's elite clubs discover their opponents for the next round.",
    imageUrl: 'https://a.espncdn.com/photo/2026/0615/r1673756_608x342_16-9.jpg',
    source: 'ESPN',
    publishedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
    url: 'https://www.espn.com/soccer/',
    section: 'Soccer',
  },
];

function pickImage(images: EspnNewsImage[] | undefined): EspnNewsImage | undefined {
  if (!images?.length) return undefined;
  const header = images.find((img) => img.type === 'header');
  return header ?? images[0];
}

function mapEspnResponse(data: EspnNewsApiResponse, limit: number, offset: number) {
  const headlines = data.headlines ?? [];
  const items = headlines.map((item) => {
    const image = pickImage(item.images);
    const url = item.links?.web?.href ?? item.links?.mobile?.href ?? '#';
    return {
      id: String(item.id),
      headline: item.headline ?? item.title ?? 'Untitled story',
      description: item.description,
      imageUrl: image?.url,
      imageCredit: image?.credit,
      source: 'ESPN',
      publishedAt: item.published ?? item.lastModified ?? new Date().toISOString(),
      url,
      section: item.section,
    };
  });

  return {
    items,
    total: data.resultsCount ?? items.length,
    limit: data.resultsLimit ?? limit,
    offset: data.resultsOffset ?? offset,
  };
}

function fallbackFeed(limit: number, offset: number) {
  const items = FALLBACK_ITEMS.slice(offset, offset + limit);
  return {
    items,
    total: FALLBACK_ITEMS.length,
    limit,
    offset,
  };
}

function buildEspnUrl(sport: string, limit: number, offset: number): string {
  const base =
    sport === 'all'
      ? 'https://now.core.api.espn.com/v1/sports/news'
      : 'https://now.core.api.espn.com/v1/sports/soccer/news';
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return `${base}?${params.toString()}`;
}

export const newsService = {
  async getSportsNews(options: { sport?: string; limit?: number; offset?: number }) {
    const sport = options.sport === 'all' ? 'all' : 'soccer';
    const limit = Math.min(Math.max(options.limit ?? 10, 1), 20);
    const offset = Math.max(options.offset ?? 0, 0);

    try {
      const response = await axios.get<EspnNewsApiResponse>(buildEspnUrl(sport, limit, offset), {
        headers: { Accept: 'application/json' },
        timeout: 8000,
      });
      return mapEspnResponse(response.data, limit, offset);
    } catch {
      return fallbackFeed(limit, offset);
    }
  },
};
