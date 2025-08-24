import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import CategorySelector from './CategorySelector';
import axios from 'axios';

const Home = () => {
  const { t, currentLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('cowAndBuffalo');

  const API_BASE_URL = 'http://localhost:5001/api';

  // Don't load all diseases on component mount - only show search results
  // useEffect(() => {
  //   loadAllDiseases();
  // }, []);

  const loadAllDiseases = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/diseases`);
      setDiseases(response.data);
    } catch (err) {
      setError('Failed to load diseases. Please try again later.');
      console.error('Error loading diseases:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/search?query=${encodeURIComponent(searchQuery)}&collection=${selectedCategory}&language=${currentLanguage}`);
      setDiseases(response.data);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    // Reset search when filter changes
    setSearchQuery('');
    loadAllDiseases();
  };

  const filteredDiseases = diseases.filter(disease => {
    if (filter === 'all') return true;
    if (filter === 'name') {
      return disease["Disease Name"].toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (filter === 'symptoms') {
      return disease["Symptoms"].toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
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
          onCategoryChange={setSelectedCategory}
        />
        
                  <form onSubmit={handleSearch} className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-button">
              {t('searchButton')}
            </button>
          </form>

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
                </span>
              </h2>
            )}

            {!searchQuery && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
                <p>{t('searchToStart')}</p>
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
                  <Link
                    key={disease._id}
                    to={`/disease/${disease.collection}/${disease._id}`}
                    className="disease-card"
                  >
                    <h3 className="disease-name">{disease["Disease Name"]}</h3>
                    <p className="disease-symptoms">
                      {disease["Symptoms"].length > 100
                        ? `${disease["Symptoms"].substring(0, 100)}...`
                        : disease["Symptoms"]}
                    </p>
                  </Link>
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
