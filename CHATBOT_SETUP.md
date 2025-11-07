# Veterinary Chatbot Integration Guide

## Overview
This guide will help you connect your Google Colab chatbot model to your veterinary website.

## Step 1: Prepare Your Colab Model

### Option A: Use the Integration Script (Recommended)
1. Copy the contents of `colab-integration.py` to your Google Colab notebook
2. Replace the `load_veterinary_model()` function with your actual model loading code
3. Replace the model prediction logic with your actual model inference

### Option B: Modify Your Existing Colab Code
Add these endpoints to your existing Colab notebook:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')
    language = data.get('language', 'en')
    
    # Your model prediction here
    response = your_model_function(message)
    
    return jsonify({
        'response': response,
        'status': 'success'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

## Step 2: Expose Your Colab Model

### Method 1: Using ngrok (Easiest)
```python
# Install ngrok in Colab
!pip install pyngrok

from pyngrok import ngrok

# Run your Flask app
# ... your Flask app code ...

# Expose the app
public_url = ngrok.connect(5000)
print(f"Public URL: {public_url}")
```

### Method 2: Using Colab's Public URL
1. In your Colab notebook, go to "Runtime" → "Change runtime type"
2. Set "Hardware accelerator" to "GPU" if needed
3. Run your Flask app
4. Use Colab's built-in URL sharing

## Step 3: Configure Your Website

### Update Environment Variables
Create a `.env` file in your backend directory:

```env
# Chatbot Configuration
CHATBOT_API_URL=http://your-ngrok-url.ngrok.io/chat
# OR
CHATBOT_API_URL=https://your-colab-url/chat
```

### Test the Connection
```bash
# Test the chatbot endpoint
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the symptoms of diarrhea in cows?", "language": "en"}'
```

## Step 4: Deploy to Production (Optional)

### Option A: Google Cloud Run
1. Save your Colab model as a Docker container
2. Deploy to Google Cloud Run
3. Update your website's environment variables

### Option B: Heroku
1. Create a Heroku app
2. Deploy your model code
3. Update your website's environment variables

### Option C: Railway/Render
1. Create a new project
2. Deploy your model
3. Update your website's environment variables

## Step 5: Test the Integration

1. Start your website servers:
   ```bash
   ./start.sh
   ```

2. Open your website in the browser
3. Click the chat button (💬) in the bottom-right corner
4. Ask a question about animal diseases
5. Check the backend logs for chatbot requests

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Make sure you have `CORS(app)` in your Flask app
   - Check that your Colab URL is accessible

2. **Connection Timeout**
   - Verify your ngrok URL is active
   - Check that your Flask app is running on port 5000

3. **Model Not Loading**
   - Ensure your model files are properly loaded in Colab
   - Check the model loading function

### Debug Commands

```bash
# Check chatbot status
curl http://localhost:5001/api/chat/status

# Test chatbot endpoint
curl -X POST http://localhost:5001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "language": "en"}'
```

## Example Model Integration

Here's how to integrate a simple model:

```python
# In your Colab notebook
import tensorflow as tf
import numpy as np

# Load your model
model = tf.keras.models.load_model('your_model.h5')

def predict_disease(message):
    # Preprocess the message
    processed_message = preprocess_text(message)
    
    # Get prediction
    prediction = model.predict(processed_message)
    
    # Convert to response
    response = format_response(prediction)
    
    return response

# Use in Flask endpoint
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data.get('message', '')
    
    response = predict_disease(message)
    
    return jsonify({
        'response': response,
        'status': 'success'
    })
```

## Support

If you encounter any issues:
1. Check the backend logs for error messages
2. Verify your Colab model is running and accessible
3. Test the chatbot endpoint directly
4. Check the browser console for frontend errors

