import { useState } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import styles from '../../styles/Analyses.module.css';
import SeasonalityAnalysis from './Seasonality/SeasonalityAnalysis';
import PatternCorrelation from './Seasonality/PatternCorrelation';
import TimeAverageReturns from './Seasonality/TimeAverageReturns';

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
      
      {/* Strategy Suggestions based on seasonality */}
      <div className={styles.strategySuggestions}>
        <h2>Strategic Insights</h2>
        <div className={styles.strategyCards}>
          <div className={styles.strategyCard}>
            <h3>Strongest Pattern</h3>
            <p>September to December shows a consistent uptrend pattern over 3 years (+15.3% cumulative)</p>
            <button className={styles.modernPrimaryButton}>Explore Strategy</button>
          </div>
          <div className={styles.strategyCard}>
            <h3>Risk Pattern</h3>
            <p>June historically shows consistent negative returns (-3.1% on average)</p>
            <button className={styles.modernPrimaryButton}>Explore Strategy</button>
          </div>
          <div className={styles.strategyCard}>
            <h3>AI Recommendation</h3>
            <p>Consider stronger positions in March (+3.9%) and rebalancing in November (-2.1%)</p>
            <button className={styles.modernPrimaryButton}>AI Analysis</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Seasonality;
