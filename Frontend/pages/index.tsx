import Layout from '../components/Layout'
import styles from '../styles/Home.module.css'
import { FaSearch } from 'react-icons/fa'
import { useState, useEffect, useRef } from 'react'

// Define interface for search results
interface SearchResult {
  symbol: string;
  shortName?: string;
  exchange?: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchSectionRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch search results
  const fetchSearchResults = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3001/api/finance/search?query=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      debugger
      if (data.length > 0) {
        setSearchResults(data.map((quote: any) => ({
          symbol: quote.symbol,
          shortName: quote.shortName || quote.longName || '',
          exchange: quote.exchange || ''
        })));
      } else {
        setSearchResults([]);
      }
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
    <Layout title="OptiWise - Smart Investment Platform">
      <main className={styles.main}>
        <div className={styles.logoContainer}>
          <h1 className={styles.title}>OptiWise</h1>
          <p className={styles.tagline}>Smart decisions, optimal results</p>
        </div>
        
        <div className={styles.searchSection} ref={searchSectionRef}>
          <h2>Let's get started...</h2>
          <div className={styles.searchBar}>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery && setShowDropdown(true)}
            />
            <button type="submit" className={styles.searchButton}>
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
                  {searchResults.map((result) => (
                    <li key={result.symbol} className={styles.resultItem}>
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
