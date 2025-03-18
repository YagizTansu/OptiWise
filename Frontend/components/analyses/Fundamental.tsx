import styles from '../../styles/Analyses.module.css';
import StockDashboard from './fundamental/StockDashboard';
import FinancialStatements from './fundamental/FinancialStatements';
import TechnicalAnalysis from './Report/TechnicalAnalysis';
import CompanySnapshot from './Report/CompanySnapshot';
interface FundamentalProps {
  symbol: string;
}

const Fundamental = ({ symbol }: FundamentalProps) => {
  return (
    <div className={styles.fundamentalContent}> 
        <StockDashboard symbol={symbol} />
        
        {/* Technical Analysis Component */}
        <TechnicalAnalysis symbol={symbol} />

        {/* Company Snapshot Component */}
        <CompanySnapshot symbol={symbol} />

        {/* Analysis Tools Component */}
        <FinancialStatements symbol={symbol} />
    </div>
  );
};

export default Fundamental;
