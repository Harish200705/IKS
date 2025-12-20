import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { LanguageProvider } from './contexts/LanguageContext';
import { ChatbotProvider, useChatbot } from './contexts/ChatbotContext';
import Header from './components/Header';
import Home from './components/Home';
import DiseaseDetail from './components/DiseaseDetail';
import CategorySearch from './components/CategorySearch';
import AllDiseases from './components/AllDiseases';
import Chatbot from './components/Chatbot';
import './components/Chatbot.css';

const AppContent = () => {
  const { isOpen } = useChatbot();
  
  return (
    <Router>
      <div className={`App ${isOpen ? 'chatbot-open' : ''}`}>
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/all-diseases" element={<AllDiseases />} />
            <Route path="/category/:category" element={<CategorySearch />} />
            <Route path="/disease/:collection/:id" element={<DiseaseDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

function App() {
  return (
    <LanguageProvider>
      <ChatbotProvider>
        <AppContent />
      </ChatbotProvider>
    </LanguageProvider>
  );
}

export default App;
