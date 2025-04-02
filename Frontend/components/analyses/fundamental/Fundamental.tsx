import StockDashboard from './StockDashboard';
import FinancialStatements from './FinancialStatements';
import CompanySnapshot from './CompanySnapshot';
import ValuationModels from './ValuationModels';

interface FundamentalProps {
  symbol: string;
}

const Fundamental = ({ symbol }: FundamentalProps) => {
  return (
    <div > 
        <StockDashboard symbol={symbol} />
        
        {/* Valuation Models Component */}
        <ValuationModels symbol={symbol} />
        
        {/* Technical Analysis Component */}

        {/* Analysis Tools Component */}
        <FinancialStatements symbol={symbol} />

        {/* Company Snapshot Component */}
        <CompanySnapshot symbol={symbol} />
    </div>
  );
};

export default Fundamental;
