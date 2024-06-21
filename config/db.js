const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const DB = process.env.MONGO_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(DB, {
      useUnifiedTopology: true,
    });
    console.log("MongoDB connection successful");
  } catch (err) {
    console.log("MongoDB connection failed", err);
  }
};

module.exports = connectDB;
