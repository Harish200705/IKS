import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import CategorySelector from './CategorySelector';
import { detectLanguage } from '../utils/languageDetection';
import axios from 'axios';

const Home = () => {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('cowAndBuffalo');
  const [detectedLanguage, setDetectedLanguage] = useState('en');

  const API_BASE_URL = 'http://localhost:5001/api';

  // Re-search when language changes (if there's an active search)
  useEffect(() => {
    if (searchQuery.trim() && currentLanguage !== detectedLanguage) {
      performSearch(searchQuery, selectedCategory, filter, currentLanguage);
    }
  }, [currentLanguage]);

  // Helper function to check if a field has content
  const hasContent = (field) => {
    if (!field) return false;
    if (typeof field === 'string') return field.trim() !== '';
    if (Array.isArray(field)) return field.length > 0 && field.some(item => item && item.trim() !== '');
    return true;
  };

  // Real-time search function
  const performSearch = async (query, category, filterType, forceLanguage = null) => {
    if (!query.trim()) {
      setDiseases([]);
      setDetectedLanguage('en');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Use forceLanguage if provided (for language switching), otherwise detect from query
      const searchLanguage = forceLanguage || detectLanguage(query);
      setDetectedLanguage(searchLanguage);
      
      // Automatically change UI language if different from current (only for initial search)
      if (!forceLanguage && searchLanguage !== currentLanguage) {
        changeLanguage(searchLanguage);
      }
      
      const response = await axios.get(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}&collection=${category}&language=${searchLanguage}`);
      
      // Handle new response format
      const searchResults = response.data.results || response.data;
      const responseDetectedLanguage = response.data.detectedLanguage || searchLanguage;
      
      // Update detected language from server response
      setDetectedLanguage(responseDetectedLanguage);
      
      // Remove duplicates based on disease name (case-insensitive)
      const uniqueDiseases = searchResults.filter((disease, index, self) => {
        const diseaseName = disease["Disease Name"]?.toLowerCase().trim();
        if (!diseaseName) return true; // Keep diseases without names
        
        return index === self.findIndex(d => {
          const otherDiseaseName = d["Disease Name"]?.toLowerCase().trim();
          return otherDiseaseName === diseaseName;
        });
      });
      
      setDiseases(uniqueDiseases);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery, selectedCategory, filter);
      } else {
        setDiseases([]);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, filter]);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    // Don't reset search query - let the useEffect handle the search
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Don't reset search query - let the useEffect handle the search
  };

  const filteredDiseases = diseases.filter(disease => {
    if (!searchQuery.trim()) return false;
    
    const query = searchQuery.toLowerCase();
    
    if (filter === 'all') {
      // Search across all fields
      const searchableFields = [
        disease["Disease Name"],
        disease["Symptoms"],
        disease["Causes"],
        disease["Treatment Name"],
        disease["Ingredients"],
        disease["Preparation Method"],
        disease["Dosage"]
      ].filter(hasContent);
      
      return searchableFields.some(field => 
        field.toLowerCase().includes(query)
      );
    }
    
    if (filter === 'name') {
      return hasContent(disease["Disease Name"]) && 
             disease["Disease Name"].toLowerCase().includes(query);
    }
    
    if (filter === 'symptoms') {
      return hasContent(disease["Symptoms"]) && 
             disease["Symptoms"].toLowerCase().includes(query);
    }
    
    return false;
  });

  return (
    <div>
      <section className="search-section">
        <h1 className="search-title">{t('searchTitle')}</h1>
        <p className="search-subtitle">
          {t('searchSubtitle')}
        </p>
        
        <CategorySelector 
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
        </div>

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
      </section>

      <section className="results-section">
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
            {searchQuery && (
              <h2 className="results-title">
                {t('searchResults')} "{searchQuery}"
                <span style={{ fontSize: '1rem', color: '#7f8c8d', display: 'block', marginTop: '0.5rem' }}>
                  {filteredDiseases.length} {t('diseasesFound')}
                  {detectedLanguage !== 'en' && (
                    <span style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', backgroundColor: '#3498db', color: 'white', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {detectedLanguage === 'ta' ? 'தமிழ்' : 
                       detectedLanguage === 'hi' ? 'हिन्दी' : 
                       detectedLanguage === 'te' ? 'తెలుగు' : 
                       detectedLanguage === 'ml' ? 'മലയാളം' : 
                       detectedLanguage === 'kn' ? 'ಕನ್ನಡ' : detectedLanguage}
                    </span>
                  )}
                </span>
              </h2>
            )}

            {!searchQuery && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
                <p>{t('searchToStart')}</p>
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Browse Diseases with Images</h3>
                  <Link 
                    to="/category/imagesheepandgoat" 
                    className="browse-images-btn"
                    style={{
                      display: 'inline-block',
                      padding: '12px 24px',
                      backgroundColor: '#16a34a',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 10px rgba(22, 163, 74, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#15803d';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 15px rgba(22, 163, 74, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#16a34a';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 10px rgba(22, 163, 74, 0.3)';
                    }}
                  >
                    🖼️ View Herbal Masala Bolus Images
                  </Link>
                </div>
              </div>
            )}

            {searchQuery && filteredDiseases.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
                <p>{t('noResults')} "{searchQuery}". {t('tryDifferent')}</p>
              </div>
            )}

            {searchQuery && filteredDiseases.length > 0 && (
              <div className="disease-grid">
                {filteredDiseases.map((disease) => (
                  hasContent(disease["Disease Name"]) && (
                    <Link
                      key={disease._id}
                      to={`/disease/${disease.collection}/${disease._id}`}
                      className="disease-card"
                    >
                      <h3 className="disease-name">{disease["Disease Name"]}</h3>
                      {hasContent(disease["Symptoms"]) && (
                        <p className="disease-symptoms">
                          {disease["Symptoms"].length > 100
                            ? `${disease["Symptoms"].substring(0, 100)}...`
                            : disease["Symptoms"]}
                        </p>
                      )}
                    </Link>
                  )
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
