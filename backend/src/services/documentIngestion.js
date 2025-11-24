import fs from "fs/promises";
import path from "path";
import mammoth from "mammoth";
import {PDFParse} from "pdf-parse";
import { v4 as uuid } from "uuid";
import qdrantClient from "../lib/qdrantClient.js";
import { createCollectionIfNotExists } from "../utils/qdrantSetup.js";
import { embedTexts } from "../lib/ollamaEmbeddings.js"; // returns arrays of vectors

const COLLECTION = process.env.QDRANT_COLLECTION;

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = await fs.readFile(filePath);

  if (ext === ".pdf") {
    const uint8Array = new Uint8Array(buffer); 
    const parser = new PDFParse(uint8Array); 
    const data = await parser.getText(); 
    console.log("[PDF Extraction] Raw text:", data.text?.slice(0, 500)); // show first 500 chars return data.text;
    return data.text;
}

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error("Unsupported file type: " + ext);
}

function chunkText(text, chunkSize = 800) {
  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
  const chunks = [];
  let current = "";

  for (const p of paragraphs) {
    if ((current + "\n" + p).length > chunkSize) {
      chunks.push(current.trim());
      current = p;
    } else {
      current += "\n" + p;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

export async function processAndIndexDocument({ filePath, title, type }) {
  const docId = uuid();
  await createCollectionIfNotExists(COLLECTION);

  const text = await extractText(filePath);
  let chunks = text
    .split(/\n+/)
    .map(t => t.trim())
    .filter(t => t.length > 30); // remove small bad chunks

  console.log(`[Ingestion] total chunks: ${chunks.length}`);

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedTexts([chunks[i]]); // returns array of vectors

    if (!embedding || !Array.isArray(embedding[0])) {
      console.warn("⚠ Skipping: no embedding produced for chunk", i);
      continue;
    }

    await qdrantClient.upsert(COLLECTION, {
      wait: true,
      points: [
        {
          id: docId,
          vector: embedding[0],
          payload: {
            docId,
            title,
            type,
            chunkIndex: i,
            text: chunks[i],
          },
        },
      ],
    });

    console.log(`Indexed chunk ${i + 1}/${chunks.length}`);
  }

  console.log(`🎯 Document indexed successfully: ${docId}`);
}
