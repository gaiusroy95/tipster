import { registerAs } from '@nestjs/config'

export default registerAs('overtime', () => ({
  baseUrl: process.env.OVERTIME_BASE_URL ?? 'https://api.overtime.io/overtime-v2',
  apiKey: process.env.X_API_KEY ?? '',
  networkId: Number(process.env.OVERTIME_NETWORK_ID ?? 10),
}))

export const cacheConfig = registerAs('cache', () => ({
  sports: Number(process.env.CACHE_TTL_SPORTS ?? 86400),
  marketTypes: Number(process.env.CACHE_TTL_MARKET_TYPES ?? 86400),
  markets: Number(process.env.CACHE_TTL_MARKETS ?? 120),
  liveMarkets: Number(process.env.CACHE_TTL_LIVE_MARKETS ?? 60),
  marketDetail: Number(process.env.CACHE_TTL_MARKET_DETAIL ?? 60),
}))

export const pollingConfig = registerAs('polling', () => ({
  marketsInterval: Number(process.env.POLL_MARKETS_INTERVAL ?? 60),
  liveInterval: Number(process.env.POLL_LIVE_INTERVAL ?? 30),
}))
