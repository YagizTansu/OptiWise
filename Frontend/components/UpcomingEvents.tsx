import { useEffect, useState } from 'react';
import { fetchAnalysisData } from '../services/api/finance';
import styles from '../styles/UpcomingEvents.module.css';
import { FaExclamationCircle, FaCalendarAlt, FaClock } from 'react-icons/fa';

interface UpcomingEventsProps {
  symbol: string;
}

interface EventData {
  type: string;
  date: Date;
  formatted: string;
  daysRemaining: number;
  details?: {
    earningsAverage?: number;
    earningsLow?: number;
    earningsHigh?: number;
    revenueAverage?: number;
    revenueLow?: number;
    revenueHigh?: number;
  };
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ symbol }) => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await fetchAnalysisData(symbol, ['calendarEvents']);
                
        // Check if calendarEvents data exists
        if (data && data.calendarEvents) {
          const upcomingEvents: EventData[] = [];
          const now = new Date();
          
          // Add earnings date if available
          if (data.calendarEvents.earnings && data.calendarEvents.earnings.earningsDate) {
            // Handle earningsDate which can be an array of strings or a single string
            const earningsDates = Array.isArray(data.calendarEvents.earnings.earningsDate) 
              ? data.calendarEvents.earnings.earningsDate 
              : [data.calendarEvents.earnings.earningsDate];
              
            earningsDates.forEach((dateStr: string) => {
              if (dateStr) {
                const date = new Date(dateStr);
                
                if (!isNaN(date.getTime()) && date > now) {
                  // Calculate days remaining
                  const daysRemaining = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  
                  upcomingEvents.push({
                    type: 'Earnings',
                    date: date,
                    formatted: date.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }),
                    daysRemaining: daysRemaining,
                    details: {
                      earningsAverage: data.calendarEvents.earnings.earningsAverage,
                      earningsLow: data.calendarEvents.earnings.earningsLow,
                      earningsHigh: data.calendarEvents.earnings.earningsHigh,
                      revenueAverage: data.calendarEvents.earnings.revenueAverage,
                      revenueLow: data.calendarEvents.earnings.revenueLow,
                      revenueHigh: data.calendarEvents.earnings.revenueHigh
                    }
                  });
                }
              }
            });
          }
          
          // Add ex-dividend date if available
          if (data.calendarEvents.exDividendDate) {
            const date = new Date(data.calendarEvents.exDividendDate);
            
            if (!isNaN(date.getTime()) && date > now) {
              // Calculate days remaining
              const daysRemaining = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              upcomingEvents.push({
                type: 'Ex-Dividend',
                date: date,
                formatted: date.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                }),
                daysRemaining: daysRemaining
              });
            }
          }
          
          // Add dividend date if available
          if (data.calendarEvents.dividendDate) {
            const date = new Date(data.calendarEvents.dividendDate);
            
            if (!isNaN(date.getTime()) && date > now) {
              // Calculate days remaining
              const daysRemaining = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              
              upcomingEvents.push({
                type: 'Dividend',
                date: date,
                formatted: date.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                }),
                daysRemaining: daysRemaining
              });
            }
          }
          
          // Sort events by date (closest first)
          upcomingEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
          
          setEvents(upcomingEvents);
        } else {
        }
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        setError('Failed to load upcoming events');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [symbol]);

  useEffect(() => {
    // Check if we're on a mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Format currency value in a more readable way
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined) return 'N/A';
    
    // Format to currency in millions or billions with proper spacing
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)} B`;
    } else if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)} M`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  };
  
  if (loading) return <div className={styles.eventsLoading}>Preparing upcoming events...</div>;
  if (error) {
    console.error('UpcomingEvents error:', error);
    return null;
  }
  
  // Don't render anything if there are no events
  if (events.length === 0) {
    return null;
  }
  
  return (
    <div className={styles.upcomingEvents}>
      {events.map((event, index) => (
        <div 
          key={index} 
          className={styles.eventItem}
          onMouseEnter={() => !isMobile && setHoveredEvent(index)}
          onMouseLeave={() => !isMobile && setHoveredEvent(null)}
          onClick={() => isMobile && setHoveredEvent(hoveredEvent === index ? null : index)}
        >
          <FaExclamationCircle className={styles.exclamationIcon} />
          <div className={styles.eventContent}>
            <div className={styles.eventHeader}>
              <div className={styles.eventTypeAndDate}>
                <span className={styles.eventType}>{event.type}</span>
                <span className={styles.eventDate}>{event.formatted}</span>
                <span className={styles.daysRemaining}>
                  ({event.daysRemaining === 0 ? 'Today' : 
                   event.daysRemaining === 1 ? 'Tomorrow' : 
                   `${event.daysRemaining} days`})
                </span>
              </div>
              {event.daysRemaining <= 7 && (
                <span className={styles.upcomingTag}>Soon</span>
              )}
            </div>

            {/* Show details on hover for desktop, on click for mobile */}
            {hoveredEvent === index && event.type === 'Earnings' && event.details && (
              <div className={styles.eventDetailsPopup}>
                <p>Est. EPS: {event.details.earningsAverage?.toFixed(2) || 'N/A'} ({event.details.earningsLow?.toFixed(2) || 'N/A'} - {event.details.earningsHigh?.toFixed(2) || 'N/A'})</p>
                <p>Est. Revenue: {formatCurrency(event.details.revenueAverage)}</p>
                {isMobile && <p style={{textAlign: 'center', marginTop: '10px', color: '#666', fontSize: '0.8rem'}}>Tap to close</p>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingEvents;
