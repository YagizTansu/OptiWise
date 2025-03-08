import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import {ParseDatePipe} from '../common/pipes/parse-date.pipe';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('quote')
  async getQuote(@Query('symbol') symbol: string) {
    return this.financeService.getQuote(symbol);
  }

  @Get('historical')
  async getHistoricalData(
    @Query('symbol') symbol: string,
    @Query('from', ParseDatePipe) from: Date,
    @Query('to', ParseDatePipe) to: Date,
    @Query('interval') interval?: string,
  ) {
    return this.financeService.getHistoricalData(symbol, from, to, interval);
  }

  @Get('search')
  async searchSymbols(
    @Query('query') query: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.financeService.searchSymbols(query, limit);
  }

  @Get('trending')
  async getTrending(@Query('region') region?: string) {
    return this.financeService.getTrending(region);
  }
}
