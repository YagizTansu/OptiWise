import { Controller, Get, Query } from '@nestjs/common';
import { CotService } from './cot.service';
import { Observable } from 'rxjs';

@Controller('cot')
export class CotController {
  constructor(private readonly cotService: CotService) {}

  @Get('report')
  getCotReport(
    @Query('symbol') symbol: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Observable<any> {
    return this.cotService.getCotReport(symbol, from, to);
  }

  @Get('analysis')
  getCotAnalysis(
    @Query('symbol') symbol: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Observable<any> {
    return this.cotService.getCotAnalysis(symbol, from, to);
  }
}
