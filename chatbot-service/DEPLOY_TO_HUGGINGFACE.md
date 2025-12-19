# Deploy Chatbot to Hugging Face Spaces

Hugging Face Spaces is a great option for deploying ML models. It's free and provides good resources.

## Step 1: Create Hugging Face Account

1. Go to https://huggingface.co
2. Sign up / Login
3. Verify your email

## Step 2: Create a New Space

1. Go to https://huggingface.co/spaces
2. Click **"Create new Space"**
3. Fill in:
   - **Space name**: `veterinary-chatbot` (or any name)
   - **SDK**: Select **"Docker"**
   - **Visibility**: **Public** (or Private if you have Pro)
   - **Hardware**: **CPU Basic** (free) or **CPU Upgrade** (if needed)
4. Click **"Create Space"**

## Step 3: Upload Files

You need to upload these files to your Space:

### Required Files:

1. **`Dockerfile`** (already created)
2. **`app_hf.py`** (already created - rename to `app.py` in the Space)
3. **`requirements.txt`** (already exists)
4. **`data/processed_template_qa.json`** (your dataset file)

### Upload Methods:

#### Option A: Using Git (Recommended)

1. **Initialize git in your chatbot-service folder**:
   ```bash
   cd /Volumes/🦋2001/Harish/veterinary-website/chatbot-service
   git init
   git add Dockerfile app_hf.py requirements.txt data/
   git commit -m "Initial commit for HF Spaces"
   ```

2. **Add Hugging Face remote**:
   ```bash
   git remote add origin https://huggingface.co/spaces/YOUR_USERNAME/veterinary-chatbot
   ```
   (Replace `YOUR_USERNAME` with your HF username)

3. **Push to Hugging Face**:
   ```bash
   git push origin main
   ```

#### Option B: Using Web Interface

1. Go to your Space page
2. Click **"Files and versions"** tab
3. Click **"Add file"** → **"Upload files"**
4. Upload:
   - `Dockerfile`
   - `app_hf.py` (rename it to `app.py` after upload)
   - `requirements.txt`
   - `data/processed_template_qa.json` (upload to `data/` folder)

## Step 4: Configure Space Settings

1. Go to your Space → **Settings**
2. **Hardware**: 
   - Free: **CPU Basic** (16GB RAM, shared)
   - Paid: **CPU Upgrade** ($0.60/hour) for more resources
3. **Environment variables** (if needed):
   - `MAX_DATASET_SIZE`: `0` (use all data, HF has more RAM)

## Step 5: Wait for Build

- Hugging Face will automatically build your Docker image
- Check the **"Logs"** tab to see build progress
- Build usually takes 5-10 minutes

## Step 6: Get Your API URL

After deployment, your API will be available at:
```
https://YOUR_USERNAME-veterinary-chatbot.hf.space
```

Or:
```
https://huggingface.co/spaces/YOUR_USERNAME/veterinary-chatbot
```

## Step 7: Update Backend

In **Render Dashboard** → Backend Service → Environment:

1. Add/Update: `CHATBOT_API_URL` = `https://YOUR_USERNAME-veterinary-chatbot.hf.space/chat`
2. **Save** and **Redeploy**

## Step 8: Test the API

### Health Check:
```bash
curl https://YOUR_USERNAME-veterinary-chatbot.hf.space/health
```

### Chat Test:
```bash
curl -X POST https://YOUR_USERNAME-veterinary-chatbot.hf.space/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is mastitis?", "language": "en"}'
```

## Important Notes

### File Structure in HF Space:
```
/
├── Dockerfile
├── app.py          (rename from app_hf.py)
├── requirements.txt
└── data/
    └── processed_template_qa.json
```

### Dockerfile Notes:
- Uses port `7860` (HF Spaces default)
- Python 3.9
- Installs all dependencies

### Advantages of Hugging Face:
- ✅ **Free tier**: 16GB RAM (much more than Render's 512MB!)
- ✅ **No port binding issues**
- ✅ **Automatic HTTPS**
- ✅ **Easy to update** (just push to git)
- ✅ **Built for ML models**

### Limitations:
- ⚠️ **Sleeps after inactivity** (free tier)
- ⚠️ **Cold start** on first request after sleep
- ⚠️ **Shared resources** (free tier)

## Troubleshooting

### Build Fails:
- Check Dockerfile syntax
- Check requirements.txt
- Check logs in HF Space

### API Not Responding:
- Check if Space is running (might be sleeping)
- Check logs in HF Space
- Verify CORS settings in `app_hf.py`

### Out of Memory:
- HF Spaces free tier has 16GB RAM, should be enough
- If still failing, reduce `MAX_DATASET_SIZE`

### Cold Start:
- First request after sleep takes 30-60 seconds
- This is normal for free tier
- Consider upgrading to keep it always running

## Alternative: Use Gradio (Easier UI)

If you want a simple UI instead of just API:

1. Create Space with **"Gradio"** SDK instead of Docker
2. Create `app.py` with Gradio interface
3. HF will automatically create a UI

But for API-only (which you need), Docker is better.

## Update Backend Configuration

After getting your HF Space URL:

1. **Render Dashboard** → Backend Service → Environment
2. Add: `CHATBOT_API_URL` = `https://YOUR_USERNAME-veterinary-chatbot.hf.space/chat`
3. **Save** and **Redeploy**

The backend will now use the Hugging Face chatbot!

