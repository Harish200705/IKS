# Veterinary Chatbot - Hugging Face Spaces

This is a veterinary chatbot API deployed on Hugging Face Spaces.

## API Endpoints

- `GET /health` - Health check
- `POST /chat` - Chat endpoint
  ```json
  {
    "message": "What is mastitis?",
    "language": "en"
  }
  ```

## Response Format

```json
{
  "response": "Answer text...",
  "detected_disease": "Disease name",
  "matched_question": "Matched question",
  "similarity_score": 0.95,
  "status": "success"
}
```

## Usage

The API URL will be:
```
https://your-username-veterinary-chatbot.hf.space
```

Use this URL in your backend's `CHATBOT_API_URL` environment variable.

