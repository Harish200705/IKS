const axios = require('axios');

// Chatbot configuration
const CHATBOT_CONFIG = {
  // Option 1: If you deploy your model as an API
  API_URL: process.env.CHATBOT_API_URL || 'https://reclosable-atomistically-tashina.ngrok-free.dev/chat',
  
  // Option 2: If you use Google Colab with ngrok
  COLAB_URL: process.env.COLAB_URL || 'https://reclosable-atomistically-tashina.ngrok-free.dev/chat',
  
  // Option 3: If you use a cloud service
  CLOUD_URL: process.env.CLOUD_CHATBOT_URL || 'https://reclosable-atomistically-tashina.ngrok-free.dev/chat',
  
  // Fallback responses
  FALLBACK_RESPONSES: {
    en: "I'm sorry, I couldn't process your request. Please try rephrasing your question about animal diseases.",
    hi: "मुझे खेद है, मैं आपके अनुरोध को संसाधित नहीं कर सका। कृपया पशु रोगों के बारे में अपना प्रश्न दोबारा लिखें।",
    ta: "மன்னிக்கவும், உங்கள் கோரிக்கையை நான் செயல்படுத்த முடியவில்லை. விலங்கு நோய்கள் பற்றி உங்கள் கேள்வியை மீண்டும் எழுதவும்."
  }
};

// Chatbot service class
class ChatbotService {
  constructor() {
    this.isAvailable = false;
    this.testConnection();
  }

  // Test connection to chatbot service
  async testConnection() {
    try {
      const testMessage = { message: "test" };
      const response = await axios.post(CHATBOT_CONFIG.API_URL, testMessage, {
        timeout: 5000
      });
      this.isAvailable = response.status === 200;
      console.log('Chatbot service:', this.isAvailable ? 'Connected' : 'Not available');
    } catch (error) {
      console.log('Chatbot service: Not available');
      this.isAvailable = false;
    }
  }

  // Get chatbot response
  async getResponse(userMessage, language = 'en') {
    const startTime = Date.now();
    
    try {
      if (!this.isAvailable) {
        console.log(`\n=== CHATBOT FALLBACK ===`);
        console.log(`Message: ${userMessage}`);
        console.log(`Language: ${language}`);
        console.log(`Reason: Service not available`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log(`=== FALLBACK END ===\n`);
        
        return this.getFallbackResponse(language);
      }

      console.log(`\n=== CHATBOT REQUEST ===`);
      console.log(`Message: "${userMessage}"`);
      console.log(`Language: ${language}`);
      console.log(`API URL: ${CHATBOT_CONFIG.API_URL}`);
      console.log(`Timestamp: ${new Date().toISOString()}`);

      const response = await axios.post(CHATBOT_CONFIG.API_URL, {
        message: userMessage
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const responseTime = Date.now() - startTime;
      console.log(`Response Time: ${responseTime}ms`);
      console.log(`Raw API Response:`, JSON.stringify(response.data, null, 2));

      // Handle your API's response format
      let formattedResponse = '';
      let confidence = null;
      let detectedDisease = null;
      let matchedQuestion = null;
      let suggestedQuestions = [];
      
      // Prefer a primary answer text if present across possible shapes
      const primaryAnswerText = (response.data && (
        response.data.answer ||
        (Array.isArray(response.data.answers) && response.data.answers[0] && response.data.answers[0].answer) ||
        response.data.message ||
        response.data.response
      )) || '';
      
      if (response.data.answers && response.data.answers.length > 0) {
        const answer = response.data.answers[0];
        detectedDisease = answer.disease;
        formattedResponse = `**${answer.disease}**\n\n${answer.answer}`;
        
        if (response.data.similarity_score) {
          confidence = (response.data.similarity_score * 100).toFixed(1);
          formattedResponse += `\n\n*Confidence: ${confidence}%*`;
        }
        
        // Generate suggested questions based on the detected disease
        suggestedQuestions = this.generateSuggestedQuestions(detectedDisease, language);
        
      } else if (response.data.detected_disease) {
        detectedDisease = response.data.detected_disease;
        // Show detected disease prominently, followed by the best available answer text
        const answerText = primaryAnswerText || 'No specific information found.';
        formattedResponse = `**${response.data.detected_disease}**\n\n${answerText}`;
        if (response.data.matched_question) {
          matchedQuestion = response.data.matched_question;
          formattedResponse += `\n\nMatched question: ${response.data.matched_question}`;
        }
        if (response.data.similarity_score) {
          confidence = (response.data.similarity_score * 100).toFixed(1);
          formattedResponse += `\n\n*Confidence: ${confidence}%*`;
        }
        
        // Generate suggested questions based on the detected disease
        suggestedQuestions = this.generateSuggestedQuestions(detectedDisease, language);
        
      } else {
        formattedResponse = primaryAnswerText || 'No specific information found.';
        // Generic suggested questions for general responses
        suggestedQuestions = this.generateGenericQuestions(language);
      }

      console.log(`Formatted Response: ${formattedResponse}`);
      console.log(`Detected Disease: ${detectedDisease || 'N/A'}`);
      console.log(`Confidence Score: ${confidence || 'N/A'}%`);
      console.log(`Matched Question: ${matchedQuestion || 'N/A'}`);
      console.log(`Suggested Questions: ${JSON.stringify(suggestedQuestions)}`);
      console.log(`Source: chatbot`);
      console.log(`=== CHATBOT RESPONSE END ===\n`);

      return {
        success: true,
        response: formattedResponse,
        source: 'chatbot',
        rawData: response.data,
        confidence: confidence,
        detectedDisease: detectedDisease,
        matchedQuestion: matchedQuestion,
        responseTime: responseTime,
        suggestedQuestions: suggestedQuestions
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`\n=== CHATBOT ERROR ===`);
      console.error(`Message: "${userMessage}"`);
      console.error(`Language: ${language}`);
      console.error(`Error: ${error.message}`);
      console.error(`Response Time: ${responseTime}ms`);
      console.error(`Timestamp: ${new Date().toISOString()}`);
      console.error(`=== ERROR END ===\n`);
      
      return {
        success: false,
        response: this.getFallbackResponse(language),
        source: 'fallback',
        error: error.message,
        responseTime: responseTime,
        suggestedQuestions: this.generateGenericQuestions(language)
      };
    }
  }

  // Get fallback response
  getFallbackResponse(language) {
    return CHATBOT_CONFIG.FALLBACK_RESPONSES[language] || 
           CHATBOT_CONFIG.FALLBACK_RESPONSES.en;
  }

  // Generate suggested questions based on detected disease
  generateSuggestedQuestions(disease, language = 'en') {
    const suggestions = {
      en: {
        'Animal Fever': [
          'What are the causes of Animal Fever?',
          'How to treat Animal Fever?',
          'What are the prevention methods for Animal Fever?',
          'How long does Animal Fever last?'
        ],
        'Watery Eyes': [
          'What causes Watery Eyes in animals?',
          'How to prepare the treatment for Watery Eyes?',
          'What are the ingredients for Watery Eyes treatment?',
          'How long to treat Watery Eyes?'
        ],
        'Diarrhoea in Young Calves': [
          'What causes diarrhea in calves?',
          'How to prevent diarrhea in calves?',
          'What is the dosage for diarrhea treatment?',
          'When to call a veterinarian for diarrhea?'
        ],
        'Fever': [
          'What are the causes of fever in animals?',
          'How to reduce fever in animals?',
          'What are the complications of fever?',
          'How to prevent fever in animals?'
        ]
      },
      hi: {
        'Animal Fever': [
          'पशु बुखार के कारण क्या हैं?',
          'पशु बुखार का इलाज कैसे करें?',
          'पशु बुखार से बचाव कैसे करें?',
          'पशु बुखार कितने दिन रहता है?'
        ],
        'Watery Eyes': [
          'पशुओं में आंखों से पानी क्यों आता है?',
          'आंखों के इलाज की तैयारी कैसे करें?',
          'आंखों के इलाज में क्या सामग्री चाहिए?',
          'आंखों का इलाज कितने दिन करना चाहिए?'
        ],
        'Diarrhoea in Young Calves': [
          'बछड़ों में दस्त क्यों होता है?',
          'बछड़ों में दस्त से कैसे बचें?',
          'दस्त के इलाज की खुराक क्या है?',
          'दस्त के लिए कब पशु चिकित्सक को बुलाएं?'
        ]
      },
      ta: {
        'Animal Fever': [
          'விலங்குகளில் காய்ச்சலுக்கான காரணங்கள் என்ன?',
          'விலங்குகளில் காய்ச்சலை எவ்வாறு குணப்படுத்துவது?',
          'விலங்குகளில் காய்ச்சலை எவ்வாறு தடுப்பது?',
          'விலங்குகளில் காய்ச்சல் எத்தனை நாட்கள் நீடிக்கும்?'
        ],
        'Watery Eyes': [
          'விலங்குகளில் கண்களில் தண்ணீர் ஏன் வருகிறது?',
          'கண் சிகிச்சையை எவ்வாறு தயாரிப்பது?',
          'கண் சிகிச்சைக்கு என்ன பொருட்கள் தேவை?',
          'கண் சிகிச்சையை எத்தனை நாட்கள் செய்ய வேண்டும்?'
        ]
      }
    };

    // Get suggestions for the specific disease and language
    const diseaseSuggestions = suggestions[language] && suggestions[language][disease];
    
    if (diseaseSuggestions) {
      return diseaseSuggestions.slice(0, 3); // Return max 3 suggestions
    }
    
    // Fallback to generic questions if no specific suggestions
    return this.generateGenericQuestions(language);
  }

  // Generate generic suggested questions
  generateGenericQuestions(language = 'en') {
    const genericQuestions = {
      en: [
        'What are the common symptoms of animal diseases?',
        'How to prevent diseases in animals?',
        'When should I call a veterinarian?'
      ],
      hi: [
        'पशु रोगों के सामान्य लक्षण क्या हैं?',
        'पशुओं में रोगों से कैसे बचें?',
        'कब पशु चिकित्सक को बुलाना चाहिए?'
      ],
      ta: [
        'விலங்கு நோய்களின் பொதுவான அறிகுறிகள் என்ன?',
        'விலங்குகளில் நோய்களை எவ்வாறு தடுப்பது?',
        'எப்போது மருத்துவரை அழைக்க வேண்டும்?'
      ]
    };

    return genericQuestions[language] || genericQuestions.en;
  }

  // Get chatbot status
  getStatus() {
    return {
      available: this.isAvailable,
      config: {
        apiUrl: CHATBOT_CONFIG.API_URL,
        colabUrl: CHATBOT_CONFIG.COLAB_URL,
        cloudUrl: CHATBOT_CONFIG.CLOUD_URL
      }
    };
  }
}

// Create singleton instance
const chatbotService = new ChatbotService();

module.exports = chatbotService;
