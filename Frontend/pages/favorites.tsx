import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getFavorites, removeFromFavorites } from '../lib/favoritesService';
import styles from '../styles/favorites.module.css';
import { FaStar, FaTrash, FaSearch, FaSort, FaSortUp, FaSortDown, FaExternalLinkAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines';
import { fetchStockData } from '../lib/stockService';

type FavoriteStock = {
  symbol: string;
  price?: number;
  change?: number;
  changePercent?: number;
  sparklineData?: number[];
  marketCap?: string;
  loading: boolean;
}

type SortField = 'symbol' | 'price' | 'change' | 'marketCap';
type SortDirection = 'asc' | 'desc';

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoriteStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const router = useRouter();
  const { user } = useAuth();

  // Load favorite symbols
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        setIsLoading(true);
        const symbolsList = await getFavorites();
        
        // Initialize with loading state
        const initialFavorites = symbolsList.map(symbol => ({
          symbol,
          loading: true
        }));
        
        setFavorites(initialFavorites);
        setIsLoading(false);
        
        // Fetch data for each symbol
        const updatedFavorites = await Promise.all(
          symbolsList.map(async (symbol) => {
            try {
              const data = await fetchStockData(symbol);
              return {
                symbol,
                price: data.price,
                change: data.change,
                changePercent: data.changePercent,
                sparklineData: data.recentPrices || Array(20).fill(data.price),
                marketCap: formatMarketCap(data.marketCap),
                loading: false
              };
            } catch (error) {
              console.error(`Error fetching data for ${symbol}:`, error);
              return { symbol, loading: false };
            }
          })
        );
        
        setFavorites(updatedFavorites);
      }
    };
    
    loadFavorites();
  }, [user]);

  const handleRemove = async (symbol: string) => {
    await removeFromFavorites(symbol);
    setFavorites(favorites.filter(fav => fav.symbol !== symbol));
  };

  const goToAnalyses = (symbol: string) => {
    router.push(`/analyses?symbol=${symbol}`);
  };
  
  // Format large numbers to readable format (like 1.2B for billions)
  const formatMarketCap = (value?: number) => {
    if (!value) return 'N/A';
    
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    return value.toLocaleString();
  };
  
  // Format price change with color
  const formatPriceChange = (change?: number, changePercent?: number) => {
    if (change === undefined || changePercent === undefined) return 'N/A';
    
    const color = change >= 0 ? styles.positive : styles.negative;
    const sign = change >= 0 ? '+' : '';
    
    return (
      <span className={color}>
        {sign}{change.toFixed(2)} ({sign}{changePercent.toFixed(2)}%)
      </span>
    );
  };
  
  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Get sorted and filtered data
  const getSortedAndFilteredData = () => {
    return favorites
      .filter(fav => fav.symbol.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const fieldA = a[sortField];
        const fieldB = b[sortField];
        
        // Handle undefined values
        if (fieldA === undefined && fieldB === undefined) return 0;
        if (fieldA === undefined) return 1;
        if (fieldB === undefined) return -1;
        
        // Sort direction
        const direction = sortDirection === 'asc' ? 1 : -1;
        
        // Sort strings
        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
          return fieldA.localeCompare(fieldB) * direction;
        }
        
        // Sort numbers
        return ((fieldA as number) - (fieldB as number)) * direction;
      });
  };
  
  // Sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className={styles.favoritesContainer}>
          <div className={styles.header}>
            <h3 className={styles.title}>My Watchlist</h3>
            <div className={styles.actions}>
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search symbols..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
                <FaSearch className={styles.searchIcon} />
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className={styles.loadingSection}>
              <div className={styles.skeleton}></div>
              <div className={styles.skeleton}></div>
              <div className={styles.skeleton}></div>
            </div>
          ) : favorites.length === 0 ? (
            <div className={styles.emptyState}>
              <FaStar size={48} color="#FFD700" />
              <p>You haven't added any favorites yet.</p>
              <p className={styles.emptyStateHint}>
                Go to any symbol analysis page and click the star icon to add it to your watchlist.
              </p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.favoritesTable}>
                <thead>
                  <tr>
                    <th>
                      <div onClick={() => handleSort('symbol')} className={styles.sortableHeader}>
                        <span>Symbol</span> {getSortIcon('symbol')}
                      </div>
                    </th>
                    <th>
                      <div onClick={() => handleSort('price')} className={styles.sortableHeader}>
                        <span>Price</span> {getSortIcon('price')}
                      </div>
                    </th>
                    <th>
                      <div onClick={() => handleSort('change')} className={styles.sortableHeader}>
                        <span>Change</span> {getSortIcon('change')}
                      </div>
                    </th>
                    <th>
                      <div onClick={() => handleSort('marketCap')} className={styles.sortableHeader}>
                        <span>Market Cap</span> {getSortIcon('marketCap')}
                      </div>
                    </th>
                    <th className={styles.sparklineCell}>Performance</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedAndFilteredData().map((item) => (
                    <tr key={item.symbol} className={styles.favoriteItem}>
                      <td className={styles.symbolCell} onClick={() => goToAnalyses(item.symbol)}>
                        <div className={styles.symbolInfo}>
                          <FaStar color="#FFD700" className={styles.starIcon} />
                          <span className={styles.symbolName}>{item.symbol}</span>
                        </div>
                      </td>
                      <td>
                        {item.loading ? (
                          <span className={styles.loading}>Loading...</span>
                        ) : (
                          <span className={styles.price}>
                            ${item.price?.toFixed(2) || 'N/A'}
                          </span>
                        )}
                      </td>
                      <td>{formatPriceChange(item.change, item.changePercent)}</td>
                      <td>{item.marketCap || 'N/A'}</td>
                      <td className={styles.sparklineCell}>
                        {item.sparklineData && (
                          <Sparklines data={item.sparklineData} width={120} height={30} margin={5}>
                            <SparklinesLine color={item.change && item.change >= 0 ? "#4CAF50" : "#F44336"} />
                            <SparklinesSpots />
                          </Sparklines>
                        )}
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            className={styles.actionButton}
                            onClick={() => goToAnalyses(item.symbol)}
                            aria-label={`View ${item.symbol} analysis`}
                          >
                            <FaExternalLinkAlt />
                          </button>
                          <button 
                            className={styles.removeButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(item.symbol);
                            }}
                            aria-label={`Remove ${item.symbol} from favorites`}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
