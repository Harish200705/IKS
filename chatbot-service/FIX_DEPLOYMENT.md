# Fix Chatbot Deployment Issues

## Issues
1. **"No open ports detected"** - Port binding issue
2. **"Out of memory (used over 512Mi)"** - Memory limit exceeded

## Solutions

### Fix 1: Port Binding Issue

**Problem**: Render is running `python app.py` instead of `gunicorn`

**Solution**: In Render Dashboard:
1. Go to your Chatbot Service
2. Click **"Settings"**
3. Scroll to **"Start Command"**
4. Change it to:
   ```
   gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --timeout 120 --threads 2
   ```
5. Click **"Save Changes"**
6. **Manual Deploy** → **"Deploy latest commit"**

### Fix 2: Memory Issue

**Problem**: Dataset is too large for 512MB free tier

**Solutions Applied**:
1. ✅ Reduced default dataset size from 2500 to 2000 items
2. ✅ Reduced batch size from 100 to 50
3. ✅ Added memory cleanup (del statements)
4. ✅ Changed to single worker (workers 1) instead of 2

**Additional Options**:

**Option A: Reduce dataset further** (in Render Environment Variables):
- Add: `MAX_DATASET_SIZE` = `1500` or `1000`

**Option B: Upgrade to paid plan** (if needed):
- Starter plan: $7/month, 512MB → 2GB RAM

### Fix 3: Verify Environment Variables

In Render Dashboard → Chatbot Service → Environment:
- ✅ `PORT` - Auto-set by Render (don't set manually)
- ✅ `MAX_DATASET_SIZE` - Set to `2000` (or lower if still failing)

### Deployment Steps

1. **Push changes to GitHub**:
   ```bash
   git add .
   git commit -m "Fix chatbot deployment: port binding and memory optimization"
   git push
   ```

2. **In Render Dashboard**:
   - Go to Chatbot Service
   - Settings → Start Command → Use gunicorn command above
   - Environment → Add `MAX_DATASET_SIZE=2000`
   - Manual Deploy → Deploy latest commit

3. **Monitor logs**:
   - Watch for "✅ Chatbot ready!" message
   - Check memory usage stays under 512MB
   - Verify port is detected

### Testing

After deployment, test:
```bash
curl https://your-chatbot-service.onrender.com/health
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

### If Still Failing

1. **Reduce dataset more**: Set `MAX_DATASET_SIZE=1500` or `1000`
2. **Check logs**: Look for memory errors during model loading
3. **Consider paid plan**: If dataset is essential, upgrade to get more RAM

