import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FaInfoCircle, FaCopy, FaTable, FaChartPie, FaGlobeAmericas, FaChevronDown } from 'react-icons/fa';
import styles from '../styles/COTReports.module.css';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

// Define category types for better organization
interface ReportItem {
  name: string;
  exchange: string;
}

// Data for the different categories
const categoriesData = {
  currencies: [
    { name: 'AUSTRALIAN DOLLAR', exchange: 'CME' },
    { name: 'BITCOIN', exchange: 'CME' },
    { name: 'BRITISH POUND', exchange: 'CME' },
    { name: 'CANADIAN DOLLAR', exchange: 'CME' },
    { name: 'ETHER CASH SETTLED', exchange: 'CME' },
    { name: 'EURO FX', exchange: 'CME' },
    { name: 'JAPANESE YEN', exchange: 'CME' },
    { name: 'MEXICAN PESO', exchange: 'CME' },
    { name: 'NEW ZEALAND DOLLAR', exchange: 'CME' },
    { name: 'SWISS FRANC', exchange: 'CME' },
    { name: 'USD INDEX', exchange: 'ICUS' }
  ],
  agriculture: [
    { name: 'COCOA', exchange: 'ICUS' },
    { name: 'COFFEE C', exchange: 'ICUS' },
    { name: 'CORN', exchange: 'CBT' },
    { name: 'COTTON', exchange: 'ICUS' },
    { name: 'FEEDER CATTLE', exchange: 'CME' },
    { name: 'LEAN HOGS', exchange: 'CME' },
    { name: 'LIVE CATTLE', exchange: 'CME' },
    { name: 'MILK, Class III', exchange: 'CME' },
    { name: 'ORANGE JUICE', exchange: 'ICUS' },
    { name: 'ROUGH RICE', exchange: 'CBT' },
    { name: 'SOYBEANS', exchange: 'CBT' },
    { name: 'SUGAR NO. 11', exchange: 'ICUS' },
    { name: 'WHEAT-SRW', exchange: 'CBT' }
  ],
  metals: [
    { name: 'COPPER', exchange: 'CMX' },
    { name: 'GOLD', exchange: 'CMX' },
    { name: 'LUMBER', exchange: 'CME' },
    { name: 'PALLADIUM', exchange: 'NYME' },
    { name: 'PLATINUM', exchange: 'NYME' },
    { name: 'SILVER', exchange: 'CMX' }
  ],
  stockIndexes: [
    { name: 'DJIA Consolidated', exchange: 'CBT' },
    { name: 'NASDAQ 100 Consolidated', exchange: 'CME' },
    { name: 'RUSSELL 2000 MINI', exchange: 'CME' },
    { name: 'S&P 500 Consolidated', exchange: 'CME' },
    { name: 'VIX', exchange: 'E' }
  ],
  petroleum: [
    { name: 'BRENT LAST DAY', exchange: 'NYME' },
    { name: 'CRUDE OIL, SWEET LIGHT', exchange: 'ICEU' },
    { name: 'GASOLINE RBOB', exchange: 'NYME' },
    { name: 'WTI-PHYSICAL', exchange: 'NYME' }
  ],
  treasuries: [
    { name: 'FED FUNDS', exchange: 'CBT' },
    { name: 'US TREASURY 10Y NOTE', exchange: 'CBT' },
    { name: 'US TREASURY 5Y NOTE', exchange: 'CBT' },
    { name: 'US TREASURY BOND', exchange: 'CBT' }
  ],
  naturalGas: [
    { name: 'NATURAL GAS', exchange: 'NYME' },
    { name: 'HENRY HUB NATURAL GAS', exchange: 'ICEU' }
  ]
};

// Define category titles for better display
const categoryTitles = {
  currencies: "Currencies",
  agriculture: "Agriculture",
  metals: "Metals and Other",
  stockIndexes: "Stock Indexes",
  petroleum: "Petroleum and Products",
  treasuries: "Treasuries and Rates",
  naturalGas: "Natural Gas and Products"
};

// Report Category Component for Card View
const ReportCategoryCard = ({ title, items, categoryKey }: { title: string, items: ReportItem[], categoryKey: string }) => (
  <div className={styles.categoryContainer}>
    <div className={styles.categoryHeader}>
      <h3>{title}</h3>
    </div>
    <div className={styles.categoryContent}>
      {items.map((item, index) => (
        <Link 
          key={index} 
          href={`/cot-reports/${categoryKey}/${encodeURIComponent(item.name)}`}
          className={styles.reportItemLink}
        >
          <div className={styles.reportItem}>
            <FaCopy className={styles.copyIcon} />
            <span className={styles.reportItemName}>{item.name}</span>
            <span className={styles.reportItemExchange}>({item.exchange})</span>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

// Table View Component
const ReportTable = ({ category, items, categoryKey }: { category: string, items: ReportItem[], categoryKey: string }) => (
  <div className={styles.tableWrapper}>
    <div className={styles.tableCategory}>{category}</div>
    <table className={styles.reportTable}>
      <thead>
        <tr>
          <th>Instrument Name</th>
          <th>Exchange</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={index}>
            <td>{item.name}</td>
            <td>{item.exchange}</td>
            <td>
              <Link 
                href={`/cot-reports/${categoryKey}/${encodeURIComponent(item.name)}`}
                className={styles.viewReportLink}
              >
                View Report
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function COTReports() {
  const [viewMode, setViewMode] = useState('cards');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // Filter categories if one is selected
  const filteredCategories = selectedCategory 
    ? { [selectedCategory]: categoriesData[selectedCategory as keyof typeof categoriesData] }
    : categoriesData;
  
  return (
    <ProtectedRoute>
      <Layout>
        <div className={styles.container}>
          <Head>
            <title>COT Reports | OptiWise</title>
            <meta name="description" content="Commitment of Traders (COT) reports analysis" />
          </Head>
          
          <main className={styles.main}>
            <div className={styles.titleContainer}>
              <h1 className={styles.title}>COT Reports</h1>
              <div className={styles.infoTag}>
                <FaInfoCircle className={styles.infoIcon} />
                <span>Commitment of Traders reports show the positions of different trader categories.</span>
              </div>
            </div>
            
            <div className={styles.filtersBar}>
              <div className={styles.viewToggle}>
                <button 
                  className={`${styles.viewButton} ${viewMode === 'table' ? styles.active : ''}`}
                  onClick={() => setViewMode('table')}
                >
                  <FaTable /> Table
                </button>
                <button 
                  className={`${styles.viewButton} ${viewMode === 'cards' ? styles.active : ''}`}
                  onClick={() => setViewMode('cards')}
                >
                  <FaChartPie /> Cards
                </button>
              </div>
              
              <div className={styles.filters}>
                <div className={styles.categoryFilterDropdown}>
                  <button 
                    className={styles.filterChip}
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    <FaGlobeAmericas className={styles.filterIcon} />
                    {selectedCategory ? categoryTitles[selectedCategory as keyof typeof categoryTitles] : 'All Categories'}
                    <FaChevronDown className={`${styles.dropdownArrow} ${showCategoryDropdown ? styles.open : ''}`} />
                  </button>
                  
                  {showCategoryDropdown && (
                    <div className={styles.categoryDropdownMenu}>
                      <div 
                        className={`${styles.categoryOption} ${selectedCategory === null ? styles.active : ''}`}
                        onClick={() => {
                          setSelectedCategory(null);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        All Categories
                      </div>
                      {Object.keys(categoriesData).map(category => (
                        <div 
                          key={category} 
                          className={`${styles.categoryOption} ${selectedCategory === category ? styles.active : ''}`}
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowCategoryDropdown(false);
                          }}
                        >
                          {categoryTitles[category as keyof typeof categoryTitles]}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
                    
            <div className={styles.content}>
              {viewMode === 'cards' ? (
                <div className={styles.contentGrid}>
                  {Object.entries(filteredCategories).map(([key, items]) => (
                    <ReportCategoryCard 
                      key={key} 
                      title={categoryTitles[key as keyof typeof categoryTitles]} 
                      items={items} 
                      categoryKey={key} 
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.tablesContainer}>
                  {Object.entries(filteredCategories).map(([key, items]) => (
                    <ReportTable 
                      key={key} 
                      category={categoryTitles[key as keyof typeof categoryTitles]} 
                      items={items} 
                      categoryKey={key} 
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
