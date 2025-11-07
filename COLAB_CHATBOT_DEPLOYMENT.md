# Deploy Google Colab Chatbot to Render

This guide will help you deploy your Google Colab chatbot code to Render and connect it to your live website.

## 📋 Step 1: Extract Code from Google Colab

### 1.1 Prepare Your Colab Code

1. **Open your Google Colab notebook**
2. **Create a new cell** and add this Flask wrapper code:

```python
# Flask API Wrapper for Colab Chatbot
from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # Allow requests from your website

# ============================================
# PASTE YOUR EXISTING CHATBOT CODE HERE
# ============================================
# Copy all your model loading, prediction, and processing code here
# Make sure to keep all your imports and model initialization

# Example structure:
# - Load your model
# - Define your prediction function
# - Any preprocessing/postprocessing functions

# ============================================
# API ENDPOINTS
# ============================================

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Chatbot service is running'
    }), 200

@app.route('/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        # Get request data
        data = request.get_json()
        message = data.get('message', '')
        language = data.get('language', 'en')
        
        if not message:
            return jsonify({
                'response': 'Please provide a message',
                'status': 'error'
            }), 400
        
        # ============================================
        # CALL YOUR CHATBOT MODEL HERE
        # ============================================
        # Replace this with your actual model prediction
        # Example:
        # response = your_chatbot_model.predict(message, language)
        
        # For now, placeholder:
        response = f"Response to: {message}"
        
        return jsonify({
            'response': response,
            'status': 'success',
            'language': language
        }), 200
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({
            'response': 'Sorry, I encountered an error processing your request.',
            'status': 'error',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("Starting Chatbot API...")
    app.run(host='0.0.0.0', port=5000, debug=True)
```

### 1.2 Test in Colab First

1. **Install Flask and CORS** in Colab:
```python
!pip install flask flask-cors
```

2. **Run your Flask app** in Colab:
```python
# Run the app
app.run(host='0.0.0.0', port=5000)
```

3. **Test with ngrok** (optional, for testing):
```python
!pip install pyngrok
from pyngrok import ngrok

# Start ngrok tunnel
public_url = ngrok.connect(5000)
print(f"Public URL: {public_url}")
```

4. **Test the endpoint**:
```python
import requests

# Test health endpoint
response = requests.get('http://localhost:5000/health')
print(response.json())

# Test chat endpoint
response = requests.post('http://localhost:5000/chat', json={
    'message': 'What is mastitis?',
    'language': 'en'
})
print(response.json())
```

---

## 📦 Step 2: Prepare for Deployment

### 2.1 Create Project Structure

Create a new folder for your chatbot service:

```
chatbot-service/
├── app.py              # Your main Flask app
├── requirements.txt    # Python dependencies
├── .env.example       # Environment variables template
└── README.md          # Documentation
```

### 2.2 Create `app.py`

Copy your Colab code into `app.py`:

```python
# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# ============================================
# YOUR CHATBOT CODE FROM COLAB
# ============================================
# Paste all your imports, model loading, and functions here

# Initialize your model (do this once at startup)
def load_model():
    """Load your chatbot model"""
    # Your model loading code here
    pass

# Load model when app starts
model = load_model()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '')
        language = data.get('language', 'en')
        
        # Call your model
        response = model.predict(message, language)
        
        return jsonify({
            'response': response,
            'status': 'success'
        }), 200
    except Exception as e:
        return jsonify({
            'response': 'Error processing request',
            'status': 'error',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
```

### 2.3 Create `requirements.txt`

List all your Python dependencies:

```txt
flask>=2.0.0
flask-cors>=3.0.0
gunicorn>=20.1.0
# Add all your ML library dependencies here
# For example:
# tensorflow>=2.10.0
# torch>=1.13.0
# transformers>=4.20.0
# sentence-transformers>=2.2.0
# numpy>=1.21.0
# pandas>=1.3.0
# scikit-learn>=1.0.0
```

**Important**: Include ALL libraries you use in Colab!

### 2.4 Create `.env.example`

```env
PORT=5000
FLASK_ENV=production
# Add any API keys or secrets here
```

---

## 🚀 Step 3: Deploy to Render

### 3.1 Push to GitHub

1. **Initialize git** in your chatbot folder:
```bash
cd chatbot-service
git init
git add .
git commit -m "Initial chatbot service"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chatbot-service.git
git push -u origin main
```

### 3.2 Deploy on Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository** (chatbot-service)
4. **Configure the service**:
   - **Name**: `veterinary-chatbot` (or your choice)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`
   - **Plan**: Free tier is fine for testing

### 3.3 Set Environment Variables

In Render dashboard → Environment tab, add:
- `PORT`: Render sets this automatically
- Any API keys or secrets your chatbot needs

### 3.4 Deploy

Click **"Create Web Service"** and wait for deployment (5-10 minutes for first build).

**Your chatbot URL will be**: `https://veterinary-chatbot.onrender.com`

---

## 🔗 Step 4: Connect to Your Website

### 4.1 Update Backend Chatbot Configuration

Edit `backend/chatbot.js`:

```javascript
const CHATBOT_CONFIG = {
  // Your deployed Render chatbot URL
  API_URL: process.env.CHATBOT_API_URL || 'https://veterinary-chatbot.onrender.com/chat',
  
  // Fallback responses
  FALLBACK_RESPONSES: {
    en: "I'm sorry, I couldn't process your request. Please try rephrasing your question.",
    hi: "मुझे खेद है, मैं आपके अनुरोध को संसाधित नहीं कर सका।",
    ta: "மன்னிக்கவும், உங்கள் கோரிக்கையை நான் செயல்படுத்த முடியவில்லை."
  }
};
```

### 4.2 Update Backend Environment Variables

In Render dashboard → Your Backend Service → Environment:
- Add: `CHATBOT_API_URL=https://veterinary-chatbot.onrender.com/chat`

### 4.3 Test the Connection

1. **Test chatbot health**:
   ```bash
   curl https://veterinary-chatbot.onrender.com/health
   ```

2. **Test chatbot chat**:
   ```bash
   curl -X POST https://veterinary-chatbot.onrender.com/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "What is mastitis?", "language": "en"}'
   ```

3. **Test from your website**:
   - Open your live website
   - Open chatbot
   - Send a test message

---

## 📝 Step 5: Common Issues & Solutions

### Issue 1: Model Files Too Large

**Problem**: Your model files exceed GitHub's 100MB limit.

**Solution**: Use cloud storage (Google Drive, S3, etc.)

1. **Upload model files to cloud storage**
2. **Download in app.py**:
```python
import gdown  # or boto3 for S3

def download_model():
    # Download from Google Drive
    model_url = 'https://drive.google.com/uc?id=YOUR_FILE_ID'
    gdown.download(model_url, 'model.pkl', quiet=False)
```

3. **Add to requirements.txt**:
```txt
gdown>=4.6.0
```

### Issue 2: Build Timeout

**Problem**: Model loading takes too long during build.

**Solution**: Load model at runtime, not build time.

```python
# In app.py
model = None

def get_model():
    global model
    if model is None:
        model = load_model()
    return model

@app.route('/chat', methods=['POST'])
def chat():
    model = get_model()  # Lazy loading
    # ... rest of code
```

### Issue 3: Memory Limits

**Problem**: Free tier has 512MB RAM limit.

**Solution**:
- Optimize your model (quantization, smaller model)
- Use Render's paid tier ($7/month for 1GB RAM)
- Or use model serving services (Hugging Face, Replicate)

### Issue 4: Cold Start Delay

**Problem**: Free tier services sleep after 15 minutes.

**Solution**:
- Use a service like UptimeRobot to ping your service every 5 minutes
- Or upgrade to paid tier (always on)

---

## 🎯 Quick Checklist

- [ ] Extracted code from Colab
- [ ] Created Flask wrapper
- [ ] Tested locally/in Colab
- [ ] Created `requirements.txt` with all dependencies
- [ ] Created `app.py` with your chatbot code
- [ ] Pushed to GitHub
- [ ] Deployed to Render
- [ ] Tested chatbot health endpoint
- [ ] Tested chatbot chat endpoint
- [ ] Updated backend `CHATBOT_API_URL`
- [ ] Tested from live website

---

## 🔄 Alternative: Keep Using Colab with ngrok

If you prefer to keep using Colab:

1. **Install ngrok in Colab**:
```python
!pip install pyngrok
from pyngrok import ngrok

# Start tunnel
public_url = ngrok.connect(5000)
print(f"Public URL: {public_url}")
```

2. **Update backend** with ngrok URL:
```javascript
API_URL: 'https://your-ngrok-url.ngrok-free.app/chat'
```

**Note**: ngrok free tier URLs change every time you restart. Render is more stable for production.

---

## 📞 Need Help?

- Check Render logs: Dashboard → Your Service → Logs
- Test endpoints with curl or Postman
- Check browser console for frontend errors
- Check backend logs for API errors

