import { FaBars, FaUser } from 'react-icons/fa';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import styles from '../styles/Navbar.module.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
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
              className={styles.userButton} 
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              aria-label="User menu"
              aria-expanded={userDropdownOpen}
            >
              <FaUser />
            </button>
            {userDropdownOpen && (
              <div className={styles.userDropdown} role="menu">
                <Link href="/login" className={styles.dropdownItem}>Log In</Link>
                <Link href="/signup" className={styles.dropdownItem}>Sign Up</Link>
                <hr className={styles.dropdownDivider} />
                <Link href="/account" className={styles.dropdownItem}>My Account</Link>
                <Link href="/settings" className={styles.dropdownItem}>Settings</Link>
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
