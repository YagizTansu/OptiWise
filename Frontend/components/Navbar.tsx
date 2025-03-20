import { FaBars, FaUser, FaChartLine } from 'react-icons/fa';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import styles from '../styles/Navbar.module.css';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user } = useAuth();
  
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
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
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
        </div>
        
        <div className={styles.navRight}>
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
