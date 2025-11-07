# How to Get Your Data File

## Quick Solution

You need to download `processed_template_qa.json` from Google Drive and place it in the `data/` folder.

## Method 1: Download from Google Drive (Easiest)

### Step 1: Get the File

1. **Open Google Drive** in your browser
2. **Go to**: `My Drive/biobert-chatbot/`
3. **Find**: `processed_template_qa.json`
4. **Right-click** → **Download**

### Step 2: Copy to Project

```bash
# Make sure you're in the chatbot-service directory
cd /Volumes/🦋2001/Harish/veterinary-website/chatbot-service

# Create data folder if it doesn't exist
mkdir -p data

# Copy the downloaded file (adjust path if needed)
cp ~/Downloads/processed_template_qa.json data/
```

### Step 3: Verify

```bash
ls -lh data/processed_template_qa.json
```

You should see the file listed.

## Method 2: Use Colab to Download

If you still have the Colab notebook open:

```python
from google.colab import files

# Download the file
files.download("/content/drive/My Drive/biobert-chatbot/processed_template_qa.json")
```

Then copy it:
```bash
cp ~/Downloads/processed_template_qa.json chatbot-service/data/
```

## Method 3: Re-create from Your Dataset

If you have the original `english_qa.json` file, you can process it:

```python
# In Colab or locally
import json

# Load your original data
with open("english_qa.json", "r") as f:
    raw_data = json.load(f)

# Process it (simplified version)
processed_data = []
for item in raw_data:
    processed_data.append({
        "question": item["question"],
        "answer": item["answer"],
        "disease": item.get("disease", "Unknown")
    })

# Save
with open("processed_template_qa.json", "w", encoding="utf-8") as f:
    json.dump(processed_data, f, ensure_ascii=False, indent=2)
```

## After Getting the File

1. **Verify it's in the right place**:
   ```bash
   ls chatbot-service/data/processed_template_qa.json
   ```

2. **Test the app**:
   ```bash
   cd chatbot-service
   python app.py
   ```

3. **You should see**:
   ```
   ✅ Loaded X Q&A pairs
   ✅ Model loaded
   ✅ Encoded X questions
   ✅ Chatbot ready!
   ```

## File Structure

```
chatbot-service/
├── app.py
├── requirements.txt
├── data/
│   └── processed_template_qa.json  ← YOU NEED THIS FILE
└── ...
```

## Still Having Issues?

- **File not found?** Make sure the path is exactly: `chatbot-service/data/processed_template_qa.json`
- **Wrong format?** The file should be a JSON array with objects containing "question", "answer", and optionally "disease"
- **File too large?** If it's >100MB, you might need to use Git LFS or cloud storage

