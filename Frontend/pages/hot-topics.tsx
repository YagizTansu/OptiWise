import { useState, useEffect } from 'react';
import Head from 'next/head';
import { FaFire, FaChartLine, FaTag, FaCalendarAlt, FaNewspaper, FaExternalLinkAlt, FaFilter, FaSearch, FaSort, FaCaretUp, FaTwitter, FaReddit, FaGlobe, FaLightbulb, FaInfoCircle } from 'react-icons/fa';
import styles from '../styles/HotTopics.module.css';
import Layout from '../components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

// Types for our data
interface TopicData {
  id: number;
  title: string;
  description: string;
  relevanceScore: number;
  trendDirection: 'up' | 'down' | 'stable';
  trendChange: number;
  category: string;
  tags: string[];
  date: string;
  source: string;
  sourceType: 'news' | 'social' | 'research';
  url: string;
}

// Mock data for trending topics
const mockTopics: TopicData[] = [
  {
    id: 1,
    title: "AI Semiconductor Demand Surge",
    description: "Demand for AI-optimized semiconductors continues to outpace supply, with data center operators reporting extended lead times for advanced GPU clusters. Analysts predict this trend will continue through 2024.",
    relevanceScore: 92,
    trendDirection: 'up',
    trendChange: 28,
    category: "Technology",
    tags: ["Semiconductors", "AI", "Supply Chain"],
    date: "2023-10-18",
    source: "Bloomberg Technology",
    sourceType: "news",
    url: "#"
  },
  {
    id: 2,
    title: "Clean Energy Infrastructure Bill",
    description: "The proposed $1.2 trillion infrastructure bill allocates $380 billion for clean energy initiatives, potentially creating significant opportunities for companies in renewable energy, grid modernization, and EV infrastructure.",
    relevanceScore: 86,
    trendDirection: 'up',
    trendChange: 15,
    category: "Energy",
    tags: ["Renewable Energy", "Policy", "Infrastructure"],
    date: "2023-10-17",
    source: "Financial Times",
    sourceType: "news",
    url: "#"
  },
  {
    id: 3,
    title: "Central Bank Digital Currencies (CBDCs)",
    description: "Major central banks accelerate CBDC development with China's digital yuan pilot expanding and the ECB moving forward with the digital euro. This trend has significant implications for financial institutions and payment processors.",
    relevanceScore: 81,
    trendDirection: 'up',
    trendChange: 12,
    category: "Finance",
    tags: ["Digital Currencies", "Central Banks", "Monetary Policy"],
    date: "2023-10-15",
    source: "The Economist",
    sourceType: "news",
    url: "#"
  },
  {
    id: 4,
    title: "Commercial Real Estate Stress",
    description: "Office vacancies in major cities continue to rise, with downtown office buildings in some markets seeing vacancy rates exceed 25%. This trend is driving REIT restructuring and creating distressed asset opportunities.",
    relevanceScore: 78,
    trendDirection: 'down',
    trendChange: -8,
    category: "Real Estate",
    tags: ["Commercial Property", "REITs", "Urban Development"],
    date: "2023-10-14",
    source: "r/RealEstateInvesting",
    sourceType: "social",
    url: "#"
  },
  {
    id: 5,
    title: "Healthcare AI Regulatory Framework",
    description: "New regulatory guidelines for AI in healthcare are expected within 90 days, potentially accelerating approval pathways for AI-based diagnostic tools while establishing clearer compliance requirements.",
    relevanceScore: 75,
    trendDirection: 'up',
    trendChange: 9,
    category: "Healthcare",
    tags: ["Regulation", "AI", "MedTech"],
    date: "2023-10-16",
    source: "Healthcare Innovation Report",
    sourceType: "research",
    url: "#"
  },
  {
    id: 6,
    title: "Supply Chain Reshoring",
    description: "Manufacturing reshoring trend accelerates with 60% of surveyed multinational corporations planning to relocate at least part of their supply chain closer to end markets within 24 months.",
    relevanceScore: 73,
    trendDirection: 'up',
    trendChange: 5,
    category: "Manufacturing",
    tags: ["Supply Chain", "Manufacturing", "Global Trade"],
    date: "2023-10-12",
    source: "Manufacturing Executive Survey",
    sourceType: "research",
    url: "#"
  },
  {
    id: 7,
    title: "Quantum Computing Commercial Applications",
    description: "Quantum computing moves toward practical use cases with financial services firms experimenting with portfolio optimization algorithms showing 30% efficiency improvements in early trials.",
    relevanceScore: 68,
    trendDirection: 'stable',
    trendChange: 2,
    category: "Technology",
    tags: ["Quantum Computing", "Financial Technology", "Research"],
    date: "2023-10-10",
    source: "Twitter Trending",
    sourceType: "social",
    url: "#"
  },
  {
    id: 8,
    title: "Agricultural Technology Water Optimization",
    description: "Precision agriculture technologies focused on water conservation are seeing rapid adoption in drought-affected regions, with smart irrigation systems reporting 40% water usage reduction while maintaining yields.",
    relevanceScore: 65,
    trendDirection: 'up',
    trendChange: 11,
    category: "Agriculture",
    tags: ["AgTech", "Sustainability", "Resource Management"],
    date: "2023-10-13",
    source: "Agricultural Innovation Forum",
    sourceType: "research",
    url: "#"
  }
];

// Array of available categories for filtering
const categories = [...new Set(mockTopics.map(topic => topic.category))];

export default function HotTopics() {
  const [topics, setTopics] = useState<TopicData[]>(mockTopics);
  const [filteredTopics, setFilteredTopics] = useState<TopicData[]>(mockTopics);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTopic, setSelectedTopic] = useState<TopicData | null>(null);

  // Filter and sort topics whenever filter conditions change
  useEffect(() => {
    let results = [...topics];
    
    // Apply category filter
    if (selectedCategory) {
      results = results.filter(topic => topic.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        topic => 
          topic.title.toLowerCase().includes(query) ||
          topic.description.toLowerCase().includes(query) ||
          topic.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    results.sort((a, b) => {
      if (sortBy === 'relevance') {
        return sortOrder === 'desc' 
          ? b.relevanceScore - a.relevanceScore 
          : a.relevanceScore - b.relevanceScore;
      } else {
        return sortOrder === 'desc' 
          ? new Date(b.date).getTime() - new Date(a.date).getTime()
          : new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });
    
    setFilteredTopics(results);
    
    // Set default selected topic if none is selected
    if (!selectedTopic && results.length > 0) {
      setSelectedTopic(results[0]);
    }
  }, [topics, searchQuery, selectedCategory, sortBy, sortOrder]);

  // Get source icon based on source type
  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'news':
        return <FaNewspaper />;
      case 'social':
        return sourceType.includes('Twitter') ? <FaTwitter /> : 
               sourceType.includes('Reddit') ? <FaReddit /> : <FaGlobe />;
      case 'research':
        return <FaLightbulb />;
      default:
        return <FaGlobe />;
    }
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Change sort field
  const changeSortBy = (field: 'relevance' | 'date') => {
    if (sortBy === field) {
      toggleSortOrder();
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <Layout>
      <ProtectedRoute>
        <div className={styles.container}>
          <Head>
            <title>Hot Topics | OptiWise</title>
            <meta name="description" content="Trending market topics and investment themes" />
          </Head>

          <header className={styles.header}>
            <div className={styles.iconContainer}>
              <FaFire className={styles.headerIcon} />
            </div>
            <div>
              <h1 className={styles.title}>Hot Topics</h1>
              <p className={styles.subtitle}>
                Trending market topics and investment themes
              </p>
            </div>
          </header>

          <main className={styles.main}>
            <div className={styles.filtersContainer}>
              <div className={styles.searchContainer}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search topics, tags, or keywords..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className={styles.filterControls}>
                <div className={styles.categoryFilter}>
                  <FaFilter className={styles.filterIcon} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={styles.selectFilter}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div className={styles.sortButtons}>
                  <button 
                    className={`${styles.sortButton} ${sortBy === 'relevance' ? styles.active : ''}`}
                    onClick={() => changeSortBy('relevance')}
                  >
                    <FaSort className={styles.sortIcon} />
                    Relevance
                    {sortBy === 'relevance' && (
                      <span className={styles.sortDirection}>
                        {sortOrder === 'desc' ? '↓' : '↑'}
                      </span>
                    )}
                  </button>
                  
                  <button 
                    className={`${styles.sortButton} ${sortBy === 'date' ? styles.active : ''}`}
                    onClick={() => changeSortBy('date')}
                  >
                    <FaCalendarAlt className={styles.sortIcon} />
                    Date
                    {sortBy === 'date' && (
                      <span className={styles.sortDirection}>
                        {sortOrder === 'desc' ? '↓' : '↑'}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className={styles.contentLayout}>
              <div className={styles.topicsList}>
                {filteredTopics.length === 0 ? (
                  <div className={styles.noResults}>
                    <p>No topics found matching your criteria.</p>
                  </div>
                ) : (
                  <>
                    {filteredTopics.map(topic => (
                      <div 
                        key={topic.id}
                        className={`${styles.topicItem} ${selectedTopic?.id === topic.id ? styles.selectedTopic : ''}`}
                        onClick={() => setSelectedTopic(topic)}
                      >
                        <div className={styles.topicHeader}>
                          <h3 className={styles.topicTitle}>{topic.title}</h3>
                          <div 
                            className={`${styles.relevanceBadge} ${
                              topic.relevanceScore >= 80 ? styles.highRelevance :
                              topic.relevanceScore >= 60 ? styles.mediumRelevance : 
                              styles.lowRelevance
                            }`}
                          >
                            {topic.relevanceScore}
                          </div>
                        </div>
                        
                        <div className={styles.topicMeta}>
                          <span className={styles.topicCategory}>{topic.category}</span>
                          <span className={styles.topicDate}>
                            <FaCalendarAlt className={styles.metaIcon} />
                            {new Date(topic.date).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className={styles.trendIndicator}>
                          <span 
                            className={`${styles.trendArrow} ${
                              topic.trendDirection === 'up' ? styles.trendUp : 
                              topic.trendDirection === 'down' ? styles.trendDown : 
                              styles.trendStable
                            }`}
                          >
                            {topic.trendDirection === 'up' ? '↑' : 
                             topic.trendDirection === 'down' ? '↓' : '→'}
                          </span>
                          <span 
                            className={`${styles.trendValue} ${
                              topic.trendChange > 0 ? styles.trendUp : 
                              topic.trendChange < 0 ? styles.trendDown : 
                              styles.trendStable
                            }`}
                          >
                            {topic.trendChange > 0 ? '+' : ''}{topic.trendChange}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
              
              {selectedTopic && (
                <div className={styles.topicDetails}>
                  <div className={styles.detailsHeader}>
                    <h2>{selectedTopic.title}</h2>
                    <div className={styles.detailsMeta}>
                      <div className={styles.metaItem}>
                        <FaCalendarAlt className={styles.metaIcon} />
                        <span>{new Date(selectedTopic.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      
                      <div className={styles.metaItem}>
                        {getSourceIcon(selectedTopic.sourceType)}
                        <span>{selectedTopic.source}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.relevanceCard}>
                    <div className={styles.relevanceHeader}>
                      <h3>Topic Relevance</h3>
                      <div 
                        className={`${styles.relevanceScore} ${
                          selectedTopic.relevanceScore >= 80 ? styles.highRelevance :
                          selectedTopic.relevanceScore >= 60 ? styles.mediumRelevance : 
                          styles.lowRelevance
                        }`}
                      >
                        {selectedTopic.relevanceScore}/100
                      </div>
                    </div>
                    
                    <div className={styles.relevanceBar}>
                      <div 
                        className={styles.relevanceFill} 
                        style={{ width: `${selectedTopic.relevanceScore}%` }}
                      ></div>
                    </div>
                    
                    <div className={styles.trendInfo}>
                      <span>Trend</span>
                      <div 
                        className={`${styles.trendBadge} ${
                          selectedTopic.trendDirection === 'up' ? styles.trendUpBg : 
                          selectedTopic.trendDirection === 'down' ? styles.trendDownBg : 
                          styles.trendStableBg
                        }`}
                      >
                        {selectedTopic.trendDirection === 'up' ? (
                          <><FaCaretUp /> Rising </>
                        ) : selectedTopic.trendDirection === 'down' ? (
                          <><FaCaretUp className={styles.rotateDown} /> Falling </>
                        ) : (
                          <>— Stable </>
                        )}
                        ({selectedTopic.trendChange > 0 ? '+' : ''}{selectedTopic.trendChange}%)
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.descriptionSection}>
                    <p className={styles.description}>
                      {selectedTopic.description}
                    </p>
                  </div>
                  
                  <div className={styles.tagsSection}>
                    <h3>Related Tags</h3>
                    <div className={styles.tagsList}>
                      {selectedTopic.tags.map((tag, index) => (
                        <div key={index} className={styles.tag}>
                          <FaTag className={styles.tagIcon} />
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.actionSection}>
                    <a href={selectedTopic.url} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
                      <FaExternalLinkAlt className={styles.linkIcon} />
                      View Source
                    </a>
                    
                    <a href="#" className={styles.analyzeLink}>
                      <FaChartLine className={styles.linkIcon} />
                      Analyze Impact
                    </a>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}
