const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const chatbotService = require('./chatbot');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware - CORS configuration
// Allow all origins in production for flexibility (you can restrict this later)
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow localhost
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, allow all origins (you can restrict this to specific domains)
    // For now, allow all to ensure it works from any system
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware - log all incoming requests
app.use((req, res, next) => {
  const requestLog = {
    method: req.method,
    url: req.url,
    origin: req.get('origin') || 'Unknown',
    ip: req.ip || req.connection.remoteAddress || 'Unknown',
    timestamp: new Date().toISOString()
  };
  
  // Log in Render-friendly format
  console.log(`[${requestLog.timestamp}] ${requestLog.method} ${requestLog.url} from ${requestLog.origin} (IP: ${requestLog.ip})`);
  
  // Log response when it finishes
  const originalSend = res.send;
  res.send = function(data) {
    const responseLog = {
      statusCode: res.statusCode,
      timestamp: new Date().toISOString()
    };
    
    if (res.statusCode >= 400) {
      console.error(`[${responseLog.timestamp}] ${requestLog.method} ${requestLog.url} - Status: ${responseLog.statusCode}`);
    } else {
      console.log(`[${responseLog.timestamp}] ${requestLog.method} ${requestLog.url} - Status: ${responseLog.statusCode}`);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
});

// Global error handler middleware
app.use((err, req, res, next) => {
  const errorLog = {
    message: err.message,
    stack: err.stack,
    name: err.name,
    url: req.url,
    method: req.method,
    origin: req.get('origin') || 'Unknown',
    timestamp: new Date().toISOString()
  };
  
  console.error('\n❌ ========== GLOBAL ERROR HANDLER ==========');
  console.error('   Timestamp:', errorLog.timestamp);
  console.error('   Method:', errorLog.method);
  console.error('   URL:', errorLog.url);
  console.error('   Origin:', errorLog.origin);
  console.error('   Error Type:', errorLog.name);
  console.error('   Error Message:', errorLog.message);
  console.error('   Stack Trace:');
  console.error(errorLog.stack);
  console.error('===========================================\n');
  
  console.error(`[ERROR] ${errorLog.method} ${errorLog.url}: ${errorLog.message}`);
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: errorLog.timestamp
  });
});

// MongoDB Connection - Updated to use correct database and collection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://harishjwork5:0511@iks.1bnw6oy.mongodb.net/Diseases?retryWrites=true&w=majority&appName=IKS';

// Connect to MongoDB with retry logic
const connectMongoDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      retryWrites: true,
      w: 'majority'
    });
    const connectionInfo = {
      database: mongoose.connection.db?.databaseName || 'Diseases',
      host: mongoose.connection.host || 'Unknown',
      port: mongoose.connection.port || 'Unknown',
      timestamp: new Date().toISOString()
    };
    
    console.log('\n✅ ========== MONGODB CONNECTED ==========');
    console.log(`   Database: ${connectionInfo.database}`);
    console.log(`   Host: ${connectionInfo.host}`);
    console.log(`   Port: ${connectionInfo.port}`);
    console.log(`   Timestamp: ${connectionInfo.timestamp}`);
    console.log(`==========================================\n`);
    
    console.log(`[INFO] MongoDB connected successfully to ${connectionInfo.database}`);
    return true;
  } catch (error) {
    const errorDetails = {
      message: error.message,
      code: error.code,
      name: error.name,
      timestamp: new Date().toISOString(),
      mongodbUri: MONGODB_URI ? MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'Not set'
    };
    
    console.error('\n❌ ========== MONGODB CONNECTION ERROR ==========');
    console.error('   Timestamp:', errorDetails.timestamp);
    console.error('   Error Type:', errorDetails.name);
    console.error('   Error Code:', errorDetails.code);
    console.error('   Error Message:', errorDetails.message);
    console.error('   MongoDB URI:', errorDetails.mongodbUri);
    console.error('\n💡 To fix this:');
    console.error('   1. Go to: https://cloud.mongodb.com');
    console.error('   2. Select your cluster');
    console.error('   3. Click "Network Access" → "Add IP Address"');
    console.error('   4. Click "Allow Access from Anywhere" (0.0.0.0/0)');
    console.error('   5. Wait 1-2 minutes, then restart server');
    console.error('==================================================\n');
    
    // Log in a format easy to see in Render
    console.error(`[ERROR] MongoDB connection failed: ${error.message} (Code: ${error.code})`);
    
    console.error('\n⚠️  Server will continue but database operations may fail\n');
    return false;
  }
};

// Attempt connection
connectMongoDB();

// Disease Schema - Updated to match the existing collection structure
const diseaseSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.Mixed, required: false }, // Handle both ObjectId and string _id
  "Disease Name": { type: String, required: false },
  "Disease name": { type: String, required: false }, // Alternative field name
  "disease_name": { type: String, required: false }, // Alternative field name for new format
  "Symptoms": { type: String, required: true },
  "Causes": { type: String, required: true },
  "Treatment Name": { type: String, required: false }, // Individual treatment fields
  "treatment_description": { type: String, required: false }, // Alternative field name for new format
  "Ingredients": { type: String, required: false },
  "Preparation Method": { type: String, required: false },
  "Dosage": { type: String, required: false },
  "Treatments": { type: [mongoose.Schema.Types.Mixed], required: false }, // Array of treatment objects
  "images": { type: [mongoose.Schema.Types.Mixed], required: false } // Array of image objects
}, { _id: false }); // Disable automatic _id generation

// Create models for different collections
const CowBuffaloDisease = mongoose.model('CowBuffaloDisease', diseaseSchema, 'cowAndBuffalo');
const CowBuffaloTamilDisease = mongoose.model('CowBuffaloTamilDisease', diseaseSchema, 'cowAndBuffaloTamil');
const CowBuffaloHindiDisease = mongoose.model('CowBuffaloHindiDisease', diseaseSchema, 'cowAndBuffaloHindi');
const CowBuffaloMalayalamDisease = mongoose.model('CowBuffaloMalayalamDisease', diseaseSchema, 'cowAndBuffaloMalayalam');

const PoultryBirdsDisease = mongoose.model('PoultryBirdsDisease', diseaseSchema, 'PoultryBirds');
const PoultryBirdsHindiDisease = mongoose.model('PoultryBirdsHindiDisease', diseaseSchema, 'PoultryBirdsHindi');
const PoultryBirdsTamilDisease = mongoose.model('PoultryBirdsTamilDisease', diseaseSchema, 'PoultryBirdsTamil');
const PoultryBirdsMalayalamDisease = mongoose.model('PoultryBirdsMalayalamDisease', diseaseSchema, 'PoultryBirdsMalayalam');

const SheepGoatDisease = mongoose.model('SheepGoatDisease', diseaseSchema, 'SheepGoat');
const SheepGoatHindiDisease = mongoose.model('SheepGoatHindiDisease', diseaseSchema, 'SheepGoatHindi');
const SheepGoatTamilDisease = mongoose.model('SheepGoatTamilDisease', diseaseSchema, 'SheepGoatTamil');
const SheepGoatMalayalamDisease = mongoose.model('SheepGoatMalayalamDisease', diseaseSchema, 'SheepGoatMalayalam');
const SheepGoatImagesDisease = mongoose.model('SheepGoatImagesDisease', diseaseSchema, 'imagesheepandgoat');

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Test search endpoint - returns sample data and tests search
app.get('/api/test-search', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(503).json({ error: 'MongoDB not connected' });
    }
    
    // Get collection names
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Try to get sample documents from multiple collections
    const testResults = {};
    
    for (const collName of ['cowAndBuffalo', 'PoultryBirds', 'SheepGoat']) {
      try {
        const sampleDoc = await db.collection(collName).findOne({});
        if (sampleDoc) {
          testResults[collName] = {
            hasData: true,
            count: await db.collection(collName).countDocuments(),
            diseaseName: sampleDoc["Disease Name"] || sampleDoc["Disease name"] || sampleDoc["disease_name"] || 'N/A',
            fields: Object.keys(sampleDoc),
            sampleFields: {
              "Disease Name": sampleDoc["Disease Name"],
              "Disease name": sampleDoc["Disease name"],
              "disease_name": sampleDoc["disease_name"],
              "Symptoms": sampleDoc["Symptoms"] ? (typeof sampleDoc["Symptoms"] === 'string' ? sampleDoc["Symptoms"].substring(0, 50) : 'Array/Object') : null
            }
          };
          
          // Test a simple search
          const testSearch = await db.collection(collName).find({
            $or: [
              { "Disease Name": /a/i },
              { "Disease name": /a/i },
              { "disease_name": /a/i }
            ]
          }).limit(3).toArray();
          testResults[collName].testSearchResults = testSearch.length;
        } else {
          testResults[collName] = { hasData: false, count: 0 };
        }
      } catch (e) {
        testResults[collName] = { error: e.message };
      }
    }
    
    res.json({
      status: 'ok',
      collections: collectionNames,
      testResults: testResults,
      mongodbState: mongoose.connection.readyState
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// Language detection utility
const detectLanguage = (text) => {
  if (!text || typeof text !== 'string') return 'en';
  
  const trimmedText = text.trim();
  
  // Tamil script detection (U+0B80-U+0BFF)
  const tamilRegex = /[\u0B80-\u0BFF]/;
  
  // Telugu script detection (U+0C00-U+0C7F)
  const teluguRegex = /[\u0C00-\u0C7F]/;
  
  // Malayalam script detection (U+0D00-U+0D7F)
  const malayalamRegex = /[\u0D00-\u0D7F]/;
  
  // Kannada script detection (U+0C80-U+0CFF)
  const kannadaRegex = /[\u0C80-\u0CFF]/;
  
  // Hindi/Devanagari script detection (U+0900-U+097F)
  const hindiRegex = /[\u0900-\u097F]/;
  
  // Check for different scripts
  if (tamilRegex.test(trimmedText)) {
    return 'ta';
  } else if (teluguRegex.test(trimmedText)) {
    return 'te';
  } else if (malayalamRegex.test(trimmedText)) {
    return 'ml';
  } else if (kannadaRegex.test(trimmedText)) {
    return 'kn';
  } else if (hindiRegex.test(trimmedText)) {
    return 'hi';
  }
  
  // Default to English if no script is detected
  return 'en';
};

// Search diseases by name or symptoms with collection filter and language support
// Support both /api/search and /search for compatibility
const handleSearch = async (req, res) => {
  const searchStartTime = Date.now();
  
  try {
    const { query, collection, language } = req.query;
    
    // Debug logging with request details
    const requestInfo = {
      query: req.query,
      url: req.url,
      method: req.method,
      origin: req.get('origin') || 'Unknown',
      userAgent: req.get('user-agent') || 'Unknown',
      ip: req.ip || req.connection.remoteAddress || 'Unknown',
      timestamp: new Date().toISOString()
    };
    
    console.log('\n🔍 ========== SEARCH REQUEST ==========');
    console.log('   Timestamp:', requestInfo.timestamp);
    console.log('   Method:', requestInfo.method);
    console.log('   URL:', requestInfo.url);
    console.log('   Origin:', requestInfo.origin);
    console.log('   IP:', requestInfo.ip);
    console.log('   Query Params:', JSON.stringify(requestInfo.query));
    console.log('   MongoDB State:', mongoose.connection.readyState, mongoose.connection.readyState === 1 ? '(Connected)' : '(Disconnected)');
    console.log('=======================================');
    
    // Log in a format easy to see in Render
    console.log(`[SEARCH] ${requestInfo.method} ${requestInfo.url} from ${requestInfo.origin}`);
    console.log(`[SEARCH] Query: "${query}", Collection: "${collection}", Language: "${language}"`);
    
    // Check MongoDB connection first
    if (mongoose.connection.readyState !== 1) {
      console.error('[ERROR] MongoDB not connected! State:', mongoose.connection.readyState);
      return res.status(503).json({ 
        message: 'Database connection unavailable. Please try again later.',
        error: 'MongoDB not connected',
        timestamp: requestInfo.timestamp
      });
    }
    
    if (!query || !query.trim()) {
      console.log('   ❌ Empty query received\n');
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    // Clean and validate query
    const cleanQuery = query.trim();
    if (cleanQuery.length < 1) {
      console.log('   ❌ Empty query received\n');
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    // Detect language from search query
    const detectedLanguage = detectLanguage(cleanQuery);
    const searchLanguage = language || detectedLanguage;
    
    console.log(`   Query: "${cleanQuery}"`);
    console.log(`   Detected language: ${detectedLanguage}`);
    console.log(`   Search language: ${searchLanguage}`);
    console.log(`   Category: ${collection || 'all'}`);
    
    // Escape special regex characters to prevent errors
    const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escapedQuery, 'i');
    let collectionsToSearch = [];
    
    // Determine which collections to search based on category and detected language
    // If language-specific collection doesn't exist, fallback to English
    switch(collection) {
      case 'cowAndBuffalo':
        if (searchLanguage === 'ta') {
          collectionsToSearch = ['cowAndBuffaloTamil'];
        } else if (searchLanguage === 'hi') {
          collectionsToSearch = ['cowAndBuffaloHindi'];
        } else if (searchLanguage === 'ml') {
          collectionsToSearch = ['cowAndBuffaloMalayalam'];
        } else {
          collectionsToSearch = ['cowAndBuffalo']; // English
        }
        break;
      case 'PoultryBirds':
        if (searchLanguage === 'ta') {
          collectionsToSearch = ['PoultryBirdsTamil'];
        } else if (searchLanguage === 'hi') {
          collectionsToSearch = ['PoultryBirdsHindi'];
        } else if (searchLanguage === 'ml') {
          collectionsToSearch = ['PoultryBirdsMalayalam'];
        } else {
          collectionsToSearch = ['PoultryBirds'];
        }
        break;
      case 'SheepGoat':
        if (searchLanguage === 'ta') {
          collectionsToSearch = ['SheepGoatTamil'];
        } else if (searchLanguage === 'hi') {
          collectionsToSearch = ['SheepGoatHindi'];
        } else if (searchLanguage === 'ml') {
          collectionsToSearch = ['SheepGoatMalayalam'];
        } else {
          collectionsToSearch = ['SheepGoat'];
        }
        break;
      case 'imagesheepandgoat':
        collectionsToSearch = ['imagesheepandgoat'];
        break;
      default:
        // Search all collections if no specific category
        collectionsToSearch = ['cowAndBuffalo', 'PoultryBirds', 'SheepGoat', 'cowAndBuffaloTamil', 'PoultryBirdsTamil', 'SheepGoatTamil', 'PoultryBirdsHindi', 'SheepGoatHindi', 'cowAndBuffaloHindi', 'PoultryBirdsMalayalam', 'SheepGoatMalayalam', 'cowAndBuffaloMalayalam'];
    }
    
    let allResults = [];
    
    // Search in all relevant collections
    for (const coll of collectionsToSearch) {
      let DiseaseModel;
      switch(coll) {
        case 'cowAndBuffalo':
          DiseaseModel = CowBuffaloDisease;
          break;
        case 'cowAndBuffaloTamil':
          DiseaseModel = CowBuffaloTamilDisease;
          break;
        case 'cowAndBuffaloHindi':
          DiseaseModel = CowBuffaloHindiDisease;
          break;
        case 'cowAndBuffaloMalayalam':
          DiseaseModel = CowBuffaloMalayalamDisease;
          break;
        case 'PoultryBirds':
          DiseaseModel = PoultryBirdsDisease;
          break;
        case 'PoultryBirdsHindi':
          DiseaseModel = PoultryBirdsHindiDisease;
          break;
        case 'PoultryBirdsTamil':
          DiseaseModel = PoultryBirdsTamilDisease;
          break;
        case 'PoultryBirdsMalayalam':
          DiseaseModel = PoultryBirdsMalayalamDisease;
          break;
        case 'SheepGoat':
          DiseaseModel = SheepGoatDisease;
          break;
        case 'SheepGoatHindi':
          DiseaseModel = SheepGoatHindiDisease;
          break;
        case 'SheepGoatTamil':
          DiseaseModel = SheepGoatTamilDisease;
          break;
        case 'SheepGoatMalayalam':
          DiseaseModel = SheepGoatMalayalamDisease;
          break;
        case 'imagesheepandgoat':
          DiseaseModel = SheepGoatImagesDisease;
          break;
        default:
          continue;
      }
      
      try {
        const collectionStartTime = Date.now();
        console.log(`[SEARCH] Searching collection: ${coll}`);
        
        // Use raw MongoDB driver for collections with string _id fields
        let diseases;
        const collectionsWithStringId = ['SheepGoatHindi', 'PoultryBirdsHindi', 'SheepGoatMalayalam', 'PoultryBirdsMalayalam', 'cowAndBuffaloHindi', 'cowAndBuffaloMalayalam'];
        
        if (collectionsWithStringId.includes(coll)) {
          const db = mongoose.connection.db;
          if (!db) {
            console.error(`[ERROR] MongoDB db object not available for collection: ${coll}`);
            console.log(`   ⚠️  MongoDB connection not ready for collection: ${coll}`);
            continue;
          }
          
          console.log(`[SEARCH] Using raw MongoDB driver for ${coll}`);
          // Try multiple search patterns - use text search for better matching
          const searchQuery = {
            $or: [
              { "Disease Name": { $regex: escapedQuery, $options: 'i' } },
              { "Disease name": { $regex: escapedQuery, $options: 'i' } },
              { "disease_name": { $regex: escapedQuery, $options: 'i' } },
              { "Symptoms": { $regex: escapedQuery, $options: 'i' } },
              { "symptoms": { $regex: escapedQuery, $options: 'i' } }
            ]
          };
          
          diseases = await db.collection(coll).find(searchQuery).limit(50).toArray();
          
          // If still no results, try searching in all string fields (fallback)
          if (diseases.length === 0) {
            console.log(`[SEARCH] No results with regex, trying full document search for ${coll}...`);
            const allDocs = await db.collection(coll).find({}).limit(100).toArray();
            diseases = allDocs.filter(doc => {
              const docStr = JSON.stringify(doc).toLowerCase();
              return docStr.includes(cleanQuery.toLowerCase());
            }).slice(0, 50);
            console.log(`[SEARCH] Full document search found ${diseases.length} results for ${coll}`);
          }
        } else {
          // Try multiple search patterns with Mongoose
          console.log(`[SEARCH] Using Mongoose model for ${coll}`);
          const searchQuery = {
            $or: [
              { "Disease Name": { $regex: escapedQuery, $options: 'i' } },
              { "Disease name": { $regex: escapedQuery, $options: 'i' } },
              { "disease_name": { $regex: escapedQuery, $options: 'i' } },
              { "Symptoms": { $regex: escapedQuery, $options: 'i' } },
              { "symptoms": { $regex: escapedQuery, $options: 'i' } }
            ]
          };
          
          console.log(`[SEARCH] Executing Mongoose query for ${coll}...`);
          diseases = await DiseaseModel.find(searchQuery).limit(50);
          console.log(`[SEARCH] Mongoose query completed for ${coll}, found ${diseases.length} results`);
          
          // If no results, try getting all and filtering
          if (diseases.length === 0) {
            const allDiseases = await DiseaseModel.find({}).limit(100);
            diseases = allDiseases.filter(disease => {
              const diseaseObj = disease.toObject ? disease.toObject() : disease;
              const diseaseStr = JSON.stringify(diseaseObj).toLowerCase();
              return diseaseStr.includes(cleanQuery.toLowerCase());
            }).slice(0, 50);
          }
        }
        
        const collectionTime = Date.now() - collectionStartTime;
        if (diseases.length > 0) {
          console.log(`   📊 ${coll}: Found ${diseases.length} results (${collectionTime}ms)`);
          // Log first result for debugging
          const firstResult = diseases[0];
          const firstDiseaseName = firstResult["Disease Name"] || firstResult["Disease name"] || firstResult["disease_name"] || 'Unknown';
          console.log(`      First result: "${firstDiseaseName}"`);
        } else {
          console.log(`   ⚠️  ${coll}: No results found (${collectionTime}ms)`);
          // Try to get total count to see if collection has data
          try {
            const db = mongoose.connection.db;
            if (db) {
              const totalCount = await db.collection(coll).countDocuments();
              console.log(`      Collection has ${totalCount} total documents`);
              if (totalCount > 0) {
                const sampleDoc = await db.collection(coll).findOne({});
                if (sampleDoc) {
                  const sampleName = sampleDoc["Disease Name"] || sampleDoc["Disease name"] || sampleDoc["disease_name"] || 'N/A';
                  console.log(`      Sample document: "${sampleName}"`);
                  console.log(`      Available fields: ${Object.keys(sampleDoc).join(', ')}`);
                }
              }
            }
          } catch (e) {
            // Ignore errors in debug logging
          }
        }
        
        // Map the results to include collection info and remove duplicates
        const diseaseMap = new Map();
        diseases.forEach(disease => {
          // Handle all field name variations
          const diseaseName = (disease["Disease Name"] || disease["Disease name"] || disease["disease_name"] || '').toString().toLowerCase().trim();
          
          // Only add if we have a disease name
          if (diseaseName && diseaseName.length > 0) {
            // Use disease name as key, but allow duplicates if they're from different collections
            const mapKey = `${diseaseName}_${coll}`;
            
            if (!diseaseMap.has(mapKey)) {
              // Handle cases where _id might be undefined
              const diseaseId = disease._id ? (typeof disease._id === 'string' ? disease._id : disease._id.toString()) : `temp_${Date.now()}_${Math.random()}`;
              const displayName = disease["Disease Name"] || disease["Disease name"] || disease["disease_name"] || 'Unknown Disease';
              
              console.log(`[SEARCH] Processing disease: "${displayName}" with ID: ${diseaseId}`);
              
              // Handle different data structures for different collections
              const diseaseData = {
                _id: diseaseId,
                "Disease Name": displayName,
                "Symptoms": disease["Symptoms"] || disease["symptoms"] || '',
                collection: coll,
                detectedLanguage: searchLanguage
              };
              
              // Add treatment data based on collection structure - preserve arrays
              if (disease["Treatments"] && Array.isArray(disease["Treatments"])) {
                diseaseData["Treatments"] = disease["Treatments"];
                console.log(`[SEARCH] Added Treatments array with ${disease["Treatments"].length} items`);
              } else {
                // Preserve arrays for treatment fields
                if (disease["Treatment Name"]) {
                  diseaseData["Treatment Name"] = disease["Treatment Name"];
                  console.log(`[SEARCH] Treatment Name type: ${Array.isArray(disease["Treatment Name"]) ? 'Array' : typeof disease["Treatment Name"]}`);
                }
                if (disease["Ingredients"]) {
                  diseaseData["Ingredients"] = disease["Ingredients"];
                  console.log(`[SEARCH] Ingredients type: ${Array.isArray(disease["Ingredients"]) ? 'Array' : typeof disease["Ingredients"]}`);
                }
                if (disease["Preparation Method"]) {
                  diseaseData["Preparation Method"] = disease["Preparation Method"];
                  console.log(`[SEARCH] Preparation Method type: ${Array.isArray(disease["Preparation Method"]) ? 'Array' : typeof disease["Preparation Method"]}`);
                }
                if (disease["Dosage"]) {
                  diseaseData["Dosage"] = disease["Dosage"];
                  console.log(`[SEARCH] Dosage type: ${Array.isArray(disease["Dosage"]) ? 'Array' : typeof disease["Dosage"]}`);
                }
              }
              
              // Add other fields if they exist
              if (disease["Causes"]) diseaseData["Causes"] = disease["Causes"];
              
              diseaseMap.set(mapKey, diseaseData);
              console.log(`[SEARCH] Added disease to results: "${displayName}"`);
            }
          }
        });
        
        allResults = allResults.concat(Array.from(diseaseMap.values()));
      } catch (modelError) {
        console.log(`   ⚠️  Collection ${coll} error: ${modelError.message}`);
        continue;
      }
    }

    const totalTime = Date.now() - searchStartTime;
    console.log(`\n✅ Search completed for "${cleanQuery}"`);
    console.log(`   Category: ${collection || 'all'}`);
    console.log(`   Language: ${searchLanguage}`);
    console.log(`   Collections searched: ${collectionsToSearch.join(', ')}`);
    console.log(`   Results found: ${allResults.length}`);
    console.log(`   Total time: ${totalTime}ms`);
    
    if (allResults.length === 0) {
      console.log(`\n⚠️  No results found for: "${cleanQuery}"`);
      console.log(`   Searched in: ${collectionsToSearch.join(', ')}`);
      console.log(`   Suggestions:`);
      console.log(`   - Check spelling`);
      console.log(`   - Try different keywords`);
      console.log(`   - Try searching in different category`);
      console.log(`   - Try searching in different language\n`);
    } else {
      console.log(`   ✅ Returning ${allResults.length} results\n`);
    }
    
    console.log(`[SEARCH] Sending response with ${allResults.length} results`);
    const response = {
      results: allResults,
      detectedLanguage: searchLanguage,
      searchedCollections: collectionsToSearch
    };
    
    console.log(`[SEARCH] Response prepared, sending...`);
    res.json(response);
    console.log(`[SEARCH] Response sent successfully`);
  } catch (error) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      query: query,
      collection: collection,
      timestamp: new Date().toISOString(),
      mongodbState: mongoose.connection.readyState,
      mongodbConnected: mongoose.connection.readyState === 1
    };
    
    console.error('\n❌ ========== SEARCH ERROR ==========');
    console.error('   Timestamp:', errorDetails.timestamp);
    console.error('   Query:', errorDetails.query);
    console.error('   Collection:', errorDetails.collection);
    console.error('   Error Type:', errorDetails.name);
    console.error('   Error Message:', errorDetails.message);
    console.error('   MongoDB State:', errorDetails.mongodbState, errorDetails.mongodbConnected ? '(Connected)' : '(Disconnected)');
    console.error('   Stack Trace:');
    console.error(errorDetails.stack);
    console.error('=====================================\n');
    
    // Log to console in a way that's easy to see in Render logs
    console.error(`[ERROR] Search failed for query "${query}" in collection "${collection}": ${error.message}`);
    
    res.status(500).json({ 
      message: 'Search failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      timestamp: errorDetails.timestamp
    });
  }
};

// Register search route for both /api/search and /search
app.get('/api/search', handleSearch);
app.get('/search', handleSearch);

// New endpoint: Get disease by index for language translation
// This endpoint uses the index field to find the same disease across different languages
app.get('/api/disease-by-index/:category/:index/:targetLanguage', async (req, res) => {
  try {
    const { category, index, targetLanguage } = req.params;
    
    console.log(`\n=== DISEASE BY INDEX TRANSLATION ===`);
    console.log(`Category: ${category}`);
    console.log(`Index: ${index}`);
    console.log(`Target Language: ${targetLanguage}`);
    
    // Map language codes to collection names
    const languageMap = {
      'en': 'en',
      'ta': 'ta',
      'hi': 'hi',
      'ml': 'ml'
    };
    
    const langCode = languageMap[targetLanguage] || targetLanguage;
    
    // Map category to target language collection name
    const targetCollectionMap = {
      'PoultryBirds': {
        'en': 'PoultryBirds',
        'ta': 'PoultryBirdsTamil',
        'hi': 'PoultryBirdsHindi',
        'ml': 'PoultryBirdsMalayalam'
      },
      'CowAndBuffalo': {
        'en': 'cowAndBuffalo',
        'ta': 'cowAndBuffaloTamil',
        'hi': 'cowAndBuffaloHindi',
        'ml': 'cowAndBuffaloMalayalam'
      },
      'cowAndBuffalo': {
        'en': 'cowAndBuffalo',
        'ta': 'cowAndBuffaloTamil',
        'hi': 'cowAndBuffaloHindi',
        'ml': 'cowAndBuffaloMalayalam'
      },
      'SheepGoat': {
        'en': 'SheepGoat',
        'ta': 'SheepGoatTamil',
        'hi': 'SheepGoatHindi',
        'ml': 'SheepGoatMalayalam'
      }
    };
    
    const targetCollection = targetCollectionMap[category]?.[langCode];
    
    if (!targetCollection) {
      return res.status(400).json({ 
        message: 'Invalid category or language',
        category,
        targetLanguage: langCode,
        availableCategories: Object.keys(targetCollectionMap)
      });
    }
    
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(503).json({ message: 'Database connection unavailable' });
    }
    
    // Convert index to number if it's a string
    const indexNum = typeof index === 'string' ? parseInt(index, 10) : index;
    
    if (isNaN(indexNum)) {
      return res.status(400).json({ 
        message: 'Invalid index value',
        index
      });
    }
    
    console.log(`Looking for disease with index ${indexNum} in collection: ${targetCollection}`);
    
    // Find all diseases with the same index (in case there are duplicates)
    let diseases = [];
    
    // Use raw MongoDB driver for all collections to handle index field
    const allDiseases = await db.collection(targetCollection).find({}).toArray();
    
    // Filter diseases by index (handle both number and string index values)
    diseases = allDiseases.filter(d => {
      const diseaseIndex = d.index !== undefined ? (typeof d.index === 'string' ? parseInt(d.index, 10) : d.index) : null;
      return diseaseIndex === indexNum;
    });
    
    console.log(`Found ${diseases.length} disease(s) with index ${indexNum}`);
    
    if (diseases.length === 0) {
      return res.status(404).json({ 
        message: `Disease with index ${indexNum} not found in ${targetCollection} collection`,
        index: indexNum,
        targetCollection: targetCollection
      });
    }
    
    // If multiple diseases have the same index, merge them
    // Use the first one as base and merge unique fields from others
    let mergedDisease = JSON.parse(JSON.stringify(diseases[0])); // Deep clone
    
    if (diseases.length > 1) {
      console.log(`Multiple diseases found with same index, merging data...`);
      
      // Merge unique data from other diseases with the same index
      for (let i = 1; i < diseases.length; i++) {
        const otherDisease = diseases[i];
        
        // Merge disease name if not already present or if current is empty
        if (!mergedDisease["Disease Name"] && otherDisease["Disease Name"]) {
          mergedDisease["Disease Name"] = otherDisease["Disease Name"];
        }
        
        // Merge symptoms if not already present or if current is empty
        if (!mergedDisease["Symptoms"] && otherDisease["Symptoms"]) {
          mergedDisease["Symptoms"] = otherDisease["Symptoms"];
        }
        
        // Merge causes if not already present or if current is empty
        if (!mergedDisease["Causes"] && otherDisease["Causes"]) {
          mergedDisease["Causes"] = otherDisease["Causes"];
        }
        
        // Merge treatment data
        if (!mergedDisease["Treatment Name"] && otherDisease["Treatment Name"]) {
          mergedDisease["Treatment Name"] = otherDisease["Treatment Name"];
        }
        
        if (!mergedDisease["Ingredients"] && otherDisease["Ingredients"]) {
          mergedDisease["Ingredients"] = otherDisease["Ingredients"];
        }
        
        if (!mergedDisease["Preparation Method"] && otherDisease["Preparation Method"]) {
          mergedDisease["Preparation Method"] = otherDisease["Preparation Method"];
        }
        
        if (!mergedDisease["Dosage"] && otherDisease["Dosage"]) {
          mergedDisease["Dosage"] = otherDisease["Dosage"];
        }
        
        // Merge Treatments array if present
        if (otherDisease["Treatments"] && Array.isArray(otherDisease["Treatments"])) {
          if (!mergedDisease["Treatments"]) {
            mergedDisease["Treatments"] = [];
          }
          // Add unique treatments
          otherDisease["Treatments"].forEach(treatment => {
            const exists = mergedDisease["Treatments"].some(t => 
              JSON.stringify(t) === JSON.stringify(treatment)
            );
            if (!exists) {
              mergedDisease["Treatments"].push(treatment);
            }
          });
        }
        
        // Merge images if present
        if (otherDisease.images && Array.isArray(otherDisease.images)) {
          if (!mergedDisease.images) {
            mergedDisease.images = [];
          }
          // Add unique images
          otherDisease.images.forEach(image => {
            const exists = mergedDisease.images.some(img => 
              img.image_id === image.image_id
            );
            if (!exists) {
              mergedDisease.images.push(image);
            }
          });
        }
      }
    }
    
    // Format the response
    const displayName = mergedDisease["Disease Name"] || mergedDisease["Disease name"] || mergedDisease["disease_name"] || 'Unknown';
    
    const response = {
      _id: mergedDisease._id,
      index: mergedDisease.index,
      "Disease Name": displayName,
      "Symptoms": mergedDisease["Symptoms"],
      "Causes": mergedDisease["Causes"],
      "Treatment Name": mergedDisease["Treatment Name"],
      "Ingredients": mergedDisease["Ingredients"],
      "Preparation Method": mergedDisease["Preparation Method"],
      "Dosage": mergedDisease["Dosage"],
      "Treatments": mergedDisease["Treatments"],
      images: mergedDisease.images,
      collection: targetCollection,
      language: langCode,
      translated: true,
      mergedFromMultiple: diseases.length > 1
    };
    
    console.log(`✅ Found disease: ${displayName} (merged from ${diseases.length} document(s))`);
    res.json(response);
    
  } catch (error) {
    console.error('Disease by index translation error:', error);
    res.status(500).json({ 
      message: 'Internal server error during disease translation by index',
      error: error.message 
    });
  }
});

// Get disease by ID with collection
app.get('/api/disease/:collection/:id', async (req, res) => {
  try {
    const { id, collection } = req.params;
    let DiseaseModel = CowBuffaloDisease; // default
    
    console.log(`\n=== DISEASE DETAIL REQUEST ===`);
    console.log(`Collection: ${collection}`);
    console.log(`ID: ${id}`);
    console.log(`Request URL: ${req.url}`);
    console.log(`Request Method: ${req.method}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`User Agent: ${req.get('User-Agent')}`);
    console.log(`Referer: ${req.get('Referer')}`);
    
    // Select the appropriate model based on collection
    switch(collection) {
      case 'cowAndBuffalo':
        DiseaseModel = CowBuffaloDisease;
        break;
      case 'cowAndBuffaloTamil':
        DiseaseModel = CowBuffaloTamilDisease;
        break;
      case 'cowAndBuffaloHindi':
        DiseaseModel = CowBuffaloHindiDisease;
        break;
      case 'cowAndBuffaloMalayalam':
        DiseaseModel = CowBuffaloMalayalamDisease;
        break;
      case 'PoultryBirds':
        DiseaseModel = PoultryBirdsDisease;
        break;
      case 'PoultryBirdsHindi':
        DiseaseModel = PoultryBirdsHindiDisease;
        break;
      case 'PoultryBirdsTamil':
        DiseaseModel = PoultryBirdsTamilDisease;
        break;
      case 'PoultryBirdsMalayalam':
        DiseaseModel = PoultryBirdsMalayalamDisease;
        break;
      case 'SheepGoat':
        DiseaseModel = SheepGoatDisease;
        break;
      case 'SheepGoatHindi':
        DiseaseModel = SheepGoatHindiDisease;
        break;
      case 'SheepGoatTamil':
        DiseaseModel = SheepGoatTamilDisease;
        break;
      case 'SheepGoatMalayalam':
        DiseaseModel = SheepGoatMalayalamDisease;
        break;
      case 'imagesheepandgoat':
        DiseaseModel = SheepGoatImagesDisease;
        break;
      default:
        DiseaseModel = CowBuffaloDisease;
    }
    
    // Find disease by ID - using manual search since ObjectId conversion has issues
    let disease = null;
    
    console.log(`\n--- DISEASE SEARCH LOGIC ---`);
    console.log(`Using collection: ${collection}`);
    console.log(`Looking for ID: ${id}`);
    console.log(`ID type: ${typeof id}`);
    
    try {
    // Use raw MongoDB driver for collections with string _id fields
    const collectionsWithStringId = ['SheepGoatHindi', 'PoultryBirdsHindi', 'SheepGoatMalayalam', 'PoultryBirdsMalayalam', 'cowAndBuffaloHindi', 'cowAndBuffaloMalayalam'];
    
    if (collectionsWithStringId.includes(collection)) {
        console.log(`[DISEASE] Using raw MongoDB driver for collection: ${collection}`);
        const db = mongoose.connection.db;
        if (!db) {
          console.error(`[ERROR] MongoDB db object not available for collection: ${collection}`);
          return res.status(503).json({ message: 'Database connection unavailable' });
        }
        
        console.log(`[DISEASE] Searching for ID: ${id} (type: ${typeof id}, length: ${id.length})`);
        
        // Try multiple ID formats for string ID collections
        // First try direct find with the ID as-is
        disease = await db.collection(collection).findOne({ _id: id });
        
        if (!disease) {
          // Try with ObjectId conversion if it looks like an ObjectId
          const mongoose = require('mongoose');
          if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
            console.log(`[DISEASE] ID looks like ObjectId, trying ObjectId conversion...`);
            try {
              const objectId = new mongoose.Types.ObjectId(id);
              disease = await db.collection(collection).findOne({ _id: objectId });
              if (disease) {
                console.log(`[DISEASE] Found disease using ObjectId conversion`);
              }
            } catch (e) {
              console.log(`[DISEASE] ObjectId conversion failed: ${e.message}`);
            }
          }
        }
        
        if (!disease) {
          // If direct find fails, try searching all documents (for string ID matching)
          console.log(`[DISEASE] Direct find failed, trying full collection search...`);
          const allDiseases = await db.collection(collection).find({}).toArray();
          console.log(`[DISEASE] Found ${allDiseases.length} total diseases in collection`);
          
          // Log first few IDs for debugging
          if (allDiseases.length > 0) {
            console.log(`[DISEASE] Sample IDs in collection:`);
            allDiseases.slice(0, 3).forEach((d, idx) => {
              const sampleId = d._id ? (typeof d._id === 'string' ? d._id : d._id.toString()) : 'No ID';
              console.log(`[DISEASE]   ${idx + 1}. ${sampleId} (type: ${typeof d._id})`);
            });
          }
          
          disease = allDiseases.find(d => {
            if (d._id) {
              // Handle both ObjectId and string _id types
              const diseaseId = typeof d._id === 'string' ? d._id : d._id.toString();
              const match = diseaseId === id || diseaseId === String(id) || String(diseaseId) === String(id);
              if (match) {
                console.log(`[DISEASE] Found match: ${diseaseId} === ${id}`);
              }
              return match;
            }
            return false;
          });
        } else {
          console.log(`[DISEASE] Found disease using direct find`);
        }
        
        if (disease) {
          console.log(`[DISEASE] Disease found: ${disease["Disease Name"] || disease["Disease name"] || 'Unknown'}`);
        } else {
          console.error(`[ERROR] Disease not found with ID: ${id} in collection: ${collection}`);
        }
      } else {
        console.log(`Using Mongoose model: ${DiseaseModel.modelName}`);
        const allDiseases = await DiseaseModel.find({});
        console.log(`Found ${allDiseases.length} diseases using Mongoose model`);
        
        // Handle both regular ObjectIds, string IDs, and temporary IDs
        disease = allDiseases.find(d => {
          if (d._id) {
            // Handle both ObjectId and string _id types
            const diseaseId = typeof d._id === 'string' ? d._id : d._id.toString();
            console.log(`Mongoose comparing: ${diseaseId} === ${id} ? ${diseaseId === id}`);
            return diseaseId === id;
          }
          // For diseases without _id, try to match by disease name
          console.log(`Disease has no _id field`);
          return false;
        });
      }
    } catch (err) {
      console.log('Disease search failed:', err.message);
      console.log('Error stack:', err.stack);
    }
    
    console.log(`\n--- SEARCH RESULT ---`);
    console.log(`Disease found: ${disease ? 'YES' : 'NO'}`);
    
    if (!disease) {
      console.log(`❌ Disease ${id} not found in collection ${collection}`);
      console.log(`\n=== DISEASE DETAIL REQUEST END (404) ===`);
      return res.status(404).json({ message: 'Disease not found' });
    }

    // Convert to plain object and ensure proper formatting
    let diseaseData;
    if (disease.toObject) {
      diseaseData = disease.toObject();
      console.log(`[DISEASE] Converted Mongoose document to plain object`);
    } else {
      // For raw MongoDB documents, ensure it's a proper object
      diseaseData = JSON.parse(JSON.stringify(disease));
      console.log(`[DISEASE] Converted raw MongoDB document to plain object`);
    }
    
    // Ensure _id is properly formatted
    if (diseaseData._id) {
      diseaseData._id = typeof diseaseData._id === 'string' ? diseaseData._id : diseaseData._id.toString();
    }
    
    // Handle both field name variations for display
    const displayName = diseaseData["Disease Name"] || diseaseData["Disease name"] || diseaseData["disease_name"] || 'Unknown';
    console.log(`✅ Found disease: ${displayName}`);
    console.log(`[DISEASE] Disease ID: ${diseaseData._id} (type: ${typeof diseaseData._id})`);
    console.log(`[DISEASE] Index: ${diseaseData.index !== undefined ? diseaseData.index : 'Not set'}`);
    console.log(`[DISEASE] Has Symptoms: ${!!diseaseData["Symptoms"]}`);
    console.log(`[DISEASE] Has Treatment Name: ${!!diseaseData["Treatment Name"]}`);
    console.log(`[DISEASE] Has Ingredients: ${!!diseaseData["Ingredients"]}`);
    console.log(`[DISEASE] Treatment Name type: ${Array.isArray(diseaseData["Treatment Name"]) ? 'Array' : typeof diseaseData["Treatment Name"]}`);
    console.log(`[DISEASE] Ingredients type: ${Array.isArray(diseaseData["Ingredients"]) ? 'Array' : typeof diseaseData["Ingredients"]}`);
    console.log(`\n=== DISEASE DETAIL REQUEST END (200) ===`);
    
    // Ensure index is included in response (if it exists)
    if (diseaseData.index === undefined) {
      console.log(`[WARN] Disease does not have index field`);
    }
    
    res.json(diseaseData);
  } catch (error) {
    console.error('\n=== DISEASE DETAIL ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request params:', req.params);
    console.error('Request body:', req.body);
    console.error('Request headers:', req.headers);
    console.error('=== END ERROR ===\n');
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get all diseases for a specific collection
app.get('/api/diseases/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    let DiseaseModel = CowBuffaloDisease; // default
    
    // Select the appropriate model based on collection
    switch(collection) {
      case 'cowAndBuffalo':
        DiseaseModel = CowBuffaloDisease;
        break;
      case 'cowAndBuffaloTamil':
        DiseaseModel = CowBuffaloTamilDisease;
        break;
      case 'PoultryBirds':
        DiseaseModel = PoultryBirdsDisease;
        break;
      case 'PoultryBirdsHindi':
        DiseaseModel = PoultryBirdsHindiDisease;
        break;
      case 'PoultryBirdsTamil':
        DiseaseModel = PoultryBirdsTamilDisease;
        break;
      case 'SheepGoat':
        DiseaseModel = SheepGoatDisease;
        break;
      case 'SheepGoatHindi':
        DiseaseModel = SheepGoatHindiDisease;
        break;
      case 'SheepGoatTamil':
        DiseaseModel = SheepGoatTamilDisease;
        break;
      default:
        DiseaseModel = CowBuffaloDisease;
    }
    
    const diseases = await DiseaseModel.find();
    
    // Map the results to include only the needed fields
    const mappedDiseases = diseases.map(disease => ({
      _id: disease._id,
      "Disease Name": disease["Disease Name"],
      "Symptoms": disease["Symptoms"],
      collection: collection
    }));
    
    console.log(`Retrieved ${mappedDiseases.length} diseases from ${collection} collection`);
    res.json(mappedDiseases);
  } catch (error) {
    console.error('Get all diseases error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Test endpoint to check database connection and data for all collections
app.get('/api/test', async (req, res) => {
  try {
    const cowBuffaloCount = await CowBuffaloDisease.countDocuments();
    const cowBuffaloTamilCount = await CowBuffaloTamilDisease.countDocuments();
    
    const poultryCount = await PoultryBirdsDisease.countDocuments();
    const poultryHindiCount = await PoultryBirdsHindiDisease.countDocuments();
    const poultryTamilCount = await PoultryBirdsTamilDisease.countDocuments();
    
    const sheepGoatCount = await SheepGoatDisease.countDocuments();
    const sheepGoatHindiCount = await SheepGoatHindiDisease.countDocuments();
    const sheepGoatTamilCount = await SheepGoatTamilDisease.countDocuments();
    
    const totalCount = cowBuffaloCount + cowBuffaloTamilCount + 
                      poultryCount + poultryHindiCount + poultryTamilCount + 
                      sheepGoatCount + sheepGoatHindiCount + sheepGoatTamilCount;
    
    res.json({
      message: 'Database connection successful',
      collections: {
        cowAndBuffalo: cowBuffaloCount,
        cowAndBuffaloTamil: cowBuffaloTamilCount,
        PoultryBirds: poultryCount,
        PoultryBirdsHindi: poultryHindiCount,
        PoultryBirdsTamil: poultryTamilCount,
        SheepGoat: sheepGoatCount,
        SheepGoatHindi: sheepGoatHindiCount,
        SheepGoatTamil: sheepGoatTamilCount
      },
      totalDiseases: totalCount,
      database: 'Diseases'
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ message: 'Database test failed', error: error.message });
  }
});

// Seed data endpoint (for testing - only if collection is empty)
app.post('/api/seed', async (req, res) => {
  try {
    // Check if cowAndBuffalo collection has data
    const existingCount = await CowBuffaloDisease.countDocuments();
    
    if (existingCount > 0) {
      return res.json({ 
        message: `Database already contains ${existingCount} diseases in cowAndBuffalo collection. Skipping seed.`,
        existingCount 
      });
    }

    const sampleDiseases = [
      {
        "Disease Name": "Bovine Mastitis",
        "Symptoms": "Swollen udder, abnormal milk, fever, decreased milk production",
        "Causes": "Bacterial infection, poor milking hygiene, stress",
        "Treatment Name": "Mastitis Antibiotic Therapy",
        "Ingredients": "Intramammary antibiotics, anti-inflammatory drugs, udder cream",
        "Preparation Method": "Intramammary infusion after proper udder cleaning",
        "Dosage": "Antibiotic: 1 tube per quarter every 12-24 hours for 3-5 days"
      },
      {
        "Disease Name": "Foot and Mouth Disease",
        "Symptoms": "Fever, blisters in mouth and on feet, lameness, reduced milk production",
        "Causes": "Viral infection, contact with infected animals",
        "Treatment Name": "Supportive Care and Antiviral Treatment",
        "Ingredients": "Antiviral medication, pain relievers, antiseptic solutions",
        "Preparation Method": "Oral medication with topical treatment for blisters",
        "Dosage": "As per veterinarian's prescription based on severity"
      }
    ];

    const result = await CowBuffaloDisease.insertMany(sampleDiseases);
    
    res.json({ 
      message: 'Sample data seeded successfully', 
      count: result.length,
      database: 'Diseases',
      collection: 'cowAndBuffalo'
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Translation endpoint - get disease data in different language
app.get('/api/translate-disease/:collection/:id/:targetLanguage', async (req, res) => {
  try {
    const { collection, id, targetLanguage } = req.params;
    
    console.log(`\n=== TRANSLATION REQUEST ===`);
    console.log(`Collection: ${collection}`);
    console.log(`ID: ${id}`);
    console.log(`Target Language: ${targetLanguage}`);
    console.log(`Request URL: ${req.url}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    // Map target language to collection suffix
    const languageMap = {
      'en': '',
      'ta': 'Tamil',
      'hi': 'Hindi',
      'te': 'Telugu',
      'ml': 'Malayalam',
      'kn': 'Kannada'
    };
    
    // Handle undefined or null target language
    if (!targetLanguage || targetLanguage === 'undefined') {
      return res.status(400).json({ 
        message: 'Target language is required',
        supportedLanguages: Object.keys(languageMap)
      });
    }
    
    const targetSuffix = languageMap[targetLanguage];
    if (!targetSuffix && targetLanguage !== 'en') {
      return res.status(400).json({ 
        message: 'Unsupported target language',
        supportedLanguages: Object.keys(languageMap)
      });
    }
    
    // Determine target collection
    let targetCollection;
    if (targetLanguage === 'en') {
      // For English, remove language suffix from collection name
      if (collection.endsWith('Hindi')) {
        targetCollection = collection.replace('Hindi', '');
      } else if (collection.endsWith('Tamil')) {
        targetCollection = collection.replace('Tamil', '');
      } else if (collection.endsWith('Malayalam')) {
        targetCollection = collection.replace('Malayalam', '');
      } else {
        // Already English collection
        targetCollection = collection;
      }
    } else {
      // For other languages, add suffix to base collection name
      const baseCollection = collection.replace(/Hindi$|Tamil$|Malayalam$/, '');
      targetCollection = baseCollection + targetSuffix;
    }
    
    console.log(`Looking for disease in collection: ${targetCollection}`);
    
    // Try to find the disease in the target language collection
    let disease = null;
    
    // Handle different collection types - use raw MongoDB driver for all language-specific collections
    const collectionsWithStringId = ['SheepGoatHindi', 'PoultryBirdsHindi', 'SheepGoatMalayalam', 'PoultryBirdsMalayalam', 'cowAndBuffaloHindi', 'cowAndBuffaloMalayalam'];
    
    if (targetCollection === 'cowAndBuffalo' || targetCollection === 'cowAndBuffaloTamil') {
      // Use Mongoose models for these collections
      const Model = targetCollection === 'cowAndBuffalo' ? CowBuffaloDisease : CowBuffaloTamilDisease;
      disease = await Model.findById(id);
    } else if (collectionsWithStringId.includes(targetCollection) || targetCollection.includes('Hindi') || targetCollection.includes('Tamil') || targetCollection.includes('Malayalam')) {
      // Use raw MongoDB driver for language-specific collections
      const db = mongoose.connection.db;
      if (db) {
        const allDiseases = await db.collection(targetCollection).find({}).toArray();
        disease = allDiseases.find(d => {
          if (d._id) {
            const diseaseId = typeof d._id === 'string' ? d._id : d._id.toString();
            return diseaseId === id;
          }
          return false;
        });
      }
    } else {
      // For other collections, try to find by ID
      const db = mongoose.connection.db;
      if (db) {
        disease = await db.collection(targetCollection).findOne({ _id: id });
      }
    }
    
    // If disease not found in target collection, return 404
    if (!disease) {
      return res.status(404).json({ 
        message: `Disease not found in ${targetLanguage} collection`,
        targetCollection: targetCollection,
        availableInLanguage: false
      });
    }
    
    // Check if we found the disease in the same collection (no translation available)
    // This happens when the target language collection is the same as the source collection
    if (targetCollection === collection) {
      return res.status(200).json({
        ...disease,
        collection: targetCollection,
        language: targetLanguage,
        translated: false,
        message: `Disease found in original collection, no ${targetLanguage} translation available`
      });
    }
    
    // Also check if we're returning content from the original collection when we should be looking elsewhere
    if (disease.collection === collection && targetCollection !== collection) {
      return res.status(200).json({
        ...disease,
        collection: collection,
        language: targetLanguage,
        translated: false,
        message: `Disease not available in ${targetLanguage}, showing original version`
      });
    }
    
    // Format the response similar to the disease detail endpoint
    const displayName = disease["Disease Name"] || disease["Disease name"];
    
    const response = {
      _id: disease._id,
      "Disease Name": displayName,
      "Symptoms": disease["Symptoms"],
      "Causes": disease["Causes"],
      "Treatment Name": disease["Treatment Name"],
      "Ingredients": disease["Ingredients"],
      "Preparation Method": disease["Preparation Method"],
      "Dosage": disease["Dosage"],
      "Treatments": disease["Treatments"], // For collections with array format
      collection: targetCollection,
      language: targetLanguage,
      translated: true
    };
    
    console.log(`Found disease in ${targetLanguage}: ${displayName}`);
    res.json(response);
    
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ message: 'Internal server error during translation' });
  }
});

// DEPRECATED: Get disease by name using translation collections
// This endpoint uses Diseases.translationPoultryBirds, Diseases.translationCowAndBuffalo, Diseases.translationSheepGoat
// NOTE: This endpoint is deprecated. Use /api/disease-by-index/:category/:index/:targetLanguage instead
// The new endpoint uses the index field which is consistent across languages for the same disease
app.get('/api/disease-by-name/:category/:diseaseName/:targetLanguage', async (req, res) => {
  try {
    const { category, diseaseName, targetLanguage } = req.params;
    
    console.log(`\n=== DISEASE BY NAME TRANSLATION ===`);
    console.log(`Category: ${category}`);
    console.log(`Disease Name (original): ${diseaseName}`);
    console.log(`Target Language: ${targetLanguage}`);
    
    // Map language codes
    const languageMap = {
      'en': 'en',
      'ta': 'ta',
      'hi': 'hi',
      'ml': 'ml'
    };
    
    const langCode = languageMap[targetLanguage] || targetLanguage;
    
    // Map category to translation collection name
    // Collections are: translationPoultryBirds, translationCowAndBuffalo, translationSheepGoat
    const translationCollectionMap = {
      'PoultryBirds': 'translationPoultryBirds',
      'CowAndBuffalo': 'translationCowAndBuffalo',
      'cowAndBuffalo': 'translationCowAndBuffalo',
      'SheepGoat': 'translationSheepGoat'
    };
    
    // Map category to target language collection name
    const targetCollectionMap = {
      'PoultryBirds': {
        'en': 'PoultryBirds',
        'ta': 'PoultryBirdsTamil',
        'hi': 'PoultryBirdsHindi',
        'ml': 'PoultryBirdsMalayalam'
      },
      'CowAndBuffalo': {
        'en': 'cowAndBuffalo',
        'ta': 'cowAndBuffaloTamil',
        'hi': 'cowAndBuffaloHindi',
        'ml': 'cowAndBuffaloMalayalam'
      },
      'cowAndBuffalo': {
        'en': 'cowAndBuffalo',
        'ta': 'cowAndBuffaloTamil',
        'hi': 'cowAndBuffaloHindi',
        'ml': 'cowAndBuffaloMalayalam'
      },
      'SheepGoat': {
        'en': 'SheepGoat',
        'ta': 'SheepGoatTamil',
        'hi': 'SheepGoatHindi',
        'ml': 'SheepGoatMalayalam'
      }
    };
    
    const translationCollectionName = translationCollectionMap[category];
    const targetCollection = targetCollectionMap[category]?.[langCode];
    
    if (!translationCollectionName || !targetCollection) {
      return res.status(400).json({ 
        message: 'Invalid category or language',
        category,
        targetLanguage: langCode,
        availableCategories: Object.keys(translationCollectionMap)
      });
    }
    
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(503).json({ message: 'Database connection unavailable' });
    }
    
    // Step 1: Find the disease in the translation collection
    console.log(`Looking in translation collection: ${translationCollectionName}`);
    
    // Access the translation collection
    const translationDocs = await db.collection(translationCollectionName).find({}).toArray();
    console.log(`Found ${translationDocs.length} entries in translation collection`);
    
    // Helper function to normalize disease names for matching
    const normalizeDiseaseName = (name) => {
      if (!name) return '';
      // Remove leading numbers and dots (e.g., "1. Disease name")
      let normalized = name.replace(/^\d+[\.\)]\s*/, '');
      // Remove trailing colons
      normalized = normalized.replace(/:\s*$/, '');
      // Remove extra spaces
      normalized = normalized.replace(/\s+/g, ' ').trim();
      return normalized.toLowerCase();
    };
    
    // Decode the disease name
    const decodedDiseaseName = decodeURIComponent(diseaseName);
    console.log(`Searching for English name: "${decodedDiseaseName}"`);
    const normalizedSearchName = normalizeDiseaseName(decodedDiseaseName);
    console.log(`Normalized search name: "${normalizedSearchName}"`);
    
    // Find the disease entry by matching the English name (case-insensitive, with normalization)
    let diseaseEntry = translationDocs.find(entry => {
      const enName = entry.names?.en || '';
      const normalizedEnName = normalizeDiseaseName(enName);
      return normalizedEnName === normalizedSearchName;
    });
    
    // If exact match not found, try partial matching
    if (!diseaseEntry) {
      console.log(`Exact match not found, trying partial match...`);
      diseaseEntry = translationDocs.find(entry => {
        const enName = entry.names?.en || '';
        const normalizedEnName = normalizeDiseaseName(enName);
        // Try partial matching (one contains the other)
        return normalizedEnName.includes(normalizedSearchName) || normalizedSearchName.includes(normalizedEnName);
      });
    }
    
    // If still not found, try matching without normalization (original matching)
    if (!diseaseEntry) {
      console.log(`Normalized match not found, trying original matching...`);
      diseaseEntry = translationDocs.find(entry => {
        const enName = entry.names?.en || '';
        const normalizedEnName = enName.toLowerCase().trim();
        const normalizedSearch = decodedDiseaseName.toLowerCase().trim();
        return normalizedEnName === normalizedSearch;
      });
    }
    
    if (!diseaseEntry) {
      console.log(`\n=== DISEASE NOT FOUND IN TRANSLATION COLLECTION ===`);
      console.log(`Searched for: "${decodedDiseaseName}"`);
      console.log(`Available English names (first 10):`);
      translationDocs.slice(0, 10).forEach((entry, idx) => {
        const enName = entry.names?.en || 'N/A';
        console.log(`  ${idx + 1}. "${enName}"`);
      });
      console.log(`=== END AVAILABLE NAMES ===\n`);
      
      return res.status(404).json({ 
        message: 'Disease not found in translation collection',
        searchedFor: decodedDiseaseName,
        collection: translationCollectionName
      });
    }
    
    console.log(`✅ Found disease entry in translation collection`);
    console.log(`  English name: "${diseaseEntry.names?.en || 'N/A'}"`);
    console.log(`  Available languages: ${Object.keys(diseaseEntry.names || {}).join(', ')}`);
    
    // Step 2: Get the translated disease name
    const translatedName = diseaseEntry.names?.[langCode];
    
    if (!translatedName || translatedName.trim() === '') {
      console.log(`\n❌ No translation available for language: ${langCode}`);
      console.log(`Available languages with translations:`);
      Object.keys(diseaseEntry.names || {}).forEach(lang => {
        if (diseaseEntry.names[lang]) {
          console.log(`  ${lang}: "${diseaseEntry.names[lang]}"`);
        }
      });
      console.log(`\n`);
      
      return res.status(404).json({ 
        message: `No translation available for ${langCode}`,
        availableLanguages: Object.keys(diseaseEntry.names || {}).filter(lang => diseaseEntry.names[lang]),
        englishName: diseaseEntry.names?.en
      });
    }
    
    console.log(`✅ Found translation: "${translatedName}" in ${langCode}`);
    
    // Step 3: Find the disease in the target language collection by name
    const targetCollectionName = targetCollection;
    console.log(`Looking for disease in target collection: ${targetCollectionName}`);
    console.log(`Translated name to search: "${translatedName}"`);
    
    // Helper function to normalize disease names for matching in target collections
    const normalizeNameForTargetSearch = (name) => {
      if (!name) return '';
      // Remove leading numbers and dots
      let normalized = name.replace(/^\d+[\.\)]\s*/, '');
      // Remove trailing colons
      normalized = normalized.replace(/:\s*$/, '');
      // Remove parentheses and their content (e.g., "(Disease)")
      normalized = normalized.replace(/\([^)]*\)/g, '');
      // Remove extra spaces
      normalized = normalized.replace(/\s+/g, ' ').trim();
      return normalized.toLowerCase();
    };
    
    const normalizedTranslatedName = normalizeNameForTargetSearch(translatedName);
    console.log(`Normalized translated name for search: "${normalizedTranslatedName}"`);
    
    // Search in the target collection
    let targetDisease = null;
    
    // First, try using Mongoose models if available (for better compatibility)
    try {
      let DiseaseModel = null;
      switch(targetCollectionName) {
        case 'cowAndBuffaloHindi':
          DiseaseModel = CowBuffaloHindiDisease;
          break;
        case 'cowAndBuffaloMalayalam':
          DiseaseModel = CowBuffaloMalayalamDisease;
          break;
        case 'PoultryBirdsHindi':
          DiseaseModel = PoultryBirdsHindiDisease;
          break;
        case 'PoultryBirdsMalayalam':
          DiseaseModel = PoultryBirdsMalayalamDisease;
          break;
        case 'SheepGoatHindi':
          // Use raw MongoDB for this
          break;
        case 'SheepGoatMalayalam':
          // Use raw MongoDB for this
          break;
      }
      
      if (DiseaseModel) {
        console.log(`Using Mongoose model for collection: ${targetCollectionName}`);
        const allDiseases = await DiseaseModel.find({}).lean();
        console.log(`Found ${allDiseases.length} diseases in collection`);
        
        // Try exact match first (with normalization)
        targetDisease = allDiseases.find(d => {
          const diseaseNameField = d["Disease Name"] || d["Disease name"] || d["disease_name"] || '';
          const normalizedField = normalizeNameForTargetSearch(diseaseNameField);
          return normalizedField === normalizedTranslatedName;
        });
        
        // If not found, try original exact match (without normalization)
        if (!targetDisease) {
          console.log(`Normalized exact match not found, trying original exact match...`);
          targetDisease = allDiseases.find(d => {
            const diseaseNameField = d["Disease Name"] || d["Disease name"] || d["disease_name"] || '';
            const normalizedField = diseaseNameField.toLowerCase().trim();
            const normalizedTranslated = translatedName.toLowerCase().trim();
            return normalizedField === normalizedTranslated;
          });
        }
        
        // If not found, try partial match (contains)
        if (!targetDisease) {
          console.log(`Exact match not found, trying partial match...`);
          targetDisease = allDiseases.find(d => {
            const diseaseNameField = d["Disease Name"] || d["Disease name"] || d["disease_name"] || '';
            const normalizedField = normalizeNameForTargetSearch(diseaseNameField);
            // Try partial matching
            return normalizedField.includes(normalizedTranslatedName) || normalizedTranslatedName.includes(normalizedField);
          });
        }
      }
    } catch (modelErr) {
      console.log(`Mongoose model approach failed, using raw MongoDB:`, modelErr.message);
    }
    
    // If not found via Mongoose, use raw MongoDB driver
    if (!targetDisease) {
      console.log(`Using raw MongoDB driver for collection: ${targetCollectionName}`);
      const allDiseases = await db.collection(targetCollectionName).find({}).toArray();
      console.log(`Found ${allDiseases.length} diseases in collection`);
      
      // Try exact match first (with normalization)
      targetDisease = allDiseases.find(d => {
        const diseaseNameField = d["Disease Name"] || d["Disease name"] || d["disease_name"] || '';
        const normalizedField = normalizeNameForTargetSearch(diseaseNameField);
        return normalizedField === normalizedTranslatedName;
      });
      
      // If not found, try original exact match (without normalization)
      if (!targetDisease) {
        console.log(`Normalized exact match not found, trying original exact match...`);
        targetDisease = allDiseases.find(d => {
          const diseaseNameField = d["Disease Name"] || d["Disease name"] || d["disease_name"] || '';
          const normalizedField = diseaseNameField.toLowerCase().trim();
          const normalizedTranslated = translatedName.toLowerCase().trim();
          return normalizedField === normalizedTranslated;
        });
      }
      
      // If not found, try partial match (contains)
      if (!targetDisease) {
        console.log(`Exact match not found, trying partial match...`);
        targetDisease = allDiseases.find(d => {
          const diseaseNameField = d["Disease Name"] || d["Disease name"] || d["disease_name"] || '';
          const normalizedField = normalizeNameForTargetSearch(diseaseNameField);
          // Try partial matching
          return normalizedField.includes(normalizedTranslatedName) || normalizedTranslatedName.includes(normalizedField);
        });
      }
      
      // If still not found, log available disease names for debugging
      if (!targetDisease && allDiseases.length > 0) {
        console.log(`\n=== AVAILABLE DISEASE NAMES IN ${targetCollectionName} ===`);
        allDiseases.slice(0, 10).forEach((d, idx) => {
          const name = d["Disease Name"] || d["Disease name"] || d["disease_name"] || 'N/A';
          console.log(`${idx + 1}. "${name}"`);
        });
        console.log(`=== END AVAILABLE DISEASES ===\n`);
      }
    }
    
    if (!targetDisease) {
      console.log(`Disease not found in target collection: ${targetCollectionName}`);
      console.log(`Searched for: "${translatedName}"`);
      return res.status(404).json({ 
        message: `Disease "${translatedName}" not found in ${targetCollectionName} collection`,
        translatedName,
        targetCollection: targetCollectionName,
        debug: {
          searchedFor: translatedName,
          collectionName: targetCollectionName
        }
      });
    }
    
    console.log(`✅ Found disease in target collection: ${targetDisease["Disease Name"] || targetDisease["Disease name"] || 'N/A'}`);
    
    // Step 4: Format and return the disease data
    const displayName = targetDisease["Disease Name"] || targetDisease["Disease name"] || targetDisease["disease_name"] || translatedName;
    
    const response = {
      _id: targetDisease._id,
      "Disease Name": displayName,
      "Symptoms": targetDisease["Symptoms"],
      "Causes": targetDisease["Causes"],
      "Treatment Name": targetDisease["Treatment Name"],
      "Ingredients": targetDisease["Ingredients"],
      "Preparation Method": targetDisease["Preparation Method"],
      "Dosage": targetDisease["Dosage"],
      "Treatments": targetDisease["Treatments"],
      images: targetDisease.images,
      collection: targetCollectionName,
      language: langCode,
      translated: true,
      originalName: diseaseName,
      translatedName: translatedName
    };
    
    console.log(`✅ Found disease: ${displayName}`);
    res.json(response);
    
  } catch (error) {
    console.error('Disease by name translation error:', error);
    res.status(500).json({ 
      message: 'Internal server error during disease translation',
      error: error.message 
    });
  }
});

// Chatbot endpoints
app.post('/api/chat', async (req, res) => {
  const requestStartTime = Date.now();
  
  try {
    const { message, language = 'en' } = req.body;
    
    if (!message || message.trim() === '') {
      console.log(`\n=== CHATBOT VALIDATION ERROR ===`);
      console.log(`Error: Empty message received`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log(`=== VALIDATION ERROR END ===\n`);
      
      return res.status(400).json({ 
        message: 'Message is required',
        success: false 
      });
    }

    console.log(`\n=== CHATBOT API REQUEST ===`);
    console.log(`User Message: "${message}"`);
    console.log(`Requested Language: ${language}`);
    console.log(`User Agent: ${req.get('User-Agent') || 'Unknown'}`);
    console.log(`IP Address: ${req.ip || req.connection.remoteAddress || 'Unknown'}`);
    console.log(`Request Timestamp: ${new Date().toISOString()}`);

    const response = await chatbotService.getResponse(message, language);
    const totalResponseTime = Date.now() - requestStartTime;
    
    console.log(`\n=== CHATBOT API RESPONSE ===`);
    console.log(`Final Response: ${response.response}`);
    console.log(`Response Source: ${response.source}`);
    console.log(`Success: ${response.success}`);
    console.log(`Total Response Time: ${totalResponseTime}ms`);
    console.log(`API Response Time: ${response.responseTime || 'N/A'}ms`);
    console.log(`Confidence Score: ${response.confidence || 'N/A'}%`);
    console.log(`Detected Disease: ${response.detectedDisease || 'N/A'}`);
    console.log(`Matched Question: ${response.matchedQuestion || 'N/A'}`);
    console.log(`Response Timestamp: ${new Date().toISOString()}`);
    console.log(`=== CHATBOT API RESPONSE END ===\n`);

    const responseData = {
      success: response.success,
      message: response.response,
      source: response.source,
      timestamp: new Date().toISOString(),
      confidence: response.confidence,
      detectedDisease: response.detectedDisease,
      matchedQuestion: response.matchedQuestion,
      responseTime: totalResponseTime,
      suggestedQuestions: response.suggestedQuestions || []
    };

    console.log(`Final API Response Data:`, JSON.stringify(responseData, null, 2));
    res.json(responseData);

  } catch (error) {
    const totalResponseTime = Date.now() - requestStartTime;
    console.error(`\n=== CHATBOT API ERROR ===`);
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    console.error(`Response Time: ${totalResponseTime}ms`);
    console.error(`Timestamp: ${new Date().toISOString()}`);
    console.error(`=== CHATBOT API ERROR END ===\n`);
    
    res.status(500).json({ 
      message: 'Internal server error',
      success: false,
      error: error.message,
      responseTime: totalResponseTime
    });
  }
});

// Get chatbot status
app.get('/api/chat/status', (req, res) => {
  try {
    const status = chatbotService.getStatus();
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error('Chatbot status error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      success: false 
    });
  }
});

// Chatbot analytics endpoint (for viewing interaction logs)
app.get('/api/chat/analytics', (req, res) => {
  try {
    // This would typically connect to a database to retrieve logs
    // For now, we'll return a message indicating logs are in console
    res.json({
      success: true,
      message: 'Chatbot interaction logs are displayed in the server console. Check your terminal for detailed logs.',
      note: 'Each interaction includes: user message, language, response time, confidence score, detected disease, and matched question.',
      logFormat: {
        request: 'User message, language, timestamp, IP address',
        response: 'Formatted response, confidence score, detected disease, response time',
        error: 'Error details, response time, timestamp'
      }
    });
  } catch (error) {
    console.error('Chatbot analytics error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      success: false 
    });
  }
});

// Image serving endpoint
app.get('/api/image/:collection/:diseaseId/:imageId', async (req, res) => {
  try {
    const { collection, diseaseId, imageId } = req.params;
    
    console.log(`\n=== IMAGE REQUEST ===`);
    console.log(`Collection: ${collection}`);
    console.log(`Disease ID: ${diseaseId}`);
    console.log(`Image ID: ${imageId}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    let DiseaseModel;
    switch(collection) {
      case 'imagesheepandgoat':
        DiseaseModel = SheepGoatImagesDisease;
        break;
      default:
        return res.status(400).json({ message: 'Invalid collection for images' });
    }
    
    // Find the disease - use raw MongoDB driver for imagesheepandgoat collection
    let disease = null;
    if (collection === 'imagesheepandgoat') {
      const db = mongoose.connection.db;
      disease = await db.collection(collection).findOne({ _id: diseaseId });
    } else {
      disease = await DiseaseModel.findById(diseaseId);
    }
    
    if (!disease) {
      return res.status(404).json({ message: 'Disease not found' });
    }
    
    // Find the specific image
    const image = disease.images?.find(img => img.image_id === imageId);
    if (!image || !image.image_data) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Set appropriate headers for image
    res.set({
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      'Content-Length': image.image_data.length
    });
    
    // Convert base64 to buffer and send
    const imageBuffer = Buffer.from(image.image_data, 'base64');
    res.send(imageBuffer);
    
    console.log(`Image served successfully: ${imageId}`);
    console.log(`=== IMAGE REQUEST END ===\n`);
    
  } catch (error) {
    console.error('Image serving error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all diseases with images
app.get('/api/diseases-with-images/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    
    let DiseaseModel;
    switch(collection) {
      case 'imagesheepandgoat':
        DiseaseModel = SheepGoatImagesDisease;
        break;
      default:
        return res.status(400).json({ message: 'Invalid collection' });
    }
    
    let diseases = [];
    if (collection === 'imagesheepandgoat') {
      const db = mongoose.connection.db;
      diseases = await db.collection(collection).find({ images: { $exists: true, $ne: [] } }).toArray();
    } else {
      diseases = await DiseaseModel.find({ images: { $exists: true, $ne: [] } });
    }
    
    // Map results to include image URLs
    const diseasesWithImages = diseases.map(disease => ({
      _id: disease._id,
      disease_name: disease.disease_name || disease["Disease Name"] || disease["Disease name"],
      treatment_description: disease.treatment_description || disease["Treatment Name"],
      images: disease.images?.map(img => ({
        image_id: img.image_id,
        image_name: img.image_name,
        image_url: `/api/image/${collection}/${disease._id}/${img.image_id}`
      })) || []
    }));
    
    res.json({
      success: true,
      diseases: diseasesWithImages,
      count: diseasesWithImages.length
    });
    
  } catch (error) {
    console.error('Error fetching diseases with images:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  const serverInfo = {
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodbUri: process.env.MONGODB_URI ? 'Set (hidden)' : 'Not set',
    frontendUrl: process.env.FRONTEND_URL || 'Not set',
    chatbotUrl: process.env.CHATBOT_API_URL || 'Not set',
    timestamp: new Date().toISOString()
  };
  
  console.log(`\n🚀 ========== SERVER STARTED ==========`);
  console.log(`   Port: ${serverInfo.port}`);
  console.log(`   Environment: ${serverInfo.nodeEnv}`);
  console.log(`   Timestamp: ${serverInfo.timestamp}`);
  console.log(`   MongoDB URI: ${serverInfo.mongodbUri}`);
  console.log(`   Frontend URL: ${serverInfo.frontendUrl}`);
  console.log(`   Chatbot URL: ${serverInfo.chatbotUrl}`);
  console.log(`   MongoDB State: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}`);
  console.log(`   Database: Diseases`);
  console.log(`   Collection: cowAndBuffalo`);
  console.log(`   Chatbot service: ${chatbotService ? (chatbotService.isAvailable ? '✅ Available' : '⚠️  Not available') : '❌ Not loaded'}`);
  console.log(`=====================================\n`);
  
  // Log in a format easy to see in Render
  console.log(`[INFO] Server started on port ${PORT} in ${serverInfo.nodeEnv} mode`);
  console.log(`[INFO] MongoDB connection: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  
  if (chatbotService && !chatbotService.isAvailable) {
    console.log(`[WARN] Chatbot service not available. Set CHATBOT_API_URL to enable.`);
  }
});
