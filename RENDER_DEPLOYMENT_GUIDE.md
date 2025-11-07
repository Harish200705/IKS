# Render Deployment Guide - Veterinary Website

This guide will help you deploy your veterinary website to Render, including the backend, frontend, and chatbot integration.

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **MongoDB Atlas**: Your database is already set up

## 🏗️ Architecture Overview

- **Backend**: Node.js/Express API (Port 5001)
- **Frontend**: React SPA (Static Site)
- **Chatbot**: Can be integrated via API or kept in Colab

---

## 🔧 Step 1: Prepare Your Code

### 1.1 Move MongoDB URI to Environment Variables

**Backend (`backend/server.js`):**
```javascript
// Change this line:
const MONGODB_URI = 'mongodb+srv://harishjwork5:0511@iks.1bnw6oy.mongodb.net/Diseases?retryWrites=true&w=majority&appName=IKS';

// To:
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://harishjwork5:0511@iks.1bnw6oy.mongodb.net/Diseases?retryWrites=true&w=majority&appName=IKS';
```

### 1.2 Update Frontend API URL

**Frontend (`frontend/src/components/DiseaseDetail.js` and other components):**
```javascript
// Change:
const API_BASE_URL = 'http://localhost:5001/api';

// To:
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
```

### 1.3 Create `.env` Files (for local development)

**Backend `.env`:**
```
MONGODB_URI=mongodb+srv://harishjwork5:0511@iks.1bnw6oy.mongodb.net/Diseases?retryWrites=true&w=majority&appName=IKS
PORT=5001
```

**Frontend `.env`:**
```
REACT_APP_API_URL=https://your-backend-name.onrender.com/api
```

---

## 🚀 Step 2: Deploy Backend to Render

### 2.1 Create Backend Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `veterinary-backend` (or your choice)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free tier is fine for testing

### 2.2 Set Environment Variables

In Render dashboard, go to **Environment** tab and add:

```
MONGODB_URI=mongodb+srv://harishjwork5:0511@iks.1bnw6oy.mongodb.net/Diseases?retryWrites=true&w=majority&appName=IKS
PORT=5001
NODE_ENV=production
```

### 2.3 Deploy

Click **"Create Web Service"** and wait for deployment.

**Note**: Your backend URL will be: `https://veterinary-backend.onrender.com`

---

## 🎨 Step 3: Deploy Frontend to Render

### 3.1 Create Static Site

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `veterinary-frontend` (or your choice)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Environment**: `Node`

### 3.2 Set Environment Variables

In Render dashboard, go to **Environment** tab and add:

```
REACT_APP_API_URL=https://veterinary-backend.onrender.com/api
```

**Important**: Replace `veterinary-backend` with your actual backend service name.

### 3.3 Deploy

Click **"Create Static Site"** and wait for deployment.

**Note**: Your frontend URL will be: `https://veterinary-frontend.onrender.com`

---

## 🤖 Step 4: Chatbot Integration

You have two options:

### Option A: Keep Chatbot in Colab (Recommended for now)

If your chatbot is in Google Colab, you can:
1. Deploy it as a separate API endpoint in Colab
2. Update your backend to call the Colab API
3. Or integrate it directly into your Node.js backend

### Option B: Deploy Chatbot as Separate Service

If you have Python chatbot code:
1. Create a new **Web Service** on Render
2. Set **Environment** to `Python 3`
3. Point to your chatbot code directory
4. Update backend to call chatbot service

---

## 📝 Step 5: Update Code for Production

### 5.1 Update Backend (`backend/server.js`)

```javascript
// Add CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://veterinary-frontend.onrender.com'] 
    : ['http://localhost:3000'],
  credentials: true
};
app.use(cors(corsOptions));
```

### 5.2 Update Frontend API Calls

Make sure all API calls use the environment variable:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
```

---

## 🔒 Step 6: Security Considerations

1. **MongoDB URI**: Already in environment variables ✅
2. **CORS**: Configured for production domains ✅
3. **API Keys**: Store in Render environment variables

---

## 🧪 Step 7: Testing

1. **Backend Health Check**: 
   - Visit: `https://veterinary-backend.onrender.com/api/test`
   - Should return collection counts

2. **Frontend**:
   - Visit: `https://veterinary-frontend.onrender.com`
   - Test search functionality
   - Test disease detail pages

---

## 📊 Step 8: Monitoring

Render provides:
- **Logs**: View real-time logs in dashboard
- **Metrics**: CPU, Memory usage
- **Alerts**: Email notifications for service issues

---

## 🐛 Troubleshooting

### Backend Issues

1. **Build Fails**: Check `package.json` scripts
2. **MongoDB Connection**: Verify `MONGODB_URI` in environment variables
3. **Port Issues**: Render sets `PORT` automatically, use `process.env.PORT`

### Frontend Issues

1. **API Calls Fail**: Check `REACT_APP_API_URL` environment variable
2. **Build Fails**: Check for ESLint errors, use `SKIP_PREFLIGHT_CHECK=true`
3. **CORS Errors**: Update backend CORS configuration

### Common Errors

- **"Cannot find module"**: Run `npm install` in build command
- **"Port already in use"**: Use `process.env.PORT` instead of hardcoded port
- **"MongoDB connection failed"**: Check network access in MongoDB Atlas

---

## 🔄 Step 9: Continuous Deployment

Render automatically deploys when you push to:
- **Main branch**: Production deployments
- **Other branches**: Preview deployments

---

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com

---

## ✅ Deployment Checklist

- [ ] Backend code pushed to GitHub
- [ ] Frontend code pushed to GitHub
- [ ] MongoDB URI moved to environment variables
- [ ] Frontend API URL updated to use environment variable
- [ ] Backend service created on Render
- [ ] Frontend static site created on Render
- [ ] Environment variables set in Render
- [ ] CORS configured for production
- [ ] Backend health check working
- [ ] Frontend loads and connects to backend
- [ ] All features tested

---

## 🎉 You're Done!

Your veterinary website should now be live on Render!

**Backend**: `https://veterinary-backend.onrender.com`  
**Frontend**: `https://veterinary-frontend.onrender.com`

