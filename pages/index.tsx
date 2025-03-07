import Layout from '../components/Layout'
import styles from '../styles/Home.module.css'
import { FaSearch } from 'react-icons/fa'

export default function Home() {
  return (
    <Layout title="OptiWise - Smart Investment Platform">
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
    </Layout>
  )
}
