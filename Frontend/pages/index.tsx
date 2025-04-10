import Layout from '../components/Layout'
import Link from 'next/link'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { useState, useEffect } from 'react'
import { 
  FaChartLine, 
  FaGlobe, 
  FaCoins, 
  FaOilCan, 
  FaChartPie, 
  FaBitcoin, 
  FaRobot, 
  FaArrowRight,
  FaDesktop,
  FaUsers,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaCircle
} from 'react-icons/fa'

export default function Home() {
  // Define chart images and titles for the showcase
  const chartData = [
    { 
      src: "/images/chart1.png", 
      title: "Market Trend Analysis", 
      type: "STOCK"
    },
    { 
      src: "/images/chart2.png", 
      title: "Forex Market Prediction", 
      type: "FOREX"
    },
    { 
      src: "/images/chart3.png", 
      title: "Volatility Indicators", 
      type: "CRYPTO"
    },
    { 
      src: "/images/chart4.png", 
      title: "Investment Portfolio", 
      type: "ETF"
    },
    { 
      src: "/images/chart5.png", 
      title: "Commodity Forecasting", 
      type: "COMMODITY"
    },
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Navigate to previous image
  const prevImage = () => {
    setCurrentIndex(prev => (prev === 0 ? chartData.length - 1 : prev - 1));
  };
  
  // Navigate to next image
  const nextImage = () => {
    setCurrentIndex(prev => (prev + 1) % chartData.length);
  };
  
  // Rotate through images automatically
  useEffect(() => {
    const interval = setInterval(() => {
      nextImage();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout title="OptiWise - Intelligent Financial Analysis Platform">
      <main className={styles.landingPage}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.logoTitleContainer}>
              <h1 className={styles.heroTitle}>
              <Image 
                  src="/images/logo.png" 
                  alt="OptiWise Logo" 
                  width={100}
                  height={60}
                  className={styles.logo}
                />
                <span className={styles.titlePrefix}>Opti</span>
                <span className={styles.titleSuffix}>Wise</span>
              </h1>
            </div>
            <h2 className={styles.heroSubtitle}>Empowering Your Financial Decisions</h2>
            <p className={styles.heroDescription}>
              Best Stock Market Analysis & Decisions for Traders and Investors with Forecaster Terminal.
              Navigate global markets confidently with our advanced AI-powered tools.
            </p>
            <div className={styles.heroCta}>
              <Link href="/terminal" className={styles.primaryButton}>
                Try Forecaster Terminal <FaArrowRight className={styles.buttonIcon} />
              </Link>
              <Link href="/features" className={styles.secondaryButton}>
                Learn More
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            {/* Modern Image Showcase */}
            <div className={styles.imageShowcase}>
              <div className={styles.showcaseHeader}>
                <h3 className={styles.showcaseTitle}>{chartData[currentIndex].title}</h3>
                <span className={styles.showcaseBadge}>{chartData[currentIndex].type}</span>
              </div>
              
              <div className={styles.showcaseContent}>
                {chartData.map((chart, index) => (
                  <div 
                    key={index}
                    className={`${styles.imageFrame} ${index === currentIndex ? styles.activeFrame : ''}`}
                  >
                    <Image 
                      src={chart.src} 
                      alt={chart.title}
                      fill={true}
                      sizes="(max-width: 768px) 100vw, 900px"
                      priority={index === currentIndex}
                      className={styles.showcaseImage}
                    />
                    <div className={styles.frameOverlay}></div>
                  </div>
                ))}
                
                {/* New modern carousel controls */}
                <div className={styles.navButtons}>
                  <button 
                    className={styles.navButton} 
                    onClick={prevImage} 
                    aria-label="Previous image"
                  >
                    <FaChevronLeft />
                  </button>
                  <button 
                    className={styles.navButton} 
                    onClick={nextImage}
                    aria-label="Next image"
                  >
                    <FaChevronRight />
                  </button>
                </div>
                
                <div className={styles.carouselControls}>
                  {chartData.map((_, index) => (
                    <button
                      key={index}
                      className={`${styles.carouselDot} ${index === currentIndex ? styles.activeDot : ''}`}
                      onClick={() => setCurrentIndex(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Why Choose OptiWise?</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <FaRobot className={styles.featureIcon} />
              <h3>AI-Powered Analysis</h3>
              <p>Advanced algorithms that analyze market trends and provide accurate predictions</p>
            </div>
            <div className={styles.featureCard}>
              <FaDesktop className={styles.featureIcon} />
              <h3>Comprehensive Terminal</h3>
              <p>All-in-one platform for in-depth market analysis across multiple instruments</p>
            </div>
            <div className={styles.featureCard}>
              <FaUsers className={styles.featureIcon} />
              <h3>For Everyone</h3>
              <p>Designed for both professional traders and beginner investors</p>
            </div>
            <div className={styles.featureCard}>
              <FaGlobe className={styles.featureIcon} />
              <h3>Global Markets</h3>
              <p>Access to worldwide financial markets and instruments</p>
            </div>
          </div>
        </section>
        
        {/* Markets Section */}
        <section className={styles.marketsSection}>
          <h2 className={styles.sectionTitle}>Forecaster Works On All Financial Instruments</h2>
          <p className={styles.sectionSubtitle}>Leverage comprehensive tools to navigate global markets confidently</p>
          
          <div className={styles.marketsGrid}>
            <div className={styles.marketCard}>
              <FaChartLine className={styles.marketIcon} />
              <h3>Stocks</h3>
              <p>Analyze equities across major exchanges worldwide</p>
            </div>
            <div className={styles.marketCard}>
              <FaCoins className={styles.marketIcon} />
              <h3>Forex</h3>
              <p>Track and analyze currency pairs with precision</p>
            </div>
            <div className={styles.marketCard}>
              <FaChartPie className={styles.marketIcon} />
              <h3>Indices</h3>
              <p>Monitor global market indices and their components</p>
            </div>
            <div className={styles.marketCard}>
              <FaOilCan className={styles.marketIcon} />
              <h3>Commodities</h3>
              <p>Track precious metals, energy products, and agricultural goods</p>
            </div>
            <div className={styles.marketCard}>
              <FaBitcoin className={styles.marketIcon} />
              <h3>Cryptos</h3>
              <p>Analyze digital currencies and blockchain assets</p>
            </div>
            <div className={styles.marketCard}>
              <FaChartPie className={styles.marketIcon} />
              <h3>ETFs</h3>
              <p>Comprehensive analysis of exchange-traded funds</p>
            </div>
          </div>
        </section>
        
        {/* Testimonials or Benefits */}
        <section className={styles.benefitsSection}>
          <h2 className={styles.sectionTitle}>Advanced Features That Make a Difference</h2>
          <div className={styles.benefitsList}>
            <div className={styles.benefitItem}>
              <FaCheckCircle className={styles.benefitIcon} />
              <p>Real-time market data and alerts</p>
            </div>
            <div className={styles.benefitItem}>
              <FaCheckCircle className={styles.benefitIcon} />
              <p>AI-driven market predictions with high accuracy</p>
            </div>
            <div className={styles.benefitItem}>
              <FaCheckCircle className={styles.benefitIcon} />
              <p>Customizable dashboard for your trading style</p>
            </div>
            <div className={styles.benefitItem}>
              <FaCheckCircle className={styles.benefitIcon} />
              <p>Advanced technical indicators and charting tools</p>
            </div>
            <div className={styles.benefitItem}>
              <FaCheckCircle className={styles.benefitIcon} />
              <p>Portfolio optimization recommendations</p>
            </div>
            <div className={styles.benefitItem}>
              <FaCheckCircle className={styles.benefitIcon} />
              <p>Risk assessment and management tools</p>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Ready to transform your trading strategy?</h2>
            <p>Start using OptiWise Forecaster Terminal today and make data-driven decisions.</p>
            <Link href="/terminal" className={styles.ctaButton}>
              Launch Forecaster Terminal <FaArrowRight className={styles.buttonIcon} />
            </Link>
          </div>
        </section>
      </main>
    </Layout>
  )
}
