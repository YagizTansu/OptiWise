import { FaBars, FaUser, FaChartLine, FaTools, FaLightbulb, FaRobot, FaChartBar, FaFire, FaRocket, FaGlobe, FaFlag, FaMoneyBillWave, FaListOl, FaSearchDollar, FaBalanceScale, FaChartArea, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import styles from '../styles/Navbar.module.css';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [featuresDropdownOpen, setFeaturesDropdownOpen] = useState(false);
  const { user } = useAuth();
  
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const featuresDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (featuresDropdownRef.current && !featuresDropdownRef.current.contains(event.target as Node)) {
        setFeaturesDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile menu when features dropdown is opened
  useEffect(() => {
    if (featuresDropdownOpen) {
      setMobileMenuOpen(false);
    }
  }, [featuresDropdownOpen]);
  
  // Get user initials
  const getUserInitials = () => {
    if (!user) return null;
    
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    
    if (!firstName && !lastName) return null;
    
    const firstInitial = firstName ? firstName.charAt(0) : '';
    const lastInitial = lastName ? lastName.charAt(0) : '';
    
    return (firstInitial + lastInitial).toUpperCase();
  };
  
  const userInitials = getUserInitials();
  
  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.navLogo}>
          <Link href="/">
            <Image 
              src="/images/logo.png" 
              alt="OptiWise Logo" 
              width={60} 
              height={35} 
            />
            <span className={styles.logoPrefix}>Opti</span>
            <span className={styles.logoSuffix}>Wise</span>
          </Link>
        </div>
        
        <div className={`${styles.navLinks} ${mobileMenuOpen ? styles.active : ''}`}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          
          <Link href="/terminal" className={styles.navLink}>
            Terminal
          </Link>
          
          <Link href="/features" className={styles.navLink}>
            Features
          </Link>
          
          <Link href="/pricing" className={styles.navLink}>
            Pricing
          </Link>
          {/* <Link href="/about" className={styles.navLink}>
            About
          </Link> */}
        </div>
        
        <div className={styles.navRight}>
          <div className={styles.featuresMenuContainer} ref={featuresDropdownRef}>
            <button 
              className={styles.featuresButton}
              onClick={() => setFeaturesDropdownOpen(!featuresDropdownOpen)}
              aria-label="Features menu"
              aria-expanded={featuresDropdownOpen}
            >
              <FaTools className={styles.featuresIcon} />
              <span className={styles.featuresButtonText}>Tools</span>
            </button>
            
            {featuresDropdownOpen && (
              <>
                {/* Mobile backdrop overlay */}
                <div className={styles.mobileBackdrop} onClick={() => setFeaturesDropdownOpen(false)}></div>
                
                <div className={styles.featuresDropdown} role="menu">
                  {/* Mobile handle and header */}
                  <div className={styles.mobileMenuHandle}></div>

                  
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownHeaderTitle}>Tools & Features</span>
                    <p className={styles.dropdownHeaderDesc}>Explore our powerful tools</p>
                  </div>
                  
                  <div className={styles.categorySection}>
                    <div className={styles.categoryTitle}>Market Intelligence</div>
                    <div className={styles.dropdownGrid}>
                      
                      <Link href="/rankings" className={styles.dropdownGridItem}>
                        <div className={styles.dropdownItemIconWrap}>
                          <FaListOl className={styles.dropdownItemIcon} />
                        </div>
                        <div>
                          <span className={styles.dropdownItemTitle}>Global Market Rankings</span>
                          <p className={styles.dropdownItemDesc}>World indexes fair value</p>
                        </div>
                      </Link>
                      
                      {/* <Link href="/breakeven" className={styles.dropdownGridItem}>
                        <div className={styles.dropdownItemIconWrap}>
                          <FaBalanceScale className={styles.dropdownItemIcon} />
                        </div>
                        <div>
                          <span className={styles.dropdownItemTitle}>Breakeven</span>
                          <p className={styles.dropdownItemDesc}>Stocks turning profitable</p>
                        </div>
                      </Link> */}
  
                      <Link href="/quantum-screener" className={styles.dropdownGridItem}>
                        <div className={styles.dropdownItemIconWrap}>
                          <FaSearchDollar className={styles.dropdownItemIcon} />
                        </div>
                        <div>
                          <span className={styles.dropdownItemTitle}>Quantum Screener</span>
                          <p className={styles.dropdownItemDesc}>Seasonality analysis</p>
                        </div>
                      </Link>
                      
                      <Link href="/cot-reports" className={styles.dropdownGridItem}>
                        <div className={styles.dropdownItemIconWrap}>
                          <FaChartArea className={styles.dropdownItemIcon} />
                        </div>
                        <div>
                          <span className={styles.dropdownItemTitle}>COT Reports</span>
                          <p className={styles.dropdownItemDesc}>Commitment of Traders data</p>
                        </div>
                      </Link>
                    </div>
                  </div>
                  
                  {/* <div className={styles.categorySection}>
                    <div className={styles.categoryTitle}>AI-Powered Analysis</div>
                    <div className={styles.dropdownGrid}>
                      <Link href="/ai-assistant" className={styles.dropdownGridItem}>
                        <div className={styles.dropdownItemIconWrap}>
                          <FaRobot className={styles.dropdownItemIcon} />
                        </div>
                        <div>
                          <span className={styles.dropdownItemTitle}>AI Assistant</span>
                          <p className={styles.dropdownItemDesc}>Get intelligent help</p>
                        </div>
                      </Link>
  
                      <Link href="/hot-topics" className={styles.dropdownGridItem}>
                        <div className={styles.dropdownItemIconWrap}>
                          <FaFire className={styles.dropdownItemIcon} />
                        </div>
                        <div>
                          <span className={styles.dropdownItemTitle}>Hot Topics</span>
                          <p className={styles.dropdownItemDesc}>Trending market topics</p>
                        </div>
                      </Link>
                      
                      <Link href="/country-economics" className={styles.dropdownGridItem}>
                        <div className={styles.dropdownItemIconWrap}>
                          <FaFlag className={styles.dropdownItemIcon} />
                        </div>
                        <div>
                          <span className={styles.dropdownItemTitle}>Country Economics</span>
                          <p className={styles.dropdownItemDesc}>AI economic analysis</p>
                        </div>
                      </Link>
                      
                      <Link href="/currency-forecasting" className={styles.dropdownGridItem}>
                        <div className={styles.dropdownItemIconWrap}>
                          <FaMoneyBillWave className={styles.dropdownItemIcon} />
                        </div>
                        <div>
                          <span className={styles.dropdownItemTitle}>Currency Strength</span>
                          <p className={styles.dropdownItemDesc}>AI forecasting</p>
                        </div>
                      </Link>
                      
                      <Link href="/market-insights" className={styles.dropdownGridItem}>
                        <div className={styles.dropdownItemIconWrap}>
                          <FaLightbulb className={styles.dropdownItemIcon} />
                        </div>
                        <div>
                          <span className={styles.dropdownItemTitle}>Insights</span>
                          <p className={styles.dropdownItemDesc}>Market opportunities</p>
                        </div>
                      </Link>
                    </div>
                  </div> */}

                </div>
              </>
            )}
          </div>
          
          <div className={styles.userMenuContainer} ref={userDropdownRef}>
            <button 
              className={`${styles.userButton} ${userInitials ? styles.userInitialsButton : ''}`} 
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              aria-label="User menu"
              aria-expanded={userDropdownOpen}
            >
              {userInitials ? userInitials : <FaUser />}
            </button>
            {userDropdownOpen && (
              <div className={styles.userDropdown} role="menu">
                <Link href="/favorites" className={styles.dropdownItem}>Favorites</Link>
                <Link href="/settings" className={styles.dropdownItem}>Settings</Link>
                
                {!user && (
                  <Link href="/login" className={styles.dropdownItem}>Sign In</Link>
                )}
              </div>
            )}
          </div>
          
          <button 
            className={styles.menuButton} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <FaBars className={styles.menuIcon} />
          </button>
        </div>
      </div>
    </nav>
  );
}
