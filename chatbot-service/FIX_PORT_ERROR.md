# Fix: "'' is not a valid port number" Error

## Problem

Render is not detecting the PORT environment variable when running gunicorn.

## Solution

### Option 1: Update Start Command in Render (Recommended)

1. Go to Render Dashboard → Your Chatbot Service
2. Click **"Settings"** tab
3. Scroll to **"Start Command"**
4. Change from:
   ```
   gunicorn app:app --bind 0.0.0.0:$PORT
   ```
   To:
   ```
   gunicorn app:app --bind 0.0.0.0:${PORT:-10000} --workers 2 --timeout 120
   ```
   OR simply:
   ```
   python app.py
   ```

5. Click **"Save Changes"**
6. Go to **"Manual Deploy"** → **"Deploy latest commit"**

### Option 2: Use Python Directly (Simpler)

Change Start Command to:
```
python app.py
```

The app.py already handles PORT from environment variables.

### Option 3: Set PORT Explicitly

1. Go to **"Environment"** tab
2. Add environment variable:
   - **Key**: `PORT`
   - **Value**: `10000` (or any port, Render will override it)
3. Save and redeploy

## Recommended Start Command

For Render, use one of these:

**Option A (Python):**
```
python app.py
```

**Option B (Gunicorn with default port):**
```
gunicorn app:app --bind 0.0.0.0:${PORT:-10000} --workers 2 --timeout 120
```

**Option C (Gunicorn with explicit port handling):**
```
PORT=${PORT:-10000} gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

## After Fixing

1. Save the changes in Render
2. Go to **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for deployment
4. Check logs to verify it's running

## Verify It's Working

After deployment, check logs:
- Should see: `🚀 Starting Chatbot API on port 10000` (or whatever port Render assigns)
- No more "not a valid port number" errors

Then test:
```bash
curl https://veterinary-chatbot.onrender.com/health
```

