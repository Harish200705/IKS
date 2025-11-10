"""
Veterinary Chatbot API for Hugging Face Spaces
Uses Sentence Transformers for semantic search
"""

import json
import os
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util
import torch

app = Flask(__name__)
# CORS - Allow requests from your website
CORS(app, origins=[
    "https://veterinary-frontend.onrender.com",
    "https://veterinary-backend-j19d.onrender.com",
    "http://localhost:3000",
    "http://localhost:5001",
    "*"  # Allow all origins
])

# =====================
# Configuration
# =====================
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "processed_template_qa.json")
MODEL_NAME = "all-MiniLM-L6-v2"

# =====================
# Global variables for model and data
# =====================
embedder = None
questions = []
answers = []
diseases = []
q_embeddings = None

# =====================
# Load Dataset
# =====================
def load_dataset():
    """Load Q&A dataset from JSON file"""
    global questions, answers, diseases
    
    print(f"📂 Loading dataset from {DATA_PATH}...")
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset file not found at {DATA_PATH}")
    
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    questions = [item["question"] for item in data]
    answers = [item["answer"] for item in data]
    diseases = [item.get("disease", "Unknown") for item in data]
    
    # Reduce dataset size for Hugging Face Spaces (free tier: 16GB RAM, but shared)
    # Set MAX_DATASET_SIZE environment variable to override, or set to 0 to use all
    max_size = int(os.environ.get("MAX_DATASET_SIZE", "0"))  # Use all by default on HF
    if max_size > 0 and len(questions) > max_size:
        print(f"⚠️  Reducing dataset from {len(questions)} to {max_size} items")
        questions = questions[:max_size]
        answers = answers[:max_size]
        diseases = diseases[:max_size]
    
    print(f"✅ Loaded {len(questions)} Q&A pairs")
    return True

# =====================
# Initialize Model
# =====================
def initialize_model():
    """Load the Sentence Transformer model and encode questions"""
    global embedder, q_embeddings
    
    print(f"🔄 Loading Sentence Transformer model: {MODEL_NAME}...")
    embedder = SentenceTransformer(MODEL_NAME, device='cpu')
    print("✅ Model loaded")
    
    print("🔄 Encoding dataset questions...")
    batch_size = 50
    embeddings_list = []
    for i in range(0, len(questions), batch_size):
        batch = questions[i:i+batch_size]
        batch_embeddings = embedder.encode(batch, convert_to_tensor=False, show_progress_bar=False)
        embeddings_list.append(batch_embeddings)
        del batch
        print(f"   Encoded {min(i+batch_size, len(questions))}/{len(questions)} questions...")
    
    # Combine all embeddings
    print("   Combining embeddings...")
    q_embeddings = np.vstack(embeddings_list)
    del embeddings_list
    q_embeddings = torch.from_numpy(q_embeddings)
    import gc
    gc.collect()
    print(f"✅ Encoded {len(questions)} questions")
    
    return True

# =====================
# Initialize on startup
# =====================
print("🚀 Initializing Veterinary Chatbot API...")
try:
    load_dataset()
    initialize_model()
    print("✅ Chatbot ready!")
except Exception as e:
    print(f"❌ Initialization failed: {e}")
    import traceback
    traceback.print_exc()
    print("⚠️  App will start but chatbot may not work")

# =====================
# API Endpoints
# =====================

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "message": "Chatbot service is running",
        "model_loaded": embedder is not None,
        "dataset_loaded": len(questions) > 0
    }), 200

@app.route("/chat", methods=["POST"])
def chat():
    """Chat endpoint - receives user question and returns answer"""
    try:
        data = request.get_json() or {}
        user_q = data.get("message", "")
        language = data.get("language", "en")
        
        if not user_q or not isinstance(user_q, str) or not user_q.strip():
            return jsonify({"error": "Empty message", "status": "error"}), 400
        
        if embedder is None or q_embeddings is None:
            return jsonify({
                "error": "Chatbot model is not loaded. Please check server logs.",
                "status": "error"
            }), 500
        
        # Encode user question
        query_emb = embedder.encode(user_q, convert_to_tensor=False, show_progress_bar=False)
        query_emb_tensor = torch.from_numpy(query_emb) if isinstance(query_emb, np.ndarray) else query_emb
        
        # Find most similar question
        cos_scores = util.cos_sim(query_emb_tensor, q_embeddings)[0]
        del query_emb_tensor
        
        best_idx = int(cos_scores.argmax())
        best_q = questions[best_idx]
        best_a = answers[best_idx]
        best_disease = diseases[best_idx]
        score = float(cos_scores[best_idx])
        
        return jsonify({
            "response": best_a,
            "detected_disease": best_disease,
            "matched_question": best_q,
            "similarity_score": score,
            "status": "success"
        })
        
    except Exception as e:
        print(f"❌ Error processing chat request: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e), "status": "error"}), 500

@app.route("/", methods=["GET"])
def index():
    """Root endpoint"""
    return jsonify({
        "service": "Veterinary Chatbot API",
        "status": "running",
        "model": MODEL_NAME,
        "dataset_size": len(questions),
        "endpoints": {
            "health": "/health",
            "chat": "/chat (POST)"
        }
    }), 200

# =====================
# Start Server
# =====================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    print(f"🚀 Starting Chatbot API on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)

