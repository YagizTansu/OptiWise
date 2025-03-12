import styles from '../../styles/Analyses.module.css';
import PriceVolumeChart from './OverboughtOversold/PriceVolumeChart';
import IndicatorChart from './OverboughtOversold/IndicatorChart';

interface OverboughtOversoldProps {
  symbol: string;
}

const OverboughtOversold: React.FC<OverboughtOversoldProps> = ({ symbol }) => {
  return (
    <div className={styles.overboughtOversoldTab}>
      <PriceVolumeChart symbol={symbol} />
      <IndicatorChart symbol={symbol} />
    </div>
  );
};

export default OverboughtOversold;
