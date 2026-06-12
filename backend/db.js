const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const ConnectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
  }
};

module.exports = ConnectToMongo;
