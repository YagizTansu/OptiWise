import React from 'react';
import styles from '../../styles/Analyses.module.css';

import AnalystRecommendation from './Report/AnalystRecommendation';
import AnalystReports from './Report/AnalystReports';
import EventsAndDevelopments from './Report/EventsAndDevelopments';
import SECFilings from './Report/SECFilings';
import AnalysisTools from './fundamental/AnalysisTools';


interface ReportProps {
  symbol: string;
}

const Report: React.FC<ReportProps> = ({ symbol }) => {
  return (
    <div>
      {/* Analysis Tools Component */}
      <AnalysisTools symbol={symbol} />

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
