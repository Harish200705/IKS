import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const DiseaseDetail = () => {
  const { id, collection } = useParams();
  const { t, currentLanguage: language } = useLanguage();
  const [disease, setDisease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [originalDiseaseName, setOriginalDiseaseName] = useState(null);
  const [category, setCategory] = useState(null);
  const [diseaseIndex, setDiseaseIndex] = useState(null);

  // Helper function to check if a field has content
  const hasContent = (field) => {
    if (!field) return false;
    if (typeof field === 'string') return field.trim() !== '';
    if (Array.isArray(field)) {
      if (field.length === 0) return false;
      // Check if it's an array of objects (like Treatments)
      if (typeof field[0] === 'object' && field[0] !== null) {
        return field.some(item => item && typeof item === 'object');
      }
      // Check if it's an array of strings - check for any non-empty string
      return field.some(item => {
        if (item === null || item === undefined) return false;
        if (typeof item === 'string') return item.trim() !== '';
        return true; // For other types, consider it has content
      });
    }
    return true;
  };

  // Helper function to check if a treatment field has content
  const hasTreatmentContent = (field) => {
    if (!field) return false;
    if (typeof field === 'string') return field.trim() !== '';
    return true;
  };

  // Fetch disease - handles both initial load and language changes
  useEffect(() => {
    const fetchDisease = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First, get the disease in the original collection to get the disease index
        const originalResponse = await axios.get(`${API_BASE_URL}/disease/${collection}/${id}`);
        
        if (originalResponse.data && originalResponse.data.message === 'Disease not found') {
          setError('Disease not found');
          setDisease(null);
          setLoading(false);
          return;
        }
        
        // Store original disease name, index, and determine category (only if not already stored)
        if (!originalDiseaseName || diseaseIndex === null) {
          const diseaseName = originalResponse.data["Disease Name"] || originalResponse.data["Disease name"] || '';
          setOriginalDiseaseName(diseaseName);
          
          // Get and store the index
          const index = originalResponse.data.index;
          if (index !== undefined && index !== null) {
            setDiseaseIndex(index);
          } else {
            console.warn('Disease does not have index field, cannot translate by index');
          }
          
          // Determine category from collection name
          let categoryName = collection;
          if (collection.includes('PoultryBirds')) {
            categoryName = 'PoultryBirds';
          } else if (collection.includes('CowAndBuffalo') || collection.includes('cowAndBuffalo')) {
            categoryName = 'CowAndBuffalo';
          } else if (collection.includes('SheepGoat')) {
            categoryName = 'SheepGoat';
          }
          setCategory(categoryName);
        }
        
        // If current language is English, use the original disease
        if (language === 'en') {
          setDisease(originalResponse.data);
          setLoading(false);
          return;
        }
        
        // For other languages, use index-based translation
        // Use stored diseaseIndex if available, otherwise try to get from response
        const indexToUse = diseaseIndex !== null ? diseaseIndex : originalResponse.data.index;
        
        if (indexToUse !== undefined && indexToUse !== null && category) {
          try {
            const translateResponse = await axios.get(
              `${API_BASE_URL}/disease-by-index/${category}/${indexToUse}/${language}`
            );

            if (translateResponse.data && translateResponse.data["Disease Name"]) {
              // Successfully got translated disease
              setDisease(translateResponse.data);
              setLoading(false);
              return;
            }
          } catch (translateErr) {
            console.log('Translation by index not available, using original:', translateErr.message);
            // Fallback to original disease below
          }
        } else {
          console.warn('Cannot translate: index is missing');
        }
        
        // Fallback: use original disease if translation not available
        setDisease(originalResponse.data);
      } catch (err) {
        setError('Failed to load disease details. Please try again.');
        console.error('Error fetching disease:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDisease();
  }, [id, collection, language, diseaseIndex, originalDiseaseName, category]);

  // Debug: Log disease data structure
  useEffect(() => {
    if (disease) {
      console.log('=== DISEASE DATA STRUCTURE ===');
      console.log('Collection:', collection);
      console.log('Disease Name:', disease["Disease Name"]);
      console.log('Symptoms:', disease["Symptoms"], 'Type:', Array.isArray(disease["Symptoms"]) ? 'Array' : typeof disease["Symptoms"]);
      console.log('Causes:', disease["Causes"], 'Type:', Array.isArray(disease["Causes"]) ? 'Array' : typeof disease["Causes"]);
      console.log('Treatment Name:', disease["Treatment Name"], 'Type:', Array.isArray(disease["Treatment Name"]) ? 'Array' : typeof disease["Treatment Name"]);
      console.log('Ingredients:', disease["Ingredients"], 'Type:', Array.isArray(disease["Ingredients"]) ? 'Array' : typeof disease["Ingredients"]);
      console.log('Preparation Method:', disease["Preparation Method"], 'Type:', Array.isArray(disease["Preparation Method"]) ? 'Array' : typeof disease["Preparation Method"]);
      console.log('Dosage:', disease["Dosage"], 'Type:', Array.isArray(disease["Dosage"]) ? 'Array' : typeof disease["Dosage"]);
      console.log('=============================');
    }
  }, [disease, collection]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>{t('loadingDetails')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <Link to="/" className="back-button">
          ← Back to Search
        </Link>
      </div>
    );
  }

  if (!disease) {
    return (
      <div className="error">
        <p>Disease not found.</p>
        <Link to="/" className="back-button">
          ← Back to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="disease-detail">
      <Link to="/" className="back-button">
        ← {t('backToSearch')}
      </Link>

      {/* Translation notice removed - no longer displaying translation availability messages */}

      {hasContent(disease["Disease Name"]) && (
        <div className="detail-header">
          <h1 className="detail-title">{disease["Disease Name"]}</h1>
        </div>
      )}

      {/* Display images if available */}
      {disease.images && disease.images.length > 0 && (
        <div className="detail-section">
          <h2 className="detail-section-title">{t('images') || 'Images'}</h2>
          <div className="image-gallery">
            <div className="main-image-container">
              <img 
                src={`${API_BASE_URL}/image/${collection}/${id}/${disease.images[selectedImageIndex].image_id}`}
                alt={disease.images[selectedImageIndex].image_name || 'Disease image'}
                className="main-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="image-error" style={{ display: 'none' }}>
                <p>Image could not be loaded</p>
              </div>
            </div>
            
            {disease.images.length > 1 && (
              <div className="image-thumbnails">
                {disease.images.map((image, index) => (
                  <img
                    key={image.image_id}
                    src={`${API_BASE_URL}/image/${collection}/${id}/${image.image_id}`}
                    alt={image.image_name || `Image ${index + 1}`}
                    className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(index)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ))}
              </div>
            )}
            
            <div className="image-info">
              <p className="image-counter">
                {selectedImageIndex + 1} of {disease.images.length}
              </p>
              {disease.images[selectedImageIndex].image_name && (
                <p className="image-name">
                  {disease.images[selectedImageIndex].image_name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Handle Symptoms - can be string or array */}
      {hasContent(disease["Symptoms"]) && (
        <div className="detail-section">
          <h2 className="detail-section-title">{t('symptoms')}</h2>
          {Array.isArray(disease["Symptoms"]) ? (
            <ul className="detail-content" style={{ 
              paddingLeft: '20px',
              lineHeight: '1.8',
              color: '#6c757d'
            }}>
              {disease["Symptoms"].map((symptom, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  {symptom}
                </li>
              ))}
            </ul>
          ) : (
            <p className="detail-content">{disease["Symptoms"]}</p>
          )}
        </div>
      )}

      {/* Handle Causes - can be string or array */}
      {hasContent(disease["Causes"]) && (
        <div className="detail-section">
          <h2 className="detail-section-title">{t('causes')}</h2>
          {Array.isArray(disease["Causes"]) ? (
            <ul className="detail-content" style={{ 
              paddingLeft: '20px',
              lineHeight: '1.8',
              color: '#6c757d'
            }}>
              {disease["Causes"].map((cause, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  {cause}
                </li>
              ))}
            </ul>
          ) : (
            <p className="detail-content">{disease["Causes"]}</p>
          )}
        </div>
      )}

      {/* Handle Treatments array (for PoultryBirdsHindi) */}
      {hasContent(disease["Treatments"]) && Array.isArray(disease["Treatments"]) && (
        <div className="detail-section">
          <h2 className="detail-section-title">{t('treatments')}</h2>
          {disease["Treatments"].map((treatment, index) => (
            <div key={index} className="treatment-item">
              {hasTreatmentContent(treatment["Treatment Name"]) && (
                <div className="treatment-name">
                  <h3 className="treatment-title">{treatment["Treatment Name"]}</h3>
                </div>
              )}
              {hasTreatmentContent(treatment["Ingredients"]) && (
                <div className="treatment-detail">
                  <h4 className="treatment-subtitle">{t('ingredients')}</h4>
                  <p className="treatment-content">{treatment["Ingredients"]}</p>
                </div>
              )}
              {hasTreatmentContent(treatment["Preparation Method"]) && (
                <div className="treatment-detail">
                  <h4 className="treatment-subtitle">{t('preparationMethod')}</h4>
                  <p className="treatment-content">{treatment["Preparation Method"]}</p>
                </div>
              )}
              {hasTreatmentContent(treatment["Dosage"]) && (
                <div className="treatment-detail">
                  <h4 className="treatment-subtitle">{t('dosage')}</h4>
                  <p className="treatment-content">{treatment["Dosage"]}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Handle individual array fields FIRST (for collections with array format like Malayalam collections) */}
      {(() => {
        const treatmentNameArray = disease["Treatment Name"];
        const ingredientsArray = disease["Ingredients"];
        const preparationMethodArray = disease["Preparation Method"];
        const dosageArray = disease["Dosage"];
        
        // Check if Treatment Name is an array
        const isTreatmentNameArray = Array.isArray(treatmentNameArray);
        const isIngredientsArray = Array.isArray(ingredientsArray);
        const isPreparationMethodArray = Array.isArray(preparationMethodArray);
        const isDosageArray = Array.isArray(dosageArray);
        
        // Check if we have array content - handle single element arrays too
        const hasTreatmentArray = isTreatmentNameArray && treatmentNameArray.length > 0;
        const hasAnyArray = hasTreatmentArray || isIngredientsArray || isPreparationMethodArray || isDosageArray;
        
        // Debug log - always log to help diagnose
        console.log('=== TREATMENT ARRAY CHECK ===');
        console.log('Collection:', collection);
        console.log('Treatment Name:', treatmentNameArray);
        console.log('Treatment Name value:', JSON.stringify(treatmentNameArray));
        console.log('Treatment Name length:', isTreatmentNameArray ? treatmentNameArray.length : 'N/A');
        console.log('Is Array:', isTreatmentNameArray);
        console.log('Has Array:', hasTreatmentArray);
        console.log('Has Any Array:', hasAnyArray);
        console.log('Ingredients Array:', ingredientsArray);
        console.log('Ingredients Array value:', JSON.stringify(ingredientsArray));
        console.log('Ingredients Array length:', isIngredientsArray ? ingredientsArray.length : 'N/A');
        if (isIngredientsArray && ingredientsArray.length > 0) {
          console.log('First ingredient type:', typeof ingredientsArray[0], 'Is Array:', Array.isArray(ingredientsArray[0]));
        }
        console.log('Preparation Method Array:', preparationMethodArray);
        console.log('Preparation Method Array length:', isPreparationMethodArray ? preparationMethodArray.length : 'N/A');
        console.log('Dosage Array:', dosageArray);
        console.log('Dosage Array length:', isDosageArray ? dosageArray.length : 'N/A');
        console.log('Full disease object keys:', Object.keys(disease));
        console.log('=============================');
        
        // If Treatment Name is an array, display it (including single-element arrays)
        if (hasTreatmentArray) {
          console.log('✅ Rendering treatment array section with', treatmentNameArray.length, 'treatment(s)');
          return (
            <div className="detail-section">
              <h2 className="detail-section-title">
                {treatmentNameArray.length === 1 ? (t('treatment') || 'Treatment') : (t('treatments') || 'Treatments')}
              </h2>
              {treatmentNameArray.map((treatmentName, index) => {
                // Skip if treatment name is empty
                if (!treatmentName || (typeof treatmentName === 'string' && treatmentName.trim() === '')) {
                  console.log(`⚠️ Skipping treatment ${index} - empty or invalid`);
                  return null;
                }
                
                console.log(`📋 Rendering treatment ${index + 1}:`, treatmentName);
                
                // Get corresponding array values
                const ingredients = isIngredientsArray && ingredientsArray[index] !== undefined ? ingredientsArray[index] : null;
                const preparationMethod = isPreparationMethodArray && preparationMethodArray[index] !== undefined ? preparationMethodArray[index] : null;
                const dosage = isDosageArray && dosageArray[index] !== undefined ? dosageArray[index] : null;
                
                console.log(`  - Ingredients:`, ingredients, 'Type:', typeof ingredients, 'Is Array:', Array.isArray(ingredients));
                console.log(`  - Preparation Method:`, preparationMethod, 'Type:', typeof preparationMethod);
                console.log(`  - Dosage:`, dosage, 'Type:', typeof dosage);
                
                return (
                  <div key={index} className="treatment-item" style={{
                    marginBottom: '30px',
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    borderLeft: '4px solid #28a745'
                  }}>
                    <div className="treatment-name">
                      <h3 className="treatment-title" style={{ 
                        color: '#28a745', 
                        marginBottom: '15px',
                        fontSize: '1.3em'
                      }}>
                        {treatmentNameArray.length === 1 ? treatmentName : `${t('treatment') || 'Treatment'} ${index + 1}: ${treatmentName}`}
                      </h3>
                    </div>
                    
                    {ingredients && (
                      <div className="treatment-detail" style={{ marginBottom: '15px' }}>
                        <h4 className="treatment-subtitle" style={{ 
                          color: '#495057', 
                          marginBottom: '8px',
                          fontSize: '1.1em',
                          fontWeight: '600'
                        }}>
                          {t('ingredients') || 'Ingredients'}
                        </h4>
                        {Array.isArray(ingredients) ? (
                          <ul className="treatment-content" style={{ 
                            color: '#6c757d',
                            lineHeight: '1.8',
                            margin: 0,
                            paddingLeft: '20px'
                          }}>
                            {ingredients.map((ingredient, ingIndex) => (
                              <li key={ingIndex} style={{ marginBottom: '6px' }}>
                                {ingredient}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="treatment-content" style={{ 
                            color: '#6c757d',
                            lineHeight: '1.6',
                            margin: 0
                          }}>
                            {ingredients}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {preparationMethod && (
                      <div className="treatment-detail" style={{ marginBottom: '15px' }}>
                        <h4 className="treatment-subtitle" style={{ 
                          color: '#495057', 
                          marginBottom: '8px',
                          fontSize: '1.1em',
                          fontWeight: '600'
                        }}>
                          {t('preparationMethod') || 'Preparation Method'}
                        </h4>
                        {Array.isArray(preparationMethod) ? (
                          <ol className="treatment-content" style={{ 
                            color: '#6c757d',
                            lineHeight: '1.8',
                            margin: 0,
                            paddingLeft: '20px'
                          }}>
                            {preparationMethod.map((method, methodIndex) => (
                              <li key={methodIndex} style={{ marginBottom: '8px' }}>
                                {method}
                              </li>
                            ))}
                          </ol>
                        ) : (
                          <p className="treatment-content" style={{ 
                            color: '#6c757d',
                            lineHeight: '1.6',
                            margin: 0,
                            whiteSpace: 'pre-line'
                          }}>
                            {preparationMethod}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {dosage && (
                      <div className="treatment-detail" style={{ marginBottom: '15px' }}>
                        <h4 className="treatment-subtitle" style={{ 
                          color: '#495057', 
                          marginBottom: '8px',
                          fontSize: '1.1em',
                          fontWeight: '600'
                        }}>
                          {t('dosage') || 'Dosage'}
                        </h4>
                        {Array.isArray(dosage) ? (
                          <ul className="treatment-content" style={{ 
                            color: '#6c757d',
                            lineHeight: '1.8',
                            margin: 0,
                            paddingLeft: '20px'
                          }}>
                            {dosage.map((dosageItem, dosageIndex) => (
                              <li key={dosageIndex} style={{ marginBottom: '8px' }}>
                                {dosageItem}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="treatment-content" style={{ 
                            color: '#6c757d',
                            lineHeight: '1.6',
                            margin: 0,
                            whiteSpace: 'pre-line'
                          }}>
                            {dosage}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        }
        
        // If no array but we have any array field, log it
        if (hasAnyArray && !hasTreatmentArray) {
          console.warn('⚠️ Found array fields but Treatment Name is not an array:', {
            treatmentName: treatmentNameArray,
            treatmentNameType: typeof treatmentNameArray,
            isTreatmentNameArray: Array.isArray(treatmentNameArray),
            ingredients: ingredientsArray,
            preparationMethod: preparationMethodArray,
            dosage: dosageArray
          });
        }
        
        if (!hasAnyArray) {
          console.log('ℹ️ No array fields found for treatment data');
        }
        
        return null;
      })()}

      {/* Handle individual treatment fields - MIXED FORMAT (for collections like SheepGoatTamil) */}
      {hasContent(disease["Treatment Name"]) && !Array.isArray(disease["Treatment Name"]) && (
        <div className="detail-section">
          <h2 className="detail-section-title">{t('treatment') || 'Treatment'}</h2>
          <div className="treatment-item" style={{
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '8px',
            borderLeft: '4px solid #28a745'
          }}>
            <h3 className="treatment-title" style={{ 
              color: '#28a745', 
              marginBottom: '15px',
              fontSize: '1.3em'
            }}>
              {disease["Treatment Name"]}
            </h3>
            
            {/* Handle Ingredients - can be string or array */}
            {hasContent(disease["Ingredients"]) && (
              <div className="treatment-detail" style={{ marginBottom: '15px' }}>
                <h4 className="treatment-subtitle" style={{ 
                  color: '#495057', 
                  marginBottom: '8px',
                  fontSize: '1.1em',
                  fontWeight: '600'
                }}>
                  {t('ingredients') || 'Ingredients'}
                </h4>
                {Array.isArray(disease["Ingredients"]) ? (
                  <ul className="treatment-content" style={{ 
                    color: '#6c757d',
                    lineHeight: '1.8',
                    margin: 0,
                    paddingLeft: '20px'
                  }}>
                    {disease["Ingredients"].map((ingredient, index) => (
                      <li key={index} style={{ marginBottom: '6px' }}>
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="treatment-content" style={{ 
                    color: '#6c757d',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {disease["Ingredients"]}
                  </p>
                )}
              </div>
            )}
            
            {/* Handle Preparation Method - can be string or array */}
            {hasContent(disease["Preparation Method"]) && (
              <div className="treatment-detail" style={{ marginBottom: '15px' }}>
                <h4 className="treatment-subtitle" style={{ 
                  color: '#495057', 
                  marginBottom: '8px',
                  fontSize: '1.1em',
                  fontWeight: '600'
                }}>
                  {t('preparationMethod') || 'Preparation Method'}
                </h4>
                {Array.isArray(disease["Preparation Method"]) ? (
                  <ol className="treatment-content" style={{ 
                    color: '#6c757d',
                    lineHeight: '1.8',
                    margin: 0,
                    paddingLeft: '20px'
                  }}>
                    {disease["Preparation Method"].map((method, index) => (
                      <li key={index} style={{ marginBottom: '8px' }}>
                        {method}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="treatment-content" style={{ 
                    color: '#6c757d',
                    lineHeight: '1.6',
                    margin: 0,
                    whiteSpace: 'pre-line'
                  }}>
                    {disease["Preparation Method"]}
                  </p>
                )}
              </div>
            )}
            
            {/* Handle Dosage - can be string or array */}
            {hasContent(disease["Dosage"]) && (
              <div className="treatment-detail" style={{ marginBottom: '15px' }}>
                <h4 className="treatment-subtitle" style={{ 
                  color: '#495057', 
                  marginBottom: '8px',
                  fontSize: '1.1em',
                  fontWeight: '600'
                }}>
                  {t('dosage') || 'Dosage'}
                </h4>
                {Array.isArray(disease["Dosage"]) ? (
                  <ul className="treatment-content" style={{ 
                    color: '#6c757d',
                    lineHeight: '1.8',
                    margin: 0,
                    paddingLeft: '20px'
                  }}>
                    {disease["Dosage"].map((dosage, index) => (
                      <li key={index} style={{ marginBottom: '8px' }}>
                        {dosage}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="treatment-content" style={{ 
                    color: '#6c757d',
                    lineHeight: '1.6',
                    margin: 0,
                    whiteSpace: 'pre-line'
                  }}>
                    {disease["Dosage"]}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetail;
