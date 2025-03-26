import React, { useEffect, useState } from 'react';
import styles from '../../../styles/fundamental/TechnicalAnalysis.module.css';
import { fetchInsightsData, InsightsData } from '../../../services/api/finance';
import { FaQuestion, FaTimes } from 'react-icons/fa';

interface TechnicalAnalysisProps {
  symbol: string;
}

// InfoButton component with improved tooltip
const InfoButton: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div className={styles.infoButtonContainer} style={{ position: 'relative' }}>
      <button 
        className={styles.infoButton}
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={`Information about ${title}`}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s'
        }}
      >
        <span className={styles.infoIcon} style={{ 
          fontSize: '14px', 
          color: '#4a90e2', 
          fontWeight: 'bold' 
        }}>ⓘ</span>
      </button>
      {showTooltip && (
        <div className={styles.infoTooltip} style={{
          position: 'absolute',
          zIndex: 100,
          width: '220px',
          right: '-10px',
          top: 'calc(100% + 5px)',
          backgroundColor: '#fff',
          boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
          borderRadius: '6px',
          padding: '10px',
          fontSize: '13px',
          transition: 'opacity 0.3s, transform 0.3s',
          opacity: 1,
          transform: 'translateY(0)',
          animation: 'fadeIn 0.3s'
        }}>
          <div className={styles.tooltipTitle} style={{
            fontWeight: 'bold',
            marginBottom: '5px',
            borderBottom: '1px solid #eee',
            paddingBottom: '5px',
            color: '#333'
          }}>{title}</div>
          <div className={styles.tooltipContent} style={{
            lineHeight: '1.4',
            color: '#555'
          }}>{content}</div>
          <div style={{
            position: 'absolute',
            top: '-6px',
            right: '10px',
            width: '12px',
            height: '12px',
            backgroundColor: '#fff',
            transform: 'rotate(45deg)',
            boxShadow: '-2px -2px 3px rgba(0,0,0,0.1)'
          }} />
        </div>
      )}
    </div>
  );
};

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ symbol }) => {
  const [insightsData, setInsightsData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        const data = await fetchInsightsData(symbol);
        setInsightsData(data);
        setError(null);
      } catch (err) {
        console.error('Error loading insights:', err);
        setError('Failed to load technical analysis data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [symbol]);

  // Enhanced score indicator with better visual cues
  const renderScoreIndicator = (score: number, direction: string) => {
    const getColorClass = () => {
      if (direction === 'Bullish') return styles.positive;
      if (direction === 'Bearish') return styles.negative;
      return styles.neutral;
    };

    const getColorHex = () => {
      if (direction === 'Bullish') return '#4caf50';
      if (direction === 'Bearish') return '#f44336';
      return '#9e9e9e';
    };

    const bars = [];
    for (let i = 1; i <= 4; i++) {
      bars.push(
        <div 
          key={i}
          className={`${styles.scoreBar} ${i <= score ? getColorClass() : ''}`}
          style={{
            width: '25%',
            height: '8px',
            margin: '0 2px',
            borderRadius: '2px',
            backgroundColor: i <= score ? getColorHex() : '#e0e0e0',
            transition: 'background-color 0.3s',
            opacity: i <= score ? 1 : 0.5
          }}
        />
      );
    }

    return (
      <div className={styles.scoreIndicatorWrapper} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%'
      }}>
        <div style={{ 
          display: 'flex', 
          width: '100%', 
          justifyContent: 'space-between' 
        }}>
          {bars}
        </div>
        <span className={getColorClass()} style={{ 
          fontWeight: 'bold', 
          fontSize: '14px',
          color: getColorHex(),
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: getColorHex()
          }}></span>
          {direction} ({score}/4)
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
      }}>
        <div className={styles.loadingSpinner} style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(0,0,0,0.1)',
          borderTopColor: '#4a90e2',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '15px', color: '#666' }}>Loading technical analysis data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '30px',
        backgroundColor: '#fff5f5',
        borderRadius: '8px',
        border: '1px solid #ffe5e5'
      }}>
        <div className={styles.errorIcon} style={{ fontSize: '32px', marginBottom: '15px' }}>⚠️</div>
        <p style={{ color: '#d32f2f', textAlign: 'center' }}>{error}</p>
      </div>
    );
  }

  if (!insightsData) {
    return (
      <div className={styles.errorContainer} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '30px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <div className={styles.errorIcon} style={{ fontSize: '32px', marginBottom: '15px' }}>⚠️</div>
        <p style={{ color: '#666', textAlign: 'center' }}>No technical analysis data available for {symbol}</p>
      </div>
    );
  }

  return (
    <div className={styles.analysisCard} style={{
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      backgroundColor: '#fff',
      transition: 'box-shadow 0.3s ease'
    }}>
      <div className={styles.seasonalityHeader} style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '100%',
        padding: '16px 20px',
        borderBottom: '1px solid #eaeaea',
        backgroundColor: '#f9fafb'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Technical Analysis</h3>
        <div className={styles.chartControls} style={{ marginLeft: 'auto' }}>
          <button 
            className={styles.iconButton} 
            title="Learn More"
            onClick={() => setShowInfoModal(true)}
          >
            <FaQuestion />
          </button>
        </div>
      </div>
      
      {/* Information Modal - improved styling */}
      {showInfoModal && (
        <div className={styles.modalOverlay} 
          onClick={() => setShowInfoModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            animation: 'fadeIn 0.3s'
          }}
        >
          <div 
            className={styles.modalContent} 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              animation: 'slideIn 0.3s'
            }}
          >
            <div className={styles.modalHeader} style={{
              padding: '20px 24px',
              borderBottom: '1px solid #eaeaea',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              backgroundColor: '#fff',
              zIndex: 1,
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#333' }}>Technical Analysis Explained</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowInfoModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#666',
                  transition: 'background-color 0.2s'
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody} style={{
              padding: '24px',
              fontSize: '15px',
              lineHeight: '1.6',
              color: '#444'
            }}>
              <h4 style={{ fontSize: '18px', margin: '0 0 12px', color: '#333' }}>What is Technical Analysis?</h4>
              <p style={{ marginBottom: '16px' }}>
                Technical analysis involves analyzing price movements and patterns to forecast future price behavior. 
                It uses charts, indicators, and historical data to identify trends and potential trading 
                opportunities, independent of a company's fundamentals.
              </p>
              
              <h4 style={{ fontSize: '18px', margin: '24px 0 12px', color: '#333' }}>Understanding the Metrics:</h4>
              <p style={{ marginBottom: '8px' }}><strong>Valuation:</strong> Indicates whether a stock is trading above (overvalued) or below (undervalued) its estimated fair value.</p>
              <p style={{ marginBottom: '8px' }}><strong>Support/Resistance:</strong> Price levels where buying interest (support) or selling pressure (resistance) are expected to be strong.</p>
              <p style={{ marginBottom: '16px' }}><strong>Stop Loss:</strong> A recommended price at which investors might consider selling to minimize potential losses.</p>
              
              <h4 style={{ fontSize: '18px', margin: '24px 0 12px', color: '#333' }}>Time Horizons:</h4>
              <p style={{ marginBottom: '8px' }}><strong>Short Term:</strong> Expected price movement over the next 2-6 weeks.</p>
              <p style={{ marginBottom: '8px' }}><strong>Intermediate Term:</strong> Analysis for the 1-3 month time horizon.</p>
              <p style={{ marginBottom: '8px' }}><strong>Long Term:</strong> Projections for the likely price direction over the next 6-12 months.</p>
            </div>
            <div className={styles.modalFooter} style={{
              padding: '16px 24px',
              borderTop: '1px solid #eaeaea',
              display: 'flex',
              justifyContent: 'flex-end',
              position: 'sticky',
              bottom: 0,
              backgroundColor: '#fff',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px'
            }}>
              <button 
                className={styles.applyButton}
                onClick={() => setShowInfoModal(false)}
                style={{
                  backgroundColor: '#4a90e2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      <p className={styles.sectionDescription}></p>
      <div className={styles.metricsGrid} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        padding: '16px 20px',
        marginBottom: '16px'
      }}>
        <div className={`${styles.metricCard} ${
          insightsData?.instrumentInfo?.valuation?.description === 'Overvalued' ? styles.negative : 
          insightsData?.instrumentInfo?.valuation?.description === 'Undervalued' ? styles.positive : 
          styles.neutral
        }`} style={{
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '1px solid #eaeaea',
          transition: 'transform 0.2s, box-shadow 0.2s',
          backgroundColor: 
            insightsData?.instrumentInfo?.valuation?.description === 'Overvalued' ? '#fff5f5' :
            insightsData?.instrumentInfo?.valuation?.description === 'Undervalued' ? '#f4fbf6' :
            '#f8f9fa'
        }}>
          <div className={styles.metricHeader} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>Valuation</h4>
            <InfoButton 
              title="Valuation Indicator" 
              content="This indicates whether a stock is currently trading above (overvalued) or below (undervalued) its estimated fair value based on various financial metrics, historical data, and market comparisons." 
            />
          </div>
          <p className={styles.metricValue} style={{
            fontSize: '18px', 
            fontWeight: '600', 
            margin: '10px 0',
            color:
              insightsData?.instrumentInfo?.valuation?.description === 'Overvalued' ? '#d32f2f' :
              insightsData?.instrumentInfo?.valuation?.description === 'Undervalued' ? '#2e7d32' :
              '#666'
          }}>{insightsData?.instrumentInfo?.valuation?.description}</p>
          <p className={styles.metricSubtitle} style={{
            fontSize: '13px',
            color: '#666',
            margin: '0'
          }}>{insightsData?.instrumentInfo?.valuation?.relativeValue} {insightsData?.instrumentInfo?.valuation?.discount}</p>
        </div>

        <div className={styles.metricCard} style={{
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '1px solid #eaeaea',
          transition: 'transform 0.2s, box-shadow 0.2s',
          backgroundColor: '#f8f9fa'
        }}>
          <div className={styles.metricHeader} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>Support</h4>
            <InfoButton 
              title="Support Level" 
              content="Support represents a price level where buying interest is strong enough to overcome selling pressure, preventing the price from falling further. It's often based on historical price reactions and can act as a 'floor' for the stock price." 
            />
          </div>
          <p className={styles.metricValue} style={{
            fontSize: '18px', 
            fontWeight: '600', 
            margin: '10px 0',
            color: '#2e7d32'
          }}>${insightsData?.instrumentInfo?.keyTechnicals?.support?.toFixed(2) || 'N/A'}</p>
        </div>

        <div className={styles.metricCard} style={{
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '1px solid #eaeaea',
          transition: 'transform 0.2s, box-shadow 0.2s',
          backgroundColor: '#f8f9fa'
        }}>
          <div className={styles.metricHeader} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>Resistance</h4>
            <InfoButton 
              title="Resistance Level" 
              content="Resistance is a price level where selling pressure is expected to overcome buying interest, preventing the price from rising further. It acts as a 'ceiling' for the stock price and is based on historical price movements." 
            />
          </div>
          <p className={styles.metricValue} style={{
            fontSize: '18px', 
            fontWeight: '600', 
            margin: '10px 0',
            color: '#d32f2f'
          }}>${insightsData?.instrumentInfo?.keyTechnicals?.resistance?.toFixed(2) || 'N/A'}</p>
        </div>

        <div className={styles.metricCard} style={{
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '1px solid #eaeaea',
          transition: 'transform 0.2s, box-shadow 0.2s',
          backgroundColor: '#f8f9fa'
        }}>
          <div className={styles.metricHeader} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>Stop Loss</h4>
            <InfoButton 
              title="Stop Loss Level" 
              content="A recommended price at which investors might consider selling to minimize potential losses. If the stock falls to or below this level, it could indicate a change in trend or increased downside risk." 
            />
          </div>
          <p className={styles.metricValue} style={{
            fontSize: '18px', 
            fontWeight: '600', 
            margin: '10px 0',
            color: '#d32f2f'
          }}>${insightsData?.instrumentInfo?.keyTechnicals?.stopLoss?.toFixed(2) || 'N/A'}</p>
        </div>
      </div>

      <div className={styles.outlooksContainer} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        padding: '0 20px 20px'
      }}>
        <div className={styles.outlookCard} style={{
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '1px solid #eaeaea',
          transition: 'transform 0.2s, box-shadow 0.2s',
          backgroundColor: '#fff'
        }}>
          <div className={styles.metricHeader} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>Short Term Outlook</h4>
            <InfoButton 
              title="Short Term Outlook" 
              content="Represents the expected price movement over the next 2-6 weeks. This analysis incorporates recent momentum, volatility patterns, and technical indicators to predict near-term direction."
            />
          </div>
          {renderScoreIndicator(
            insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.score || 0,
            insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.direction || 'Neutral'
          )}
          <p className={styles.outlookDescription} style={{
            fontSize: '14px',
            color: '#555',
            margin: '12px 0',
            lineHeight: '1.5'
          }}>
            {insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.stateDescription}
          </p>
          <div className={styles.comparisonData} style={{
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '13px'
          }}>
            <div className={styles.comparisonItem} style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '6px'
            }}>
              <span className={styles.comparisonLabel} style={{ fontWeight: '500' }}>Sector:</span>
              <span className={
                insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.sectorDirection === 'Bullish' ? styles.positive :
                insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.sectorDirection === 'Bearish' ? styles.negative :
                styles.neutral
              } style={{
                fontWeight: '500',
                color: 
                  insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.sectorDirection === 'Bullish' ? '#2e7d32' :
                  insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.sectorDirection === 'Bearish' ? '#d32f2f' :
                  '#666'
              }}>
                {insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.sectorDirection}
              </span>
            </div>
            <div className={styles.comparisonItem} style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span className={styles.comparisonLabel} style={{ fontWeight: '500' }}>Index:</span>
              <span className={
                insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.indexDirection === 'Bullish' ? styles.positive :
                insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.indexDirection === 'Bearish' ? styles.negative :
                styles.neutral
              } style={{
                fontWeight: '500',
                color: 
                  insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.indexDirection === 'Bullish' ? '#2e7d32' :
                  insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.indexDirection === 'Bearish' ? '#d32f2f' :
                  '#666'
              }}>
                {insightsData?.instrumentInfo?.technicalEvents?.shortTermOutlook?.indexDirection}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.outlookCard} style={{
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '1px solid #eaeaea',
          transition: 'transform 0.2s, box-shadow 0.2s',
          backgroundColor: '#fff'
        }}>
          <div className={styles.metricHeader} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>Intermediate Term Outlook</h4>
            <InfoButton 
              title="Intermediate Term Outlook" 
              content="Provides analysis for the 1-3 month time horizon. This assessment evaluates medium-term trends, support/resistance levels, and broader market influences that may affect price direction."
            />
          </div>
          {renderScoreIndicator(
            insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.score || 0,
            insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.direction || 'Neutral'
          )}
          <p className={styles.outlookDescription} style={{
            fontSize: '14px',
            color: '#555',
            margin: '12px 0',
            lineHeight: '1.5'
          }}>
            {insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.stateDescription}
          </p>
          <div className={styles.comparisonData} style={{
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '13px'
          }}>
            <div className={styles.comparisonItem} style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '6px'
            }}>
              <span className={styles.comparisonLabel} style={{ fontWeight: '500' }}>Sector:</span>
              <span className={
                insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.sectorDirection === 'Bullish' ? styles.positive :
                insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.sectorDirection === 'Bearish' ? styles.negative :
                styles.neutral
              } style={{
                fontWeight: '500',
                color: 
                  insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.sectorDirection === 'Bullish' ? '#2e7d32' :
                  insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.sectorDirection === 'Bearish' ? '#d32f2f' :
                  '#666'
              }}>
                {insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.sectorDirection}
              </span>
            </div>
            <div className={styles.comparisonItem} style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span className={styles.comparisonLabel} style={{ fontWeight: '500' }}>Index:</span>
              <span className={
                insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.indexDirection === 'Bullish' ? styles.positive :
                insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.indexDirection === 'Bearish' ? styles.negative :
                styles.neutral
              } style={{
                fontWeight: '500',
                color: 
                  insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.indexDirection === 'Bullish' ? '#2e7d32' :
                  insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.indexDirection === 'Bearish' ? '#d32f2f' :
                  '#666'
              }}>
                {insightsData?.instrumentInfo?.technicalEvents?.intermediateTermOutlook?.indexDirection}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.outlookCard} style={{
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '1px solid #eaeaea',
          transition: 'transform 0.2s, box-shadow 0.2s',
          backgroundColor: '#fff'
        }}>
          <div className={styles.metricHeader} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '500' }}>Long Term Outlook</h4>
            <InfoButton 
              title="Long Term Outlook" 
              content="Projects the likely price direction over the next 6-12 months. Considers longer-term trends, cyclical patterns, and persistent market factors that affect the security's performance over extended periods."
            />
          </div>
          {renderScoreIndicator(
            insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.score || 0,
            insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.direction || 'Neutral'
          )}
          <p className={styles.outlookDescription} style={{
            fontSize: '14px',
            color: '#555',
            margin: '12px 0',
            lineHeight: '1.5'
          }}>
            {insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.stateDescription}
          </p>
          <div className={styles.comparisonData} style={{
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '13px'
          }}>
            <div className={styles.comparisonItem} style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '6px'
            }}>
              <span className={styles.comparisonLabel} style={{ fontWeight: '500' }}>Sector:</span>
              <span className={
                insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.sectorDirection === 'Bullish' ? styles.positive :
                insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.sectorDirection === 'Bearish' ? styles.negative :
                styles.neutral
              } style={{
                fontWeight: '500',
                color: 
                  insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.sectorDirection === 'Bullish' ? '#2e7d32' :
                  insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.sectorDirection === 'Bearish' ? '#d32f2f' :
                  '#666'
              }}>
                {insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.sectorDirection}
              </span>
            </div>
            <div className={styles.comparisonItem} style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span className={styles.comparisonLabel} style={{ fontWeight: '500' }}>Index:</span>
              <span className={
                insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.indexDirection === 'Bullish' ? styles.positive :
                insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.indexDirection === 'Bearish' ? styles.negative :
                styles.neutral
              } style={{
                fontWeight: '500',
                color: 
                  insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.indexDirection === 'Bullish' ? '#2e7d32' :
                  insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.indexDirection === 'Bearish' ? '#d32f2f' :
                  '#666'
              }}>
                {insightsData?.instrumentInfo?.technicalEvents?.longTermOutlook?.indexDirection}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAnalysis;
