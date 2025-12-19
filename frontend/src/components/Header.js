import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';

const Header = () => {
  const { t } = useLanguage();

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">🐾</span>
          <span>{t('logo')}</span>
        </Link>
        <nav className="nav-menu">
          <Link to="/" className="nav-link">
            {t('home')}
          </Link>
          <LanguageSelector />
        </nav>
      </div>
    </header>
  );
};

export default Header;
