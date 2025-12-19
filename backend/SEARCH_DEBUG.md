# Search Debugging Guide

## Issue: Search is slow or returns "no disease found"

### Quick Test

1. **Test backend health**:
   ```bash
   curl http://localhost:5001/api/health
   ```

2. **Test search endpoint**:
   ```bash
   curl "http://localhost:5001/api/search?query=mastitis&collection=cowAndBuffalo"
   ```

3. **Test database connection**:
   ```bash
   curl http://localhost:5001/api/test-search
   ```

### Check Backend Logs

When you search, you should see detailed logs like:
```
🔍 === SEARCH REQUEST ===
   Query: "mastitis"
   Detected language: en
   Category: cowAndBuffalo
   📊 cowAndBuffalo: Found 5 results (120ms)
✅ Search completed
   Results found: 5
   Total time: 150ms
```

### Common Issues

#### 1. MongoDB Not Connected
**Symptom**: Search times out or returns no results
**Fix**: Check backend logs for MongoDB connection status
**Solution**: Ensure MongoDB Atlas network access is configured

#### 2. Wrong Collection Name
**Symptom**: "Collection not found" in logs
**Fix**: Check collection names match exactly (case-sensitive)
**Solution**: Verify collection names in MongoDB Atlas

#### 3. Query Too Short or Invalid
**Symptom**: "Query too short" error
**Fix**: Minimum 2 characters required
**Solution**: Use longer search terms

#### 4. Frontend API URL Wrong
**Symptom**: Network errors in browser console
**Fix**: Check `Home.js` uses correct API URL
**Solution**: 
- Local: `http://localhost:5001/api`
- Production: Set `REACT_APP_API_URL` environment variable

### Debug Steps

1. **Check backend is running**:
   ```bash
   # Should see: "Server is running on port 5001"
   ```

2. **Check MongoDB connection**:
   ```bash
   # Should see: "✅ Connected to MongoDB Atlas successfully!"
   ```

3. **Test search directly**:
   ```bash
   curl "http://localhost:5001/api/search?query=mastitis&collection=cowAndBuffalo"
   ```

4. **Check browser console**:
   - Open browser DevTools (F12)
   - Go to Network tab
   - Search for a disease
   - Check the request/response

5. **Check backend logs**:
   - Look for search request logs
   - Check for errors
   - Note the time taken

### Expected Behavior

**Fast Search** (< 500ms):
- MongoDB connected
- Collection exists
- Query matches documents
- Results returned quickly

**Slow Search** (> 2s):
- MongoDB connection slow
- Large collection
- No indexes
- Network issues

**No Results**:
- Query doesn't match any documents
- Wrong collection searched
- Language mismatch
- Data not in database

### Performance Tips

1. **Add MongoDB Indexes**:
   ```javascript
   // In MongoDB Atlas, create indexes on:
   // - "Disease Name"
   // - "Disease name"  
   // - "Symptoms"
   ```

2. **Limit Results**:
   - Already implemented: `.limit(50)`

3. **Cache Results** (future):
   - Implement Redis caching
   - Cache popular searches

### Test Queries

Try these test queries:

**English**:
- `mastitis`
- `fever`
- `diarrhea`

**Hindi**:
- `बुखार`
- `दस्त`

**Tamil**:
- `காய்ச்சல்`
- `வயிற்றுப்போக்கு`

### Still Not Working?

1. Check backend logs for detailed error messages
2. Verify MongoDB has data in the collections
3. Test the API directly with curl
4. Check browser network tab for request/response
5. Verify frontend API URL is correct

