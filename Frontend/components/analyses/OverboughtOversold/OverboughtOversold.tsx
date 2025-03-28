import PriceVolumeChart from './PriceVolumeChart';
import IndicatorChart from './IndicatorChart';
import AdvancedDPO from './AdvancedDPO';

interface OverboughtOversoldProps {
  symbol: string;
}

const OverboughtOversold: React.FC<OverboughtOversoldProps> = ({ symbol }) => {
  return (
    <div>
      <PriceVolumeChart symbol={symbol} />
      <IndicatorChart symbol={symbol} />
    </div>
  );
};

export default OverboughtOversold;
