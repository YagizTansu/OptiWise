import styles from '../../styles/Analyses.module.css';
import StockDashboard from './fundamental/StockDashboard';
import FinancialStatements from './fundamental/FinancialStatements';
import AnalysisTools from './fundamental/AnalysisTools';

interface FundamentalProps {
  symbol: string;
}

const Fundamental = ({ symbol }: FundamentalProps) => {
  return (
    <div className={styles.fundamentalContent}>
        
        <StockDashboard symbol={symbol} />
        <AnalysisTools symbol={symbol} />
        <FinancialStatements symbol={symbol} />


    
    </div>
  );
};

export default Fundamental;
