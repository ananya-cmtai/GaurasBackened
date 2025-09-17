// lib/db.js or utils/db.js
const mongoose = require('mongoose');

let isConnected = false; // Global flag

const connectDB = async () => {
  if (isConnected) {
    // Use existing connection
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
};

module.exports = connectDB;
