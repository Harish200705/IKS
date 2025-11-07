import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const CategorySearch = () => {
  const { category } = useParams();
  const { t, currentLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const API_BASE_URL = 'http://localhost:5001/api';

  // Helper function to check if a field has content
  const hasContent = (field) => {
    if (!field) return false;
    if (typeof field === 'string') return field.trim() !== '';
    if (Array.isArray(field)) return field.length > 0 && field.some(item => item && item.trim() !== '');
    return true;
  };

  // Real-time search function
  const performSearch = async (query, categoryParam, filterType) => {
    if (!query.trim()) {
      setDiseases([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}&collection=${categoryParam}&language=${currentLanguage}`);
      
      // Remove duplicates based on disease name (case-insensitive)
      const uniqueDiseases = response.data.filter((disease, index, self) => {
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
        performSearch(searchQuery, category, filter);
      } else {
        setDiseases([]);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery, category, filter]);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    // Don't reset search query - let the useEffect handle the search
  };

  const getCategoryName = (categoryId) => {
    switch(categoryId) {
      case 'cowAndBuffalo':
        return t('cowBuffalo');
      case 'PoultryBirds':
        return t('poultry');
      case 'SheepGoat':
        return t('sheepGoat');
      case 'imagesheepandgoat':
        return 'Diseases with Images';
      default:
        return categoryId;
    }
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
        <h1 className="search-title">{getCategoryName(category)} - {t('searchTitle')}</h1>
        <p className="search-subtitle">
          {t('searchSubtitle')}
        </p>
        
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
                {t('searchResults')} "{searchQuery}" - {getCategoryName(category)}
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
                {filteredDiseases.map((disease) => {
                  const diseaseName = disease["Disease Name"] || disease["Disease name"] || disease.disease_name;
                  const symptoms = disease["Symptoms"];
                  const treatmentDescription = disease.treatment_description || disease["Treatment Name"];
                  
                  return hasContent(diseaseName) && (
                    <Link
                      key={disease._id}
                      to={`/disease/${disease.collection}/${disease._id}`}
                      className="disease-card"
                    >
                      <h3 className="disease-name">{diseaseName}</h3>
                      {hasContent(symptoms) && (
                        <p className="disease-symptoms">
                          {symptoms.length > 100
                            ? `${symptoms.substring(0, 100)}...`
                            : symptoms}
                        </p>
                      )}
                      {hasContent(treatmentDescription) && (
                        <p className="disease-treatment">
                          <strong>Treatment:</strong> {treatmentDescription.length > 80
                            ? `${treatmentDescription.substring(0, 80)}...`
                            : treatmentDescription}
                        </p>
                      )}
                      {disease.images && disease.images.length > 0 && (
                        <div className="image-indicator">
                          🖼️ {disease.images.length} image{disease.images.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default CategorySearch;
