# Hugging Face Authentication Setup

Hugging Face no longer supports password authentication. You need to use a **Personal Access Token**.

## Step 1: Create Personal Access Token

1. Go to https://huggingface.co/settings/tokens
2. Click **"New token"**
3. Fill in:
   - **Name**: `veterinary-chatbot-deploy` (or any name)
   - **Type**: **Write** (needed to push)
4. Click **"Generate token"**
5. **Copy the token immediately** (you won't see it again!)

## Step 2: Use Token for Git Push

### Option A: Use Token in URL (Easiest)

```bash
git remote set-url origin https://YOUR_TOKEN@huggingface.co/spaces/Harish200511/veterinary-chatbot
git push origin master
```

Replace `YOUR_TOKEN` with your actual token.

### Option B: Use Git Credential Helper (Recommended)

```bash
# Store credentials
git config --global credential.helper store

# Push (will prompt for username and password)
git push origin master
# Username: Harish200511
# Password: YOUR_TOKEN (paste your token here)
```

### Option C: Use SSH (Most Secure)

1. Generate SSH key (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. Add SSH key to Hugging Face:
   - Go to https://huggingface.co/settings/keys
   - Click **"New SSH key"**
   - Paste your public key (`~/.ssh/id_ed25519.pub`)

3. Change remote to SSH:
   ```bash
   git remote set-url origin git@hf.co:spaces/Harish200511/veterinary-chatbot
   git push origin master
   ```

## Quick Fix (Use Token in URL)

The fastest way is to use the token directly in the URL:

```bash
git remote set-url origin https://YOUR_TOKEN@huggingface.co/spaces/Harish200511/veterinary-chatbot
git push origin master
```

Replace `YOUR_TOKEN` with the token you copied from Step 1.

