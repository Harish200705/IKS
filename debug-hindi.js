const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'en';
  const trimmedText = text.trim();
  const hindiRegex = /[\u0900-\u097F]/;
  if (hindiRegex.test(trimmedText)) return 'hi';
  return 'en';
};

console.log('Testing Hindi detection:');
console.log('Input: दस्त');
console.log('Detected:', detectLanguage('दस्त'));
console.log('Regex test:', /[\u0900-\u097F]/.test('दस्त'));

// Test with URL encoding
const encoded = encodeURIComponent('दस्त');
console.log('URL encoded:', encoded);
console.log('Decoded:', decodeURIComponent(encoded));
console.log('Detected from decoded:', detectLanguage(decodeURIComponent(encoded)));
