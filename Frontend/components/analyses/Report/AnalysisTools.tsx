import { useState, useEffect } from 'react';
import styles from '../../../styles/reports/AnalysisTools.module.css';
import { fetchAnalysisData, AnalysisData } from '../../../services/api/finance';

interface AnalysisToolsProps {
  symbol: string;
}

const AnalysisTools = ({ symbol }: AnalysisToolsProps) => {
  const [data, setData] = useState<AnalysisData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const modules = [
          'recommendationTrend', 
          'earningsHistory', 
          'earningsTrend',
          'calendarEvents'
        ];
        
        const response = await fetchAnalysisData(symbol, modules);
        setData(response);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch analysis data');
        setLoading(false);
        console.error(err);
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  };

  // Format recommendation period to be more descriptive
  const formatRecommendationPeriod = (period: string) => {
    // Yahoo Finance typically returns periods like "0m", "+1m", "-1m" etc.
    if (period === "0m") return "Current Month";
    if (period === "-1m") return "Last Month";
    if (period === "-2m") return "Two Months Ago";
    if (period === "-3m") return "Three Months Ago";
    
    // For other formats, try to parse and provide better description
    if (period.endsWith('m')) {
      const num = parseInt(period);
      if (!isNaN(num)) {
        return num > 0 ? `${num} Months Ahead` : `${Math.abs(num)} Months Ago`;
      }
    }
    
    return period; // Return original if we can't parse it
  };

  // Get section description based on section name
  const getSectionDescription = (section: string) => {
    switch(section) {
      case 'recommendations':
        return 'Analyst recommendations and consensus ratings for this security';
      case 'earningsHistory':
        return 'Historical quarterly earnings data and analyst expectations';
      case 'earningsForecast':
        return 'Future earnings projections and growth estimates';
      case 'calendarEvents':
        return 'Upcoming earnings dates, dividends, and other important events';
      default:
        return '';
    }
  };

  // Render recommendation trends
  const renderRecommendations = () => {
    const recommendations = data.recommendationTrend?.trend || [];
    if (recommendations.length === 0) return <div className={styles.noStatementData}>No recommendation data available</div>;
    
    // Calculate totals and sentiment for most recent recommendation period (current period)
    const currentRecommendation = recommendations.find((rec: { period: string; }) => rec.period === '0m') || recommendations[0];
    const totalAnalysts = currentRecommendation ? 
      currentRecommendation.strongBuy + 
      currentRecommendation.buy + 
      currentRecommendation.hold + 
      currentRecommendation.sell + 
      currentRecommendation.strongSell : 0;
    
    // Calculate bullish percentage (strongBuy + buy)
    const bullishPercentage = totalAnalysts ? 
      Math.round(((currentRecommendation.strongBuy + currentRecommendation.buy) / totalAnalysts) * 100) : 0;
    
    // Calculate bearish percentage (sell + strongSell)
    const bearishPercentage = totalAnalysts ? 
      Math.round(((currentRecommendation.sell + currentRecommendation.strongSell) / totalAnalysts) * 100) : 0;
    
    // Calculate neutral percentage (hold)
    const neutralPercentage = totalAnalysts ? 
      Math.round((currentRecommendation.hold / totalAnalysts) * 100) : 0;
    
    // Determine overall sentiment
    let overallSentiment = 'Neutral';
    let sentimentClass = styles.neutral;
    if (bullishPercentage > 60) {
      overallSentiment = 'Bullish';
      sentimentClass = styles.positive;
    } else if (bearishPercentage > 60) {
      overallSentiment = 'Bearish';
      sentimentClass = styles.negative;
    } else if (bullishPercentage > bearishPercentage + 10) {
      overallSentiment = 'Moderately Bullish';
      sentimentClass = styles.positive;
    } else if (bearishPercentage > bullishPercentage + 10) {
      overallSentiment = 'Moderately Bearish';
      sentimentClass = styles.negative;
    }

    return (
      <div>
        <div className={styles.recommendationSummary}>
          <div className={styles.summaryBox}>
            <h5>Current Analyst Consensus</h5>
            <div className={styles.sentimentDisplay}>
              <div className={`${styles.sentimentValue} ${sentimentClass}`}>
                {overallSentiment}
              </div>
              <div className={styles.analystCount}>
                Based on {totalAnalysts} analyst{totalAnalysts !== 1 ? 's' : ''}
              </div>
            </div>
            <div className={styles.sentimentDescription}>
              {overallSentiment === 'Bullish' ? 'Strong buy signals from analysts' :
               overallSentiment === 'Moderately Bullish' ? 'Positive outlook with some caution' :
               overallSentiment === 'Bearish' ? 'Strong sell signals from analysts' :
               overallSentiment === 'Moderately Bearish' ? 'Negative outlook but not extreme' :
               'Mixed or balanced opinions among analysts'}
            </div>
          </div>

          <div className={styles.chartBox}>
            <h5>Recommendation Breakdown</h5>
            <div className={styles.recommendationBar}>
              <div 
                className={`${styles.barSegment} ${styles.strongBuySegment}`} 
                style={{ width: `${Math.round((currentRecommendation.strongBuy / totalAnalysts) * 100)}%` }}
                title={`Strong Buy: ${currentRecommendation.strongBuy} (${Math.round((currentRecommendation.strongBuy / totalAnalysts) * 100)}%)`}
              >
                {currentRecommendation.strongBuy > 0 && 
                  <span className={styles.segmentValue}>{currentRecommendation.strongBuy}</span>
                }
              </div>
              <div 
                className={`${styles.barSegment} ${styles.buySegment}`} 
                style={{ width: `${Math.round((currentRecommendation.buy / totalAnalysts) * 100)}%` }}
                title={`Buy: ${currentRecommendation.buy} (${Math.round((currentRecommendation.buy / totalAnalysts) * 100)}%)`}
              >
                {currentRecommendation.buy > 0 && 
                  <span className={styles.segmentValue}>{currentRecommendation.buy}</span>
                }
              </div>
              <div 
                className={`${styles.barSegment} ${styles.holdSegment}`} 
                style={{ width: `${Math.round((currentRecommendation.hold / totalAnalysts) * 100)}%` }}
                title={`Hold: ${currentRecommendation.hold} (${Math.round((currentRecommendation.hold / totalAnalysts) * 100)}%)`}
              >
                {currentRecommendation.hold > 0 && 
                  <span className={styles.segmentValue}>{currentRecommendation.hold}</span>
                }
              </div>
              <div 
                className={`${styles.barSegment} ${styles.sellSegment}`} 
                style={{ width: `${Math.round((currentRecommendation.sell / totalAnalysts) * 100)}%` }}
                title={`Sell: ${currentRecommendation.sell} (${Math.round((currentRecommendation.sell / totalAnalysts) * 100)}%)`}
              >
                {currentRecommendation.sell > 0 && 
                  <span className={styles.segmentValue}>{currentRecommendation.sell}</span>
                }
              </div>
              <div 
                className={`${styles.barSegment} ${styles.strongSellSegment}`} 
                style={{ width: `${Math.round((currentRecommendation.strongSell / totalAnalysts) * 100)}%` }}
                title={`Strong Sell: ${currentRecommendation.strongSell} (${Math.round((currentRecommendation.strongSell / totalAnalysts) * 100)}%)`}
              >
                {currentRecommendation.strongSell > 0 && 
                  <span className={styles.segmentValue}>{currentRecommendation.strongSell}</span>
                }
              </div>
            </div>
            <div className={styles.legendContainer}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.strongBuyColor}`}></div>
                <span>Strong Buy</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.buyColor}`}></div>
                <span>Buy</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.holdColor}`}></div>
                <span>Hold</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.sellColor}`}></div>
                <span>Sell</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.strongSellColor}`}></div>
                <span>Strong Sell</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tableExplanation}>
          <p>
            <strong>What This Means:</strong> Analyst recommendations represent professional opinions on whether investors should buy, hold, 
            or sell a stock. They are based on fundamental analysis, company performance, and future prospects.
            These recommendations change over time as new information becomes available and market conditions evolve.
          </p>
        </div>

        <div className={styles.reportsTable}>
          <table>
            <thead>
              <tr>
                <th>Time Period</th>
                <th>Strong Buy</th>
                <th>Buy</th>
                <th>Hold</th>
                <th>Sell</th>
                <th>Strong Sell</th>
                <th>Average Rating</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((rec: any, index: number) => {
                // Calculate average rating (1=Strong Buy, 5=Strong Sell)
                const totalRecs = rec.strongBuy + rec.buy + rec.hold + rec.sell + rec.strongSell;
                const avgRating = totalRecs > 0 ? 
                  ((rec.strongBuy * 1) + (rec.buy * 2) + (rec.hold * 3) + (rec.sell * 4) + (rec.strongSell * 5)) / totalRecs : 0;
                
                // Determine sentiment class based on average rating
                const ratingClass = avgRating < 2.5 ? styles.positive : 
                                    avgRating > 3.5 ? styles.negative : 
                                    styles.neutral;
                                    
                // Get rating description
                const ratingDesc = avgRating < 1.5 ? 'Strong Buy' :
                                  avgRating < 2.5 ? 'Buy' :
                                  avgRating < 3.5 ? 'Hold' :
                                  avgRating < 4.5 ? 'Sell' : 'Strong Sell';
                
                return (
                  <tr key={index} className={index === 0 ? styles.currentPeriodRow : ''}>
                    <td><strong>{formatRecommendationPeriod(rec.period)}</strong></td>
                    <td>{rec.strongBuy}</td>
                    <td>{rec.buy}</td>
                    <td>{rec.hold}</td>
                    <td>{rec.sell}</td>
                    <td>{rec.strongSell}</td>
                    <td className={ratingClass}>
                      {avgRating.toFixed(2)} - {ratingDesc}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {recommendations.length > 1 && (
          <div className={styles.trendAnalysis}>
            <h5>Recommendation Trend</h5>
            <p>
              {(() => {
                // Compare current and previous period
                const current = recommendations.find((rec: { period: string; }) => rec.period === '0m') || recommendations[0];
                const previous = recommendations.find((rec: { period: string; }) => rec.period === '-1m') || recommendations[1];
                
                if (!previous) return "No trend data available";
                
                // Calculate current and previous bullishness
                const currentBullish = current.strongBuy + current.buy;
                const previousBullish = previous.strongBuy + previous.buy;
                
                // Calculate current and previous bearishness
                const currentBearish = current.sell + current.strongSell;
                const previousBearish = previous.sell + previous.strongSell;
                
                if (currentBullish > previousBullish) {
                  return (
                    <span className={styles.positive}>
                      Analyst sentiment has become more bullish compared to last month, with an increase in 
                      Buy/Strong Buy recommendations.
                    </span>
                  );
                } else if (currentBearish > previousBearish) {
                  return (
                    <span className={styles.negative}>
                      Analyst sentiment has become more bearish compared to last month, with an increase in 
                      Sell/Strong Sell recommendations.
                    </span>
                  );
                } else if (current.hold > previous.hold) {
                  return (
                    <span className={styles.neutral}>
                      More analysts have moved to a Hold position compared to last month, indicating 
                      increased caution in the market.
                    </span>
                  );
                } else {
                  return "Analyst sentiment has remained relatively stable compared to last month.";
                }
              })()}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render earnings history
  const renderEarningsHistory = () => {
    const earningsHistory = data.earningsHistory?.history || [];
    if (earningsHistory.length === 0) return <div className={styles.noStatementData}>No earnings history available</div>;
    
    // Calculate some summary statistics
    let beatsCount = 0;
    let missesCount = 0;
    earningsHistory.forEach((eh: any) => {
      if (eh.epsDifference > 0) beatsCount++;
      else if (eh.epsDifference < 0) missesCount++;
    });
    
    // Calculate average surprise percentage
    const avgSurprise = earningsHistory.reduce((acc: number, curr: any) => 
      acc + (curr.surprisePercent || 0), 0) / earningsHistory.length;
    
    // Get most recent earnings data
    const latestEarnings = earningsHistory[0];
    const latestQuarter = latestEarnings ? formatDate(latestEarnings.quarter) : 'N/A';
    const latestResult = latestEarnings?.epsDifference > 0 ? 'beat' : 
                        latestEarnings?.epsDifference < 0 ? 'missed' : 'met';

    return (
      <div>
        <div className={styles.earningsSummary}>
          <div className={styles.summaryBox}>
            <h5>Performance Summary</h5>
            <p>In the last {earningsHistory.length} quarters, {symbol} has:</p>
            <ul>
              <li><span className={styles.positive}>Beat expectations</span> {beatsCount} time{beatsCount !== 1 ? 's' : ''}</li>
              <li><span className={styles.negative}>Missed expectations</span> {missesCount} time{missesCount !== 1 ? 's' : ''}</li>
              <li><span className={earningsHistory.length - beatsCount - missesCount > 0 ? styles.neutral : ''}>Met expectations</span> {earningsHistory.length - beatsCount - missesCount} time{earningsHistory.length - beatsCount - missesCount !== 1 ? 's' : ''}</li>
            </ul>
            <p className={styles.quarterSummary}>
              For Q{latestQuarter}, {symbol} {latestResult} analyst expectations 
              {latestEarnings?.epsDifference ? ` by $${Math.abs(latestEarnings.epsDifference).toFixed(2)} per share` : ''}
            </p>
          </div>
          <div className={styles.summaryBox}>
            <h5>Average Surprise</h5>
            <div className={`${styles.surpriseValue} ${avgSurprise > 0 ? styles.positive : styles.negative}`}>
              {(avgSurprise * 100).toFixed(2)}%
            </div>
            <p className={styles.surpriseExplanation}>
              {avgSurprise > 0 
                ? 'Positive surprises indicate the company tends to outperform analyst expectations' 
                : 'Negative surprises indicate the company tends to underperform analyst expectations'}
            </p>
          </div>
        </div>

        <div className={styles.tableExplanation}>
          <p>
            <strong>What This Means:</strong> Earnings history shows how a company has performed relative to analyst expectations.
            A positive surprise (beating estimates) is often viewed favorably, while missing estimates may indicate challenges.
          </p>
        </div>

        <div className={styles.reportsTable}>
          <table>
            <thead>
              <tr>
                <th>Quarter End</th>
                <th>Analyst Estimate</th>
                <th>Actual EPS</th>
                <th>Difference</th>
                <th>% Surprise</th>
              </tr>
            </thead>
            <tbody>
              {earningsHistory.map((eh: any, index: number) => (
                <tr key={index}>
                  <td>{formatDate(eh.quarter)}</td>
                  <td>${eh.epsEstimate?.toFixed(2) || 'N/A'}</td>
                  <td>${eh.epsActual?.toFixed(2) || 'N/A'}</td>
                  <td>
                    {eh.epsDifference > 0 ? 
                      <span className={styles.positive}>+${eh.epsDifference?.toFixed(2) || 'N/A'} ▲</span> : 
                      eh.epsDifference < 0 ?
                      <span className={styles.negative}>${eh.epsDifference?.toFixed(2) || 'N/A'} ▼</span> :
                      <span>${eh.epsDifference?.toFixed(2) || 'N/A'}</span>
                    }
                  </td>
                  <td>
                    {eh.surprisePercent > 0 ? 
                      <span className={styles.positive}>+{(eh.surprisePercent * 100).toFixed(2)}% ▲</span> : 
                      eh.surprisePercent < 0 ?
                      <span className={styles.negative}>{(eh.surprisePercent * 100).toFixed(2)}% ▼</span> :
                      <span>{(eh.surprisePercent * 100).toFixed(2)}%</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render earnings forecast
  const renderEarningsForecast = () => {
    const earningsTrend = data.earningsTrend?.trend || [];
    if (earningsTrend.length === 0) return <div className={styles.noStatementData}>No earnings forecast available</div>;

    // Function to convert period code to more descriptive text
    const getDescriptivePeriod = (periodCode: string) => {
      switch(periodCode) {
        case '0q': return 'Current Quarter';
        case '+1q': return 'Next Quarter';
        case '0y': return 'Current Year';
        case '+1y': return 'Next Year';
        case '+2y': return 'Year After Next';
        default: return periodCode;
      }
    };
    
    // Find current quarter and year forecasts if they exist
    const currentQuarter = earningsTrend.find((et: { period: string; }) => et.period === '0q');
    const nextQuarter = earningsTrend.find((et: { period: string; }) => et.period === '+1q');
    const currentYear = earningsTrend.find((et: { period: string; }) => et.period === '0y');
    const nextYear = earningsTrend.find((et: { period: string; }) => et.period === '+1y');

    return (
      <div>
        <div className={styles.forecastSummary}>
          <div className={styles.highlightBox}>
            <h5>Earnings Outlook</h5>
            {currentQuarter && (
              <div className={styles.keyMetric}>
                <span className={styles.metricLabel}>Current Quarter EPS:</span>
                <span className={styles.metricValue}>${currentQuarter.earningsEstimate?.avg?.toFixed(2) || 'N/A'}</span>
                {currentQuarter.earningsEstimate?.growth && (
                  <span className={`${styles.growthTag} ${currentQuarter.earningsEstimate?.growth > 0 ? styles.positive : styles.negative}`}>
                    {currentQuarter.earningsEstimate?.growth > 0 ? '+' : ''}
                    {(currentQuarter.earningsEstimate?.growth * 100).toFixed(2)}% YoY
                  </span>
                )}
              </div>
            )}
            {currentYear && (
              <div className={styles.keyMetric}>
                <span className={styles.metricLabel}>Current Year EPS:</span>
                <span className={styles.metricValue}>${currentYear.earningsEstimate?.avg?.toFixed(2) || 'N/A'}</span>
                {currentYear.earningsEstimate?.growth && (
                  <span className={`${styles.growthTag} ${currentYear.earningsEstimate?.growth > 0 ? styles.positive : styles.negative}`}>
                    {currentYear.earningsEstimate?.growth > 0 ? '+' : ''}
                    {(currentYear.earningsEstimate?.growth * 100).toFixed(2)}% YoY
                  </span>
                )}
              </div>
            )}
            <div className={styles.analystConsensus}>
              <p>Based on {currentQuarter?.earningsEstimate?.numberOfAnalysts || 'N/A'} analysts for current quarter</p>
            </div>
          </div>
          
          <div className={styles.growthProjection}>
            <h5>Growth Projection</h5>
            {nextYear && currentYear && nextYear.earningsEstimate?.avg && currentYear.earningsEstimate?.avg && (
              <div className={styles.growthChart}>
                <div className={styles.yearLabel}>Current Year</div>
                <div className={styles.yearValue}>${currentYear.earningsEstimate?.avg?.toFixed(2)}</div>
                <div className={styles.growthArrow}>
                  {nextYear.earningsEstimate?.avg > currentYear.earningsEstimate?.avg ? '↗️' : '↘️'}
                </div>
                <div className={styles.yearLabel}>Next Year</div>
                <div className={styles.yearValue}>${nextYear.earningsEstimate?.avg?.toFixed(2)}</div>
                <div className={styles.growthPercentage}>
                  {((nextYear.earningsEstimate?.avg / currentYear.earningsEstimate?.avg - 1) * 100).toFixed(2)}% change
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.tableExplanation}>
          <p>
            <strong>What This Means:</strong> Earnings forecasts show what analysts expect the company to earn in future periods.
            Higher analyst count typically indicates more reliable estimates. Growth rates compare to the same period last year.
          </p>
        </div>

        <div className={styles.reportsTable}>
          <table>
            <thead>
              <tr>
                <th>Time Period</th>
                <th>Average EPS Estimate</th>
                <th>Year-over-Year Growth</th>
                <th>Lowest Estimate</th>
                <th>Highest Estimate</th>
                <th>Number of Analysts</th>
              </tr>
            </thead>
            <tbody>
              {earningsTrend.map((et: any, index: number) => (
                <tr key={index}>
                  <td><strong>{getDescriptivePeriod(et.period)}</strong></td>
                  <td>${et.earningsEstimate?.avg?.toFixed(2) || 'N/A'}</td>
                  <td>
                    {et.earningsEstimate?.growth !== undefined ? (
                      <span className={et.earningsEstimate?.growth > 0 ? styles.positive : styles.negative}>
                        {et.earningsEstimate?.growth > 0 ? '+' : ''}
                        {(et.earningsEstimate?.growth * 100).toFixed(2)}% 
                        {et.earningsEstimate?.growth > 0 ? ' ▲' : ' ▼'}
                      </span>
                    ) : 'N/A'}
                  </td>
                  <td>${et.earningsEstimate?.low?.toFixed(2) || 'N/A'}</td>
                  <td>${et.earningsEstimate?.high?.toFixed(2) || 'N/A'}</td>
                  <td>
                    {et.earningsEstimate?.numberOfAnalysts || 'N/A'}
                    {et.earningsEstimate?.numberOfAnalysts > 10 ? 
                      <span className={styles.confidenceTag}>High Coverage</span> : 
                      et.earningsEstimate?.numberOfAnalysts > 5 ?
                      <span className={styles.confidenceTag}>Medium Coverage</span> :
                      <span className={styles.lowConfidenceTag}>Low Coverage</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render upcoming earnings dates
  const renderCalendarEvents = () => {
    const calendarEvents = data.calendarEvents || {};
    
    if (!calendarEvents.earnings?.earningsDate || calendarEvents.earnings.earningsDate.length === 0) {
      return <div className={styles.noStatementData}>No upcoming events available</div>;
    }

    return (
      <div className={styles.eventsContainer}>
        <div className={styles.eventCards}>
          {calendarEvents.earnings?.earningsDate && (
            <div className={styles.eventCard}>
              <div className={styles.eventType}>Earnings Announcement</div>
              <div className={styles.eventDetails}>
                <p>
                  <span className={styles.eventLabel}>Date:</span>
                  <span className={styles.eventValue}>
                    {formatDate(calendarEvents.earnings.earningsDate[0])}
                  </span>
                </p>
                {calendarEvents.earnings.earningsAverage && (
                  <p>
                    <span className={styles.eventLabel}>EPS Estimate:</span>
                    <span className={styles.eventValue}>
                      ${calendarEvents.earnings.earningsAverage.toFixed(2)}
                    </span>
                  </p>
                )}
                {calendarEvents.earnings.revenueAverage && (
                  <p>
                    <span className={styles.eventLabel}>Revenue Estimate:</span>
                    <span className={styles.eventValue}>
                      ${(calendarEvents.earnings.revenueAverage/1000000).toFixed(2)}M
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          {calendarEvents.dividendDate && (
            <div className={styles.eventCard}>
              <div className={styles.eventType}>Dividend Payment</div>
              <div className={styles.eventDetails}>
                <p>
                  <span className={styles.eventLabel}>Date:</span>
                  <span className={styles.eventValue}>
                    {formatDate(calendarEvents.dividendDate)}
                  </span>
                </p>
                {calendarEvents.exDividendDate && (
                  <p>
                    <span className={styles.eventLabel}>Ex-Dividend Date:</span>
                    <span className={styles.eventValue}>
                      {formatDate(calendarEvents.exDividendDate)}
                    </span>
                  </p>
                )}
                {calendarEvents.dividendRate && (
                  <p>
                    <span className={styles.eventLabel}>Dividend Rate:</span>
                    <span className={styles.eventValue}>
                      ${calendarEvents.dividendRate.toFixed(2)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Loading and error state handling
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading analysis data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <p>{error}</p>
        <button 
          className={styles.retryButton} 
          onClick={() => {
            setError(null);
            setLoading(true);
            // Re-fetch data logic
            const fetchData = async () => {
              try {
                const modules = [
                  'recommendationTrend', 
                  'earningsHistory', 
                  'earningsTrend',
                  'calendarEvents'
                ];
                
                const response = await fetchAnalysisData(symbol, modules);
                setData(response);
                setLoading(false);
              } catch (err) {
                setError('Failed to fetch analysis data');
                setLoading(false);
                console.error(err);
              }
            };
            
            if (symbol) {
              fetchData();
            }
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Recommendations Card */}
      <div className={styles.analysisCard}>
        <div className={styles.sectionHeadingWithInfo}>
          <h3>Analyst Recommendations</h3>
        </div>
        <p className={styles.sectionDescription}>
          {getSectionDescription('recommendations')}
        </p>
        {renderRecommendations()}
      </div>
      
      {/* Earnings History Card */}
      <div className={styles.analysisCard}>
        <div className={styles.sectionHeadingWithInfo}>
          <h3>Earnings History</h3>
        </div>
        <p className={styles.sectionDescription}>
          {getSectionDescription('earningsHistory')}
        </p>
        {renderEarningsHistory()}
      </div>
      
      {/* Earnings Forecast Card */}
      <div className={styles.analysisCard}>
        <div className={styles.sectionHeadingWithInfo}>
          <h3>Earnings Forecast</h3>
        </div>
        <p className={styles.sectionDescription}>
          {getSectionDescription('earningsForecast')}
        </p>
        {renderEarningsForecast()}
      </div>
      
      {/* Calendar Events Card */}
      <div className={styles.analysisCard}>
        <div className={styles.sectionHeadingWithInfo}>
          <h3>Calendar Events</h3>
        </div>
        <p className={styles.sectionDescription}>
          {getSectionDescription('calendarEvents')}
        </p>
        {renderCalendarEvents()}
      </div>
    </div>
  );
};

export default AnalysisTools;
