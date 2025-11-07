"""
Quick test script for the chatbot
Run this to test if your chatbot is working
"""

import requests
import json

CHATBOT_URL = "http://localhost:5002"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{CHATBOT_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_chat(message):
    """Test chat endpoint"""
    print(f"\nTesting chat with message: '{message}'")
    try:
        response = requests.post(
            f"{CHATBOT_URL}/chat",
            json={"message": message, "language": "en"},
            timeout=30
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Chatbot Test Script")
    print("=" * 60)
    
    # Test health
    if test_health():
        print("\n✅ Health check passed!")
    else:
        print("\n❌ Health check failed!")
        exit(1)
    
    # Test chat
    if test_chat("What is mastitis?"):
        print("\n✅ Chat test passed!")
    else:
        print("\n❌ Chat test failed!")
        exit(1)
    
    print("\n" + "=" * 60)
    print("All tests passed! ✅")
    print("=" * 60)

