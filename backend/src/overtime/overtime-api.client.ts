import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { fetchWithRetry } from '../common/retry.util'
import type {
  LiveMarketsApiResponse,
  MarketTypesMap,
  MarketsApiResponse,
  OvertimeMarket,
  SportsMap,
} from './overtime.types'

export interface MarketsQuery {
  ungroup?: boolean
  onlyBasicProperties?: boolean
  includeHashInResponse?: boolean
  status?: string
  onlyMainMarkets?: boolean
  includeProofs?: boolean
  minMaturity?: number
  responseHash?: string
}

@Injectable()
export class OvertimeApiClient {
  private readonly logger = new Logger(OvertimeApiClient.name)
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly networkId: number

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('overtime.baseUrl')!
    this.apiKey = this.config.get<string>('overtime.apiKey') ?? ''
    this.networkId = this.config.get<number>('overtime.networkId')!
  }

  private buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${path}`)
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value))
        }
      }
    }
    return url.toString()
  }

  private headers(requiresAuth = true): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (requiresAuth && this.apiKey) {
      headers['x-api-key'] = this.apiKey
    }
    return headers
  }

  async getSports(): Promise<SportsMap> {
    const url = this.buildUrl('/sports')
    return fetchWithRetry<SportsMap>(url, { headers: this.headers(true) })
  }

  async getMarketTypes(): Promise<MarketTypesMap> {
    const url = this.buildUrl('/market-types')
    return fetchWithRetry<MarketTypesMap>(url, { headers: this.headers(true) })
  }

  async getMarkets(query: MarketsQuery): Promise<{
    noChange: boolean
    responseHash?: string
    markets?: OvertimeMarket[]
  }> {
    const url = this.buildUrl(`/networks/${this.networkId}/markets`, {
      ungroup: query.ungroup ?? true,
      onlyBasicProperties: query.onlyBasicProperties ?? true,
      includeHashInResponse: query.includeHashInResponse ?? true,
      status: query.status ?? 'open',
      onlyMainMarkets: query.onlyMainMarkets ?? true,
      includeProofs: query.includeProofs ?? false,
      minMaturity: query.minMaturity,
      responseHash: query.responseHash,
    })

    const data = await fetchWithRetry<MarketsApiResponse>(url, { headers: this.headers(true) })

    if (data.markets === 'no change') {
      return { noChange: true, responseHash: data.responseHash }
    }

    const markets = Array.isArray(data.markets)
      ? data.markets
      : this.flattenGroupedMarkets(data.markets)

    return {
      noChange: false,
      responseHash: data.responseHash,
      markets,
    }
  }

  async getMarketByGameId(gameId: string): Promise<OvertimeMarket> {
    const encodedId = encodeURIComponent(gameId)
    const url = this.buildUrl(`/networks/${this.networkId}/markets/${encodedId}`)
    const data = await fetchWithRetry<OvertimeMarket | { markets: OvertimeMarket }>(url, {
      headers: this.headers(true),
    })

    if ('markets' in data && data.markets) {
      return data.markets as OvertimeMarket
    }

    return data as OvertimeMarket
  }

  async getLiveMarkets(): Promise<LiveMarketsApiResponse> {
    const url = this.buildUrl(`/networks/${this.networkId}/live-markets`)
    return fetchWithRetry<LiveMarketsApiResponse>(url, { headers: this.headers(true) })
  }

  private flattenGroupedMarkets(grouped: Record<string, unknown>): OvertimeMarket[] {
    const markets: OvertimeMarket[] = []

    for (const value of Object.values(grouped)) {
      if (Array.isArray(value)) {
        markets.push(...(value as OvertimeMarket[]))
      } else if (value && typeof value === 'object') {
        const nested = value as Record<string, unknown>
        for (const inner of Object.values(nested)) {
          if (Array.isArray(inner)) {
            markets.push(...(inner as OvertimeMarket[]))
          } else if (inner && typeof inner === 'object' && 'gameId' in inner) {
            markets.push(inner as OvertimeMarket)
          }
        }
      }
    }

    return markets
  }
}
