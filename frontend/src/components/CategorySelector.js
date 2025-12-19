import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const CategorySelector = ({ selectedCategory, onCategoryChange }) => {
  const { t } = useLanguage();

  const categories = [
    { id: 'cowAndBuffalo', name: t('cowBuffalo'), icon: '🐄' },
    { id: 'PoultryBirds', name: t('poultry'), icon: '🐔' },
    { id: 'SheepGoat', name: t('sheepGoat'), icon: '🐑' }
  ];

  return (
    <div className="category-selector">
      <h3 className="category-title">{t('categories')}</h3>
      <div className="category-grid">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
