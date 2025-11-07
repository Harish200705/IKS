const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const chatbotService = require('./chatbot');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection - Updated to use correct database and collection
const MONGODB_URI = 'mongodb+srv://harishjwork5:0511@iks.1bnw6oy.mongodb.net/Diseases?retryWrites=true&w=majority&appName=IKS';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas successfully!');
    console.log('Database: Diseases');
    console.log('Collection: cowAndBuffalo');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

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

const PoultryBirdsDisease = mongoose.model('PoultryBirdsDisease', diseaseSchema, 'PoultryBirds');
const PoultryBirdsHindiDisease = mongoose.model('PoultryBirdsHindiDisease', diseaseSchema, 'PoultryBirdsHindi');
const PoultryBirdsTamilDisease = mongoose.model('PoultryBirdsTamilDisease', diseaseSchema, 'PoultryBirdsTamil');

const SheepGoatDisease = mongoose.model('SheepGoatDisease', diseaseSchema, 'SheepGoat');
const SheepGoatHindiDisease = mongoose.model('SheepGoatHindiDisease', diseaseSchema, 'SheepGoatHindi');
const SheepGoatTamilDisease = mongoose.model('SheepGoatTamilDisease', diseaseSchema, 'SheepGoatTamil');
const SheepGoatImagesDisease = mongoose.model('SheepGoatImagesDisease', diseaseSchema, 'imagesheepandgoat');

// Routes

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
app.get('/api/search', async (req, res) => {
  try {
    const { query, collection, language } = req.query;
    
    // Debug logging
    console.log('Raw query params:', req.query);
    console.log('Raw URL:', req.url);
    
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    // Detect language from search query
    const detectedLanguage = detectLanguage(query);
    const searchLanguage = language || detectedLanguage;
    
    console.log(`Query: "${query}", Detected language: ${detectedLanguage}, Search language: ${searchLanguage}`);
    
    const searchRegex = new RegExp(query, 'i');
    let collectionsToSearch = [];
    
    // Determine which collections to search based on category and detected language
    // If language-specific collection doesn't exist, fallback to English
    switch(collection) {
      case 'cowAndBuffalo':
        if (searchLanguage === 'ta') {
          collectionsToSearch = ['cowAndBuffaloTamil'];
        } else {
          collectionsToSearch = ['cowAndBuffalo']; // English only for cowAndBuffalo
        }
        break;
      case 'PoultryBirds':
        if (searchLanguage === 'ta') {
          collectionsToSearch = ['PoultryBirdsTamil'];
        } else if (searchLanguage === 'hi') {
          collectionsToSearch = ['PoultryBirdsHindi'];
        } else {
          collectionsToSearch = ['PoultryBirds'];
        }
        break;
      case 'SheepGoat':
        if (searchLanguage === 'ta') {
          collectionsToSearch = ['SheepGoatTamil'];
        } else if (searchLanguage === 'hi') {
          collectionsToSearch = ['SheepGoatHindi'];
        } else {
          collectionsToSearch = ['SheepGoat'];
        }
        break;
      case 'imagesheepandgoat':
        collectionsToSearch = ['imagesheepandgoat'];
        break;
      default:
        collectionsToSearch = ['cowAndBuffalo'];
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
        case 'imagesheepandgoat':
          DiseaseModel = SheepGoatImagesDisease;
          break;
        default:
          continue;
      }
      
      try {
        // Use raw MongoDB driver for collections with string _id fields
        let diseases;
        if (coll === 'SheepGoatHindi' || coll === 'PoultryBirdsHindi') {
          const db = mongoose.connection.db;
          diseases = await db.collection(coll).find({
            $or: [
              { "Disease Name": searchRegex },
              { "Disease name": searchRegex },
              { "Symptoms": searchRegex }
            ]
          }).toArray();
        } else {
          diseases = await DiseaseModel.find({
            $or: [
              { "Disease Name": searchRegex },
              { "Disease name": searchRegex },
              { "Symptoms": searchRegex }
            ]
          });
        }
        
        // Map the results to include collection info and remove duplicates
        const diseaseMap = new Map();
        diseases.forEach(disease => {
          // Handle both field name variations
          const diseaseName = (disease["Disease Name"] || disease["Disease name"])?.toLowerCase().trim();
          if (diseaseName && !diseaseMap.has(diseaseName)) {
            // Handle cases where _id might be undefined
            const diseaseId = disease._id ? (typeof disease._id === 'string' ? disease._id : disease._id.toString()) : `temp_${Date.now()}_${Math.random()}`;
            const displayName = disease["Disease Name"] || disease["Disease name"];
            console.log(`Disease found: ${displayName}, ID: ${diseaseId}, Original ID: ${disease._id}`);
            // Handle different data structures for different collections
            const diseaseData = {
              _id: diseaseId,
              "Disease Name": displayName,
              "Symptoms": disease["Symptoms"],
              collection: coll,
              detectedLanguage: searchLanguage
            };
            
            // Add treatment data based on collection structure
            if (disease["Treatments"] && Array.isArray(disease["Treatments"])) {
              // For collections with Treatments array (like PoultryBirdsHindi)
              diseaseData["Treatments"] = disease["Treatments"];
            } else {
              // For collections with individual treatment fields
              if (disease["Treatment Name"]) diseaseData["Treatment Name"] = disease["Treatment Name"];
              if (disease["Ingredients"]) diseaseData["Ingredients"] = disease["Ingredients"];
              if (disease["Preparation Method"]) diseaseData["Preparation Method"] = disease["Preparation Method"];
              if (disease["Dosage"]) diseaseData["Dosage"] = disease["Dosage"];
            }
            
            // Add other fields if they exist
            if (disease["Causes"]) diseaseData["Causes"] = disease["Causes"];
            
            diseaseMap.set(diseaseName, diseaseData);
          }
        });
        
        allResults = allResults.concat(Array.from(diseaseMap.values()));
      } catch (modelError) {
        console.log(`Collection ${coll} not found or empty, skipping...`);
        continue;
      }
    }

    console.log(`Search results for "${query}" in ${collection} (${collectionsToSearch.join(', ')}) - Detected language: ${searchLanguage}:`, allResults.length);
    res.json({
      results: allResults,
      detectedLanguage: searchLanguage,
      searchedCollections: collectionsToSearch
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Internal server error' });
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
      if (collection === 'SheepGoatHindi' || collection === 'PoultryBirdsHindi') {
        console.log(`Using raw MongoDB driver for collection: ${collection}`);
        const db = mongoose.connection.db;
        const allDiseases = await db.collection(collection).find({}).toArray();
        console.log(`Found ${allDiseases.length} total diseases in collection`);
        
        disease = allDiseases.find(d => {
          if (d._id) {
            // Handle both ObjectId and string _id types
            const diseaseId = typeof d._id === 'string' ? d._id : d._id.toString();
            console.log(`Comparing: ${diseaseId} === ${id} ? ${diseaseId === id}`);
            return diseaseId === id;
          }
          return false;
        });
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

    // Handle both field name variations for display
    const displayName = disease["Disease Name"] || disease["Disease name"];
    console.log(`✅ Found disease: ${displayName}`);
    console.log(`Disease ID: ${disease._id}`);
    console.log(`Disease type: ${typeof disease._id}`);
    console.log(`\n=== DISEASE DETAIL REQUEST END (200) ===`);
    res.json(disease);
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
    const existingCount = await Disease.countDocuments();
    
    if (existingCount > 0) {
      return res.json({ 
        message: `Database already contains ${existingCount} diseases. Skipping seed.`,
        existingCount 
      });
    }

    const sampleDiseases = [
      {
        diseaseName: 'Canine Parvovirus',
        symptoms: 'Vomiting, diarrhea, lethargy, loss of appetite, fever',
        causes: 'Viral infection, contact with infected dogs or contaminated feces',
        treatmentName: 'Supportive Care Protocol',
        ingredients: 'IV fluids, anti-nausea medication, antibiotics',
        preparationMethod: 'Hospitalization with IV fluid therapy and medication administration',
        dosage: 'IV fluids: 60-90ml/kg/day, Anti-nausea: 0.5-1mg/kg every 8-12 hours'
      },
      {
        diseaseName: 'Feline Upper Respiratory Infection',
        symptoms: 'Sneezing, runny nose, watery eyes, coughing, fever',
        causes: 'Viral or bacterial infection, stress, poor ventilation',
        treatmentName: 'Respiratory Support Treatment',
        ingredients: 'Antibiotics, decongestants, eye drops, steam therapy',
        preparationMethod: 'Oral medication with steam therapy and eye care',
        dosage: 'Antibiotics: 10-15mg/kg twice daily, Eye drops: 1-2 drops every 6-8 hours'
      },
      {
        diseaseName: 'Equine Colic',
        symptoms: 'Abdominal pain, restlessness, rolling, decreased appetite, sweating',
        causes: 'Dietary changes, parasites, stress, intestinal blockage',
        treatmentName: 'Colic Relief Protocol',
        ingredients: 'Pain medication, muscle relaxants, IV fluids, mineral oil',
        preparationMethod: 'Immediate pain relief followed by fluid therapy and monitoring',
        dosage: 'Pain meds: 0.5-1mg/kg every 4-6 hours, IV fluids: 10-20L over 24 hours'
      },
      {
        diseaseName: 'Bovine Mastitis',
        symptoms: 'Swollen udder, abnormal milk, fever, decreased milk production',
        causes: 'Bacterial infection, poor milking hygiene, stress',
        treatmentName: 'Mastitis Antibiotic Therapy',
        ingredients: 'Intramammary antibiotics, anti-inflammatory drugs, udder cream',
        preparationMethod: 'Intramammary infusion after proper udder cleaning',
        dosage: 'Antibiotic: 1 tube per quarter every 12-24 hours for 3-5 days'
      },
      {
        diseaseName: 'Avian Psittacosis',
        symptoms: 'Respiratory distress, lethargy, weight loss, eye discharge',
        causes: 'Bacterial infection, stress, poor nutrition',
        treatmentName: 'Psittacosis Antibiotic Treatment',
        ingredients: 'Tetracycline antibiotics, vitamin supplements, supportive care',
        preparationMethod: 'Oral antibiotic administration with nutritional support',
        dosage: 'Tetracycline: 50-100mg/kg daily for 21-45 days'
      }
    ];

    const result = await Disease.insertMany(sampleDiseases);
    
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
      } else {
        // Already English collection
        targetCollection = collection;
      }
    } else {
      // For other languages, add language suffix
      if (collection.endsWith('Hindi') || collection.endsWith('Tamil')) {
        // Replace existing language suffix
        targetCollection = collection.replace(/Hindi|Tamil$/, '') + targetSuffix;
      } else {
        // Add language suffix to English collection
        targetCollection = collection + targetSuffix;
      }
    }
    
    console.log(`Looking for disease in collection: ${targetCollection}`);
    
    // Try to find the disease in the target language collection
    let disease = null;
    
    // Handle different collection types
    if (targetCollection === 'cowAndBuffalo' || targetCollection === 'cowAndBuffaloTamil') {
      // Use Mongoose models for these collections
      const Model = targetCollection === 'cowAndBuffalo' ? CowBuffaloDisease : CowBuffaloTamilDisease;
      disease = await Model.findById(id);
    } else if (targetCollection.includes('Hindi') || targetCollection.includes('Tamil')) {
      // Use raw MongoDB driver for Hindi/Tamil collections
      const rawDisease = await mongoose.connection.db.collection(targetCollection).findOne({ _id: id });
      if (rawDisease) {
        disease = rawDisease;
      }
    } else {
      // For other collections, try to find by ID
      const rawDisease = await mongoose.connection.db.collection(targetCollection).findOne({ _id: id });
      if (rawDisease) {
        disease = rawDisease;
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
  console.log(`Server is running on port ${PORT}`);
  console.log(`Database: Diseases`);
  console.log(`Collection: cowAndBuffalo`);
  console.log(`Chatbot service: ${chatbotService.isAvailable ? 'Available' : 'Not configured'}`);
});
