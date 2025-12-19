# Backend Troubleshooting Guide

## Issue 1: MongoDB Connection Error (ECONNREFUSED)

### Problem
```
MongoDB connection error: Error: querySrv ECONNREFUSED _mongodb._tcp.iks.1bnw6oy.mongodb.net
```

### Solutions

#### Solution 1: Check MongoDB Atlas Network Access

1. Go to https://cloud.mongodb.com
2. Login to your account
3. Select your cluster
4. Click **"Network Access"** (left sidebar)
5. Click **"Add IP Address"**
6. Click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
7. Click **"Confirm"**
8. Wait 1-2 minutes for changes to propagate

#### Solution 2: Check Internet Connection

```bash
# Test if you can reach MongoDB
ping iks.1bnw6oy.mongodb.net
```

#### Solution 3: Verify MongoDB URI

Make sure the connection string is correct:
```
mongodb+srv://harishjwork5:0511@iks.1bnw6oy.mongodb.net/Diseases?retryWrites=true&w=majority&appName=IKS
```

#### Solution 4: Use Environment Variable

Create `.env` file in backend folder:
```env
MONGODB_URI=mongodb+srv://harishjwork5:0511@iks.1bnw6oy.mongodb.net/Diseases?retryWrites=true&w=majority&appName=IKS
```

Then restart server.

### Test Connection

```bash
# Test MongoDB connection
node -e "const mongoose = require('mongoose'); mongoose.connect('YOUR_URI').then(() => console.log('Connected!')).catch(e => console.error(e));"
```

---

## Issue 2: Chatbot Service "Not configured"

### Problem
```
Chatbot service: Not configured
```

### Solutions

#### Solution 1: Start Local Chatbot (For Development)

1. **Start your chatbot**:
   ```bash
   cd /Volumes/🦋2001/Harish/veterinary-website/chatbot-service
   python app.py
   ```

2. **Verify it's running**:
   ```bash
   curl http://localhost:5002/health
   ```

3. **Backend will auto-connect** (default URL is `http://localhost:5002/chat`)

#### Solution 2: Set Environment Variable (For Production)

If chatbot is deployed on Render:

1. **Create `.env` file** in backend folder:
   ```env
   CHATBOT_API_URL=https://veterinary-chatbot.onrender.com/chat
   ```

2. **Or set in Render Dashboard**:
   - Backend Service → Environment
   - Add: `CHATBOT_API_URL=https://veterinary-chatbot.onrender.com/chat`

3. **Restart backend**

#### Solution 3: Chatbot Not Required

The chatbot is **optional**. Your backend will work without it:
- Search will work ✅
- Disease details will work ✅
- Only chatbot feature won't work ❌

---

## Quick Fixes

### Fix MongoDB Connection

1. **Check MongoDB Atlas**:
   - Network Access → Allow `0.0.0.0/0`
   - Database Access → User has read/write permissions

2. **Test connection**:
   ```bash
   # In backend folder
   node -e "require('mongoose').connect('mongodb+srv://harishjwork5:0511@iks.1bnw6oy.mongodb.net/Diseases?retryWrites=true&w=majority&appName=IKS').then(() => console.log('✅ Connected')).catch(e => console.error('❌', e.message))"
   ```

3. **If still fails**: Check firewall/network settings

### Fix Chatbot (Optional)

1. **For local development**:
   ```bash
   # Terminal 1: Start chatbot
   cd chatbot-service
   python app.py
   
   # Terminal 2: Start backend
   cd backend
   npm start
   ```

2. **For production**: Set `CHATBOT_API_URL` in Render environment variables

---

## Status Messages Explained

- ✅ **Connected to MongoDB Atlas successfully!** - Database working
- ⚠️ **MongoDB connection error** - Database not accessible (check network)
- ✅ **Chatbot service: Available** - Chatbot connected and working
- ⚠️ **Chatbot service: Not available** - Chatbot not running or URL wrong (optional feature)

---

## Common Issues

### Issue: "ECONNREFUSED"

**Causes**:
- MongoDB Atlas network access not configured
- Firewall blocking connection
- Wrong connection string
- Internet connection issues

**Fix**: Allow all IPs in MongoDB Atlas Network Access

### Issue: "Chatbot service: Not configured"

**Causes**:
- Chatbot not running locally
- `CHATBOT_API_URL` not set
- Chatbot URL incorrect

**Fix**: 
- Start chatbot locally, OR
- Set `CHATBOT_API_URL` environment variable

---

## Testing

### Test MongoDB

```bash
cd backend
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://harishjwork5:0511@iks.1bnw6oy.mongodb.net/Diseases?retryWrites=true&w=majority&appName=IKS').then(() => { console.log('✅ MongoDB Connected!'); process.exit(0); }).catch(e => { console.error('❌ Error:', e.message); process.exit(1); });"
```

### Test Chatbot

```bash
# If chatbot is running on port 5002
curl http://localhost:5002/health
```

---

## Next Steps

1. **Fix MongoDB**: Allow network access in MongoDB Atlas
2. **Fix Chatbot** (optional): Start chatbot or set URL
3. **Restart backend**: `npm start`
4. **Test**: Try searching for a disease

