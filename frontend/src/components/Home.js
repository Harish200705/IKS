import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { detectLanguage } from '../utils/languageDetection';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import './Home.css';

const Home = () => {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [diseases, setDiseases] = useState([]);
  const [allDiseases, setAllDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('cowAndBuffalo');
  const [detectedLanguage, setDetectedLanguage] = useState('en');

  // Re-search when language changes (if there's an active search)
  // But don't override if language was auto-detected from search
  useEffect(() => {
    // Only re-search if language was manually changed (not auto-detected)
    // This prevents infinite loops when auto-detecting language
    if (query.trim() && currentLanguage !== detectedLanguage) {
      // Small delay to allow language change to complete
      const timeoutId = setTimeout(() => {
        performSearch(query, null, filter, currentLanguage);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [currentLanguage]);

  // Helper function to check if a field has content
  const hasContent = (field) => {
    if (!field) return false;
    if (typeof field === 'string') return field.trim() !== '';
    if (Array.isArray(field)) {
      return field.length > 0 && field.some(item => {
        if (!item) return false;
        if (typeof item === 'string') return item.trim() !== '';
        if (Array.isArray(item)) return item.length > 0;
        return true;
      });
    }
    return true;
  };
  
  // Helper function to convert field to searchable string
  const fieldToString = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (Array.isArray(field)) {
      return field.map(item => {
        if (typeof item === 'string') return item;
        if (Array.isArray(item)) return item.join(' ');
        return String(item);
      }).join(' ');
    }
    return String(field);
  };

  // Real-time search function
  const performSearch = async (searchQuery, category, filterType, forceLanguage = null) => {
    if (!searchQuery.trim()) {
      setDiseases([]);
      setDetectedLanguage('en');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Detect language from search query
      const detectedLang = detectLanguage(searchQuery);
      setDetectedLanguage(detectedLang);
      
      // Use detected language for filtering collections, but allow forceLanguage override
      const searchLanguage = forceLanguage || detectedLang || currentLanguage;
      
      // Auto-change page language if detected language is different from current
      if (!forceLanguage && detectedLang && detectedLang !== currentLanguage) {
        changeLanguage(detectedLang);
      }
      
      // Search all collections by default - pass detected/selected language to filter collections
      const response = await axios.get(`${API_BASE_URL}/search?query=${encodeURIComponent(searchQuery)}&language=${searchLanguage}`);
      
      const searchResults = response.data.results || response.data;
      const responseDetectedLanguage = response.data.detectedLanguage || searchLanguage;
      
      setDetectedLanguage(responseDetectedLanguage);
      
      const uniqueDiseases = searchResults.filter((disease, index, self) => {
        const diseaseName = disease["Disease Name"]?.toLowerCase().trim();
        if (!diseaseName) return true;
        
        return index === self.findIndex(d => {
          const otherDiseaseName = d["Disease Name"]?.toLowerCase().trim();
          return otherDiseaseName === diseaseName;
        });
      });
      
      setDiseases(uniqueDiseases);
    } catch (err) {
      console.error('Search error:', err);
      if (err.response) {
        setError(`Search failed: ${err.response.data?.message || err.response.statusText || 'Please try again.'}`);
      } else if (err.request) {
        setError('Cannot connect to server. Please check your internet connection.');
      } else {
        setError('Search failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch all diseases
  const fetchAllDiseases = async () => {
    setLoading(true);
    setError(null);
    try {
      // Search all collections for current language - pass language to filter collections
      const response = await axios.get(`${API_BASE_URL}/search?query=&language=${currentLanguage}`);
      const searchResults = response.data.results || response.data;
      
      const uniqueDiseases = searchResults.filter((disease, index, self) => {
        const diseaseName = disease["Disease Name"]?.toLowerCase().trim();
        if (!diseaseName) return true;
        
        return index === self.findIndex(d => {
          const otherDiseaseName = d["Disease Name"]?.toLowerCase().trim();
          return otherDiseaseName === diseaseName;
        });
      });
      
      setAllDiseases(uniqueDiseases);
      setDiseases(uniqueDiseases);
    } catch (err) {
      console.error('Fetch all diseases error:', err);
      setError('Failed to load diseases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect - triggers on typing
  useEffect(() => {
    if (query.trim()) {
      // Set hasSearched immediately when user starts typing
      if (!hasSearched) {
        setHasSearched(true);
      }
      
      const timeoutId = setTimeout(() => {
        performSearch(query, null, filter);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else if (hasSearched && query === '') {
      // If user clears the search, transition back to previous state
      setHasSearched(false);
      setDiseases([]);
      setAllDiseases([]);
    }
  }, [query, selectedCategory, filter]);

  const handleSearchInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }
    // Search is now handled by useEffect when typing
  };

  const handleGetAllDiseases = () => {
    // Navigate to the AllDiseases page
    navigate('/all-diseases');
  };

  const handleShowAllDiseases = () => {
    setQuery('');
    fetchAllDiseases();
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (hasSearched) {
      if (query.trim()) {
        performSearch(query, null, filter);
      } else {
        fetchAllDiseases();
      }
    }
  };

  const filteredDiseases = useMemo(() => {
    if (!hasSearched) return [];
    
    if (!query.trim()) {
      return diseases;
    }
    
    return diseases.filter(disease => {
      const searchQuery = query.toLowerCase();
      
      if (filter === 'all') {
        const searchableFields = [
          disease["Disease Name"],
          disease["Symptoms"],
          disease["Causes"],
          disease["Treatment Name"],
          disease["Ingredients"],
          disease["Preparation Method"],
          disease["Dosage"]
        ].filter(hasContent);
        
        return searchableFields.some(field => {
          const fieldStr = fieldToString(field);
          return fieldStr.toLowerCase().includes(searchQuery);
        });
      }
      
      if (filter === 'name') {
        if (!hasContent(disease["Disease Name"])) return false;
        const nameStr = fieldToString(disease["Disease Name"]);
        return nameStr.toLowerCase().includes(searchQuery);
      }
      
      if (filter === 'symptoms') {
        if (!hasContent(disease["Symptoms"])) return false;
        const symptomsStr = fieldToString(disease["Symptoms"]);
        return symptomsStr.toLowerCase().includes(searchQuery);
      }
      
      return false;
    });
  }, [diseases, query, filter, hasSearched, fieldToString, hasContent]);

  return (
    <div className={`home-container ${hasSearched ? 'searched' : ''}`}>
      <div className="home-background"></div>
      
      <div className={`home-content ${hasSearched ? 'searched' : ''}`}>
        {/* Heading - fades out when searched */}
        <h1 className={`home-heading ${hasSearched ? 'fade-out' : ''}`}>
          {t('searchTitle')}
        </h1>

        {/* Search Section */}
        <div className={`search-wrapper ${hasSearched ? 'moved-to-top' : ''}`}>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-container">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19 19L14.65 14.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                className="home-search-input"
                placeholder={t('searchPlaceholder')}
                value={query}
                onChange={handleSearchInputChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                  }
                }}
              />
            </div>
            
            <button
              type="button"
              className={`get-all-button ${hasSearched ? 'moved-inline' : ''}`}
              onClick={handleGetAllDiseases}
            >
              {t('getAllDiseases')} <span className="arrow">></span>
            </button>
          </form>
        </div>

        {/* Filter Section - only show when searched */}
        {hasSearched && (
          <div className="filter-section">
            <button
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              {t('all')}
            </button>
            <button
              className={`filter-button ${filter === 'name' ? 'active' : ''}`}
              onClick={() => handleFilterChange('name')}
            >
              {t('diseaseName')}
            </button>
            <button
              className={`filter-button ${filter === 'symptoms' ? 'active' : ''}`}
              onClick={() => handleFilterChange('symptoms')}
            >
              {t('symptoms')}
            </button>
          </div>
        )}

        {/* Results Section */}
        {hasSearched && (
          <div className="results-section">
            {loading && (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>{t('searching')}</p>
              </div>
            )}

            {error && (
              <div className="error">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                {query && filteredDiseases.length === 0 && (
                  <div className="no-results">
                    <p className="no-results-text">{t('noResultsFound')}</p>
                    <button
                      className="show-all-button"
                      onClick={handleShowAllDiseases}
                    >
                      {t('showAllDiseases')}
                    </button>
                  </div>
                )}

                {(!query || filteredDiseases.length > 0) && (
                  <div className="disease-grid">
                    {filteredDiseases.map((disease, index) => {
                      // Extract animal category from collection name
                      const getAnimalCategory = (collection) => {
                        if (!collection) return '';
                        const collectionLower = collection.toLowerCase();
                        
                        // Check for SheepGoat variations first (to avoid matching "goat" in other names)
                        if (collectionLower.includes('sheepgoat') || collectionLower.includes('sheepandgoat')) {
                          return 'Sheep and Goat';
                        } 
                        // Check for PoultryBirds variations - must check exact match first
                        else if (collectionLower === 'poultrybirds' || 
                                 collectionLower.includes('poultrybirds') || 
                                 collectionLower.startsWith('poultrybirds')) {
                          return 'Poultry';
                        } 
                        // Check for CowAndBuffalo variations
                        else if (collectionLower.includes('cowandbuffalo') || 
                                 collectionLower.includes('cowandbuffalo')) {
                          return 'Cow and Buffalo';
                        }
                        // Fallback: try to extract from collection name
                        else if (collectionLower.includes('poultry')) {
                          return 'Poultry';
                        }
                        return collection;
                      };

                      const animalCategory = getAnimalCategory(disease.collection);

                      return (
                        hasContent(disease["Disease Name"]) && (
                          <Link
                            key={disease._id}
                            to={`/disease/${disease.collection}/${disease._id}`}
                            className="disease-card"
                            style={{
                              animationDelay: `${index * 0.05}s`
                            }}
                          >
                            <h3 className="disease-name">{disease["Disease Name"]}</h3>
                            {animalCategory && (
                              <p className="disease-affected">
                                Affected: <span className="affected-animal">{animalCategory}</span>
                              </p>
                            )}
                            {hasContent(disease["Symptoms"]) && (
                              <p className="disease-symptoms">
                                {Array.isArray(disease["Symptoms"]) 
                                  ? disease["Symptoms"].join(', ')
                                  : disease["Symptoms"].length > 100
                                  ? `${disease["Symptoms"].substring(0, 100)}...`
                                  : disease["Symptoms"]}
                              </p>
                            )}
                          </Link>
                        )
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
