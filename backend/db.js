const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MongoURI = process.env.MONGO_URI;

const ConnectToMongo = async () => {
    try {
        await mongoose.connect(MongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ Connected to MongoDB Successfully");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error);
    }
};

module.exports = ConnectToMongo;
