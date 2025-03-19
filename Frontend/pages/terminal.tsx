import Layout from '../components/Layout'
import styles from '../styles/Home.module.css'
import { FaSearch } from 'react-icons/fa'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { searchSymbols, SearchResult } from '../services/api/finance'

export default function Terminal() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchSectionRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounce search input
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch search results using the imported function
  const fetchSearchResults = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const results = await searchSymbols(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowDropdown(true);

    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout
    debounceTimeout.current = setTimeout(() => {
      fetchSearchResults(query);
    }, 300); // 300ms debounce time
  };

  // Handle click on a search result item
  const handleResultClick = (symbol: string) => {
    // Navigate to the analyses page with the selected symbol as a parameter
    router.push({
      pathname: '/analyses',
      query: { symbol: symbol }
    });
  };

  // Dropdown'un dışına tıklanınca kapanmasını sağla
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchSectionRef.current && !searchSectionRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Layout title="OptiWise Terminal - Financial Analysis Platform">
      <main className={styles.main}>
        <div className={styles.logoContainer}>
          <h1 className={styles.title}>
            <span className={styles.titlePrefix}>Optiwise</span>
            <span className={styles.titleSuffix}>Terminal</span>
          </h1>
          <p className={styles.tagline}>Advanced Ai Analysis, Informed Decisions</p>
        </div>
        
        <div className={styles.searchSection} ref={searchSectionRef}>
          <h2> <span>Unlock the World of Trading:</span> Stocks, Forex, Indices, Commodities & ETFs!</h2>
          <div className={styles.searchBar}>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery && setShowDropdown(true)}
            />
            <button 
              type="submit" 
              className={styles.searchButton}
            >
              <FaSearch className={styles.searchIcon} />
            </button>
          </div>
          
          {showDropdown && (searchResults.length > 0 || isLoading || searchQuery) && (
            <div className={styles.searchResults}>
              {isLoading ? (
                <div className={styles.loadingMessage}>
                  <div className={styles.loadingSpinner}></div>
                  Searching for stocks...
                </div>
              ) : searchResults.length > 0 ? (
                <ul className={styles.resultsList}>
                  {searchResults.map((result, index) => (
                    <li 
                      key={`${result.symbol || ''}-${result.exchange || ''}-${result.shortName || ''}-${index}`}
                      className={styles.resultItem}
                      onClick={() => handleResultClick(result.symbol)}
                      title={`View analysis for ${result.symbol}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleResultClick(result.symbol);
                        }
                      }}
                    >
                      <span className={styles.resultSymbol}>{result.symbol}</span>
                      <span className={styles.resultName}>{result.shortName}</span>
                      {result.exchange && (
                        <span className={styles.resultExchange}>{result.exchange}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : searchQuery ? (
                <div className={styles.noResults}>
                  No matching stocks found
                </div>
              ) : null}
            </div>
          )}
        </div>
      </main>
    </Layout>
  )
}
