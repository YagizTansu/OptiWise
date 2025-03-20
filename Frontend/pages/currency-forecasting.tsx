import { useState } from 'react';
import Head from 'next/head';
import { FaMoneyBillWave, FaChartLine, FaArrowUp, FaArrowDown, FaMinus, FaSync, FaCalendarAlt } from 'react-icons/fa';
import styles from '../styles/CurrencyForecasting.module.css';
import Layout from '../components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

type CurrencyData = {
  code: string;
  name: string;
  value: number;
  change: number;
  forecast: 'up' | 'down' | 'stable';
  strength: number; // 0-100
}

export default function CurrencyForecasting() {
  const [timeframe, setTimeframe] = useState('1m');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  
  // Mock data - would come from an API in a real implementation
  const currenciesData: CurrencyData[] = [
    { 
      code: 'USD', 
      name: 'US Dollar', 
      value: 1.0000, 
      change: 0.12, 
      forecast: 'stable',
      strength: 75
    },
    { 
      code: 'EUR', 
      name: 'Euro', 
      value: 1.0576, 
      change: -0.23, 
      forecast: 'down',
      strength: 65
    },
    { 
      code: 'GBP', 
      name: 'British Pound', 
      value: 1.2167, 
      change: 0.34, 
      forecast: 'up',
      strength: 72
    },
    { 
      code: 'JPY', 
      name: 'Japanese Yen', 
      value: 0.0067, 
      change: -0.45, 
      forecast: 'down',
      strength: 58
    },
    { 
      code: 'CHF', 
      name: 'Swiss Franc', 
      value: 1.1210, 
      change: 0.18, 
      forecast: 'up',
      strength: 82
    },
    { 
      code: 'CAD', 
      name: 'Canadian Dollar', 
      value: 0.7319, 
      change: -0.22, 
      forecast: 'stable',
      strength: 68
    },
    { 
      code: 'AUD', 
      name: 'Australian Dollar', 
      value: 0.6482, 
      change: -0.67, 
      forecast: 'down',
      strength: 61
    },
    { 
      code: 'CNY', 
      name: 'Chinese Yuan', 
      value: 0.1373, 
      change: 0.05, 
      forecast: 'stable',
      strength: 69
    }
  ];

  const getForecastIcon = (forecast: string) => {
    if (forecast === 'up') return <FaArrowUp style={{ color: '#4caf50' }} />;
    if (forecast === 'down') return <FaArrowDown style={{ color: '#f44336' }} />;
    return <FaMinus style={{ color: '#ff9800' }} />;
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 75) return '#4caf50';
    if (strength >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <Layout>
      <ProtectedRoute>
        <div className={styles.container}>
          <Head>
            <title>Currency Strength | OptiWise</title>
            <meta name="description" content="AI-powered currency strength forecasting" />
          </Head>

          <header className={styles.header}>
            <div className={styles.iconContainer}>
              <FaMoneyBillWave className={styles.headerIcon} />
            </div>
            <div>
              <h1 className={styles.title}>Currency Strength</h1>
              <p className={styles.subtitle}>
                AI-powered currency analysis and forecasting
              </p>
            </div>
          </header>

          <main className={styles.main}>
            <div className={styles.controlsBar}>
              <div className={styles.timeframeSelector}>
                <FaCalendarAlt className={styles.controlIcon} />
                <span>Timeframe:</span>
                <select 
                  value={timeframe} 
                  onChange={(e) => setTimeframe(e.target.value)}
                  className={styles.selectControl}
                >
                  <option value="1w">1 Week</option>
                  <option value="1m">1 Month</option>
                  <option value="3m">3 Months</option>
                  <option value="6m">6 Months</option>
                  <option value="1y">1 Year</option>
                </select>
              </div>
              
              <div className={styles.baseCurrencySelector}>
                <FaMoneyBillWave className={styles.controlIcon} />
                <span>Base Currency:</span>
                <select 
                  value={baseCurrency} 
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className={styles.selectControl}
                >
                  {currenciesData.map(currency => (
                    <option key={currency.code} value={currency.code}>{currency.code} - {currency.name}</option>
                  ))}
                </select>
              </div>
              
              <button className={styles.refreshButton}>
                <FaSync className={styles.refreshIcon} />
                Refresh Data
              </button>
            </div>

            <div className={styles.currencyTable}>
              <div className={styles.tableHeader}>
                <div className={styles.currencyCell}>Currency</div>
                <div className={styles.valueCell}>Value</div>
                <div className={styles.changeCell}>24h Change</div>
                <div className={styles.forecastCell}>AI Forecast</div>
                <div className={styles.strengthCell}>Strength</div>
              </div>
              
              <div className={styles.tableBody}>
                {currenciesData.map(currency => (
                  <div key={currency.code} className={styles.tableRow}>
                    <div className={styles.currencyCell}>
                      <div className={styles.currencyCode}>{currency.code}</div>
                      <div className={styles.currencyName}>{currency.name}</div>
                    </div>
                    
                    <div className={styles.valueCell}>
                      {currency.value.toFixed(4)}
                    </div>
                    
                    <div className={`${styles.changeCell} ${currency.change > 0 ? styles.positive : currency.change < 0 ? styles.negative : ''}`}>
                      {currency.change > 0 ? '+' : ''}{currency.change.toFixed(2)}%
                    </div>
                    
                    <div className={styles.forecastCell}>
                      <div className={styles.forecastContainer}>
                        {getForecastIcon(currency.forecast)}
                        <span className={styles.forecastText}>
                          {currency.forecast.charAt(0).toUpperCase() + currency.forecast.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.strengthCell}>
                      <div className={styles.strengthBar}>
                        <div 
                          className={styles.strengthFill} 
                          style={{ 
                            width: `${currency.strength}%`,
                            backgroundColor: getStrengthColor(currency.strength)
                          }}
                        ></div>
                      </div>
                      <span className={styles.strengthValue}>{currency.strength}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={styles.insightSection}>
              <h2 className={styles.insightTitle}>
                <FaChartLine className={styles.insightIcon} />
                AI Currency Analysis
              </h2>
              
              <div className={styles.insightContent}>
                <div className={styles.insightCard}>
                  <h3>Trend Analysis</h3>
                  <p>The US Dollar is showing stability against most major currencies with a slight strengthening trend over the {timeframe === '1w' ? 'past week' : timeframe === '1m' ? 'past month' : timeframe === '3m' ? 'past 3 months' : timeframe === '6m' ? 'past 6 months' : 'past year'}. The Euro continues to face headwinds due to regional economic challenges, while the Swiss Franc demonstrates resilience amid global uncertainties.</p>
                </div>
                
                <div className={styles.insightCard}>
                  <h3>Key Movers</h3>
                  <p>The British Pound has recovered some ground, up 0.34% in the last 24 hours, driven by better-than-expected employment data. The Australian Dollar has declined 0.67% amid concerns about Chinese demand for commodities and domestic interest rate expectations.</p>
                </div>
                
                <div className={styles.insightCard}>
                  <h3>Market Sentiment</h3>
                  <p>Market sentiment is currently cautious with traders closely monitoring central bank policies. The Japanese Yen's weakness reflects the Bank of Japan's continued accommodative stance relative to other major central banks that have maintained higher interest rates.</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}
