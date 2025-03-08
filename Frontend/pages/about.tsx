import Layout from '../components/Layout'
import styles from '../styles/About.module.css'
import { FaUsers, FaChartLine, FaLightbulb, FaGlobe, FaBullseye, FaRocket, FaShieldAlt, FaHandshake } from 'react-icons/fa'
import Image from 'next/image'

export default function About() {
  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      bio: 'Former hedge fund manager with 15+ years experience in quantitative analysis and algorithmic trading.',
      image: '/team/sarah.jpg',
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      bio: 'AI researcher and software architect with experience building high-frequency trading systems.',
      image: '/team/michael.jpg',
    },
    {
      name: 'Elena Rodriguez',
      role: 'Head of Data Science',
      bio: 'PhD in Statistical Learning with expertise in predictive modeling for financial markets.',
      image: '/team/elena.jpg',
    },
    {
      name: 'David Kim',
      role: 'Chief Market Strategist',
      bio: 'Former investment banker with deep knowledge of global markets and macroeconomic trends.',
      image: '/team/david.jpg',
    },
  ];
  
  return (
    <Layout title="About Us - OptiWise">
      <div className={styles.aboutContainer}>
        <section className={styles.valuesSection}>
          <h2>Our Mission</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FaBullseye /></div>
              <h3>Democratize Finance</h3>
              <p>Make sophisticated financial analysis tools accessible to individual investors worldwide.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FaRocket /></div>
              <h3>Empower Investors</h3>
              <p>Enable smarter, data-driven decisions through cutting-edge AI and intuitive design.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FaShieldAlt /></div>
              <h3>Build Trust</h3>
              <p>Provide transparent, reliable insights investors can depend on for their financial future.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FaHandshake /></div>
              <h3>Level the Playing Field</h3>
              <p>Bridge the gap between institutional capabilities and individual investor resources.</p>
            </div>
          </div>
        </section>
        
        <section className={styles.valuesSection}>
          <h2>Our Values</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FaUsers /></div>
              <h3>Investor First</h3>
              <p>We build everything with our users' success in mind, focusing on tools that create real value.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FaChartLine /></div>
              <h3>Data Integrity</h3>
              <p>We're committed to providing accurate, reliable data and transparent analysis methodologies.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FaLightbulb /></div>
              <h3>Continuous Innovation</h3>
              <p>We constantly improve our AI models and features to stay ahead of evolving market dynamics.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}><FaGlobe /></div>
              <h3>Global Perspective</h3>
              <p>We analyze markets worldwide to provide comprehensive insights for diverse investment strategies.</p>
            </div>
          </div>
        </section>
        
        <section className={styles.storySection}>
          <div className={styles.storyContent}>
            <h2>Our Story</h2>
            <p>
              OptiWise was founded in 2020 when Sarah Johnson, a seasoned hedge fund manager, 
              recognized that individual investors lacked access to the sophisticated tools 
              used by institutional traders. She assembled a team of AI experts, data scientists, 
              and market strategists with the goal of building a platform that could level the 
              playing field.
            </p>
            <p>
              What began as a prototype for algorithmic market analysis quickly evolved into a 
              comprehensive investment intelligence platform. After two years of development and 
              testing with early adopters, OptiWise launched publicly in 2022 and now serves 
              thousands of investors across 40 countries.
            </p>
          </div>
        </section>
        
        <section className={styles.teamSection}>
          <h2>Meet Our Team</h2>
          <div className={styles.teamGrid}>
            {team.map((member, index) => (
              <div key={index} className={styles.teamMember}>
                <div className={styles.memberImage}>
                  {/* Placeholder for team member images */}
                  <div className={styles.imagePlaceholder}></div>
                </div>
                <h3>{member.name}</h3>
                <p className={styles.memberRole}>{member.role}</p>
                <p className={styles.memberBio}>{member.bio}</p>
              </div>
            ))}
          </div>
        </section>
        
        <section className={styles.ctaSection}>
          <h2>Join Us on Our Mission</h2>
          <p>Ready to transform how you make investment decisions?</p>
          <div className={styles.ctaButtons}>
            <button className={styles.primaryBtn}>Get Started</button>
            <button className={styles.secondaryBtn}>View Careers</button>
          </div>
        </section>
      </div>
    </Layout>
  )
}
