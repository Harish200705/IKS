import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const Chatbot = () => {
  const { t, currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatbotStatus, setChatbotStatus] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check chatbot status on component mount
  useEffect(() => {
    checkChatbotStatus();
  }, []);

  const checkChatbotStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/status`);
      setChatbotStatus(response.data);
    } catch (error) {
      console.error('Error checking chatbot status:', error);
      setChatbotStatus({ available: false });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: inputMessage,
        language: currentLanguage
      });

      // Handle different response formats from chatbot API
      const responseText = response.data.response || response.data.message || response.data.answer || 'No response received';
      const source = response.data.source || response.data.detected_disease || 'chatbot';

      const botMessage = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        source: source
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: t('chatbotError') || 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        source: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Removed handleSuggestedQuestion - suggested questions feature removed

  const clearChat = () => {
    setMessages([]);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="chatbot-container">
      {/* Chat Toggle Button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={toggleChat}
        title={t('chatbotTitle') || 'Ask about animal diseases'}
      >
        <span className="chatbot-icon">💬</span>
        {isOpen && <span className="chatbot-close">×</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>{t('chatbotTitle') || 'Veterinary Assistant'}</h3>
            <div className="chatbot-actions">
              <button 
                className="clear-chat-btn" 
                onClick={clearChat}
                title={t('clearChat') || 'Clear chat'}
              >
                🗑️
              </button>
              <button 
                className="close-chat-btn" 
                onClick={toggleChat}
                title={t('closeChat') || 'Close chat'}
              >
                ×
              </button>
            </div>
          </div>

          {/* Status Indicator */}
          {chatbotStatus && (
            <div className={`chatbot-status ${chatbotStatus.available ? 'online' : 'offline'}`}>
              <span className="status-dot"></span>
              {chatbotStatus.available ? 
                (t('chatbotOnline') || 'AI Assistant Online') : 
                (t('chatbotOffline') || 'AI Assistant Offline - Using fallback responses')
              }
            </div>
          )}

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                <p>{t('chatbotWelcome') || 'Hello! I can help you with questions about animal diseases and treatments. What would you like to know?'}</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  <div className="message-text" dangerouslySetInnerHTML={{ 
                    __html: (message.text || '')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/\n/g, '<br>')
                  }} />
                  {message.source && message.source !== 'chatbot' && (
                    <small className="message-source">
                      {message.source === 'fallback' ? 
                        (t('fallbackResponse') || 'Fallback response') : 
                        message.source
                      }
                    </small>
                  )}
                </div>
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message bot">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('chatbotPlaceholder') || 'Ask about animal diseases...'}
              disabled={isLoading}
              rows="1"
            />
            <button 
              onClick={sendMessage} 
              disabled={!inputMessage.trim() || isLoading}
              className="send-btn"
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
