const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);

    throw error;
  }
};

module.exports = connectDB;