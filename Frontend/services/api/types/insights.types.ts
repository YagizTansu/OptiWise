// Report Insights types
export interface InsightsData {
  symbol: string;
  instrumentInfo: {
    technicalEvents: {
      provider: string;
      sector: string;
      shortTermOutlook: {
        stateDescription: string;
        direction: string;
        score: number;
        scoreDescription: string;
        sectorDirection: string;
        sectorScore: number;
        sectorScoreDescription: string;
        indexDirection: string;
        indexScore: number;
        indexScoreDescription: string;
      };
      intermediateTermOutlook: {
        stateDescription: string;
        direction: string;
        score: number;
        scoreDescription: string;
        sectorDirection: string;
        sectorScore: number;
        sectorScoreDescription: string;
        indexDirection: string;
        indexScore: number;
        indexScoreDescription: string;
      };
      longTermOutlook: {
        stateDescription: string;
        direction: string;
        score: number;
        scoreDescription: string;
        sectorDirection: string;
        sectorScore: number;
        sectorScoreDescription: string;
        indexDirection: string;
        indexScore: number;
        indexScoreDescription: string;
      };
    };
    keyTechnicals: {
      provider: string;
      support: number;
      resistance: number;
      stopLoss: number;
    };
    valuation: {
      color: number;
      description: string;
      discount: string;
      relativeValue: string;
      provider: string;
    };
  };
  companySnapshot: {
    sectorInfo: string;
    company: {
      innovativeness: number;
      hiring: number;
      sustainability: number;
      insiderSentiments: number;
      earningsReports: number;
      dividends: number;
    };
    sector: {
      innovativeness: number;
      hiring: number;
      sustainability: number;
      insiderSentiments: number;
      earningsReports: number;
      dividends: number;
    };
  };
  recommendation: {
    targetPrice: number;
    provider: string;
    rating: string;
  };
  upsell: {
    msBullishSummary: string[];
    msBearishSummary: string[];
    companyName: string;
    msBullishBearishSummariesPublishDate: string;
    upsellReportType: string;
  };
  events: Array<{
    eventType: string;
    pricePeriod: string;
    tradingHorizon: string;
    tradeType: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
  }>;
  reports: Array<{
    id: string;
    headHtml: string;
    provider: string;
    reportDate: string;
    reportTitle: string;
    reportType: string;
    targetPrice?: number;
    targetPriceStatus?: string;
    investmentRating?: string;
    tickers: string[];
    title: string;
  }>;
  sigDevs: Array<{
    headline: string;
    date: string;
  }>;
  secReports: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    filingDate: string;
    snapshotUrl: string;
    formType: string;
  }>;
}

// Analysis data types
export interface AnalysisData {
  recommendationTrend?: any;
  earningsHistory?: any;
  earningsTrend?: any;
  calendarEvents?: any;
  [key: string]: any;
}

// Stock dashboard data types
export interface QuoteSummaryData {
  price?: any;
  summaryDetail?: any;
  defaultKeyStatistics?: any;
  [key: string]: any;
}
