# Quick Deploy to Render - Step by Step

## 🚀 Fast Track Deployment

### Step 1: Push Code to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Prepare for Render deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Deploy Backend (5 minutes)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Fill in:
   - **Name**: `veterinary-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **"Advanced"** → **"Add Environment Variable"**:
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://harishjwork5:0511@iks.1bnw6oy.mongodb.net/Diseases?retryWrites=true&w=majority&appName=IKS`
   - Key: `NODE_ENV`
   - Value: `production`
6. Click **"Create Web Service"**
7. Wait for deployment (2-3 minutes)
8. **Copy your backend URL**: `https://veterinary-backend.onrender.com`

### Step 3: Deploy Frontend (5 minutes)

1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect the same GitHub repository
3. Fill in:
   - **Name**: `veterinary-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. Click **"Advanced"** → **"Add Environment Variable"**:
   - Key: `REACT_APP_API_URL`
   - Value: `https://veterinary-backend.onrender.com/api` (use your actual backend URL)
5. Click **"Create Static Site"**
6. Wait for deployment (3-5 minutes)

### Step 4: Update Backend CORS (if needed)

If you get CORS errors:

1. Go to your backend service in Render
2. **Environment** tab
3. Add environment variable:
   - Key: `FRONTEND_URL`
   - Value: `https://veterinary-frontend.onrender.com` (your actual frontend URL)

### Step 5: Test

1. Visit your frontend URL: `https://veterinary-frontend.onrender.com`
2. Test search functionality
3. Test disease detail pages
4. Check browser console for any errors

## ✅ Done!

Your website is now live!

**Backend**: `https://veterinary-backend.onrender.com`  
**Frontend**: `https://veterinary-frontend.onrender.com`

## 🔧 Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Verify `MONGODB_URI` is set correctly
- Make sure `package.json` has `"start": "node server.js"`

### Frontend build fails
- Check build logs
- Make sure `REACT_APP_API_URL` is set
- Verify all dependencies are in `package.json`

### CORS errors
- Add `FRONTEND_URL` to backend environment variables
- Restart backend service

### MongoDB connection fails
- Check MongoDB Atlas network access (allow all IPs: `0.0.0.0/0`)
- Verify connection string is correct

## 📝 Notes

- **Free tier**: Services spin down after 15 minutes of inactivity
- **First request**: May take 30-60 seconds (cold start)
- **Auto-deploy**: Every push to main branch triggers deployment

