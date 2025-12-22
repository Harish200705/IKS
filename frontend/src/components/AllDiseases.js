import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { detectLanguage } from '../utils/languageDetection';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import './AllDiseases.css';

const AllDiseases = () => {
  const { t, currentLanguage, changeLanguage } = useLanguage();
  const [query, setQuery] = useState('');
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, name, symptoms, cowAndBuffalo, sheepGoat, poultry

  // Fetch all diseases on component mount
  useEffect(() => {
    fetchAllDiseases();
  }, [currentLanguage]);

  // Fetch all diseases from all collections
  const fetchAllDiseases = async () => {
    setLoading(true);
    setError(null);
    try {
      // Determine which collections to fetch based on current language
      let collectionsToFetch = [];
      if (currentLanguage === 'en') {
        collectionsToFetch = ['cowAndBuffalo', 'PoultryBirds', 'SheepGoat'];
      } else if (currentLanguage === 'ta') {
        collectionsToFetch = ['cowAndBuffaloTamil', 'PoultryBirdsTamil', 'SheepGoatTamil'];
      } else if (currentLanguage === 'hi') {
        collectionsToFetch = ['cowAndBuffaloHindi', 'PoultryBirdsHindi', 'SheepGoatHindi'];
      } else if (currentLanguage === 'ml') {
        collectionsToFetch = ['cowAndBuffaloMalayalam', 'PoultryBirdsMalayalam', 'SheepGoatMalayalam'];
      } else {
        collectionsToFetch = ['cowAndBuffalo', 'PoultryBirds', 'SheepGoat'];
      }

      const allDiseasesData = [];
      
      for (const collection of collectionsToFetch) {
        try {
          console.log(`[AllDiseases] Fetching diseases from ${collection}...`);
          const response = await axios.get(`${API_BASE_URL}/diseases/${collection}`);
          console.log(`[AllDiseases] Response from ${collection}:`, response.data?.length || 0, 'diseases');
          
          if (response.data && Array.isArray(response.data)) {
            // Add collection info to each disease
            const diseasesWithCollection = response.data.map(disease => ({
              ...disease,
              collection: collection
            }));
            allDiseasesData.push(...diseasesWithCollection);
            console.log(`[AllDiseases] Added ${diseasesWithCollection.length} diseases from ${collection}`);
          } else {
            console.warn(`[AllDiseases] No data or invalid format from ${collection}:`, response.data);
          }
        } catch (err) {
          console.error(`[AllDiseases] Error fetching ${collection}:`, err.response?.data || err.message);
          if (err.response?.status === 503) {
            setError(err.response.data?.message || 'Database connection unavailable. Please try again later.');
          }
        }
      }

      console.log(`[AllDiseases] Total diseases fetched: ${allDiseasesData.length}`);
      setDiseases(allDiseasesData);
    } catch (err) {
      console.error('[AllDiseases] Error fetching all diseases:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to load diseases. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Perform search
  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      fetchAllDiseases();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Use current language for search (respect user's language selection)
      // Only detect language if no language is selected or if we want to auto-detect
      const searchLanguage = currentLanguage;

      const response = await axios.get(`${API_BASE_URL}/search?query=${encodeURIComponent(searchQuery)}&language=${searchLanguage}`);
      
      const searchResults = response.data.results || response.data;
      
      // Remove duplicates based on disease name
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
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change with debounce
  // Also re-fetch when language changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        fetchAllDiseases();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, currentLanguage]);

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

  // Get collection name for display (translated based on current language)
  const getCollectionDisplayName = (collection) => {
    // Determine category type from collection name (case-insensitive)
    const collectionLower = collection.toLowerCase();
    let categoryType = '';
    
    if (collectionLower.includes('cowandbuffalo')) {
      categoryType = 'cowBuffalo';
    } else if (collectionLower.includes('poultrybirds')) {
      categoryType = 'poultry';
    } else if (collectionLower.includes('sheepgoat')) {
      categoryType = 'sheepGoat';
    }
    
    // Return translated category name
    if (categoryType) {
      return t(categoryType);
    }
    
    // Fallback to collection name if category type not found
    return collection;
  };

  // Filter diseases based on filter type
  const getFilteredDiseases = () => {
    let filtered = [...diseases];
    
    console.log('[AllDiseases] Filtering diseases:', {
      totalDiseases: diseases.length,
      query: query,
      filterType: filterType
    });

    // Apply search query filter
    if (query.trim()) {
      const searchQuery = query.toLowerCase();
      
      if (filterType === 'all') {
        filtered = filtered.filter(disease => {
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
        });
      } else if (filterType === 'name') {
        filtered = filtered.filter(disease => {
          if (!hasContent(disease["Disease Name"])) return false;
          const nameStr = fieldToString(disease["Disease Name"]);
          return nameStr.toLowerCase().includes(query.toLowerCase());
        });
      } else if (filterType === 'symptoms') {
        filtered = filtered.filter(disease => {
          if (!hasContent(disease["Symptoms"])) return false;
          const symptomsStr = fieldToString(disease["Symptoms"]);
          return symptomsStr.toLowerCase().includes(query.toLowerCase());
        });
      } else if (filterType === 'cowAndBuffalo') {
        filtered = filtered.filter(disease => {
          const collection = disease.collection || '';
          return collection.includes('cowAndBuffalo') && 
                 (fieldToString(disease["Disease Name"] || disease["Symptoms"] || '')).toLowerCase().includes(searchQuery);
        });
      } else if (filterType === 'sheepGoat') {
        filtered = filtered.filter(disease => {
          const collection = disease.collection || '';
          return collection.includes('SheepGoat') && 
                 (fieldToString(disease["Disease Name"] || disease["Symptoms"] || '')).toLowerCase().includes(searchQuery);
        });
      } else if (filterType === 'poultry') {
        filtered = filtered.filter(disease => {
          const collection = disease.collection || '';
          return collection.includes('PoultryBirds') && 
                 (fieldToString(disease["Disease Name"] || disease["Symptoms"] || '')).toLowerCase().includes(searchQuery);
        });
      }
    } else {
      // If no search query, apply category filter only (or show all if filterType is 'all')
      if (filterType === 'cowAndBuffalo') {
        filtered = filtered.filter(disease => {
          const collection = disease.collection || '';
          return collection.includes('cowAndBuffalo');
        });
      } else if (filterType === 'sheepGoat') {
        filtered = filtered.filter(disease => {
          const collection = disease.collection || '';
          return collection.includes('SheepGoat');
        });
      } else if (filterType === 'poultry') {
        filtered = filtered.filter(disease => {
          const collection = disease.collection || '';
          return collection.includes('PoultryBirds');
        });
      }
      // If filterType is 'all' and no query, show all diseases (no filtering needed)
    }

    console.log('[AllDiseases] Filtered result:', filtered.length, 'diseases');
    return filtered;
  };

  // Group diseases by category
  const groupDiseasesByCategory = (diseasesList) => {
    const grouped = {
      'cowBuffalo': [],
      'poultry': [],
      'sheepGoat': []
    };

    diseasesList.forEach(disease => {
      const collection = disease.collection || '';
      const collectionLower = collection.toLowerCase();
      
      // Determine category type from collection name (use keys, not translated values)
      // Use case-insensitive matching to handle all variations
      if (collectionLower.includes('cowandbuffalo')) {
        grouped['cowBuffalo'].push(disease);
      } else if (collectionLower.includes('poultrybirds')) {
        grouped['poultry'].push(disease);
      } else if (collectionLower.includes('sheepgoat')) {
        grouped['sheepGoat'].push(disease);
      } else {
        // Debug: log unmatched collections
        console.warn('[AllDiseases] Unmatched collection:', collection);
      }
    });

    console.log('[AllDiseases] Grouping result:', {
      cowBuffalo: grouped['cowBuffalo'].length,
      poultry: grouped['poultry'].length,
      sheepGoat: grouped['sheepGoat'].length,
      total: diseasesList.length
    });

    return grouped;
  };

  const filteredDiseases = getFilteredDiseases();
  const groupedDiseases = groupDiseasesByCategory(filteredDiseases);
  
  // Debug logging
  useEffect(() => {
    console.log('[AllDiseases] State update:', {
      diseasesCount: diseases.length,
      filteredCount: filteredDiseases.length,
      groupedCategories: Object.keys(groupedDiseases),
      categoryCounts: Object.entries(groupedDiseases).map(([name, items]) => ({ name, count: items.length })),
      loading,
      error
    });
  }, [diseases.length, filteredDiseases.length, loading, error]);

  const handleFilterClick = (filter) => {
    setFilterType(filter);
    setShowFilter(false);
  };

  return (
    <div className="all-diseases-container">
      {/* Search and Filter Section */}
      <div className="all-diseases-search-section">
        <div className="all-diseases-search-wrapper">
          <div className="all-diseases-search-bar">
            <input
              type="text"
              className="all-diseases-search-input"
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div style={{ position: 'relative' }}>
              <button
                className="all-diseases-filter-button"
                onClick={() => setShowFilter(!showFilter)}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 5H17M5 10H15M7 15H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Filter
              </button>
              
              {/* Filter Dropdown - Below Filter Button */}
              {showFilter && (
                <div className="all-diseases-filter-dropdown">
                  <button
                    className={`filter-option ${filterType === 'all' ? 'active' : ''}`}
                    onClick={() => handleFilterClick('all')}
                  >
                    {t('all')}
                  </button>
                  <button
                    className={`filter-option ${filterType === 'name' ? 'active' : ''}`}
                    onClick={() => handleFilterClick('name')}
                  >
                    {t('diseaseName')}
                  </button>
                  <button
                    className={`filter-option ${filterType === 'symptoms' ? 'active' : ''}`}
                    onClick={() => handleFilterClick('symptoms')}
                  >
                    {t('symptoms')}
                  </button>
                  <button
                    className={`filter-option ${filterType === 'cowAndBuffalo' ? 'active' : ''}`}
                    onClick={() => handleFilterClick('cowAndBuffalo')}
                  >
                    Cow and Buffalo
                  </button>
                  <button
                    className={`filter-option ${filterType === 'sheepGoat' ? 'active' : ''}`}
                    onClick={() => handleFilterClick('sheepGoat')}
                  >
                    Sheep and Goat
                  </button>
                  <button
                    className={`filter-option ${filterType === 'poultry' ? 'active' : ''}`}
                    onClick={() => handleFilterClick('poultry')}
                  >
                    Poultry
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="all-diseases-loading">
          <div className="loading-spinner"></div>
          <p>{t('searching')}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="all-diseases-error">
          <p>{error}</p>
        </div>
      )}

      {/* No Results Message */}
      {!loading && !error && filteredDiseases.length === 0 && (
        <div className="all-diseases-no-results">
          <p>{t('noResultsFound')}</p>
        </div>
      )}

      {/* Disease Categories */}
      {!loading && !error && filteredDiseases.length > 0 && (
        <div className="all-diseases-categories">
          {Object.entries(groupedDiseases).map(([categoryKey, categoryDiseases]) => {
            if (categoryDiseases.length === 0) return null;

            // Get translated category name for display
            const categoryDisplayName = t(categoryKey);

            return (
              <div key={categoryKey} className="all-diseases-category-widget">
                <h2 className="all-diseases-category-heading">{t('categories')}: {categoryDisplayName}</h2>
                <div className="all-diseases-category-grid">
                  {categoryDiseases.map((disease) => {
                    const diseaseName = disease["Disease Name"] || disease["Disease name"] || disease.disease_name;
                    const symptoms = disease["Symptoms"];
                    const collection = disease.collection || 'cowAndBuffalo';
                    const diseaseId = disease._id || disease.id;

                    if (!hasContent(diseaseName)) return null;

                    return (
                      <Link
                        key={`${collection}-${diseaseId}`}
                        to={`/disease/${collection}/${diseaseId}`}
                        className="all-diseases-disease-card"
                      >
                        <h3 className="all-diseases-disease-name">{diseaseName}</h3>
                        {hasContent(symptoms) && (
                          <p className="all-diseases-disease-symptoms">
                            {typeof symptoms === 'string' 
                              ? (symptoms.length > 100 ? `${symptoms.substring(0, 100)}...` : symptoms)
                              : Array.isArray(symptoms)
                              ? symptoms.slice(0, 2).join(', ') + (symptoms.length > 2 ? '...' : '')
                              : String(symptoms).substring(0, 100)}
                          </p>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default AllDiseases;

