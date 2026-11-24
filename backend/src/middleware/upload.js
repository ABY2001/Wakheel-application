import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_UPLOAD_DIR = path.resolve(__dirname, "../../uploads");

// Ensure upload subdirectories exist
const getCategoryDir = (category = "general") => {
  const allowed = ["documents", "audio", "exhibits", "books", "general"];
  const sub = allowed.includes(category) ? category : "general";
  const targetDir = path.join(ROOT_UPLOAD_DIR, sub);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  return targetDir;
};

// Storage configuration with category routing and unique filename generation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = (req.body?.category || req.query?.category || "general").toLowerCase();
    const dest = getCategoryDir(category);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Sanitize extension
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const filename = `${safeBase}_${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

// Allowed MIME types across legal document, audio recording, and exhibit categories
const ALLOWED_MIME_TYPES = new Set([
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/html",
  "text/markdown",
  // Audio
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp3",
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/aac",
  // Images / Exhibits
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    // Check extension fallback in case client sends generic application/octet-stream
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = [
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
      ".html",
      ".wav",
      ".mp3",
      ".webm",
      ".ogg",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
    ];
    if (allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Unsupported file type (${file.mimetype}). Allowed types: PDF, Word, Plain text, WAV/MP3 Audio, PNG/JPG Images.`
        ),
        false
      );
    }
  }
};

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max per file
  },
}).single("file");

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 10, // Max 10 files per batch
  },
}).array("files", 10);

export const uploadFields = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
}).fields([
  { name: "document", maxCount: 1 },
  { name: "attachment", maxCount: 5 },
  { name: "audio", maxCount: 1 },
  { name: "exhibit", maxCount: 10 },
]);

export { ROOT_UPLOAD_DIR };
