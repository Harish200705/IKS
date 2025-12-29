import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for voice search functionality using Web Speech API
 * @returns {Object} Voice search state and controls
 */
const useVoiceSearch = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      
      // Configure recognition settings
      recognition.continuous = false; // Stop after user stops speaking
      recognition.interimResults = false; // Only return final results
      recognition.lang = 'en-US'; // Default language, can be changed based on user's language preference
      
      // Event handlers
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };
      
      recognition.onresult = (event) => {
        const lastResult = event.results.length - 1;
        const transcriptText = event.results[lastResult][0].transcript;
        setTranscript(transcriptText);
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        setIsListening(false);
        let errorMessage = 'Voice recognition error. Please try again.';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not found. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'aborted':
            errorMessage = 'Voice recognition aborted.';
            break;
          default:
            errorMessage = `Voice recognition error: ${event.error}`;
        }
        
        setError(errorMessage);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError('Voice search is not supported in your browser. Please use Chrome, Edge, or Safari.');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = (language = 'en-US') => {
    if (!isSupported) {
      setError('Voice search is not supported in your browser.');
      return;
    }
    
    if (recognitionRef.current) {
      try {
        // Update language if provided
        if (language) {
          recognitionRef.current.lang = language;
        }
        
        setError(null);
        setTranscript('');
        recognitionRef.current.start();
      } catch (err) {
        setError('Failed to start voice recognition. Please try again.');
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    setError(null);
  };

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
  };
};

export default useVoiceSearch;

