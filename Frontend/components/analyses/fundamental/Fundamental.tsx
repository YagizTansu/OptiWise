import StockDashboard from './StockDashboard';
import FinancialStatements from './FinancialStatements';
import TechnicalAnalysis from './TechnicalAnalysis';
import CompanySnapshot from './CompanySnapshot';
interface FundamentalProps {
  symbol: string;
}

const Fundamental = ({ symbol }: FundamentalProps) => {
  return (
    <div > 
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
