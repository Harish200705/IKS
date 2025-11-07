// Test script for language detection functionality
const detectLanguage = (text) => {
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

// Test cases
const testCases = [
  { text: "fever", expected: "en", description: "English word" },
  { text: "ज्वर", expected: "hi", description: "Hindi word for fever" },
  { text: "காய்ச்சல்", expected: "ta", description: "Tamil word for fever" },
  { text: "జ్వరం", expected: "te", description: "Telugu word for fever" },
  { text: "തണുപ്പ്", expected: "ml", description: "Malayalam word for cold" },
  { text: "ಜ್ವರ", expected: "kn", description: "Kannada word for fever" },
  { text: "cough and fever", expected: "en", description: "English phrase" },
  { text: "खांसी और ज्वर", expected: "hi", description: "Hindi phrase" },
  { text: "இருமல் மற்றும் காய்ச்சல்", expected: "ta", description: "Tamil phrase" }
];

console.log("Testing Language Detection Functionality\n");
console.log("=" .repeat(50));

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = detectLanguage(testCase.text);
  const success = result === testCase.expected;
  
  console.log(`Test ${index + 1}: ${testCase.description}`);
  console.log(`Input: "${testCase.text}"`);
  console.log(`Expected: ${testCase.expected}, Got: ${result}`);
  console.log(`Status: ${success ? '✅ PASS' : '❌ FAIL'}`);
  console.log("-".repeat(30));
  
  if (success) {
    passed++;
  } else {
    failed++;
  }
});

console.log(`\nTest Results: ${passed} passed, ${failed} failed`);
console.log(`Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log("\n🎉 All tests passed! Language detection is working correctly.");
} else {
  console.log(`\n⚠️  ${failed} test(s) failed. Please check the implementation.`);
}
