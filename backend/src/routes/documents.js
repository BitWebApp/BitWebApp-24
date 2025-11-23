import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { processAndIndexDocument } from "../services/documentIngestion.js";

const router = express.Router();
const uploadDir = path.join(process.cwd(), "backend/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const { title, type, uploadedBy } = req.body;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // You can insert metadata in Mongo if needed
    const documentId = file.filename;

    await processAndIndexDocument({
      documentId,
      filePath: file.path,
      title: title || file.originalname,
      type,
    });

    res.json({ success: true, documentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload/indexing failed" });
  }
});

export default router;
