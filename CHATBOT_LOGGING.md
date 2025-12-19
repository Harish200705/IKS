# Chatbot Logging System

## Overview
Your veterinary website now has a comprehensive logging system that tracks all chatbot interactions with detailed information about user messages, responses, confidence scores, and performance metrics.

## What Gets Logged

### For Each Chatbot Request:
- **User Message**: The exact text sent by the user
- **Language**: The language the user is using (en, hi, ta, etc.)
- **Timestamp**: When the request was made
- **IP Address**: User's IP address
- **User Agent**: Browser information

### For Each Response:
- **Formatted Response**: The final response shown to the user
- **Confidence Score**: AI model's confidence percentage (0-100%)
- **Detected Disease**: The disease identified by the AI
- **Matched Question**: The question that best matched the user's query
- **Response Time**: How long it took to get the response (in milliseconds)
- **Source**: Whether response came from chatbot or fallback

### For Errors:
- **Error Message**: What went wrong
- **Error Stack**: Technical details for debugging
- **Response Time**: How long before the error occurred

## Log Format Examples

### Successful Request:
```
=== CHATBOT API REQUEST ===
User Message: "What are the symptoms of fever in cattle?"
Requested Language: en
User Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36
IP Address: ::1
Request Timestamp: 2025-09-19T10:27:01.321Z

=== CHATBOT REQUEST ===
Message: "What are the symptoms of fever in cattle?"
Language: en
API URL: https://81a9b5d4181b.ngrok-free.app/chat
Timestamp: 2025-09-19T10:27:01.321Z
Response Time: 893ms
Raw API Response: {
  "answers": [
    {
      "answer": "Shivering of the body and limbs, erect hairs, watery eyes...",
      "disease": "Animal Fever"
    }
  ],
  "similarity_score": 0.875
}
Formatted Response: **Animal Fever**

Shivering of the body and limbs, erect hairs, watery eyes, recumbent and unable to get up, off feed and water, reduction in milk yield

*Confidence: 87.5%*
Detected Disease: Animal Fever
Confidence Score: 87.5%
Matched Question: N/A
Source: chatbot
=== CHATBOT RESPONSE END ===

=== CHATBOT API RESPONSE ===
Final Response: **Animal Fever**...
Response Source: chatbot
Success: true
Total Response Time: 893ms
API Response Time: 893ms
Confidence Score: 87.5%
Detected Disease: Animal Fever
Matched Question: N/A
Response Timestamp: 2025-09-19T10:27:01.321Z
=== CHATBOT API RESPONSE END ===
```

### Error Request:
```
=== CHATBOT ERROR ===
Message: "what is the symptoms of fever of cow"
Language: en
Error: socket hang up
Response Time: 5000ms
Timestamp: 2025-09-19T10:21:38.852Z
=== ERROR END ===
```

## How to View Logs

### 1. Real-time Monitoring
Watch your server console (terminal) where you ran `./start.sh`. All chatbot interactions will be logged there in real-time.

### 2. Analytics Endpoint
Visit: `http://localhost:5001/api/chat/analytics`

This endpoint provides information about the logging system and what data is being captured.

### 3. Log Analyzer Script
Use the provided script to analyze logs:

```bash
# Start real-time monitoring
node chatbot-log-analyzer.js monitor

# Generate analytics report
node chatbot-log-analyzer.js report
```

## Key Metrics Tracked

### Performance Metrics:
- **Response Time**: How fast the AI responds (typically 500-2000ms)
- **Success Rate**: Percentage of successful vs failed requests
- **API Availability**: Whether your Flask API is responding

### Quality Metrics:
- **Confidence Scores**: How confident the AI is in its responses (0-100%)
- **Disease Detection**: Which diseases are being identified most often
- **Language Distribution**: Which languages users are using

### Usage Metrics:
- **Total Requests**: Number of chatbot interactions
- **User Messages**: What questions users are asking
- **Error Types**: What kinds of errors occur

## Sample Log Analysis

From your recent logs, here are some insights:

### Recent Interactions:
1. **"What are the symptoms of diarrhea in cows?"** (English)
   - Detected: Diarrhoea in Young Calves
   - Confidence: 86.3%
   - Response Time: ~1000ms

2. **"what are the symptoms of fever"** (English)
   - Detected: Fever
   - Confidence: 96.0%
   - Response Time: ~800ms

3. **"my cow is infected with watery eyes, how can i treat it"** (Tamil)
   - Detected: Watery Eyes
   - Confidence: 70.4%
   - Response Time: ~900ms

### Performance Insights:
- Average response time: ~900ms
- High confidence scores (70-96%)
- Multi-language support working well
- Occasional API timeouts (socket hang up errors)

## Troubleshooting

### Common Issues:

1. **"socket hang up" errors**
   - Your Flask API might be temporarily unavailable
   - Check if your ngrok tunnel is still active
   - Verify your Flask app is running

2. **Low confidence scores**
   - User questions might be unclear
   - Disease not in your training data
   - Consider improving your model's training data

3. **Slow response times**
   - Network latency to your Flask API
   - Your model might be processing complex queries
   - Consider optimizing your model or using a faster server

## Best Practices

1. **Monitor Regularly**: Check logs daily to identify issues
2. **Track Confidence**: Low confidence scores indicate areas for improvement
3. **Analyze Errors**: Common errors help identify system issues
4. **Language Usage**: Track which languages are most used
5. **Response Times**: Monitor for performance degradation

## API Endpoints for Logging

- `POST /api/chat` - Main chatbot endpoint (logs all interactions)
- `GET /api/chat/status` - Check if chatbot service is available
- `GET /api/chat/analytics` - Get logging system information

## Next Steps

1. **Set up log persistence**: Store logs in a database for long-term analysis
2. **Create dashboards**: Build visual analytics for better insights
3. **Alert system**: Set up alerts for high error rates or slow responses
4. **Performance optimization**: Use logs to identify bottlenecks

Your chatbot logging system is now fully operational and providing detailed insights into user interactions, AI performance, and system health!

