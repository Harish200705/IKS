# Veterinary Chatbot Service

This is a template for deploying your Google Colab chatbot to Render.

## 🚀 Quick Start

1. **Copy your Colab code** into `app.py` (see comments in the file)
2. **Add your dependencies** to `requirements.txt`
3. **Push to GitHub**
4. **Deploy to Render**

## 📝 Steps

### 1. Copy Your Colab Code

Open `app.py` and replace the placeholder code with your actual Colab code:

- Copy all your imports
- Copy your model loading function
- Copy your prediction function
- Update the `chat()` endpoint to call your model

### 2. Add Dependencies

Edit `requirements.txt` and add all libraries you use in Colab.

### 3. Test Locally (Optional)

```bash
pip install -r requirements.txt
python app.py
```

Test with:
```bash
curl http://localhost:5000/health
curl -X POST http://localhost:5000/chat -H "Content-Type: application/json" -d '{"message": "test"}'
```

### 4. Deploy to Render

1. Push to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Set:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`
5. Deploy!

## 🔗 Connect to Your Website

After deployment, update your backend:

1. Go to Render Dashboard → Your Backend Service → Environment
2. Add: `CHATBOT_API_URL=https://your-chatbot.onrender.com/chat`
3. Restart backend service

## 📚 Need Help?

See `COLAB_CHATBOT_DEPLOYMENT.md` for detailed instructions.

