# Quick Chatbot Deployment - 5 Minutes

## 🚀 Fast Track

### Step 1: Push to GitHub (2 min)

```bash
cd /Volumes/🦋2001/Harish/veterinary-website/chatbot-service

# Make sure data file is there
ls data/processed_template_qa.json

# Push to GitHub
git init  # if not already
git add .
git commit -m "Chatbot service"
git remote add origin https://github.com/YOUR_USERNAME/veterinary-chatbot.git
git push -u origin main
```

### Step 2: Deploy on Render (3 min)

1. Go to https://dashboard.render.com
2. **New +** → **Web Service**
3. Connect GitHub → Select `veterinary-chatbot` repo
4. Settings:
   - **Name**: `veterinary-chatbot`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`
5. **Create Web Service**
6. Wait 5-10 minutes

### Step 3: Connect to Website (1 min)

1. Copy chatbot URL: `https://veterinary-chatbot.onrender.com`
2. Go to Backend Service → Environment
3. Add: `CHATBOT_API_URL=https://veterinary-chatbot.onrender.com/chat`
4. Restart backend

### Step 4: Test

```bash
# Test health
curl https://veterinary-chatbot.onrender.com/health

# Test chat
curl -X POST https://veterinary-chatbot.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is mastitis?", "language": "en"}'
```

## ✅ Done!

Your chatbot is live and connected!

