# Setup Data File - Quick Guide

## Problem: Missing `processed_template_qa.json`

The chatbot needs your data file to work. Here's how to get it:

## Option 1: Download from Google Drive (Recommended)

### Step 1: Get the file from Google Drive

1. **Open Google Drive** in your browser
2. **Navigate to**: `My Drive/biobert-chatbot/`
3. **Find**: `processed_template_qa.json`
4. **Right-click** → **Share** → **Make it viewable by anyone with the link**
5. **Copy the link**

### Step 2: Download using the script

```bash
cd chatbot-service
python download_data.py
```

Follow the prompts to enter your Google Drive file ID or direct link.

### Step 3: Or download manually

1. **Download** the file from Google Drive to your computer
2. **Copy** it to the data folder:
   ```bash
   cp ~/Downloads/processed_template_qa.json chatbot-service/data/
   ```

## Option 2: Use Colab to Download

If you still have access to Colab:

```python
from google.colab import files

# Download the file
files.download("/content/drive/My Drive/biobert-chatbot/processed_template_qa.json")
```

Then copy it to:
```bash
cp ~/Downloads/processed_template_qa.json chatbot-service/data/
```

## Verify

After downloading, verify the file exists:

```bash
ls -lh chatbot-service/data/processed_template_qa.json
```

You should see the file listed.

## Test Again

```bash
cd chatbot-service
python app.py
```

You should now see:
```
✅ Loaded X Q&A pairs
✅ Model loaded
✅ Encoded X questions
✅ Chatbot ready!
```

## Port Issue Fix

If you see "Port 5000 is in use", the app will automatically try ports 5001, 5002, etc.

Or disable AirPlay:
1. **System Preferences** → **General** → **AirDrop & Handoff**
2. **Disable** "AirPlay Receiver"

Then run again:
```bash
python app.py
```

