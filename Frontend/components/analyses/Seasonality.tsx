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
      <div className={styles.seasonalityHeader}>
        <h1>Seasonality Analysis for {assetInfo.name}</h1>
        <p className={styles.seasonalityDescription}>
          <FaInfoCircle className={styles.infoIcon} /> 
          Seasonality analysis helps identify recurring patterns in asset price movements during specific 
          time periods. Use this data to optimize your entry and exit points.
        </p>
      </div>
      
      <SeasonalityAnalysis symbol={symbol} />

      <PatternCorrelation symbol={symbol} />

      <TimeAverageReturns symbol={symbol} />
      
      <SeasonalStrategyInsights symbol={symbol} />
    </div>
  );
};

export default Seasonality;
