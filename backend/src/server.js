import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (from backend/.env or root .env)
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import citizenRoutes from "./routes/citizenRoutes.js";
import advocateRoutes from "./routes/advocateRoutes.js";
import copilotRoutes from "./routes/copilotRoutes.js";
import csRoutes from "./routes/csRoutes.js";
import caRoutes from "./routes/caRoutes.js";
import challanDscRoutes from "./routes/challanDscRoutes.js";
import boardDossierRoutes from "./routes/boardDossierRoutes.js";
import dueDiligenceRoutes from "./routes/dueDiligenceRoutes.js";
import { initWebSocketServer } from "./socket.js";

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = [
        process.env.CLIENT_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://wakheel-application.vercel.app",
      ].filter(Boolean);

      if (allowed.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Wakheel Backend API",
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/citizen", citizenRoutes);
app.use("/api/advocate", advocateRoutes);
app.use("/api/copilot", copilotRoutes);
app.use("/api/cs", csRoutes);
app.use("/api/ca", caRoutes);
app.use("/api/dsc-challan", challanDscRoutes);
app.use("/api/board-dossier", boardDossierRoutes);
app.use("/api/due-diligence", dueDiligenceRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initWebSocketServer(server);

server.listen(PORT, () => {
  console.log(`🚀 Wakheel Server running on http://localhost:${PORT}`);
});
