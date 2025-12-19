# Deploy Chatbot to Render - Step by Step

## 📋 Prerequisites

✅ Your chatbot is working locally on port 5002  
✅ You have the `processed_template_qa.json` file in the `data/` folder  
✅ You have a GitHub account  

---

## 🚀 Step 1: Prepare Your Code

### 1.1 Verify Your Files

Make sure you have:
```
chatbot-service/
├── app.py                    ✅
├── requirements.txt          ✅
├── data/
│   └── processed_template_qa.json  ✅ (MUST BE HERE)
├── README.md
└── .gitignore
```

### 1.2 Check Data File Size

```bash
cd chatbot-service
ls -lh data/processed_template_qa.json
```

**If file is >100MB:**
- GitHub won't accept it
- You'll need to use Git LFS or cloud storage
- See "Large File Solution" below

---

## 📤 Step 2: Push to GitHub

### 2.1 Initialize Git (if not already)

```bash
cd /Volumes/🦋2001/Harish/veterinary-website/chatbot-service

# Check if git is initialized
git status

# If not initialized:
git init
git add .
git commit -m "Chatbot service ready for deployment"
```

### 2.2 Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `veterinary-chatbot` (or your choice)
3. Make it **Public** (or Private if you have GitHub Pro)
4. **Don't** initialize with README
5. Click **"Create repository"**

### 2.3 Push Your Code

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/veterinary-chatbot.git
git branch -M main
git push -u origin main
```

**Important**: Make sure `data/processed_template_qa.json` is included!

---

## 🌐 Step 3: Deploy to Render

### 3.1 Create Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. **Connect** your GitHub account (if not already)
4. **Select** your `veterinary-chatbot` repository

### 3.2 Configure Service

Fill in these settings:

- **Name**: `veterinary-chatbot` (or your choice)
- **Environment**: `Python 3`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: (leave empty)
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`
- **Plan**: 
  - **Free** - Good for testing (sleeps after 15 min)
  - **Starter ($7/month)** - Always on, 1GB RAM (recommended for production)

### 3.3 Set Environment Variables (Optional)

Click **"Advanced"** → **"Add Environment Variable"**:

- **Key**: `PORT`
- **Value**: (Leave empty - Render sets this automatically)

You can add more later if needed.

### 3.4 Deploy

1. Click **"Create Web Service"**
2. **Wait**: 5-10 minutes for first build
   - Downloads model (`all-MiniLM-L6-v2`)
   - Installs dependencies
   - Loads and encodes dataset

### 3.5 Get Your URL

After deployment, you'll get a URL like:
```
https://veterinary-chatbot.onrender.com
```

**Save this URL!**

---

## 🔗 Step 4: Connect to Your Website

### 4.1 Update Backend Environment Variables

1. Go to Render Dashboard → Your **Backend Service**
2. Click **"Environment"** tab
3. **Add/Update**:
   - **Key**: `CHATBOT_API_URL`
   - **Value**: `https://veterinary-chatbot.onrender.com/chat`
   - (Replace with your actual chatbot URL)

### 4.2 Restart Backend

1. Go to your Backend Service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for deployment to complete

---

## ✅ Step 5: Test

### 5.1 Test Chatbot Health

```bash
curl https://veterinary-chatbot.onrender.com/health
```

**Expected**:
```json
{
  "status": "ok",
  "message": "Chatbot service is running",
  "model_loaded": true,
  "dataset_loaded": true
}
```

### 5.2 Test Chatbot Chat

```bash
curl -X POST https://veterinary-chatbot.onrender.com/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is mastitis?", "language": "en"}'
```

**Expected**: JSON response with answer

### 5.3 Test from Website

1. Open your live website
2. Open chatbot
3. Send: "What is mastitis?"
4. Should get a response!

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Check Render Logs**:
- Go to your service → **"Logs"** tab
- Look for error messages
- Common issues:
  - Missing dependencies in `requirements.txt`
  - Data file not found
  - Python version mismatch

### Issue: "Dataset file not found"

**Solution**:
- Make sure `data/processed_template_qa.json` is in your GitHub repo
- Check file path in `app.py` matches your structure
- Verify file is committed: `git ls-files data/`

### Issue: Out of Memory

**Solution**:
- Free tier has 512MB RAM
- If your dataset is too large, reduce it
- Or upgrade to Starter plan ($7/month, 1GB RAM)

### Issue: Slow First Request

**Solution**:
- Normal! Model loads on first request (30-60 seconds)
- Subsequent requests are fast
- Free tier services sleep after 15 minutes

### Issue: Service Keeps Sleeping

**Solution**:
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Upgrade to Starter plan for always-on service

---

## 📊 Step 6: Monitor

### Check Logs

- Go to Render Dashboard → Your Chatbot Service → **"Logs"**
- See real-time logs
- Check for errors

### Check Metrics

- **CPU Usage**: Should be low when idle
- **Memory Usage**: Check if you're hitting limits
- **Response Time**: Should be <1 second after model loads

---

## 🔄 Step 7: Update Code

When you make changes:

```bash
cd chatbot-service
git add .
git commit -m "Update chatbot"
git push
```

Render will **automatically deploy** the new version!

---

## ✅ Deployment Checklist

- [ ] Data file is in `data/` folder
- [ ] All files committed to git
- [ ] Pushed to GitHub
- [ ] Created Render Web Service
- [ ] Build successful
- [ ] Health endpoint works
- [ ] Chat endpoint works
- [ ] Updated backend `CHATBOT_API_URL`
- [ ] Restarted backend
- [ ] Tested from live website

---

## 🎉 Done!

Your chatbot is now live at:
**https://veterinary-chatbot.onrender.com**

And connected to your website!

---

## 💡 Tips

1. **Free Tier**: Good for testing, but services sleep after 15 min
2. **Starter Plan**: $7/month for always-on service (recommended for production)
3. **Monitoring**: Check logs regularly for errors
4. **Updates**: Push to GitHub to auto-deploy
5. **Backup**: Keep your data file backed up

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **Check Logs**: Dashboard → Service → Logs tab

