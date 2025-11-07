# Veterinary Chatbot Service

Semantic search chatbot using Sentence Transformers, deployed from Google Colab.

## 📋 Prerequisites

1. Your `processed_template_qa.json` file from Google Drive
2. GitHub account
3. Render account

## 🚀 Deployment Steps

### Step 1: Prepare Your Data File

1. **Download from Google Drive**:
   - Go to: `/content/drive/My Drive/biobert-chatbot/processed_template_qa.json`
   - Download this file to your computer

2. **Create data folder**:
   ```bash
   mkdir -p chatbot-service/data
   ```

3. **Copy the file**:
   ```bash
   # Copy processed_template_qa.json to chatbot-service/data/
   cp /path/to/processed_template_qa.json chatbot-service/data/
   ```

### Step 2: Verify Files

Your folder structure should be:
```
chatbot-service/
├── app.py
├── requirements.txt
├── README.md
├── data/
│   └── processed_template_qa.json  ← Your data file here
└── .gitignore
```

### Step 3: Test Locally (Optional)

```bash
cd chatbot-service
pip install -r requirements.txt
python app.py
```

Test with:
```bash
# Health check
curl http://localhost:5000/health

# Chat test
curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is mastitis?", "language": "en"}'
```

### Step 4: Push to GitHub

```bash
cd chatbot-service
git init
git add .
git commit -m "Veterinary chatbot service"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/veterinary-chatbot.git
git push -u origin main
```

### Step 5: Deploy to Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `veterinary-chatbot`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`
   - **Plan**: Free tier (or paid for better performance)
5. Click **"Create Web Service"**
6. Wait for deployment (5-10 minutes for first build)

### Step 6: Connect to Your Website

1. **Copy your chatbot URL**: `https://veterinary-chatbot.onrender.com`

2. **Update backend environment variables**:
   - Go to Render Dashboard → Your Backend Service → Environment
   - Add: `CHATBOT_API_URL=https://veterinary-chatbot.onrender.com/chat`

3. **Restart backend service**

4. **Test from your website**:
   - Open your live website
   - Open chatbot
   - Send a test message

## 🔍 Testing

### Test Health Endpoint
```bash
curl https://veterinary-chatbot.onrender.com/health
```

### Test Chat Endpoint
```bash
curl -X POST https://veterinary-chatbot.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is mastitis?", "language": "en"}'
```

## 📝 Notes

- **First request may be slow** (30-60 seconds) - model loading
- **Free tier sleeps** after 15 minutes of inactivity
- **Memory limit**: 512MB on free tier (should be enough for this model)
- **Build time**: 5-10 minutes (downloading model and dependencies)

## 🐛 Troubleshooting

### Error: "Dataset file not found"
- Make sure `processed_template_qa.json` is in the `data/` folder
- Check file path in `app.py` matches your structure

### Error: "Out of memory"
- Upgrade to paid tier ($7/month for 1GB RAM)
- Or optimize your dataset (reduce size)

### Slow responses
- First request loads the model (slow)
- Subsequent requests should be fast
- Free tier may have cold starts

## ✅ Checklist

- [ ] Downloaded `processed_template_qa.json` from Google Drive
- [ ] Created `data/` folder and copied file
- [ ] Tested locally (optional)
- [ ] Pushed to GitHub
- [ ] Deployed to Render
- [ ] Tested health endpoint
- [ ] Tested chat endpoint
- [ ] Updated backend `CHATBOT_API_URL`
- [ ] Tested from live website

