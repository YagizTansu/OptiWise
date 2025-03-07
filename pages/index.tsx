import Layout from '../components/Layout'
import styles from '../styles/Home.module.css'
import { FaSearch, FaBars } from 'react-icons/fa' // Added FaBars icon

export default function Home() {
  return (
    <Layout>

      {/* New modern navigation bar */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>OptiWise</div>
        <div className={styles.navLinks}>
          <a href="#" className={styles.navLink}>Dashboard</a>
          <a href="#" className={styles.navLink}>Features</a>
          <a href="#" className={styles.navLink}>Pricing</a>
          <a href="/about" className={styles.navLink}>About</a>
        </div>
        <button className={styles.menuButton}>
          <FaBars className={styles.menuIcon} />
        </button>
      </nav>

      <main className={styles.main}>
        <div className={styles.logoContainer}>
          <h1 className={styles.title}>OptiWise</h1>
          <p className={styles.tagline}>Smart decisions, optimal results</p>
        </div>
        
        <div className={styles.searchSection}>
          <h2>Let's get started...</h2>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Search..." />
            <button type="submit" className={styles.searchButton}>
              <FaSearch className={styles.searchIcon} />
            </button>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerSection}>
          <h3>EXPLORE</h3>
          <ul>
            <li><a href="#">Landing</a></li>
            <li><a href="#">Terminal</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Affiliate Program</a></li>
            <li><a href="#">What's New</a></li>
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h3>PERSONAL DATA</h3>
          <ul>
            <li><a href="#">Disclaimer</a></li>
            <li><a href="#">Risk disclosure statement</a></li>
            <li><a href="#">Personal data processing</a></li>
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h3>POLICY</h3>
          <ul>
            <li><a href="#">Terms and conditions</a></li>
            <li><a href="#">Privacy policy</a></li>
            <li><a href="#">Cookie policy</a></li>
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h3>CONTACT US</h3>
          <p>ELP SA</p>
          <p>Chiasso, Switzerland</p>
          <p>Phone: [Phone Number]</p>
          <p>Email: [Email Address]</p>
        </div>
      </footer>
    </Layout>
  )
}
