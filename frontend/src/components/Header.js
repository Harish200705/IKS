import React from 'react';
import { Link } from 'react-router-dom';
import Chatbot from './Chatbot';
import LanguageSelector from './LanguageSelector';
import { useChatbot } from '../contexts/ChatbotContext';

const Header = () => {
  const { toggleChatbot } = useChatbot();

  return (
    <>
      <header className="header-new">
        <div className="header-content-new">
          <Link to="/" className="logo-new">
            <span>VetCare</span>
          </Link>
          <div className="header-actions">
            <button 
              className="chatbot-button"
              onClick={toggleChatbot}
            >
              Chatbot
            </button>
            <LanguageSelector />
          </div>
        </div>
      </header>
      <Chatbot />
    </>
  );
};

export default Header;
