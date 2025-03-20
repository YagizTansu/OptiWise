import { useState } from 'react';
import Head from 'next/head';
import { FaLightbulb, FaChartLine, FaChartBar, FaExclamationTriangle, FaCheck, FaFilter, FaSortAmountDown, FaStar } from 'react-icons/fa';
import styles from '../styles/MarketInsights.module.css';
import Layout from '../components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

type InsightType = 'opportunity' | 'warning' | 'trend';
type MarketSector = 'Technology' | 'Healthcare' | 'Finance' | 'Energy' | 'Consumer' | 'Industrial' | 'All';

type InsightData = {
  id: number;
  title: string;
  description: string;
  type: InsightType;
  sector: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  date: string;
}

export default function MarketInsights() {
  const [selectedSector, setSelectedSector] = useState<MarketSector>('All');
  const [selectedType, setSelectedType] = useState<InsightType | 'all'>('all');
  const [sortBy, setSortBy] = useState('date');
  
  // Mock data - would come from an API in a real implementation
  const insightsData: InsightData[] = [
    {
      id: 1,
      title: "Semiconductor sector shows signs of recovery",
      description: "After a prolonged downturn, semiconductor stocks are showing strong signals of a potential upcycle. AI demand continues to drive growth while traditional markets are stabilizing.",
      type: "opportunity",
      sector: "Technology",
      impact: "high",
      confidence: 87,
      date: "2023-10-15"
    },
    {
      id: 2,
      title: "Banking pressure from rising delinquency rates",
      description: "Consumer banking is experiencing increasing pressure from rising delinquency rates in credit cards and personal loans, potentially signaling broader economic stress.",
      type: "warning",
      sector: "Finance",
      impact: "medium",
      confidence: 74,
      date: "2023-10-18"
    },
    {
      id: 3,
      title: "Renewable energy investment accelerating",
      description: "Global investments in renewable energy infrastructure are accelerating beyond previous forecasts, creating potential opportunities in clean energy suppliers and grid technology.",
      type: "trend",
      sector: "Energy",
      impact: "high",
      confidence: 91,
      date: "2023-10-12"
    },
    {
      id: 4,
      title: "Healthcare AI adoption reaching inflection point",
      description: "AI adoption in healthcare diagnostics and drug discovery is reaching an inflection point, with several key technologies moving from research to commercial deployment.",
      type: "opportunity",
      sector: "Healthcare",
      impact: "high",
      confidence: 82,
      date: "2023-10-17"
    },
    {
      id: 5,
      title: "Supply chain reconfiguration accelerating",
      description: "Global manufacturers are accelerating supply chain reconfiguration, moving away from just-in-time models toward regionalization and redundancy.",
      type: "trend",
      sector: "Industrial",
      impact: "medium",
      confidence: 79,
      date: "2023-10-14"
    },
    {
      id: 6,
      title: "Consumer discretionary showing weakness",
      description: "High-end consumer discretionary spending is showing signs of weakness in Q3 data, potentially signaling broader pullback in consumer confidence.",
      type: "warning",
      sector: "Consumer",
      impact: "medium",
      confidence: 68,
      date: "2023-10-16"
    }
  ];

  // Filter and sort insights
  const filteredInsights = insightsData
    .filter(insight => selectedSector === 'All' || insight.sector === selectedSector)
    .filter(insight => selectedType === 'all' || insight.type === selectedType)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortBy === 'confidence') {
        return b.confidence - a.confidence;
      } else if (sortBy === 'impact') {
        const impactValue = { high: 3, medium: 2, low: 1 };
        return impactValue[b.impact as keyof typeof impactValue] - impactValue[a.impact as keyof typeof impactValue];
      }
      return 0;
    });

  const getInsightIcon = (type: InsightType) => {
    if (type === 'opportunity') return <FaChartLine className={`${styles.insightIcon} ${styles.opportunityIcon}`} />;
    if (type === 'warning') return <FaExclamationTriangle className={`${styles.insightIcon} ${styles.warningIcon}`} />;
    return <FaChartBar className={`${styles.insightIcon} ${styles.trendIcon}`} />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#4caf50';
    if (confidence >= 60) return '#ff9800';
    return '#f44336';
  };

  return (
    <Layout>
      <ProtectedRoute>
        <div className={styles.container}>
          <Head>
            <title>Market Insights | OptiWise</title>
            <meta name="description" content="AI-powered market insights and investment opportunities" />
          </Head>

          <header className={styles.header}>
            <div className={styles.iconContainer}>
              <FaLightbulb className={styles.headerIcon} />
            </div>
            <div>
              <h1 className={styles.title}>Market Insights</h1>
              <p className={styles.subtitle}>
                AI-powered market analysis and investment opportunities
              </p>
            </div>
          </header>

          <main className={styles.main}>
            <div className={styles.filtersContainer}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <FaFilter className={styles.filterIcon} />
                  Sector:
                </label>
                <select 
                  value={selectedSector} 
                  onChange={(e) => setSelectedSector(e.target.value as MarketSector)}
                  className={styles.filterSelect}
                >
                  <option value="All">All Sectors</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Energy">Energy</option>
                  <option value="Consumer">Consumer</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <FaFilter className={styles.filterIcon} />
                  Type:
                </label>
                <select 
                  value={selectedType} 
                  onChange={(e) => setSelectedType(e.target.value as InsightType | 'all')}
                  className={styles.filterSelect}
                >
                  <option value="all">All Types</option>
                  <option value="opportunity">Opportunities</option>
                  <option value="warning">Warnings</option>
                  <option value="trend">Trends</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>
                  <FaSortAmountDown className={styles.filterIcon} />
                  Sort by:
                </label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="date">Latest</option>
                  <option value="confidence">Confidence</option>
                  <option value="impact">Impact</option>
                </select>
              </div>
            </div>

            <div className={styles.insightsGrid}>
              {filteredInsights.length > 0 ? (
                filteredInsights.map(insight => (
                  <div key={insight.id} className={`${styles.insightCard} ${styles[insight.type]}`}>
                    <div className={styles.insightHeader}>
                      {getInsightIcon(insight.type)}
                      <div className={styles.insightType}>
                        {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                      </div>
                      <div className={styles.insightDate}>
                        {new Date(insight.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    
                    <h3 className={styles.insightTitle}>{insight.title}</h3>
                    <p className={styles.insightDescription}>{insight.description}</p>
                    
                    <div className={styles.insightFooter}>
                      <div className={styles.insightSector}>
                        <span className={styles.sectorLabel}>Sector:</span> {insight.sector}
                      </div>
                      
                      <div className={styles.insightMetrics}>
                        <div className={styles.confidenceMetric}>
                          <div className={styles.confidenceLabel}>AI Confidence</div>
                          <div className={styles.confidenceBar}>
                            <div 
                              className={styles.confidenceFill}
                              style={{ 
                                width: `${insight.confidence}%`,
                                backgroundColor: getConfidenceColor(insight.confidence)
                              }}
                            ></div>
                          </div>
                          <div className={styles.confidenceValue}>{insight.confidence}%</div>
                        </div>
                        
                        <div className={styles.impactMetric}>
                          <div className={styles.impactLabel}>Impact</div>
                          <div className={`${styles.impactValue} ${styles[`impact${insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)}`]}`}>
                            {insight.impact.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button className={styles.saveButton}>
                      <FaStar className={styles.saveIcon} />
                      Save
                    </button>
                  </div>
                ))
              ) : (
                <div className={styles.noInsights}>
                  <FaCheck className={styles.noInsightsIcon} />
                  <p>No insights match your current filters. Try adjusting your selection.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}
