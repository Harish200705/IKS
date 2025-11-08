# Fix Port Binding Error

## Error
```
Error: '' is not a valid port number.
```

## Problem
The `$PORT` variable is not being expanded correctly in the gunicorn command.

## Solution

### Option 1: Use shell command (Recommended)

In Render Dashboard → Chatbot Service → Settings → Start Command:

Change to:
```bash
sh -c 'gunicorn app:app --bind 0.0.0.0:${PORT:-10000} --workers 1 --timeout 120 --threads 2'
```

This uses shell expansion to properly read the PORT environment variable.

### Option 2: Use Python to get port

Alternative start command:
```bash
python -c "import os; port = os.environ.get('PORT', '10000'); exec(open('app.py').read().replace('if __name__', f'if __name__').replace('port = int', f'port = {port}'))" && gunicorn app:app --bind 0.0.0.0:${PORT} --workers 1
```

**Actually, just use Option 1 - it's simpler!**

### Steps

1. Go to Render Dashboard
2. Select your Chatbot Service
3. Click **"Settings"**
4. Find **"Start Command"**
5. Replace with:
   ```
   sh -c 'gunicorn app:app --bind 0.0.0.0:${PORT:-10000} --workers 1 --timeout 120 --threads 2'
   ```
6. Click **"Save Changes"**
7. **Manual Deploy** → **"Deploy latest commit"**

### Why This Works

- `sh -c` runs the command in a shell, which properly expands `${PORT}`
- `${PORT:-10000}` uses PORT if set, otherwise defaults to 10000
- This ensures the port is always a valid number

### Verify

After deployment, check logs for:
```
🚀 Chatbot API configured for port [number]
```

The port should be detected and the service should start successfully.

