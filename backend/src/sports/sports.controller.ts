import { Controller, Get, Param } from '@nestjs/common'
import { SportsService } from './sports.service'

@Controller()
export class SportsController {
  constructor(private readonly sportsService: SportsService) {}

  @Get('sports')
  getSports() {
    return { data: this.sportsService.getSports() }
  }

  @Get('market-types')
  getMarketTypes() {
    return { data: this.sportsService.getMarketTypes() }
  }

  @Get('leagues')
  getLeagues() {
    return { data: this.sportsService.getLeagues() }
  }

  @Get('markets')
  getMarkets() {
    return { data: this.sportsService.getMarkets() }
  }

  @Get('markets/:gameId')
  async getMarketByGameId(@Param('gameId') gameId: string) {
    return { data: await this.sportsService.getMarketByGameId(gameId) }
  }

  @Get('live-markets')
  getLiveMarkets() {
    return { data: this.sportsService.getLiveMarkets() }
  }
}
