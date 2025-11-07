#!/usr/bin/env node

/**
 * Chatbot Log Analyzer
 * This script helps analyze chatbot interaction logs from the server console
 */

const fs = require('fs');
const path = require('path');

class ChatbotLogAnalyzer {
  constructor() {
    this.logs = [];
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      averageConfidence: 0,
      languageDistribution: {},
      diseaseDistribution: {},
      errorTypes: {}
    };
  }

  // Parse log entries from console output
  parseLogEntry(logLine) {
    const timestamp = new Date().toISOString();
    
    // Look for chatbot request patterns
    if (logLine.includes('=== CHATBOT API REQUEST ===')) {
      return { type: 'request_start', timestamp };
    }
    
    if (logLine.includes('User Message:')) {
      const match = logLine.match(/User Message: "(.+?)"/);
      return { type: 'user_message', message: match ? match[1] : null };
    }
    
    if (logLine.includes('Requested Language:')) {
      const match = logLine.match(/Requested Language: (\w+)/);
      return { type: 'language', language: match ? match[1] : null };
    }
    
    if (logLine.includes('=== CHATBOT API RESPONSE ===')) {
      return { type: 'response_start', timestamp };
    }
    
    if (logLine.includes('Final Response:')) {
      const match = logLine.match(/Final Response: (.+)/);
      return { type: 'final_response', response: match ? match[1] : null };
    }
    
    if (logLine.includes('Confidence Score:')) {
      const match = logLine.match(/Confidence Score: ([\d.]+)%/);
      return { type: 'confidence', confidence: match ? parseFloat(match[1]) : null };
    }
    
    if (logLine.includes('Detected Disease:')) {
      const match = logLine.match(/Detected Disease: (.+)/);
      return { type: 'disease', disease: match ? match[1] : null };
    }
    
    if (logLine.includes('Total Response Time:')) {
      const match = logLine.match(/Total Response Time: (\d+)ms/);
      return { type: 'response_time', time: match ? parseInt(match[1]) : null };
    }
    
    if (logLine.includes('=== CHATBOT ERROR ===')) {
      return { type: 'error', timestamp };
    }
    
    return null;
  }

  // Generate analytics report
  generateReport() {
    console.log('\n🤖 CHATBOT ANALYTICS REPORT');
    console.log('='.repeat(50));
    
    console.log(`\n📊 OVERALL STATISTICS:`);
    console.log(`Total Requests: ${this.stats.totalRequests}`);
    console.log(`Successful Requests: ${this.stats.successfulRequests}`);
    console.log(`Failed Requests: ${this.stats.failedRequests}`);
    console.log(`Success Rate: ${this.stats.totalRequests > 0 ? ((this.stats.successfulRequests / this.stats.totalRequests) * 100).toFixed(1) : 0}%`);
    
    if (this.stats.averageResponseTime > 0) {
      console.log(`Average Response Time: ${this.stats.averageResponseTime.toFixed(0)}ms`);
    }
    
    if (this.stats.averageConfidence > 0) {
      console.log(`Average Confidence Score: ${this.stats.averageConfidence.toFixed(1)}%`);
    }
    
    console.log(`\n🌍 LANGUAGE DISTRIBUTION:`);
    Object.entries(this.stats.languageDistribution).forEach(([lang, count]) => {
      console.log(`${lang}: ${count} requests`);
    });
    
    console.log(`\n🦠 TOP DISEASES DETECTED:`);
    const sortedDiseases = Object.entries(this.stats.diseaseDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    sortedDiseases.forEach(([disease, count]) => {
      console.log(`${disease}: ${count} times`);
    });
    
    if (Object.keys(this.stats.errorTypes).length > 0) {
      console.log(`\n❌ ERROR TYPES:`);
      Object.entries(this.stats.errorTypes).forEach(([error, count]) => {
        console.log(`${error}: ${count} times`);
      });
    }
    
    console.log('\n' + '='.repeat(50));
  }

  // Real-time log monitoring
  startMonitoring() {
    console.log('🔍 Starting real-time chatbot log monitoring...');
    console.log('📝 Watch your server console for detailed logs');
    console.log('💡 Each interaction will show:');
    console.log('   - User message and language');
    console.log('   - Response time and confidence score');
    console.log('   - Detected disease and matched question');
    console.log('   - Any errors that occur');
    console.log('\nPress Ctrl+C to stop monitoring\n');
    
    // This would typically tail log files in a real implementation
    console.log('📊 To view analytics, visit: http://localhost:5001/api/chat/analytics');
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new ChatbotLogAnalyzer();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'monitor':
      analyzer.startMonitoring();
      break;
    case 'report':
      analyzer.generateReport();
      break;
    default:
      console.log('🤖 Chatbot Log Analyzer');
      console.log('Usage:');
      console.log('  node chatbot-log-analyzer.js monitor  - Start real-time monitoring');
      console.log('  node chatbot-log-analyzer.js report   - Generate analytics report');
      console.log('\n📊 View live analytics at: http://localhost:5001/api/chat/analytics');
  }
}

module.exports = ChatbotLogAnalyzer;
