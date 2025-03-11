import { useState } from 'react';
import styles from '../../styles/Analyses.module.css';

// Import sub-components
import CommitmentOfTradersReport from './COTReport/CommitmentOfTradersReport';
import CurrentPositionDistribution from './COTReport/CurrentPositionDistribution';
import HistoricalAnalysis from './COTReport/HistoricalAnalysis';
import SentimentAnalysis from './COTReport/SentimentAnalysis';
import TradingInsights from './COTReport/TradingInsights';

// Simplified props interface
interface COTReportProps {
  symbol: string;
}

const COTReport: React.FC<COTReportProps> = ({ symbol }) => {
  // Internal state management
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [assetInfo, setAssetInfo] = useState<{ name: string; symbol: string }>({
    name: symbol,
    symbol: symbol
  });

  return (
    <div className={styles.cotTab}>
      <CommitmentOfTradersReport 
        assetInfo={assetInfo}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        symbol={symbol}
      />
      
      <CurrentPositionDistribution 
        symbol={symbol}
      />
      
      <HistoricalAnalysis 
        symbol={symbol}
      />
      
      <SentimentAnalysis 
        symbol={symbol}
      />
      
      <TradingInsights 
        symbol={symbol}
      />
    </div>
  );
};

export default COTReport;
