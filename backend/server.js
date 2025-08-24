const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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
  "Disease Name": { type: String, required: true },
  "Symptoms": { type: String, required: true },
  "Causes": { type: String, required: true },
  "Treatment Name": { type: String, required: true },
  "Ingredients": { type: String, required: true },
  "Preparation Method": { type: String, required: true },
  "Dosage": { type: String, required: true }
});

// Create models for different collections
const CowBuffaloDisease = mongoose.model('CowBuffaloDisease', diseaseSchema, 'cowAndBuffalo');
const PoultryBirdsDisease = mongoose.model('PoultryBirdsDisease', diseaseSchema, 'PoultryBirds');
const PoultryBirdsTamilDisease = mongoose.model('PoultryBirdsTamilDisease', diseaseSchema, 'PoultryBirdsTamil');
const SheepGoatDisease = mongoose.model('SheepGoatDisease', diseaseSchema, 'SheepGoat');

// Routes

// Search diseases by name or symptoms with collection filter
app.get('/api/search', async (req, res) => {
  try {
    const { query, collection } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }

    const searchRegex = new RegExp(query, 'i');
    let DiseaseModel = CowBuffaloDisease; // default
    
    // Select the appropriate model based on collection
    switch(collection) {
      case 'cowAndBuffalo':
        DiseaseModel = CowBuffaloDisease;
        break;
      case 'PoultryBirds':
        DiseaseModel = PoultryBirdsDisease;
        break;
      case 'PoultryBirdsTamil':
        DiseaseModel = PoultryBirdsTamilDisease;
        break;
      case 'SheepGoat':
        DiseaseModel = SheepGoatDisease;
        break;
      default:
        DiseaseModel = CowBuffaloDisease;
    }
    
    const diseases = await DiseaseModel.find({
      $or: [
        { "Disease Name": searchRegex },
        { "Symptoms": searchRegex }
      ]
    });
    
    // Map the results to include only the needed fields
    const mappedDiseases = diseases.map(disease => ({
      _id: disease._id,
      "Disease Name": disease["Disease Name"],
      "Symptoms": disease["Symptoms"],
      collection: collection || 'cowAndBuffalo'
    }));

    console.log(`Search results for "${query}" in ${collection}:`, mappedDiseases.length);
    res.json(mappedDiseases);
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
    
    // Select the appropriate model based on collection
    switch(collection) {
      case 'cowAndBuffalo':
        DiseaseModel = CowBuffaloDisease;
        break;
      case 'PoultryBirds':
        DiseaseModel = PoultryBirdsDisease;
        break;
      case 'PoultryBirdsTamil':
        DiseaseModel = PoultryBirdsTamilDisease;
        break;
      case 'SheepGoat':
        DiseaseModel = SheepGoatDisease;
        break;
      default:
        DiseaseModel = CowBuffaloDisease;
    }
    
    const disease = await DiseaseModel.findById(id);
    
    if (!disease) {
      return res.status(404).json({ message: 'Disease not found' });
    }

    res.json(disease);
  } catch (error) {
    console.error('Get disease error:', error);
    res.status(500).json({ message: 'Internal server error' });
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
      case 'PoultryBirds':
        DiseaseModel = PoultryBirdsDisease;
        break;
      case 'PoultryBirdsTamil':
        DiseaseModel = PoultryBirdsTamilDisease;
        break;
      case 'SheepGoat':
        DiseaseModel = SheepGoatDisease;
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
    const poultryCount = await PoultryBirdsDisease.countDocuments();
    const poultryTamilCount = await PoultryBirdsTamilDisease.countDocuments();
    const sheepGoatCount = await SheepGoatDisease.countDocuments();
    
    const totalCount = cowBuffaloCount + poultryCount + poultryTamilCount + sheepGoatCount;
    
    res.json({
      message: 'Database connection successful',
      collections: {
        cowAndBuffalo: cowBuffaloCount,
        PoultryBirds: poultryCount,
        PoultryBirdsTamil: poultryTamilCount,
        SheepGoat: sheepGoatCount
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Database: Diseases`);
  console.log(`Collection: cowAndBuffalo`);
});
