const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI,
      {
        dbName: "test",
        connectTimeoutMS: 30000, 
        serverSelectionTimeoutMS: 30000, 
      }
    );
    console.log("MongoDB connected successfully");
  } catch (err) {
    process.exit(1);
  }
};

module.exports = connectDB;