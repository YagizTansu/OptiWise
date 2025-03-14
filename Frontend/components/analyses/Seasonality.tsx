import { useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import styles from '../../styles/Analyses.module.css';
import SeasonalityAnalysis from './Seasonality/SeasonalityAnalysis';
import PatternCorrelation from './Seasonality/PatternCorrelation';
import TimeAverageReturns from './Seasonality/TimeAverageReturns';
import SeasonalStrategyInsights from './Seasonality/SeasonalStrategyInsights';

interface SeasonalityProps {
  symbol: string;
}

const Seasonality: React.FC<SeasonalityProps> = ({ symbol }) => {
  // Only keep asset info state in the parent component
  const [assetInfo, setAssetInfo] = useState<{ name: string; symbol: string }>({
    name: symbol,
    symbol: symbol
  });

  return (
    <div className={styles.seasonalityTab}>
   
      <SeasonalityAnalysis symbol={symbol} />

      <PatternCorrelation symbol={symbol} />

      <TimeAverageReturns symbol={symbol} />
      
      <SeasonalStrategyInsights symbol={symbol} />
    </div>
  );
};

export default Seasonality;
