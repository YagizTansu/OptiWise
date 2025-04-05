import { useState } from 'react';
import SeasonalityAnalysis from './SeasonalityAnalysis';
import PatternCorrelation from './PatternCorrelation';
import TimeAverageReturns from './TimeAverageReturns';
import SeasonalStrategyInsights from './SeasonalStrategyInsights';
import SeasonalityChart from './SeasonalityChart';

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
    <div >
      <SeasonalityChart symbol={symbol} />

      <TimeAverageReturns symbol={symbol} />

      <SeasonalityAnalysis symbol={symbol} />
         
      <PatternCorrelation symbol={symbol} />

      <SeasonalStrategyInsights symbol={symbol} />
    </div>
  );
};

export default Seasonality;
