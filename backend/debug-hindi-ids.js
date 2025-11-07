const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = 'mongodb+srv://harishjwork5:0511@iks.1bnw6oy.mongodb.net/Diseases?retryWrites=true&w=majority&appName=IKS';

const diseaseSchema = new mongoose.Schema({
  "Disease Name": { type: String, required: false },
  "Disease name": { type: String, required: false },
  "Symptoms": { type: String, required: true },
  "Causes": { type: String, required: true },
  "Treatment Name": { type: String, required: true },
  "Ingredients": { type: String, required: true },
  "Preparation Method": { type: String, required: true },
  "Dosage": { type: String, required: true }
});

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  const SheepGoatHindiDisease = mongoose.model('SheepGoatHindiDisease', diseaseSchema, 'SheepGoatHindi');
  
  try {
    const diseases = await SheepGoatHindiDisease.find({}).limit(3);
    console.log(`Found ${diseases.length} diseases in SheepGoatHindi collection`);
    
    diseases.forEach((disease, index) => {
      console.log(`${index + 1}. Disease: ${disease["Disease Name"]}`);
      console.log(`   _id: ${disease._id}`);
      console.log(`   _id type: ${typeof disease._id}`);
      console.log(`   _id toString(): ${disease._id ? disease._id.toString() : 'undefined'}`);
      console.log(`   Has _id: ${!!disease._id}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Connection error:', err.message);
  process.exit(1);
});
