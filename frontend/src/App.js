import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import Home from './components/Home';
import DiseaseDetail from './components/DiseaseDetail';
import CategorySearch from './components/CategorySearch';
import Chatbot from './components/Chatbot';
import './components/Chatbot.css';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:category" element={<CategorySearch />} />
              <Route path="/disease/:collection/:id" element={<DiseaseDetail />} />
            </Routes>
          </main>
          <Chatbot />
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;
