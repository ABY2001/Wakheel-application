import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { seedMongoIfEmpty } from "../utils/seedMongo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

let isMongoConnected = false;

export const connectDB = async () => {
  try {
    // Disable command buffering so queries don't hang if MongoDB is momentarily offline
    mongoose.set("bufferCommands", false);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);

    // Auto-seed collections if empty
    await seedMongoIfEmpty();
  } catch (error) {
    isMongoConnected = false;
    console.warn(`⚠️ MongoDB connection unavailable (${error.message}).`);
    console.log(`💡 Local Storage Fallback active: Login & all features will work smoothly without crashing!`);
    console.log(`ℹ️ To connect real MongoDB: ensure your current IP address is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0).`);
  }
};

export const getIsMongoConnected = () => {
  return isMongoConnected && mongoose.connection.readyState === 1;
};
