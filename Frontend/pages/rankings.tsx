import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Rankings.module.css';
import { FaSortAmountDown, FaSortAmountUp, FaInfoCircle, FaChartPie, FaTable, FaFilter, FaChevronDown, FaGlobeAmericas } from 'react-icons/fa';

// Regions and their indexes
const regions = {
  World: "World",
  NorthAmerica: "North America",
  Europe: "Europe",
  LatinAmerica: "Latin America",
  Asia: "Asia"
};

// Mock data for demonstration - would be fetched from an API in a real application
const mockIndexes = [
  // World
  { id: 1, name: 'World Index', region: regions.World, fairValue: 11.2, currentValue: 3150.75, potential: 11.2 },
  
  // North America
  { id: 2, name: 'S&P 500', region: regions.NorthAmerica, fairValue: 12.4, currentValue: 4510.25, potential: 12.4 },
  { id: 3, name: 'NASDAQ 100', region: regions.NorthAmerica, fairValue: 15.6, currentValue: 15865.75, potential: 15.6 },
  { id: 4, name: 'Dow Jones Industrial Average', region: regions.NorthAmerica, fairValue: 8.2, currentValue: 35120.08, potential: 8.2 },
  { id: 5, name: 'Russell 2000', region: regions.NorthAmerica, fairValue: 9.7, currentValue: 1990.45, potential: 9.7 },
  { id: 6, name: 'S&P/TSX Composite index', region: regions.NorthAmerica, fairValue: 7.3, currentValue: 20725.00, potential: 7.3 },
  
  // Europe
  { id: 7, name: 'STOXX Europe 600', region: regions.Europe, fairValue: 9.5, currentValue: 475.80, potential: 9.5 },
  { id: 8, name: 'EURO STOXX 50', region: regions.Europe, fairValue: 8.9, currentValue: 4340.50, potential: 8.9 },
  { id: 9, name: 'DAX 40', region: regions.Europe, fairValue: 9.3, currentValue: 15808.04, potential: 9.3 },
  { id: 10, name: 'FTSE 100', region: regions.Europe, fairValue: 5.7, currentValue: 7234.03, potential: 5.7 },
  { id: 11, name: 'FTSE MIB', region: regions.Europe, fairValue: 10.2, currentValue: 28750.50, potential: 10.2 },
  { id: 12, name: 'CAC 40', region: regions.Europe, fairValue: 8.5, currentValue: 7115.75, potential: 8.5 },
  { id: 13, name: 'IBEX 35', region: regions.Europe, fairValue: 7.8, currentValue: 9420.30, potential: 7.8 },
  { id: 14, name: 'AEX-INDEX', region: regions.Europe, fairValue: 9.1, currentValue: 765.85, potential: 9.1 },
  { id: 15, name: 'SMI PR', region: regions.Europe, fairValue: 6.4, currentValue: 11125.30, potential: 6.4 },
  
  // Latin America
  { id: 16, name: 'IPC MEXICO', region: regions.LatinAmerica, fairValue: 14.5, currentValue: 54750.25, potential: 14.5 },
  { id: 17, name: 'BOVESPA', region: regions.LatinAmerica, fairValue: 16.9, currentValue: 115250.75, potential: 16.9 },
  { id: 18, name: 'MERVAL', region: regions.LatinAmerica, fairValue: 18.3, currentValue: 750850.50, potential: 18.3 },
  
  // Asia
  { id: 19, name: 'Nikkei 225', region: regions.Asia, fairValue: 10.5, currentValue: 27548.00, potential: 10.5 },
  { id: 20, name: 'HANG SENG INDEX', region: regions.Asia, fairValue: 19.8, currentValue: 18645.20, potential: 19.8 },
  { id: 21, name: 'NIFTY 50', region: regions.Asia, fairValue: 12.7, currentValue: 18560.50, potential: 12.7 },
  { id: 22, name: 'BIST 100', region: regions.Asia, fairValue: 15.3, currentValue: 7875.30, potential: 15.3 },
  { id: 23, name: 'Tadawul All Shares Index', region: regions.Asia, fairValue: 11.5, currentValue: 11550.75, potential: 11.5, comingSoon: true },
  { id: 24, name: 'FTSE Bursa Malaysia KLCI', region: regions.Asia, fairValue: 8.7, currentValue: 1450.25, potential: 8.7, comingSoon: true },
];

// Mock sectors data
const mockSectors = [
  { id: 1, indexId: 1, name: 'Technology', fairValue: 18.6, weight: 28.3 },
  { id: 2, indexId: 1, name: 'Healthcare', fairValue: 14.2, weight: 13.5 },
  { id: 3, indexId: 1, name: 'Financials', fairValue: 8.4, weight: 11.2 },
  { id: 4, indexId: 1, name: 'Consumer Discretionary', fairValue: 11.8, weight: 12.5 },
  { id: 5, indexId: 1, name: 'Communication Services', fairValue: 15.3, weight: 10.8 },
  { id: 6, indexId: 1, name: 'Industrials', fairValue: 9.7, weight: 7.9 },
  { id: 7, indexId: 1, name: 'Consumer Staples', fairValue: 5.2, weight: 5.8 },
];

export default function Rankings() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(1);
  const [sortField, setSortField] = useState('potential');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewMode, setViewMode] = useState('table');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

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
    ? mockIndexes.filter(index => index.region === selectedRegion)
    : mockIndexes;

  // Sort the filtered indexes
  const sortedIndexes = [...filteredIndexes].sort((a, b) => {
    if (sortDirection === 'asc') {
      return a[sortField as keyof typeof a] > b[sortField as keyof typeof b] ? 1 : -1;
    } else {
      return a[sortField as keyof typeof a] < b[sortField as keyof typeof b] ? 1 : -1;
    }
  });

  const selectedIndexData = mockIndexes.find(index => index.id === selectedIndex);
  const selectedIndexSectors = mockSectors.filter(sector => sector.indexId === selectedIndex);

  // Get unique regions for the dropdown
  const uniqueRegions = Object.values(regions);

  return (
    <>
      <Head>
        <title>World Indexes Rankings - OptiWise</title>
        <meta name="description" content="Explore world indexes and their fair values" />
      </Head>

      <main className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>World Indexes Rankings</h1>
          <p className={styles.description}>
            Explore world indexes and analyze their fair values compared to current market prices.
            Fair values are calculated by weighted averaging of component stocks.
          </p>
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

            {viewMode === 'table' ? (
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
                      <span className={styles.sectorWeight}>{sector.weight}% of index</span>
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
  );
}
