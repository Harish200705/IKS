import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const DiseaseDetail = () => {
  const { id, collection } = useParams();
  const { t } = useLanguage();
  const [disease, setDisease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5001/api';

  useEffect(() => {
    const fetchDisease = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/disease/${collection}/${id}`);
        
        if (response.data.message === 'Disease not found') {
          setError('Disease not found');
          setDisease(null);
        } else {
          setDisease(response.data);
        }
      } catch (err) {
        setError('Failed to load disease details. Please try again.');
        console.error('Error fetching disease:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDisease();
  }, [id, collection]);

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
      <Link to={`/category/${collection}`} className="back-button">
        ← {t('backToSearch')}
      </Link>

      <div className="detail-header">
        <h1 className="detail-title">{disease["Disease Name"]}</h1>
      </div>

      <div className="detail-section">
        <h2 className="detail-section-title">{t('symptoms')}</h2>
        <p className="detail-content">{disease["Symptoms"]}</p>
      </div>

      {disease["Causes"] && disease["Causes"].trim() !== "" && (
        <div className="detail-section">
          <h2 className="detail-section-title">{t('causes')}</h2>
          <p className="detail-content">{disease["Causes"]}</p>
        </div>
      )}

      <div className="detail-section">
        <h2 className="detail-section-title">{t('treatment')}</h2>
        <p className="detail-content">
          <strong>{t('treatmentName')}:</strong> {disease["Treatment Name"]}
        </p>
      </div>

      <div className="detail-section">
        <h2 className="detail-section-title">{t('ingredients')}</h2>
        <p className="detail-content">{disease["Ingredients"]}</p>
      </div>

      <div className="detail-section">
        <h2 className="detail-section-title">{t('preparationMethod')}</h2>
        <p className="detail-content">{disease["Preparation Method"]}</p>
      </div>

      <div className="detail-section">
        <h2 className="detail-section-title">{t('dosage')}</h2>
        <p className="detail-content">{disease["Dosage"]}</p>
      </div>
    </div>
  );
};

export default DiseaseDetail;
