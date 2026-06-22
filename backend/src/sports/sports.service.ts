import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MemoryCacheService } from '../cache/memory-cache.service'
import { OvertimeApiClient } from '../overtime/overtime-api.client'
import type {
  CachedPayloadMeta,
  LeaguesBySport,
  LiveMarketsListResponse,
  MarketTypesMap,
  MarketsListResponse,
  SportsMap,
  EnrichedMarket,
  EnrichedLiveMarket,
} from '../overtime/overtime.types'
import {
  CACHE_KEYS,
  buildLeaguesBySport,
  enrichLiveMarkets,
  enrichMarket,
  enrichMarkets,
} from './sports.mapper'

@Injectable()
export class SportsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SportsService.name)
  private marketsTimer?: NodeJS.Timeout
  private liveTimer?: NodeJS.Timeout
  private referenceTimer?: NodeJS.Timeout

  constructor(
    private readonly overtime: OvertimeApiClient,
    private readonly cache: MemoryCacheService,
    private readonly config: ConfigService,
  ) {}

  onModuleInit(): void {
    void this.bootstrap()

    const marketsInterval = this.config.get<number>('polling.marketsInterval')! * 1000
    const liveInterval = this.config.get<number>('polling.liveInterval')! * 1000
    const sportsTtl = this.config.get<number>('cache.sports')!

    this.marketsTimer = setInterval(() => void this.refreshMarkets(), marketsInterval)
    this.liveTimer = setInterval(() => void this.refreshLiveMarkets(), liveInterval)
    this.referenceTimer = setInterval(() => void this.refreshReferenceData(), sportsTtl * 1000)
  }

  onModuleDestroy(): void {
    if (this.marketsTimer) clearInterval(this.marketsTimer)
    if (this.liveTimer) clearInterval(this.liveTimer)
    if (this.referenceTimer) clearInterval(this.referenceTimer)
  }

  private async bootstrap(): Promise<void> {
    await this.refreshReferenceData()
    await this.refreshMarkets()
    await this.refreshLiveMarkets()
  }

  private getSportsMap(): SportsMap {
    return this.cache.get<SportsMap>(CACHE_KEYS.sports) ?? {}
  }

  async refreshReferenceData(): Promise<void> {
    try {
      const sportsTtl = this.config.get<number>('cache.sports')!
      const typesTtl = this.config.get<number>('cache.marketTypes')!

      const [sports, marketTypes] = await Promise.all([
        this.overtime.getSports(),
        this.overtime.getMarketTypes(),
      ])

      this.cache.set(CACHE_KEYS.sports, sports, sportsTtl)
      this.cache.set(CACHE_KEYS.marketTypes, marketTypes, typesTtl)
      this.logger.log('Reference data refreshed (sports + market types)')
    } catch (error) {
      this.logger.error(`Failed to refresh reference data: ${String(error)}`)
    }
  }

  async refreshMarkets(): Promise<void> {
    const ttl = this.config.get<number>('cache.markets')!
    const sportsMap = this.getSportsMap()
    const previousHash = this.cache.get<string>(CACHE_KEYS.marketsHash)

    try {
      const minMaturity = Math.floor(Date.now() / 1000)
      const result = await this.overtime.getMarkets({
        minMaturity,
        responseHash: previousHash,
      })

      if (result.noChange) {
        if (result.responseHash) {
          this.cache.set(CACHE_KEYS.marketsHash, result.responseHash, ttl)
        }
        this.logger.debug('Markets unchanged (hash match)')
        return
      }

      const enriched = enrichMarkets(result.markets ?? [], sportsMap)
      const now = new Date().toISOString()

      this.cache.set(CACHE_KEYS.markets, enriched, ttl)
      this.cache.set(CACHE_KEYS.marketsCachedAt, now, ttl)
      if (result.responseHash) {
        this.cache.set(CACHE_KEYS.marketsHash, result.responseHash, ttl)
      }

      this.logger.log(`Markets refreshed (${enriched.length} open markets)`)
    } catch (error) {
      this.logger.error(`Failed to refresh markets: ${String(error)}`)
    }
  }

  async refreshLiveMarkets(): Promise<void> {
    const ttl = this.config.get<number>('cache.liveMarkets')!
    const sportsMap = this.getSportsMap()

    try {
      const response = await this.overtime.getLiveMarkets()
      const enriched = enrichLiveMarkets(response.markets ?? [], sportsMap)
      const now = new Date().toISOString()

      this.cache.set(CACHE_KEYS.liveMarkets, enriched, ttl)
      this.cache.set(CACHE_KEYS.liveCachedAt, now, ttl)
      this.cache.set('overtime:live:errors', response.errors ?? [], ttl)

      this.logger.log(`Live markets refreshed (${enriched.length} markets)`)
    } catch (error) {
      this.logger.error(`Failed to refresh live markets: ${String(error)}`)
    }
  }

  getSports(): { data: SportsMap; meta: CachedPayloadMeta } {
    const data = this.cache.getStale<SportsMap>(CACHE_KEYS.sports)
    if (!data) {
      throw new NotFoundException('Sports metadata not loaded yet')
    }

    return {
      data,
      meta: {
        cachedAt: new Date().toISOString(),
        stale: !this.cache.get<SportsMap>(CACHE_KEYS.sports),
      },
    }
  }

  getMarketTypes(): { data: MarketTypesMap; meta: CachedPayloadMeta } {
    const data = this.cache.getStale<MarketTypesMap>(CACHE_KEYS.marketTypes)
    if (!data) {
      throw new NotFoundException('Market types not loaded yet')
    }

    return {
      data,
      meta: {
        cachedAt: new Date().toISOString(),
        stale: !this.cache.get<MarketTypesMap>(CACHE_KEYS.marketTypes),
      },
    }
  }

  getLeagues(): { data: LeaguesBySport[]; meta: CachedPayloadMeta } {
    const sportsMap = this.cache.getStale<SportsMap>(CACHE_KEYS.sports) ?? {}
    const markets = this.cache.getStale<EnrichedMarket[]>(CACHE_KEYS.markets) ?? []
    const cachedAt = this.cache.getStale<string>(CACHE_KEYS.marketsCachedAt)

    return {
      data: buildLeaguesBySport(sportsMap, markets),
      meta: {
        cachedAt: cachedAt ?? new Date().toISOString(),
        stale: !this.cache.get<EnrichedMarket[]>(CACHE_KEYS.markets),
        responseHash: this.cache.getStale<string>(CACHE_KEYS.marketsHash),
      },
    }
  }

  getMarkets(): MarketsListResponse {
    const markets = this.cache.getStale<EnrichedMarket[]>(CACHE_KEYS.markets)
    if (!markets) {
      throw new NotFoundException('Markets not loaded yet')
    }

    const cachedAt = this.cache.getStale<string>(CACHE_KEYS.marketsCachedAt) ?? new Date().toISOString()
    const fresh = this.cache.get<EnrichedMarket[]>(CACHE_KEYS.markets)

    return {
      markets,
      meta: {
        cachedAt,
        stale: !fresh,
        responseHash: this.cache.getStale<string>(CACHE_KEYS.marketsHash),
      },
    }
  }

  async getMarketByGameId(gameId: string): Promise<{ data: EnrichedMarket; meta: CachedPayloadMeta }> {
    const ttl = this.config.get<number>('cache.marketDetail')!
    const cacheKey = CACHE_KEYS.marketDetail(gameId)
    const cachedAtKey = CACHE_KEYS.marketDetailCachedAt(gameId)

    const cached = this.cache.getStale<EnrichedMarket>(cacheKey)
    if (cached) {
      return {
        data: cached,
        meta: {
          cachedAt: this.cache.getStale<string>(cachedAtKey) ?? new Date().toISOString(),
          stale: !this.cache.get<EnrichedMarket>(cacheKey),
        },
      }
    }

    try {
      const sportsMap = this.getSportsMap()
      const market = await this.overtime.getMarketByGameId(gameId)
      const enriched = enrichMarket(market, sportsMap)
      const now = new Date().toISOString()

      this.cache.set(cacheKey, enriched, ttl)
      this.cache.set(cachedAtKey, now, ttl)

      return {
        data: enriched,
        meta: { cachedAt: now, stale: false },
      }
    } catch (error) {
      if (cached) {
        return {
          data: cached,
          meta: {
            cachedAt: this.cache.getStale<string>(cachedAtKey) ?? new Date().toISOString(),
            stale: true,
          },
        }
      }
      throw error
    }
  }

  getLiveMarkets(): LiveMarketsListResponse {
    const markets = this.cache.getStale<EnrichedLiveMarket[]>(CACHE_KEYS.liveMarkets)
    if (!markets) {
      throw new NotFoundException('Live markets not loaded yet')
    }

    const errors = this.cache.getStale<string[]>('overtime:live:errors') ?? []
    const cachedAt = this.cache.getStale<string>(CACHE_KEYS.liveCachedAt) ?? new Date().toISOString()
    const fresh = this.cache.get<EnrichedLiveMarket[]>(CACHE_KEYS.liveMarkets)

    return {
      markets,
      errors,
      meta: {
        cachedAt,
        stale: !fresh,
      },
    }
  }
}
