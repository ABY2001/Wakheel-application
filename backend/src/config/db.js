import mongoose from "mongoose";

let isMongoConnected = false;

export const connectDB = async () => {
  try {
    // Disable command buffering so queries don't hang for 10 seconds if MongoDB is offline
    mongoose.set("bufferCommands", false);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2000, // Quick 2s check
    });
    isMongoConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`⚠️ MongoDB connection unavailable (${error.message}).`);
    console.log(`💡 Local Dev Storage active: Login & Register will work smoothly without crashing!`);
    console.log(`ℹ️ To connect real MongoDB: paste your MongoDB Atlas URI into backend/.env under MONGO_URI`);
  }
};

export const getIsMongoConnected = () => {
  return isMongoConnected && mongoose.connection.readyState === 1;
};
