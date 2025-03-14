import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../../styles/Analyses.module.css';

interface CompanyProfileProps {
  symbol: string;
}

interface SummaryProfile {
  address1?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  website?: string;
  industry?: string;
  sector?: string;
  longBusinessSummary?: string;
  fullTimeEmployees?: number;
}

const CompanyProfile: React.FC<CompanyProfileProps> = ({ symbol }) => {
  const [profileData, setProfileData] = useState<SummaryProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false); // Initially collapsed

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Updated to use port 3001 explicitly
        const response = await axios.get(`http://localhost:3001/api/finance/quoteSummary`, {
          params: {
            symbol,
            modules: 'summaryProfile'
          }
        });
        
        if (response.data.summaryProfile) {
          setProfileData(response.data.summaryProfile);
        } else {
          setError('No profile data available for this company');
        }
      } catch (err) {
        setError('Error fetching company profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [symbol]);

  // Return null (nothing) if there's an error
  if (error) return null;
  
  if (loading) return <div className={styles.loadingContainer}>Loading company profile...</div>;
  if (!profileData) return null;

  const formatAddress = () => {
    const parts = [];
    if (profileData.address1) parts.push(profileData.address1);
    
    let cityStateZip = '';
    if (profileData.city) cityStateZip += profileData.city;
    if (profileData.state) cityStateZip += cityStateZip ? `, ${profileData.state}` : profileData.state;
    if (profileData.zip) cityStateZip += cityStateZip ? ` ${profileData.zip}` : profileData.zip;
    
    if (cityStateZip) parts.push(cityStateZip);
    if (profileData.country) parts.push(profileData.country);
    
    return parts.join(', ');
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  // Handler for toggling expanded/collapsed state
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.companyProfileContainer}>
      <div 
        className={styles.companyProfileHeader} 
        onClick={toggleExpand}
      >
        <h2>Company Profile</h2>
        <div className={styles.expandIcon}>
          {isExpanded ? '▼' : '►'}
        </div>
      </div>
      
      {isExpanded && (
        <div className={styles.profileContent}>
          <div className={styles.profileSummary}>
            {profileData.sector && profileData.industry && (
              <div className={styles.industryInfo}>
                <span>{profileData.sector}</span> • <span>{profileData.industry}</span>
              </div>
            )}
            {profileData.longBusinessSummary && (
              <div className={styles.businessSummary}>
                <p>{profileData.longBusinessSummary}</p>
              </div>
            )}
          </div>
          
          <div className={styles.profileDetails}>
            <div className={styles.detailsGrid}>
              {profileData.website && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Website</span>
                  <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                    {profileData.website.replace(/(^\w+:|^)\/\//, '')}
                  </a>
                </div>
              )}
              {formatAddress() && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Headquarters</span>
                  <span>{formatAddress()}</span>
                </div>
              )}
              {profileData.phone && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Phone</span>
                  <span>{profileData.phone}</span>
                </div>
              )}
              {profileData.fullTimeEmployees && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Employees</span>
                  <span>{formatNumber(profileData.fullTimeEmployees)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
