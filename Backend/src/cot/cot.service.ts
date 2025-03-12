import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CotService {
  private readonly logger = new Logger(CotService.name);
  // Revert to the original endpoint from the documentation
  private readonly apiBaseUrl = 'https://financialmodelingprep.com/stable';
  private readonly apiKey = process.env.FMP_API_KEY || '';

  constructor(private httpService: HttpService) {
    if (!this.apiKey) {
      this.logger.error('FMP_API_KEY is not set in environment variables');
    }
  }

  getCotReport(symbol: string, from?: string, to?: string): Observable<any> {
    let url = `${this.apiBaseUrl}/commitment-of-traders-report?symbol=${symbol}`;
    
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;
    url += `&apikey=${this.apiKey}`;

    this.logger.log(`Making request to COT report for symbol ${symbol}`);
    
    return this.httpService.get(url).pipe(
      map(response => {
        if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
          this.logger.warn(`No COT report data found for symbol: ${symbol}`);
          throw new HttpException(
            `No COT report data available for symbol: ${symbol}. Please verify the symbol is correct and supported.`,
            HttpStatus.NOT_FOUND
          );
        }
        return response.data;
      }),
      catchError(error => {
        if (error.response?.status === 402) {
          this.logger.error(`Payment required error for symbol ${symbol}. Verify your API key and subscription plan.`);
          return throwError(() => new HttpException(
            'API subscription issue: The requested data requires a paid subscription or you have exceeded your quota.',
            HttpStatus.PAYMENT_REQUIRED
          ));
        }
        this.logger.error(`Error fetching COT report for ${symbol}: ${error.message}`);
        return throwError(() => new HttpException(
          error.response?.data?.message || 'Failed to fetch data from external API',
          error.response?.status || HttpStatus.BAD_GATEWAY
        ));
      })
    );
  }

  getCotAnalysis(symbol: string, from?: string, to?: string): Observable<any> {
    let url = `${this.apiBaseUrl}/commitment-of-traders-analysis?symbol=${symbol}`;
    
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;
    url += `&apikey=${this.apiKey}`;

    this.logger.log(`Making request to COT analysis for symbol ${symbol}`);
    
    return this.httpService.get(url).pipe(
      map(response => {
        if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
          this.logger.warn(`No COT analysis data found for symbol: ${symbol}`);
          throw new HttpException(
            `No COT analysis data available for symbol: ${symbol}. Please verify the symbol is correct and supported.`,
            HttpStatus.NOT_FOUND
          );
        }
        return response.data;
      }),
      catchError(error => {
        if (error.response?.status === 402) {
          this.logger.error(`Payment required error for symbol ${symbol}. Verify your API key and subscription plan.`);
          return throwError(() => new HttpException(
            'API subscription issue: The requested data requires a paid subscription or you have exceeded your quota.',
            HttpStatus.PAYMENT_REQUIRED
          ));
        }
        this.logger.error(`Error fetching COT analysis for ${symbol}: ${error.message}`);
        return throwError(() => new HttpException(
          error.response?.data?.message || 'Failed to fetch data from external API',
          error.response?.status || HttpStatus.BAD_GATEWAY
        ));
      })
    );
  }
}
