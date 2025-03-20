import { useState } from 'react';
import Head from 'next/head';
import { FaFlag, FaSearch, FaChartLine, FaLandmark, FaMoneyBillWave, FaIndustry } from 'react-icons/fa';
import styles from '../styles/CountryEconomics.module.css';
import Layout from '../components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

type CountryData = {
  name: string;
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  debtToGDP: number;
  currency: string;
  interestRate: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export default function CountryEconomics() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - would come from an API in a real implementation
  const countriesData: {[key: string]: CountryData} = {
    'United States': {
      name: 'United States',
      gdpGrowth: 2.1,
      inflation: 3.7,
      unemployment: 3.8,
      debtToGDP: 128.1,
      currency: 'USD',
      interestRate: 5.50,
      sentiment: 'positive'
    },
    'European Union': {
      name: 'European Union',
      gdpGrowth: 0.8,
      inflation: 2.9,
      unemployment: 6.4,
      debtToGDP: 90.2,
      currency: 'EUR',
      interestRate: 4.50,
      sentiment: 'neutral'
    },
    'Japan': {
      name: 'Japan',
      gdpGrowth: 1.2,
      inflation: 3.0,
      unemployment: 2.5,
      debtToGDP: 261.7,
      currency: 'JPY',
      interestRate: 0.10,
      sentiment: 'negative'
    },
    'China': {
      name: 'China',
      gdpGrowth: 4.9,
      inflation: 0.7,
      unemployment: 5.0,
      debtToGDP: 77.3,
      currency: 'CNY',
      interestRate: 3.45,
      sentiment: 'neutral'
    },
    'United Kingdom': {
      name: 'United Kingdom',
      gdpGrowth: 0.5,
      inflation: 6.7,
      unemployment: 4.2,
      debtToGDP: 103.1,
      currency: 'GBP',
      interestRate: 5.25,
      sentiment: 'neutral'
    }
  };

  const filteredCountries = Object.values(countriesData).filter(country => 
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'positive') return '#4caf50';
    if (sentiment === 'negative') return '#f44336';
    return '#ff9800';
  };

  const getCountryAnalysis = (country: string) => {
    const data = countriesData[country];
    
    if (!data) return 'Select a country to see analysis.';
    
    if (data.sentiment === 'positive') {
      return `Our AI analysis indicates ${country} has a robust economic outlook. With GDP growth at ${data.gdpGrowth}% and unemployment at ${data.unemployment}%, the economy is performing well despite inflation at ${data.inflation}%. The central bank's interest rate of ${data.interestRate}% is supporting monetary stability while managing growth.`;
    } else if (data.sentiment === 'negative') {
      return `Our AI analysis suggests caution regarding ${country}'s economic trajectory. Despite GDP growth of ${data.gdpGrowth}%, high debt-to-GDP ratio of ${data.debtToGDP}% presents significant challenges. The current interest rate of ${data.interestRate}% may be insufficient to address underlying structural issues in the economy.`;
    } else {
      return `${country}'s economy shows mixed signals according to our AI analysis. GDP growth of ${data.gdpGrowth}% is moderate, while inflation at ${data.inflation}% requires monitoring. The central bank's approach with interest rates at ${data.interestRate}% reflects a balanced approach to current economic conditions.`;
    }
  };

  return (
    <Layout>
      <ProtectedRoute>
        <div className={styles.container}>
          <Head>
            <title>Country Economics | OptiWise</title>
            <meta name="description" content="AI-powered economic analysis of countries worldwide" />
          </Head>

          <header className={styles.header}>
            <div className={styles.iconContainer}>
              <FaFlag className={styles.headerIcon} />
            </div>
            <div>
              <h1 className={styles.title}>Country Economics</h1>
              <p className={styles.subtitle}>
                AI-powered analysis of global economies and their outlook
              </p>
            </div>
          </header>

          <main className={styles.main}>
            <div className={styles.searchSection}>
              <div className={styles.searchContainer}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search for a country..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.contentLayout}>
              <div className={styles.countriesList}>
                <h2>Countries</h2>
                <div className={styles.countryItemsContainer}>
                  {filteredCountries.map((country) => (
                    <div
                      key={country.name}
                      className={`${styles.countryItem} ${selectedCountry === country.name ? styles.selectedCountry : ''}`}
                      onClick={() => setSelectedCountry(country.name)}
                    >
                      <span>{country.name}</span>
                      <div 
                        className={styles.sentimentIndicator}
                        style={{ backgroundColor: getSentimentColor(country.sentiment) }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.countryDetails}>
                {selectedCountry ? (
                  <>
                    <div className={styles.countryHeader}>
                      <h2>{selectedCountry}</h2>
                      <div 
                        className={styles.sentimentBadge}
                        style={{ backgroundColor: getSentimentColor(countriesData[selectedCountry].sentiment) }}
                      >
                        {countriesData[selectedCountry].sentiment.charAt(0).toUpperCase() + countriesData[selectedCountry].sentiment.slice(1)} Outlook
                      </div>
                    </div>

                    <div className={styles.economicIndicators}>
                      <div className={styles.indicatorCard}>
                        <FaChartLine className={styles.indicatorIcon} />
                        <span>GDP Growth</span>
                        <div className={styles.indicatorValue}>{countriesData[selectedCountry].gdpGrowth}%</div>
                      </div>
                      <div className={styles.indicatorCard}>
                        <FaMoneyBillWave className={styles.indicatorIcon} />
                        <span>Inflation</span>
                        <div className={styles.indicatorValue}>{countriesData[selectedCountry].inflation}%</div>
                      </div>
                      <div className={styles.indicatorCard}>
                        <FaIndustry className={styles.indicatorIcon} />
                        <span>Unemployment</span>
                        <div className={styles.indicatorValue}>{countriesData[selectedCountry].unemployment}%</div>
                      </div>
                      <div className={styles.indicatorCard}>
                        <FaLandmark className={styles.indicatorIcon} />
                        <span>Interest Rate</span>
                        <div className={styles.indicatorValue}>{countriesData[selectedCountry].interestRate}%</div>
                      </div>
                    </div>

                    <div className={styles.analysisSection}>
                      <h3>AI Economic Analysis</h3>
                      <p className={styles.analysisText}>
                        {getCountryAnalysis(selectedCountry)}
                      </p>
                    </div>

                    <div className={styles.additionalMetrics}>
                      <div className={styles.metricItem}>
                        <span className={styles.metricLabel}>Currency</span>
                        <span className={styles.metricValue}>{countriesData[selectedCountry].currency}</span>
                      </div>
                      <div className={styles.metricItem}>
                        <span className={styles.metricLabel}>Debt to GDP</span>
                        <span className={styles.metricValue}>{countriesData[selectedCountry].debtToGDP}%</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    <FaFlag className={styles.emptyStateIcon} />
                    <p>Select a country to view detailed economic analysis</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}
