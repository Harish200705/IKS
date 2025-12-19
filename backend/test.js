const mongoose = require('mongoose');

const uri = 'mongodb+srv://harishjwork5:0511@iks.1bnw6oy.mongodb.net/Diseases?retryWrites=true&w=majority&appName=IKS';
const opts = { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 10000 };

async function start() {
  try {
    await mongoose.connect(uri, opts);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}
start();
