import { fetchStockDashboardData, QuoteSummaryData } from '../services/api/finance';

export type StockData = {
  symbol: string;
  price?: number;
  change?: number;
  changePercent?: number;
  recentPrices?: number[];
  marketCap?: number;
  volume?: number;
  peRatio?: number;
  currency?: string;
  name?: string;
  dayHigh?: number;
  dayLow?: number;
  previousClose?: number;
  open?: number;
  bid?: number;
  ask?: number;
  fiftyTwoWeekLow?: number;
  fiftyTwoWeekHigh?: number;
  avgVolume?: number;
  dividendRate?: number;
  dividendYield?: number;
  beta?: number;
}

export const fetchStockData = async (symbol: string): Promise<StockData> => {
  try {
    // Fetch real data using the API function from finance.ts
    const data = await fetchStockDashboardData(symbol);
    
    // Extract relevant information from the response based on the actual structure
    const price = data?.price?.regularMarketPrice;
    const change = data?.price?.regularMarketChange;
    const changePercent = data?.price?.regularMarketChangePercent;
    const marketCap = data?.price?.marketCap;
    const currency = data?.price?.currency;
    const name = data?.price?.shortName || data?.price?.longName;
    const dayHigh = data?.price?.regularMarketDayHigh;
    const dayLow = data?.price?.regularMarketDayLow;
    const previousClose = data?.price?.regularMarketPreviousClose;
    const open = data?.price?.regularMarketOpen;
    
    // Summary details
    const volume = data?.summaryDetail?.volume;
    const peRatio = data?.summaryDetail?.trailingPE;
    const bid = data?.summaryDetail?.bid;
    const ask = data?.summaryDetail?.ask;
    const fiftyTwoWeekLow = data?.summaryDetail?.fiftyTwoWeekLow;
    const fiftyTwoWeekHigh = data?.summaryDetail?.fiftyTwoWeekHigh;
    const avgVolume = data?.summaryDetail?.averageVolume;
    const dividendRate = data?.summaryDetail?.dividendRate;
    const dividendYield = data?.summaryDetail?.dividendYield;
    const beta = data?.summaryDetail?.beta;
    
    return {
      symbol,
      price,
      change,
      changePercent,
      marketCap,
      volume,
      peRatio,
      currency,
      name,
      dayHigh,
      dayLow,
      previousClose,
      open,
      bid,
      ask,
      fiftyTwoWeekLow,
      fiftyTwoWeekHigh,
      avgVolume,
      dividendRate,
      dividendYield,
      beta,
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    return { symbol };
  }
};
