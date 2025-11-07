const axios = require('axios');

async function testTranslation() {
  try {
    console.log('Testing translation endpoint...');
    
    // Test the translation endpoint
    const response = await axios.get('http://localhost:5001/api/translate-disease/PoultryBirdsHindi/a1b2c3d4-e5f6-7890-abcd-123456789004/en');
    
    console.log('Translation successful!');
    console.log('Disease Name:', response.data['Disease Name']);
    console.log('Language:', response.data.language);
    console.log('Translated:', response.data.translated);
    
  } catch (error) {
    console.error('Translation test failed:', error.response?.data || error.message);
  }
}

testTranslation();
