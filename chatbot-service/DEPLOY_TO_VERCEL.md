# Deploy Chatbot to Vercel

## Step 1: Prepare Your Code

The code is already prepared with:
- ✅ `vercel.json` configuration
- ✅ Flask app ready for Vercel
- ✅ CORS configured
- ✅ Memory optimizations

## Step 2: Install Vercel CLI (if not installed)

```bash
npm install -g vercel
```

Or use npx (no installation needed):
```bash
npx vercel
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI

1. **Navigate to chatbot-service directory**:
   ```bash
   cd /Volumes/🦋2001/Harish/veterinary-website/chatbot-service
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name? `veterinary-chatbot` (or any name)
   - Directory? `./` (current directory)
   - Override settings? **No**

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

### Option B: Using Vercel Dashboard (GitHub)

1. **Push code to GitHub** (if not already):
   ```bash
   cd /Volumes/🦋2001/Harish/veterinary-website
   git add chatbot-service/
   git commit -m "Add chatbot service for Vercel deployment"
   git push
   ```

2. **Go to Vercel Dashboard**:
   - Visit: https://vercel.com
   - Sign up/Login
   - Click **"Add New Project"**

3. **Import from GitHub**:
   - Select your repository
   - Choose **"veterinary-website"** (or your repo name)
   - Root Directory: Set to **`chatbot-service`**

4. **Configure Project**:
   - Framework Preset: **Other**
   - Build Command: Leave empty (or `pip install -r requirements.txt`)
   - Output Directory: Leave empty
   - Install Command: `pip install -r requirements.txt`

5. **Environment Variables**:
   - Add: `MAX_DATASET_SIZE` = `2000`

6. **Deploy**:
   - Click **"Deploy"**

## Step 4: Get Your Vercel URL

After deployment, Vercel will give you a URL like:
```
https://veterinary-chatbot.vercel.app
```

Or:
```
https://veterinary-chatbot-[your-username].vercel.app
```

## Step 5: Update Backend to Use Vercel Chatbot URL

### In Render Dashboard (Backend Service):

1. Go to your **Backend Service** in Render
2. Click **"Environment"**
3. Add/Update:
   - Key: `CHATBOT_API_URL`
   - Value: `https://your-chatbot-url.vercel.app/chat`
   (Replace with your actual Vercel URL)

4. **Save** and **Redeploy** the backend

## Step 6: Test the Chatbot

### Test Health Endpoint:
```bash
curl https://your-chatbot-url.vercel.app/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Chatbot service is running",
  "model_loaded": true,
  "dataset_loaded": true
}
```

### Test Chat Endpoint:
```bash
curl -X POST https://your-chatbot-url.vercel.app/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is mastitis?", "language": "en"}'
```

## Troubleshooting

### Issue: Build fails
- Check that `requirements.txt` has all dependencies
- Check Vercel logs for errors

### Issue: Out of memory
- Reduce `MAX_DATASET_SIZE` to `1500` or `1000` in Vercel environment variables

### Issue: CORS errors
- Check that your frontend URL is in the CORS origins list in `app.py`

### Issue: Model not loading
- Check Vercel function logs
- Vercel has a 50MB limit for serverless functions - the model might be too large
- Consider using a smaller model or external model hosting

## Vercel Limitations

- **Function timeout**: 10 seconds (Hobby), 60 seconds (Pro)
- **Memory**: 1024MB (Hobby), 3008MB (Pro)
- **Cold starts**: First request may be slow (model loading)

## Alternative: Use Vercel Pro Plan

If you need more resources:
- Upgrade to Vercel Pro ($20/month)
- Gets 60s timeout and more memory
- Better for ML models

## Update Backend Configuration

After getting your Vercel URL, update the backend:

1. **Render Dashboard** → Backend Service → Environment
2. Add: `CHATBOT_API_URL` = `https://your-chatbot.vercel.app/chat`
3. **Save** and **Redeploy**

The backend will now use the Vercel chatbot instead of Render.

