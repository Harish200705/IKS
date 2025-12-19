// Language detection utility
export const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'en';
  
  const trimmedText = text.trim();
  
  // Tamil script detection (U+0B80-U+0BFF)
  const tamilRegex = /[\u0B80-\u0BFF]/;
  
  // Telugu script detection (U+0C00-U+0C7F)
  const teluguRegex = /[\u0C00-\u0C7F]/;
  
  // Malayalam script detection (U+0D00-U+0D7F)
  const malayalamRegex = /[\u0D00-\u0D7F]/;
  
  // Kannada script detection (U+0C80-U+0CFF)
  const kannadaRegex = /[\u0C80-\u0CFF]/;
  
  // Hindi/Devanagari script detection (U+0900-U+097F)
  const hindiRegex = /[\u0900-\u097F]/;
  
  // Check for different scripts
  if (tamilRegex.test(trimmedText)) {
    return 'ta';
  } else if (teluguRegex.test(trimmedText)) {
    return 'te';
  } else if (malayalamRegex.test(trimmedText)) {
    return 'ml';
  } else if (kannadaRegex.test(trimmedText)) {
    return 'kn';
  } else if (hindiRegex.test(trimmedText)) {
    return 'hi';
  }
  
  // Default to English if no script is detected
  return 'en';
};

// Get collection name based on category and language
export const getCollectionName = (category, language) => {
  const languageMap = {
    'en': '',
    'ta': 'Tamil',
    'hi': 'Hindi',
    'ml': 'Malayalam'
  };
  
  const languageSuffix = languageMap[language] || '';
  
  switch (category) {
    case 'cowAndBuffalo':
      return languageSuffix ? `cowAndBuffalo${languageSuffix}` : 'cowAndBuffalo';
    case 'PoultryBirds':
      return languageSuffix ? `PoultryBirds${languageSuffix}` : 'PoultryBirds';
    case 'SheepGoat':
      return languageSuffix ? `SheepGoat${languageSuffix}` : 'SheepGoat';
    default:
      return category;
  }
};

// Get all possible collections for a category
export const getAllCollectionsForCategory = (category) => {
  const collections = ['cowAndBuffalo', 'PoultryBirds', 'SheepGoat'];
  
  if (!collections.includes(category)) {
    return [category];
  }
  
  return [
    category,
    `${category}Hindi`,
    `${category}Tamil`,
    `${category}Malayalam`
  ];
};
