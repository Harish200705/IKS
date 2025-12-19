# Fix MongoDB Connection Error

## Problem
```
❌ MongoDB connection error: querySrv ECONNREFUSED _mongodb._tcp.iks.1bnw6oy.mongodb.net
```

This means MongoDB Atlas is **blocking your connection**.

## ✅ Solution: Allow Network Access in MongoDB Atlas

### Step-by-Step:

1. **Go to MongoDB Atlas**:
   - Visit: https://cloud.mongodb.com
   - Login with your account

2. **Select Your Project**:
   - Click on your project/cluster

3. **Open Network Access**:
   - Click **"Network Access"** in the left sidebar
   - (Or go to: https://cloud.mongodb.com/v2#/security/network/whitelist)

4. **Add IP Address**:
   - Click **"Add IP Address"** button
   - Click **"Allow Access from Anywhere"**
   - This adds `0.0.0.0/0` (allows all IPs)
   - Click **"Confirm"**

5. **Wait 1-2 minutes** for changes to propagate

6. **Restart your backend**:
   ```bash
   # Stop current server (Ctrl+C)
   npm start
   ```

### Alternative: Add Your Specific IP

If you don't want to allow all IPs:

1. Find your IP: https://whatismyipaddress.com/
2. In MongoDB Atlas → Network Access
3. Click "Add IP Address"
4. Enter your IP address
5. Click "Confirm"

## 🔍 Verify Connection

### Test 1: Check Network Access

In MongoDB Atlas:
- Network Access tab should show `0.0.0.0/0` or your IP
- Status should be "Active"

### Test 2: Test Connection

```bash
cd backend
node -e "
const mongoose = require('mongoose');
const uri = 'mongodb+srv://harishjwork5:0511@iks.1bnw6oy.mongodb.net/Diseases?retryWrites=true&w=majority&appName=IKS';
mongoose.connect(uri, {serverSelectionTimeoutMS: 5000})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    process.exit(0);
  })
  .catch(e => {
    console.error('❌ Connection Failed:', e.message);
    process.exit(1);
  });
"
```

### Test 3: Check Internet Connection

```bash
# Test if you can reach MongoDB
ping iks.1bnw6oy.mongodb.net
```

## 🐛 If Still Not Working

### Check 1: Database User Permissions

1. Go to MongoDB Atlas → **"Database Access"**
2. Find user: `harishjwork5`
3. Make sure it has **"Read and write to any database"** permission
4. If not, edit user → Set permissions → Save

### Check 2: Connection String

Verify your connection string is correct:
```
mongodb+srv://harishjwork5:0511@iks.1bnw6oy.mongodb.net/Diseases?retryWrites=true&w=majority&appName=IKS
```

### Check 3: Firewall/VPN

- **Disable VPN** if you're using one
- **Check firewall** settings
- **Try different network** (mobile hotspot)

### Check 4: MongoDB Atlas Status

- Check if MongoDB Atlas is having issues: https://status.mongodb.com/
- Try creating a new cluster if current one has issues

## 💡 Quick Checklist

- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0` or your IP
- [ ] Network Access status is "Active"
- [ ] Database user has read/write permissions
- [ ] Connection string is correct
- [ ] Internet connection is working
- [ ] No VPN/firewall blocking
- [ ] Waited 1-2 minutes after changing network access

## 🚀 After Fixing

Restart your backend:
```bash
npm start
```

You should see:
```
✅ Connected to MongoDB Atlas successfully!
```

Instead of:
```
❌ MongoDB connection error
```

