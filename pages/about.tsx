import Layout from '../components/Layout'
import styles from '../styles/Home.module.css'
import { 
  FaBars, 
  FaBullseye, 
  FaCalendarAlt, 
  FaUsers, 
  FaGlobeAmericas,
  FaLinkedin,
  FaTwitter,
  FaLightbulb,
  FaHandshake,
  FaUserFriends,
  FaTrophy
} from 'react-icons/fa'

export default function About() {
  return (
    <Layout>
      {/* Modern navigation bar */}
      <nav className={styles.navbar}>
        <div className={styles.navLogo}>OptiWise</div>
        <div className={styles.navLinks}>
          <a href="/" className={styles.navLink}>Dashboard</a>
          <a href="#" className={styles.navLink}>Features</a>
          <a href="#" className={styles.navLink}>Pricing</a>
          <a href="/about" className={`${styles.navLink} ${styles.active}`}>About</a>
        </div>
        <button className={styles.menuButton}>
          <FaBars className={styles.menuIcon} />
        </button>
      </nav>

      <main className={styles.main}>
        <div className={styles.aboutHero}>
          <h1 className={styles.title}>About OptiWise</h1>
          <p className={styles.subtitle}>Driving innovation through smart optimization</p>
        </div>
        
        <section className={styles.aboutSection}>
          <div className={styles.sectionHeader}>
            <FaBullseye className={styles.sectionIcon} />
            <h2>Our Mission</h2>
          </div>
          <p className={styles.missionText}>OptiWise is dedicated to helping businesses make better decisions through advanced analytics and optimization technologies. We believe that with the right insights and tools, every organization can achieve optimal results.</p>
          
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <div className={styles.statIconWrapper}>
                <FaCalendarAlt className={styles.statIcon} />
              </div>
              <h3>2015</h3>
              <p>Founded</p>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIconWrapper}>
                <FaUsers className={styles.statIcon} />
              </div>
              <h3>500+</h3>
              <p>Clients</p>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statIconWrapper}>
                <FaGlobeAmericas className={styles.statIcon} />
              </div>
              <h3>30+</h3>
              <p>Countries</p>
            </div>
          </div>
        </section>
        
        <section className={styles.aboutSection}>
          <div className={styles.sectionHeader}>
            <FaUsers className={styles.sectionIcon} />
            <h2>Our Team</h2>
          </div>
          <p>We're a diverse group of innovators, analysts, and problem solvers committed to excellence.</p>
          
          <div className={styles.teamContainer}>
            <div className={styles.teamMember}>
              <div className={styles.memberPhoto}></div>
              <h4>Jane Smith</h4>
              <p>CEO & Founder</p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialIcon}><FaLinkedin /></a>
                <a href="#" className={styles.socialIcon}><FaTwitter /></a>
              </div>
            </div>
            <div className={styles.teamMember}>
              <div className={styles.memberPhoto}></div>
              <h4>John Davis</h4>
              <p>CTO</p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialIcon}><FaLinkedin /></a>
                <a href="#" className={styles.socialIcon}><FaTwitter /></a>
              </div>
            </div>
            <div className={styles.teamMember}>
              <div className={styles.memberPhoto}></div>
              <h4>Sarah Williams</h4>
              <p>Head of Product</p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialIcon}><FaLinkedin /></a>
                <a href="#" className={styles.socialIcon}><FaTwitter /></a>
              </div>
            </div>
          </div>
        </section>
        
        <section className={styles.aboutSection}>
          <div className={styles.sectionHeader}>
            <FaTrophy className={styles.sectionIcon} />
            <h2>Our Values</h2>
          </div>
          
          <div className={styles.valuesGrid}>
            <div className={styles.valueItem}>
              <FaLightbulb className={styles.valueIcon} />
              <h3>Innovation</h3>
              <p>We constantly push boundaries to create cutting-edge solutions.</p>
            </div>
            <div className={styles.valueItem}>
              <FaHandshake className={styles.valueIcon} />
              <h3>Integrity</h3>
              <p>We operate with transparency and honesty in all we do.</p>
            </div>
            <div className={styles.valueItem}>
              <FaUserFriends className={styles.valueIcon} />
              <h3>Customer Focus</h3>
              <p>Our clients' success drives every decision we make.</p>
            </div>
            <div className={styles.valueItem}>
              <FaTrophy className={styles.valueIcon} />
              <h3>Excellence</h3>
              <p>We strive for the highest quality in our products and services.</p>
            </div>
          </div>
        </section>
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
