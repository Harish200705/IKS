# Fix: Out of Memory Error on Render

## Problem

Your chatbot is using more than 512MB RAM (free tier limit). The model + dataset + embeddings are too large.

## Solutions

### Option 1: Optimize Code (Try This First)

I've updated `app.py` to:
- Use CPU instead of GPU (saves memory)
- Encode in batches (reduces peak memory)
- Use numpy arrays instead of tensors where possible

**Push the updated code:**
```bash
cd chatbot-service
git add app.py
git commit -m "Optimize memory usage"
git push
```

Render will auto-deploy the update.

### Option 2: Reduce Dataset Size

If still too large, reduce your dataset:

```python
# In app.py, after loading dataset, keep only first N items
MAX_ITEMS = 2000  # Reduce this number
if len(questions) > MAX_ITEMS:
    questions = questions[:MAX_ITEMS]
    answers = answers[:MAX_ITEMS]
    diseases = diseases[:MAX_ITEMS]
    print(f"⚠️  Reduced dataset to {MAX_ITEMS} items to save memory")
```

### Option 3: Upgrade to Starter Plan ($7/month)

- **1GB RAM** (enough for your model)
- **Always on** (no sleeping)
- **Better performance**

1. Go to Render Dashboard → Your Service
2. Click **"Change Plan"**
3. Select **"Starter"** ($7/month)
4. Redeploy

### Option 4: Use Lighter Model

Change to a smaller model in `app.py`:

```python
MODEL_NAME = "all-MiniLM-L6-v2"  # Current (80MB)
# Try smaller:
# MODEL_NAME = "paraphrase-MiniLM-L3-v2"  # Smaller, faster
```

## Port Issue Fix

The port conflict is not the real issue - Render handles ports automatically. But fix the start command:

**In Render Dashboard → Settings → Start Command:**

Change to:
```
python app.py
```

Or if using gunicorn:
```
gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120
```

**Note**: Use `--workers 1` (not 2) to save memory.

## Recommended Start Command

For free tier with memory constraints:
```
python app.py
```

For Starter plan:
```
gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
```

## Check Memory Usage

After deploying, check logs:
- Look for memory usage
- If still over 512MB, you need to:
  1. Reduce dataset size
  2. Upgrade to Starter plan
  3. Use a smaller model

## Quick Fix Steps

1. **Update code** (already done - optimized memory)
2. **Push to GitHub**:
   ```bash
   cd chatbot-service
   git add app.py
   git commit -m "Optimize memory usage"
   git push
   ```
3. **Update Start Command in Render**:
   - Settings → Start Command → `python app.py`
   - Save
4. **Redeploy**: Manual Deploy → Deploy latest commit
5. **If still fails**: Upgrade to Starter plan ($7/month)

