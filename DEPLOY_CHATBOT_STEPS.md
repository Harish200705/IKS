# Deploy Colab Chatbot to Render - Step by Step

## 📋 Quick Summary

You have a chatbot in Colab using Sentence Transformers. Here's how to deploy it to Render.

---

## 🎯 Step 1: Download Your Data File

### From Google Colab:

1. **Open your Colab notebook**
2. **Download the data file**:
   ```python
   from google.colab import files
   files.download("/content/drive/My Drive/biobert-chatbot/processed_template_qa.json")
   ```

   OR

   - Go to Google Drive
   - Navigate to: `My Drive/biobert-chatbot/`
   - Download `processed_template_qa.json`

---

## 📁 Step 2: Create Project Structure

### On your computer:

```bash
# Navigate to your project
cd /Volumes/🦋2001/Harish/veterinary-website

# The chatbot-service folder is already created with app.py
# Now create data folder and add your file
mkdir -p chatbot-service/data

# Copy your downloaded file
# (Replace with actual path to your downloaded file)
cp ~/Downloads/processed_template_qa.json chatbot-service/data/
```

**Verify structure**:
```
chatbot-service/
├── app.py                    ✅ (already created)
├── requirements.txt          ✅ (already created)
├── README.md                ✅ (already created)
├── .gitignore               ✅ (already created)
└── data/
    └── processed_template_qa.json  ← You need to add this
```

---

## 🧪 Step 3: Test Locally (Optional but Recommended)

```bash
cd chatbot-service

# Install dependencies
pip install -r requirements.txt

# Run the app
python app.py
```

**You should see**:
```
🚀 Initializing Veterinary Chatbot API...
📂 Loading dataset from ...
✅ Loaded X Q&A pairs
🔄 Loading Sentence Transformer model...
✅ Model loaded
🔄 Encoding dataset questions...
✅ Encoded X questions
✅ Chatbot ready!
🚀 Starting Chatbot API on port 5000
```

**Test it**:
```bash
# In another terminal
curl http://localhost:5000/health

curl -X POST http://localhost:5000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is mastitis?", "language": "en"}'
```

---

## 📤 Step 4: Push to GitHub

```bash
cd chatbot-service

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Veterinary chatbot service ready for deployment"

# Create GitHub repository first, then:
git remote add origin https://github.com/YOUR_USERNAME/veterinary-chatbot.git
git branch -M main
git push -u origin main
```

**Important**: Make sure `processed_template_qa.json` is included in the commit!

---

## 🚀 Step 5: Deploy to Render

### 5.1 Create Web Service

1. **Go to**: https://dashboard.render.com
2. **Click**: "New +" → "Web Service"
3. **Connect**: Your GitHub account
4. **Select**: Your `veterinary-chatbot` repository

### 5.2 Configure Service

Fill in these settings:

- **Name**: `veterinary-chatbot` (or your choice)
- **Environment**: `Python 3`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: (leave empty, or `./` if needed)
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`
- **Plan**: `Free` (or `Starter` for $7/month - always on)

### 5.3 Deploy

1. **Click**: "Create Web Service"
2. **Wait**: 5-10 minutes for first build
   - It will download the model (`all-MiniLM-L6-v2`)
   - Install all dependencies
   - Load and encode your dataset

### 5.4 Get Your URL

After deployment, you'll get a URL like:
```
https://veterinary-chatbot.onrender.com
```

**Save this URL!**

---

## 🔗 Step 6: Connect to Your Website

### 6.1 Update Backend Environment Variables

1. **Go to**: Render Dashboard → Your Backend Service
2. **Click**: "Environment" tab
3. **Add new variable**:
   - **Key**: `CHATBOT_API_URL`
   - **Value**: `https://veterinary-chatbot.onrender.com/chat`
4. **Save**

### 6.2 Restart Backend

1. **Go to**: Your Backend Service → "Manual Deploy" → "Deploy latest commit"
2. **Wait**: For deployment to complete

---

## ✅ Step 7: Test Everything

### 7.1 Test Chatbot Health

```bash
curl https://veterinary-chatbot.onrender.com/health
```

**Expected response**:
```json
{
  "status": "ok",
  "message": "Chatbot service is running",
  "model_loaded": true,
  "dataset_loaded": true
}
```

### 7.2 Test Chatbot Chat

```bash
curl -X POST https://veterinary-chatbot.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is mastitis?", "language": "en"}'
```

**Expected response**:
```json
{
  "response": "...answer...",
  "detected_disease": "...",
  "matched_question": "...",
  "similarity_score": 0.85,
  "status": "success",
  "language": "en"
}
```

### 7.3 Test from Your Website

1. **Open**: Your live website
2. **Open**: Chatbot widget
3. **Send**: A test message like "What is mastitis?"
4. **Verify**: You get a response

---

## 🎉 Done!

Your chatbot is now live and connected to your website!

**Chatbot URL**: `https://veterinary-chatbot.onrender.com`  
**Health Check**: `https://veterinary-chatbot.onrender.com/health`  
**Chat Endpoint**: `https://veterinary-chatbot.onrender.com/chat`

---

## 🐛 Troubleshooting

### Issue: "Dataset file not found"

**Solution**:
- Make sure `processed_template_qa.json` is in `data/` folder
- Check it's committed to GitHub
- Verify file path in `app.py` is correct

### Issue: Build fails

**Solution**:
- Check Render logs for error messages
- Verify `requirements.txt` has all dependencies
- Make sure Python version is compatible

### Issue: Out of memory

**Solution**:
- Free tier has 512MB RAM
- If your dataset is too large, reduce it
- Or upgrade to paid tier ($7/month for 1GB)

### Issue: Slow first response

**Solution**:
- Normal! Model loads on first request (30-60 seconds)
- Subsequent requests are fast
- Free tier services sleep after 15 minutes

### Issue: CORS errors

**Solution**:
- Already handled in `app.py` with `CORS(app)`
- If still issues, check backend is calling correct URL

---

## 📝 Notes

- **First deployment**: Takes 5-10 minutes (downloading model)
- **First request**: Takes 30-60 seconds (loading model into memory)
- **Free tier**: Services sleep after 15 minutes of inactivity
- **Memory**: 512MB on free tier (should be enough)
- **Model size**: `all-MiniLM-L6-v2` is ~80MB

---

## ✅ Final Checklist

- [ ] Downloaded `processed_template_qa.json` from Google Drive
- [ ] Created `data/` folder and copied file
- [ ] Tested locally (optional)
- [ ] Pushed to GitHub (with data file)
- [ ] Created Render Web Service
- [ ] Deployment successful
- [ ] Tested health endpoint
- [ ] Tested chat endpoint
- [ ] Updated backend `CHATBOT_API_URL`
- [ ] Restarted backend
- [ ] Tested from live website

---

## 🎓 Next Steps (Optional)

1. **Add more languages**: Extend the chatbot to handle multiple languages
2. **Improve responses**: Fine-tune similarity threshold
3. **Add logging**: Track user queries and responses
4. **Monitor performance**: Use Render metrics to track usage
5. **Upgrade tier**: For always-on service (no cold starts)

