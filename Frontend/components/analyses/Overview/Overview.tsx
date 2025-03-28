import React from 'react';

// Import new components
import CompanyProfile from './CompanyProfile'; // Add this new import
import PerformanceOverview from './PerformanceOverview';
import PerformanceMetrics from './PerformanceMetrics';
import AnnualPerformance from './AnnualPerformance';
import KeyStatistics from './KeyStatistics';
import Dividends from './Dividends'; // Ensure this path is correct or update it to the correct path

interface OverviewProps {
  symbol: string;
}

const Overview: React.FC<OverviewProps> = ({ symbol }) => {
  return (
    <div >
      {/* Company Profile Component */}
      <CompanyProfile symbol={symbol} />
      
      {/* Performance Overview Component */}
      <PerformanceOverview symbol={symbol} />

      {/* Performance Metrics Component */}
      <PerformanceMetrics symbol={symbol} />

      {/* Annual Performance Component */}
      <AnnualPerformance symbol={symbol} />
      
      {/* Key Statistics Component */}
      {/* <KeyStatistics symbol={symbol} /> */}
      
      {/* Dividends Component */}
      <Dividends symbol={symbol} />
    </div>
  );
};

export default Overview;
