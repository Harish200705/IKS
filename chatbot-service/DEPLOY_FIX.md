# Fix Deployment Issues

## Issues Found

1. ❌ **Out of Memory**: Using >512MB (free tier limit)
2. ⚠️ **Port**: Render handles this automatically, but start command needs fixing

## Solutions Applied

### ✅ Code Optimizations (Already Done)

I've updated `app.py` to:
- Use CPU instead of GPU (saves ~200MB)
- Encode in batches (reduces peak memory)
- Use numpy arrays efficiently

### 🔧 Fix Start Command in Render

1. Go to Render Dashboard → Your Chatbot Service
2. Click **"Settings"** tab
3. Find **"Start Command"**
4. **Remove any extra spaces** and use:
   ```
   python app.py
   ```
   OR
   ```
   gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120
   ```
   (Note: `--workers 1` not 2, to save memory)

5. Click **"Save Changes"**

### 📤 Push Updated Code

```bash
cd /Volumes/🦋2001/Harish/veterinary-website/chatbot-service
git add app.py
git commit -m "Optimize memory usage for Render deployment"
git push
```

### 🔄 Redeploy

1. Go to Render Dashboard → Your Chatbot Service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for deployment

## If Still Out of Memory

### Option 1: Upgrade to Starter Plan ($7/month) ⭐ Recommended

- **1GB RAM** (enough for your model)
- **Always on** (no sleeping)
- **Better performance**

Steps:
1. Render Dashboard → Your Service
2. Click **"Change Plan"**
3. Select **"Starter"** ($7/month)
4. Redeploy

### Option 2: Reduce Dataset Size

If you want to stay on free tier, reduce dataset:

```python
# Add this in app.py after loading dataset (around line 51)
MAX_ITEMS = 2000  # Reduce from 4740 to 2000
if len(questions) > MAX_ITEMS:
    questions = questions[:MAX_ITEMS]
    answers = answers[:MAX_ITEMS]
    diseases = diseases[:MAX_ITEMS]
    print(f"⚠️  Reduced dataset to {MAX_ITEMS} items to save memory")
```

Then push and redeploy.

## Port Issue

**Render handles ports automatically** - you don't need to change the port number. The issue is just the start command format.

Use: `python app.py` (simplest) or `gunicorn app:app --bind 0.0.0.0:$PORT --workers 1`

## Recommended Steps

1. ✅ **Code is already optimized** (memory improvements)
2. **Fix Start Command** in Render: `python app.py`
3. **Push code**: `git push`
4. **Redeploy** in Render
5. **If still fails**: Upgrade to Starter plan ($7/month)

## Check After Deployment

```bash
# Health check
curl https://veterinary-chatbot.onrender.com/health

# Should return:
# {"status": "ok", "model_loaded": true, "dataset_loaded": true}
```

