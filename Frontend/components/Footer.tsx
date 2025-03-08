import Link from 'next/link';
import styles from '../styles/Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerSection}>
          <h3>EXPLORE</h3>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/features">Features</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h3>PERSONAL DATA</h3>
          <ul>
            <li><Link href="/disclaimer">Disclaimer</Link></li>
            <li><Link href="/risk-disclosure">Risk disclosure statement</Link></li>
            <li><Link href="/personal-data">Personal data processing</Link></li>
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h3>POLICY</h3>
          <ul>
            <li><Link href="/terms">Terms and conditions</Link></li>
            <li><Link href="/privacy">Privacy policy</Link></li>
            <li><Link href="/cookies">Cookie policy</Link></li>
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h3>CONTACT US</h3>
          <p>OptiWise Ltd.</p>
          <p>Zurich, Switzerland</p>
          <p>Email: contact@optiwise.ai</p>
          <p>Phone: +41 123 456 789</p>
        </div>
      </div>
      
      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} OptiWise. All rights reserved.</p>
      </div>
    </footer>
  );
}
