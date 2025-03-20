import { useState } from 'react';
import Head from 'next/head';
import { FaBalanceScale, FaInfoCircle, FaChartLine, FaArrowUp, FaCalendarAlt, FaFilter, FaSearch } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import styles from '../styles/breakeven.module.css';

// Mock data for demonstration
const mockBreakevenStocks = [
  {
    id: 1,
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    sector: 'Consumer Cyclical',
    industry: 'Internet Retail',
    lastQuarterProfit: '$3.12B',
    previousLosses: '5 quarters',
    growthSince: '+42.3%',
    nextEarnings: '2023-10-26',
  },
  {
    id: 2,
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    sector: 'Automotive',
    industry: 'Auto Manufacturers',
    lastQuarterProfit: '$1.85B',
    previousLosses: '6 quarters',
    growthSince: '+28.7%',
    nextEarnings: '2023-10-18',
  },
  {
    id: 3,
    symbol: 'UBER',
    name: 'Uber Technologies Inc.',
    sector: 'Technology',
    industry: 'Software—Application',
    lastQuarterProfit: '$0.38B',
    previousLosses: '8 quarters',
    growthSince: '+19.5%',
    nextEarnings: '2023-11-02',
  },
  {
    id: 4,
    symbol: 'SHOP',
    name: 'Shopify Inc.',
    sector: 'Technology',
    industry: 'Software—Application',
    lastQuarterProfit: '$0.12B',
    previousLosses: '7 quarters',
    growthSince: '+35.2%',
    nextEarnings: '2023-10-30',
  },
  {
    id: 5,
    symbol: 'SNAP',
    name: 'Snap Inc.',
    sector: 'Communication Services',
    industry: 'Internet Content & Information',
    lastQuarterProfit: '$0.07B',
    previousLosses: '9 quarters',
    growthSince: '+15.8%',
    nextEarnings: '2023-10-24',
  },
  {
    id: 6,
    symbol: 'LYFT',
    name: 'Lyft, Inc.',
    sector: 'Technology',
    industry: 'Software—Application',
    lastQuarterProfit: '$0.05B',
    previousLosses: '12 quarters',
    growthSince: '+22.4%',
    nextEarnings: '2023-11-07',
  },
];

export default function Breakeven() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const sectors = [...new Set(mockBreakevenStocks.map(stock => stock.sector))];
  
  const filteredStocks = mockBreakevenStocks.filter(stock => 
    (stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
     stock.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterSector === '' || stock.sector === filterSector)
  );
  
  return (
    <div>
      <Head>
        <title>Breakeven Stocks | OptiWise</title>
        <meta name="description" content="Discover stocks that have turned profitable after multiple losing quarters" />
      </Head>
      
      <Navbar />
      
      <main className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>
            <div className={styles.iconContainer}>
              <FaBalanceScale size={24} />
            </div>
            Breakeven Analysis
          </div>
          
          <p className={styles.description}>
            Discover companies that have reported positive earnings after at least five consecutive quarters of losses. 
            Historically, these stocks often see significant price increases as they transition to profitability.
          </p>
          
          <div className={styles.infoAlert}>
            <FaInfoCircle className={styles.infoIcon} />
            <span>Past performance doesn't guarantee future results. Always conduct thorough research before investing.</span>
          </div>
        </div>
        
        <div className={styles.filterSection}>
          <div className={styles.searchWrapper}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by symbol or company name"
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={styles.selectWrapper}>
            <FaFilter className={styles.selectIcon} />
            <select
              className={styles.select}
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
            >
              <option value="">All Sectors</option>
              {sectors.map((sector, index) => (
                <option key={index} value={sector}>{sector}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Symbol / Company</th>
                <th>Sector / Industry</th>
                <th>Last Quarter Profit</th>
                <th>Previous Losses</th>
                <th>Growth Since</th>
                <th>Next Earnings</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock) => (
                <tr key={stock.id}>
                  <td>
                    <div className={styles.symbol}>{stock.symbol}</div>
                    <div className={styles.company}>{stock.name}</div>
                  </td>
                  <td>
                    <div className={styles.sector}>{stock.sector}</div>
                    <div className={styles.industry}>{stock.industry}</div>
                  </td>
                  <td>
                    <div className={styles.profitValue}>{stock.lastQuarterProfit}</div>
                  </td>
                  <td>
                    <div className={styles.lossValue}>{stock.previousLosses}</div>
                  </td>
                  <td>
                    <div className={styles.growth}>
                      <FaArrowUp />
                      {stock.growthSince}
                    </div>
                  </td>
                  <td>
                    <div className={styles.earnings}>
                      <FaCalendarAlt className={styles.calendarIcon} />
                      {stock.nextEarnings}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className={styles.infoCard}>
          <h2 className={styles.infoTitle}>How to Use This Data</h2>
          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <div className={styles.cardIcon}>
                  <FaChartLine />
                </div>
                Historical Performance
              </div>
              <p className={styles.cardContent}>
                Companies that transition from consistent losses to profitability often experience significant stock price appreciation. 
                This marks a fundamental shift in the company's financial health that can attract new investors.
              </p>
            </div>
            
            <div className={styles.card}>
              <div className={styles.cardTitle}>
                <div className={styles.cardIcon}>
                  <FaBalanceScale />
                </div>
                Risk Factors
              </div>
              <p className={styles.cardContent}>
                A single profitable quarter doesn't guarantee continued success. Consider market conditions, 
                sector trends, and the company's long-term strategy before making investment decisions.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
