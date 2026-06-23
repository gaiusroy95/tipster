import { Controller, Get, Param, Query } from '@nestjs/common';
import { SportsService } from './sports.service';

@Controller('sports')
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @Get('sports')
  async fetchSports() {
    return await this.sportsService.fetchSportsMapper();
  }

  @Get('market-types')
  async fetchMarketTypes() {
    return await this.sportsService.fetchMarketTypesMapper();
  }

  @Get('leagues')
  async fetchLeagues() {
    return await this.sportsService.fetchLeaguesMapper();
  }

  @Get('networks/:network/markets')
  async fetchMarkets(
    @Param('network') _network: number,
    @Query() query: Record<string, unknown>,
  ) {
    return await this.sportsService.fetchMarketsMapper(10, query);
  }

  @Get('networks/:network/markets/:gameId')
  async getMarket(@Param('gameId') gameId: string) {
    return await this.sportsService.getMarket(10, gameId);
  }

  @Get('networks/:network/live-markets')
  async fetchLiveMarkets(@Param('network') _network: number) {
    return await this.sportsService.fetchLiveMarketsMapper(10);
  }
}
