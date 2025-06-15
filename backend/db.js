const mongoose = require('mongoose');
// const MongoURI = "mongodb://localhost:27017/INoteBook"; 
const MongoURI = "mongodb+srv://CrypNote08:MongoDB%4008@cluster0.y60erxf.mongodb.net/INoteBook";

const ConnectToMongo = async () => {
    try {
        await mongoose.connect(MongoURI);
        console.log("✅ Connected to MongoDB Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error);
    }
};

module.exports = ConnectToMongo;
