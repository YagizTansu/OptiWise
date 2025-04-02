import React from 'react';
import AnalystRecommendation from './AnalystRecommendation';
import AnalystReports from './AnalystReports';
import EventsAndDevelopments from './EventsAndDevelopments';
import SECFilings from './SECFilings';
import AnalysisTools from './AnalysisTools';
import TechnicalAnalysis from './TechnicalAnalysis';


interface ReportProps {
  symbol: string;
}

const Report: React.FC<ReportProps> = ({ symbol }) => {
  return (
    <div>
      {/* Analysis Tools Component */}
      <AnalysisTools symbol={symbol} />

      <TechnicalAnalysis symbol={symbol} />
      {/* Technical Analysis Component */}

      {/* Analyst Recommendation Component */}
      <AnalystRecommendation symbol={symbol} />

      {/* Analyst Reports Component */}
      <AnalystReports symbol={symbol} />

      {/* Events and Developments Component */}
      <EventsAndDevelopments symbol={symbol} />

      {/* SEC Filings Component */}
      <SECFilings symbol={symbol} />
    </div>
  );
};

export default Report;
