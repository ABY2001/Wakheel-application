import path from "path";
import fs from "fs";
import { ROOT_UPLOAD_DIR } from "../middleware/upload.js";

// Helper to format bytes into readable KB/MB
const formatBytes = (bytes = 0) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getRelativeUrl = (category, filename) => {
  return `/uploads/${category}/${filename}`;
};

/**
 * Handle single file upload
 * POST /api/upload/single
 */
export const uploadSingleFile = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file was provided for upload.",
      });
    }

    const file = req.file;
    const category = (req.body?.category || req.query?.category || "general").toLowerCase();
    const relativeUrl = getRelativeUrl(category, file.filename);

    const host = req.get("host") || "localhost:5001";
    const protocol = req.protocol || "http";
    const fullUrl = `${protocol}://${host}${relativeUrl}`;

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      file: {
        id: `file_${Date.now()}`,
        originalName: file.originalname,
        storedName: file.filename,
        category,
        mimetype: file.mimetype,
        sizeBytes: file.size,
        sizeFormatted: formatBytes(file.size),
        relativeUrl,
        fileUrl: fullUrl,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("uploadSingleFile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Handle batch file upload (up to 10 files)
 * POST /api/upload/multiple
 */
export const uploadMultipleFiles = (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files were provided for upload.",
      });
    }

    const category = (req.body?.category || req.query?.category || "general").toLowerCase();
    const host = req.get("host") || "localhost:5001";
    const protocol = req.protocol || "http";

    const files = req.files.map((file, idx) => {
      const relativeUrl = getRelativeUrl(category, file.filename);
      const fullUrl = `${protocol}://${host}${relativeUrl}`;
      return {
        id: `file_${Date.now()}_${idx}`,
        originalName: file.originalname,
        storedName: file.filename,
        category,
        mimetype: file.mimetype,
        sizeBytes: file.size,
        sizeFormatted: formatBytes(file.size),
        relativeUrl,
        fileUrl: fullUrl,
        uploadedAt: new Date().toISOString(),
      };
    });

    res.status(201).json({
      success: true,
      message: `Uploaded ${files.length} files successfully`,
      count: files.length,
      files,
    });
  } catch (error) {
    console.error("uploadMultipleFiles error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Handle Base64 Data-URI upload (useful for client recordings / synthesized WAV / HTML exports)
 * POST /api/upload/base64
 */
export const uploadBase64 = (req, res) => {
  try {
    const { base64Data, filename = "file.bin", category = "general" } = req.body;

    if (!base64Data) {
      return res.status(400).json({
        success: false,
        message: "base64Data is required.",
      });
    }

    // Strip data URI prefix if present (e.g. data:audio/wav;base64,....)
    const matches = base64Data.match(/^data:([A-Za-z-+/0-9.]+);base64,(.+)$/);
    const mime = matches ? matches[1] : "application/octet-stream";
    const cleanBase64 = matches ? matches[2] : base64Data;

    const buffer = Buffer.from(cleanBase64, "base64");
    const ext = path.extname(filename) || (mime.includes("wav") ? ".wav" : mime.includes("pdf") ? ".pdf" : ".bin");
    const safeBase = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 35);
    const uniqueName = `${safeBase}_${Date.now()}${ext}`;

    const subDir = path.join(ROOT_UPLOAD_DIR, category.toLowerCase());
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }

    const fullDiskPath = path.join(subDir, uniqueName);
    fs.writeFileSync(fullDiskPath, buffer);

    const relativeUrl = `/uploads/${category.toLowerCase()}/${uniqueName}`;
    const host = req.get("host") || "localhost:5001";
    const protocol = req.protocol || "http";
    const fullUrl = `${protocol}://${host}${relativeUrl}`;

    res.status(201).json({
      success: true,
      message: "Base64 content stored successfully",
      file: {
        id: `file_${Date.now()}`,
        originalName: filename,
        storedName: uniqueName,
        category: category.toLowerCase(),
        mimetype: mime,
        sizeBytes: buffer.length,
        sizeFormatted: formatBytes(buffer.length),
        relativeUrl,
        fileUrl: fullUrl,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("uploadBase64 error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete an uploaded file
 * DELETE /api/upload/:category/:filename
 */
export const deleteFile = (req, res) => {
  try {
    const { category, filename } = req.params;
    const targetPath = path.join(ROOT_UPLOAD_DIR, category.toLowerCase(), filename);

    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      return res.json({ success: true, message: "File removed from storage" });
    } else {
      return res.status(404).json({ success: false, message: "File not found" });
    }
  } catch (error) {
    console.error("deleteFile error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
