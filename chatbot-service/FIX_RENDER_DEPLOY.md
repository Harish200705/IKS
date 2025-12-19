# Fix Render Deployment Issues

## Issues
1. **Port binding error** - Extra quotes in start command
2. **Out of memory** - Exceeding 512MB limit

## Fix 1: Port Binding

### In Render Dashboard:

1. Go to your **Chatbot Service**
2. Click **"Settings"**
3. Find **"Start Command"**
4. **Remove the extra quotes** and use:
   ```
   gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120
   ```
5. Click **"Save Changes"**

**Important**: Remove the `sh -c` wrapper and extra quotes. Render should expand `$PORT` directly.

## Fix 2: Memory Issue

### Option A: Reduce Dataset Size (Recommended)

In Render Dashboard → Chatbot Service → Environment:

1. Add/Update: `MAX_DATASET_SIZE` = `1500` (or even `1000` if still failing)
2. **Save** and **Redeploy**

### Option B: Further Optimizations Applied

The code has been updated with:
- ✅ Dataset size reduced to 1500 (from 2000)
- ✅ Batch size reduced to 32 (from 50)
- ✅ Memory cleanup added (del statements, gc.collect())
- ✅ Single worker (no multiple processes)

### Option C: Upgrade Render Plan

If you need the full dataset:
- **Starter Plan**: $7/month → 512MB → 2GB RAM
- Allows larger dataset and better performance

## Step-by-Step Fix

### 1. Fix Start Command

Render Dashboard → Chatbot Service → Settings:
- **Start Command**: 
  ```
  gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120
  ```

### 2. Set Environment Variable

Render Dashboard → Chatbot Service → Environment:
- **Key**: `MAX_DATASET_SIZE`
- **Value**: `1500`

### 3. Redeploy

- Click **"Manual Deploy"** → **"Deploy latest commit"**

## Testing

After deployment, check logs for:
```
✅ Loaded 1500 Q&A pairs
✅ Encoded 1500 questions
✅ Chatbot ready!
```

If you see "Out of memory" again:
- Reduce `MAX_DATASET_SIZE` to `1000` or `800`
- Or upgrade to Starter plan

## Alternative: Use Smaller Model

If still failing, consider using a smaller model:
- Current: `all-MiniLM-L6-v2` (~80MB)
- Alternative: Use a quantized version or smaller model

But try reducing dataset size first - that's the easiest fix.

