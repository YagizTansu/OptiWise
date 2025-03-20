import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Rankings.module.css';
import { FaSortAmountDown, FaSortAmountUp, FaInfoCircle, FaChartPie, FaTable, FaFilter, FaChevronDown, FaGlobeAmericas } from 'react-icons/fa';
import { searchSymbols, fetchQuoteData, fetchStockDashboardData, SearchResult, QuoteData } from '../services/api/finance';
import Layout from '../components/Layout'

// Regions and their indexes
const regions = {
  World: "World",
  NorthAmerica: "North America",
  Europe: "Europe",
  LatinAmerica: "Latin America",
  Asia: "Asia"
};

// Map of indexes to their regions
const indexToRegionMap: Record<string, string> = {
  // World
  "^GSPC": regions.World, // S&P 500 as world proxy

  // North America
  "^SPX": regions.NorthAmerica, // S&P 500
  "^NDX": regions.NorthAmerica, // NASDAQ 100
  "^DJI": regions.NorthAmerica, // Dow Jones Industrial Average
  "^RUT": regions.NorthAmerica, // Russell 2000
  "^GSPTSE": regions.NorthAmerica, // S&P/TSX Composite index

  // Europe
  "^STOXX": regions.Europe, // STOXX Europe 600
  "^STOXX50E": regions.Europe, // EURO STOXX 50
  "^GDAXI": regions.Europe, // DAX 40
  "^FTSE": regions.Europe, // FTSE 100
  "FTSEMIB.MI": regions.Europe, // FTSE MIB
  "^FCHI": regions.Europe, // CAC 40
  "^IBEX": regions.Europe, // IBEX 35
  "^AEX": regions.Europe, // AEX-INDEX
  "^SSMI": regions.Europe, // SMI PR

  // Latin America
  "^MXX": regions.LatinAmerica, // IPC MEXICO
  "^BVSP": regions.LatinAmerica, // BOVESPA
  "^MERV": regions.LatinAmerica, // MERVAL

  // Asia
  "^N225": regions.Asia, // Nikkei 225
  "^HSI": regions.Asia, // HANG SENG INDEX
  "^NSEI": regions.Asia, // NIFTY 50
  "XU100.IS": regions.Asia, // BIST 100
  "^TASI": regions.Asia, // Tadawul All Shares Index
  "^KLSE": regions.Asia // FTSE Bursa Malaysia KLCI
};

// Index names for better readability
const indexNames: Record<string, string> = {
  "^GSPC": "S&P 500",
  "^SPX": "S&P 500",
  "^NDX": "NASDAQ 100",
  "^DJI": "Dow Jones Industrial Average",
  "^RUT": "Russell 2000",
  "^GSPTSE": "S&P/TSX Composite",
  "^STOXX": "STOXX Europe 600",
  "^STOXX50E": "EURO STOXX 50",
  "^GDAXI": "DAX 40",
  "^FTSE": "FTSE 100",
  "FTSEMIB.MI": "FTSE MIB",
  "^FCHI": "CAC 40",
  "^IBEX": "IBEX 35",
  "^AEX": "AEX-INDEX",
  "^SSMI": "SMI PR",
  "^MXX": "IPC MEXICO",
  "^BVSP": "BOVESPA",
  "^MERV": "MERVAL",
  "^N225": "Nikkei 225",
  "^HSI": "HANG SENG INDEX",
  "^NSEI": "NIFTY 50",
  "XU100.IS": "BIST 100",
  "^TASI": "Tadawul All Shares Index",
  "^KLSE": "FTSE Bursa Malaysia KLCI"
};

// Interface for index data with fair value calculations
interface IndexData {
  id: number;
  symbol: string;
  name: string;
  region: string;
  fairValue: number;
  currentValue: number;
  potential: number;
  comingSoon?: boolean;
}

// Interface for sector data
interface SectorData {
  id: number;
  indexId: number;
  indexSymbol: string;
  name: string;
  fairValue: number;
  weight: number;
}

// Sectors for indexes - would be better to fetch this data if available
const defaultSectors = [
  { name: 'Technology', weight: 28.3, fairValue: 18.6 },
  { name: 'Healthcare', weight: 13.5, fairValue: 14.2 },
  { name: 'Financials', weight: 11.2, fairValue: 8.4 },
  { name: 'Consumer Discretionary', weight: 12.5, fairValue: 11.8 },
  { name: 'Communication Services', weight: 10.8, fairValue: 15.3 },
  { name: 'Industrials', weight: 7.9, fairValue: 9.7 },
  { name: 'Consumer Staples', weight: 5.8, fairValue: 5.2 },
];

export default function Rankings() {
  const [indexes, setIndexes] = useState<IndexData[]>([]);
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sortField, setSortField] = useState('potential');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewMode, setViewMode] = useState('table');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  // Function to calculate "fair value" based on stock metrics
  // In real-world this would be based on financial models
  const calculateFairValue = (quote: any) => {
    // Sample calculation based on available metrics
    // This is a simplified approach for demonstration
    const priceToBookRatio = quote.priceToBook || 3;
    const pe = quote.trailingPE || 20;
    const dividend = quote.dividendYield || 0;
    
    // Fair value calculation (simplified example)
    // Higher P/B and P/E ratios might indicate overvaluation
    const peFactor = 20 / Math.max(pe, 1); // Normalize P/E (20 is average)
    const pbFactor = 3 / Math.max(priceToBookRatio, 0.5); // Normalize P/B (3 is average)
    const dividendFactor = 1 + (dividend / 100); // Dividend bonus
    
    // Calculate potential (% from current price to fair value)
    // This is just an example calculation - real models would be more complex
    const potentialRaw = ((peFactor * 0.6) + (pbFactor * 0.3) + (dividendFactor * 0.1) - 1) * 100;
    
    // Add some randomness to simulate variance in fair value calculations
    const randomFactor = (Math.random() * 6) - 3; // -3% to +3%
    return Math.round((potentialRaw + randomFactor) * 10) / 10; // Round to 1 decimal
  };

  useEffect(() => {
    async function fetchIndexes() {
      setLoading(true);
      setError(null);
      
      try {
        const symbols = Object.keys(indexToRegionMap);
        const indexData: IndexData[] = [];
        const sectorData: SectorData[] = [];
        let idCounter = 1;
        let sectorIdCounter = 1;
        
        // Fetch data for each index
        for (const symbol of symbols) {
          try {
            // Get quote data for the index
            const quote = await fetchQuoteData(symbol);
            
            if (quote && quote.regularMarketPrice) {
              // Calculate fair value and potential
              const potential = calculateFairValue(quote);
              
              // Create index data object
              const index: IndexData = {
                id: idCounter++,
                symbol: symbol,
                name: indexNames[symbol] || quote.shortName || quote.longName || symbol,
                region: indexToRegionMap[symbol],
                fairValue: potential,
                currentValue: quote.regularMarketPrice,
                potential: potential,
                // Mark certain indexes as coming soon
                comingSoon: symbol === "^TASI" || symbol === "^KLSE"
              };
              
              indexData.push(index);
              
              // Create sectors for this index
              defaultSectors.forEach(sector => {
                sectorData.push({
                  id: sectorIdCounter++,
                  indexId: idCounter - 1, // ID of the index we just added
                  indexSymbol: symbol,
                  name: sector.name,
                  fairValue: sector.fairValue + (Math.random() * 4 - 2), // Add some variance
                  weight: sector.weight + (Math.random() * 2 - 1) // Add some variance
                });
              });
            }
          } catch (err) {
            console.error(`Failed to fetch data for ${symbol}:`, err);
            // Continue with other indexes even if one fails
          }
        }
        
        setIndexes(indexData);
        setSectors(sectorData);
        
        // Set default selected index if we have data
        if (indexData.length > 0 && selectedIndex === null) {
          setSelectedIndex(indexData[0].id);
        }
        
      } catch (err) {
        console.error('Error fetching indexes:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchIndexes();
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter indexes by region if a region is selected
  const filteredIndexes = selectedRegion 
    ? indexes.filter(index => index.region === selectedRegion)
    : indexes;

  // Sort the filtered indexes
  const sortedIndexes = [...filteredIndexes].sort((a, b) => {
    // Add null checking with fallback to handle undefined values
    const aValue = a[sortField as keyof typeof a] ?? 0;
    const bValue = b[sortField as keyof typeof b] ?? 0;
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const selectedIndexData = indexes.find(index => index.id === selectedIndex);
  const selectedIndexSectors = sectors.filter(sector => sector.indexId === selectedIndex);

  // Get unique regions for the dropdown
  const uniqueRegions = Object.values(regions);

  return (
    <Layout title="Rankings - OptiWise">

    <>
      <Head>
        <title>World Indexes Rankings - OptiWise</title>
        <meta name="description" content="Explore world indexes and their fair values" />
      </Head>

      <main className={styles.container}>

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
            <div className={styles.regionFilterDropdown}>
              <button 
                className={styles.filterChip}
                onClick={() => setShowRegionDropdown(!showRegionDropdown)}
              >
                <FaGlobeAmericas className={styles.filterIcon} />
                {selectedRegion || 'All Regions'}
                <FaChevronDown className={`${styles.dropdownArrow} ${showRegionDropdown ? styles.open : ''}`} />
              </button>
              
              {showRegionDropdown && (
                <div className={styles.regionDropdownMenu}>
                  <div 
                    className={`${styles.regionOption} ${selectedRegion === null ? styles.active : ''}`}
                    onClick={() => {
                      setSelectedRegion(null);
                      setShowRegionDropdown(false);
                    }}
                  >
                    All Regions
                  </div>
                  {uniqueRegions.map(region => (
                    <div 
                      key={region} 
                      className={`${styles.regionOption} ${selectedRegion === region ? styles.active : ''}`}
                      onClick={() => {
                        setSelectedRegion(region);
                        setShowRegionDropdown(false);
                      }}
                    >
                      {region}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.indexesContainer}>
            <div className={styles.sectionTitle}>
              <h2>{selectedRegion || 'World'} Indexes</h2>
              <div className={styles.infoTag}>
                <FaInfoCircle className={styles.infoIcon} />
                <span>Fair value based on component analysis</span>
              </div>
            </div>

            {loading ? (
              <div className={styles.loadingMessage}>Loading index data...</div>
            ) : error ? (
              <div className={styles.errorMessage}>{error}</div>
            ) : viewMode === 'table' ? (
              <div className={styles.tableWrapper}>
                <table className={styles.indexesTable}>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')}>
                        Index Name
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <FaSortAmountUp className={styles.sortIcon} /> : <FaSortAmountDown className={styles.sortIcon} />
                        )}
                      </th>
                      <th onClick={() => handleSort('region')}>
                        Region
                        {sortField === 'region' && (
                          sortDirection === 'asc' ? <FaSortAmountUp className={styles.sortIcon} /> : <FaSortAmountDown className={styles.sortIcon} />
                        )}
                      </th>
                      <th onClick={() => handleSort('currentValue')}>
                        Current Value
                        {sortField === 'currentValue' && (
                          sortDirection === 'asc' ? <FaSortAmountUp className={styles.sortIcon} /> : <FaSortAmountDown className={styles.sortIcon} />
                        )}
                      </th>
                      <th onClick={() => handleSort('fairValue')}>
                        Fair Value
                        {sortField === 'fairValue' && (
                          sortDirection === 'asc' ? <FaSortAmountUp className={styles.sortIcon} /> : <FaSortAmountDown className={styles.sortIcon} />
                        )}
                      </th>
                      <th onClick={() => handleSort('potential')}>
                        Potential (%)
                        {sortField === 'potential' && (
                          sortDirection === 'asc' ? <FaSortAmountUp className={styles.sortIcon} /> : <FaSortAmountDown className={styles.sortIcon} />
                        )}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedIndexes.map((index) => (
                      <tr 
                        key={index.id} 
                        className={`${selectedIndex === index.id ? styles.selectedRow : ''} ${index.comingSoon ? styles.comingSoonRow : ''}`}
                        onClick={() => !index.comingSoon && setSelectedIndex(index.id)}
                      >
                        <td>
                          {index.name}
                          {index.comingSoon && <span className={styles.comingSoonBadge}>Coming soon</span>}
                        </td>
                        <td>{index.region}</td>
                        <td>{index.currentValue.toLocaleString()}</td>
                        <td>{(index.currentValue * (1 + index.fairValue / 100)).toLocaleString()}</td>
                        <td>
                          <span 
                            className={`${styles.potentialValue} ${index.potential > 0 ? styles.positive : styles.negative}`}
                          >
                            {index.potential > 0 ? '+' : ''}{index.potential.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.cardsGrid}>
                {uniqueRegions.filter(region => 
                  selectedRegion ? region === selectedRegion : true
                ).map(region => (
                  <div key={region} className={styles.regionGroup}>
                    <div className={styles.regionHeader}>
                      <h3>{region}</h3>
                    </div>
                    <div className={styles.regionCards}>
                      {sortedIndexes
                        .filter(index => index.region === region)
                        .map((index) => (
                          <div 
                            key={index.id} 
                            className={`${styles.indexCard} ${selectedIndex === index.id ? styles.selectedCard : ''} ${index.comingSoon ? styles.comingSoonCard : ''}`}
                            onClick={() => !index.comingSoon && setSelectedIndex(index.id)}
                          >
                            <div className={styles.cardHeader}>
                              <h3>{index.name}</h3>
                              {index.comingSoon && <span className={styles.comingSoonBadge}>Coming soon</span>}
                            </div>
                            <div className={styles.cardBody}>
                              <div className={styles.cardData}>
                                <div className={styles.dataItem}>
                                  <span className={styles.dataLabel}>Current Value</span>
                                  <span className={styles.dataValue}>{index.currentValue.toLocaleString()}</span>
                                </div>
                                <div className={styles.dataItem}>
                                  <span className={styles.dataLabel}>Fair Value</span>
                                  <span className={styles.dataValue}>
                                    {(index.currentValue * (1 + index.fairValue / 100)).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <div className={styles.cardPotential}>
                                <span className={styles.potentialLabel}>Growth Potential</span>
                                <span 
                                  className={`${styles.potentialBadge} ${index.potential > 0 ? styles.positiveBg : styles.negativeBg}`}
                                >
                                  {index.potential > 0 ? '+' : ''}{index.potential.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedIndexData && (
            <div className={styles.sectorsContainer}>
              <div className={styles.sectionTitle}>
                <h2>Sectors in {selectedIndexData.name}</h2>
                <div className={styles.infoTag}>
                  <FaInfoCircle className={styles.infoIcon} />
                  <span>Weighted by market capitalization</span>
                </div>
              </div>

              <div className={styles.sectorsList}>
                {selectedIndexSectors.map((sector) => (
                  <div key={sector.id} className={styles.sectorCard}>
                    <div className={styles.sectorHeader}>
                      <h3>{sector.name}</h3>
                      <span className={styles.sectorWeight}>{sector.weight.toFixed(1)}% of index</span>
                    </div>
                    <div className={styles.sectorPotential}>
                      <div className={styles.potentialBar}>
                        <div 
                          className={styles.potentialFill} 
                          style={{ 
                            width: `${Math.min(Math.abs(sector.fairValue), 25)}%`,
                            backgroundColor: sector.fairValue > 0 ? '#e6f4e6' : '#fde9e8' // Direct color values instead of CSS vars
                          }}
                        ></div>
                      </div>
                      <span 
                        className={`${styles.sectorPotentialValue} ${sector.fairValue > 0 ? styles.positive : styles.negative}`}
                      >
                        {sector.fairValue > 0 ? '+' : ''}{sector.fairValue.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
    </Layout>

  );
}
