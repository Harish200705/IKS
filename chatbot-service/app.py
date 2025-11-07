"""
Veterinary Chatbot API - Deployed from Colab
Uses Sentence Transformers for semantic search
"""

import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer, util
import torch

app = Flask(__name__)
CORS(app)  # Allow requests from your website

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
# Load dataset
# =====================
def load_dataset():
    """Load the Q&A dataset"""
    global questions, answers, diseases
    
    print(f"📂 Loading dataset from {DATA_PATH}...")
    
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f"Dataset file not found at {DATA_PATH}. "
            "Please upload processed_template_qa.json to the data/ folder."
        )
    
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    questions = [item["question"] for item in data]
    answers = [item["answer"] for item in data]
    diseases = [item.get("disease", "Unknown") for item in data]
    
    print(f"✅ Loaded {len(questions)} Q&A pairs")
    return True

# =====================
# Load model and encode questions
# =====================
def initialize_model():
    """Load the Sentence Transformer model and encode questions"""
    global embedder, q_embeddings
    
    print(f"🔄 Loading Sentence Transformer model: {MODEL_NAME}...")
    embedder = SentenceTransformer(MODEL_NAME)
    print("✅ Model loaded")
    
    print("🔄 Encoding dataset questions...")
    q_embeddings = embedder.encode(questions, convert_to_tensor=True)
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
    """Main chat endpoint - receives messages from your website"""
    try:
        # Get request data
        data = request.get_json() or {}
        user_q = data.get("message", "")
        language = data.get("language", "en")  # Language parameter (for future use)
        
        # Validate input
        if not user_q or not isinstance(user_q, str) or not user_q.strip():
            return jsonify({
                "error": "Empty message",
                "status": "error"
            }), 400
        
        # Check if model is ready
        if embedder is None or q_embeddings is None:
            return jsonify({
                "error": "Chatbot model is not loaded. Please check server logs.",
                "status": "error"
            }), 500
        
        # Encode user query
        query_emb = embedder.encode(user_q, convert_to_tensor=True)
        
        # Calculate similarity scores
        cos_scores = util.cos_sim(query_emb, q_embeddings)[0]
        
        # Get best match
        best_idx = int(cos_scores.argmax())
        best_q = questions[best_idx]
        best_a = answers[best_idx]
        best_disease = diseases[best_idx]
        score = float(cos_scores[best_idx])
        
        # Format response for your website
        return jsonify({
            "response": best_a,  # Main answer for your website
            "detected_disease": best_disease,
            "matched_question": best_q,
            "similarity_score": score,
            "status": "success",
            "language": language
        }), 200
        
    except Exception as e:
        print(f"❌ Error processing chat request: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "response": "Sorry, I encountered an error processing your request.",
            "status": "error",
            "error": str(e)
        }), 500

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
    # Get port from environment (Render sets this automatically)
    port = int(os.environ.get("PORT", 5000))
    
    print(f"🚀 Starting Chatbot API on port {port}")
    print(f"📡 Health check: http://localhost:{port}/health")
    print(f"💬 Chat endpoint: http://localhost:{port}/chat")
    app.run(host="0.0.0.0", port=port, debug=False)

