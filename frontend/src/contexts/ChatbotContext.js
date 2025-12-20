import React, { createContext, useContext, useState } from 'react';

const ChatbotContext = createContext();

export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within ChatbotProvider');
  }
  return context;
};

export const ChatbotProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatbot = () => {
    setIsOpen(prev => !prev);
  };

  const closeChatbot = () => {
    setIsOpen(false);
  };

  const openChatbot = () => {
    setIsOpen(true);
  };

  return (
    <ChatbotContext.Provider value={{ isOpen, toggleChatbot, closeChatbot, openChatbot }}>
      {children}
    </ChatbotContext.Provider>
  );
};

