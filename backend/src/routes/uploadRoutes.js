import express from "express";
import { uploadSingle, uploadMultiple } from "../middleware/upload.js";
import {
  uploadSingleFile,
  uploadMultipleFiles,
  uploadBase64,
  deleteFile,
} from "../controllers/uploadController.js";

const router = express.Router();

// 1. Single file upload (multipart/form-data with field name 'file')
router.post("/single", uploadSingle, uploadSingleFile);

// 2. Multiple files batch upload (multipart/form-data with field name 'files')
router.post("/multiple", uploadMultiple, uploadMultipleFiles);

// 3. Base64 encoded payload upload (useful for client synthesized WAVs / HTML exports)
router.post("/base64", uploadBase64);

// 4. Delete an uploaded file
router.delete("/:category/:filename", deleteFile);

export default router;
