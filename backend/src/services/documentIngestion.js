import fs from "fs/promises";
import path from "path";
import { PDFParse } from 'pdf-parse';
import mammoth from "mammoth";
import qdrantClient from "../lib/qdrantClient.js";
import { voyage } from "../lib/voyageClient.js";
import { v4 as uuid } from "uuid";
import { createCollectionIfNotExists } from "../utils/qdrantSetup.js";

const COLLECTION = process.env.QDRANT_COLLECTION;

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const fileBuffer = await fs.readFile(filePath);

  if (ext === ".pdf") {
    const uint8Array = new Uint8Array(fileBuffer);
    const parser = new PDFParse(uint8Array);
    const data = await parser.getText();
    return data.text;
  } else if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value;
  } else {
    throw new Error("Unsupported file type: " + ext);
  }
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

export async function processAndIndexDocument({ documentId, filePath, title, type }) {
await createCollectionIfNotExists(COLLECTION);  
const text = await extractText(filePath);
  let chunks = chunkText(text);

// Clean and filter
chunks = chunks
  .map(c => c.replace(/\s+/g, " ").trim()) // normalize whitespace
  .filter(c => c.length >= 30 && /\w/.test(c)); // valid text only

    const embedResp = await voyage.embed({
    input: chunks,                // array of chunk strings
    model: "voyage-code-2",       // embedding model
    });
    const rawVectors = embedResp.data;
const vectors = rawVectors.map(v => Array.from(v)).filter(v => v.length === 1024);
if (!vectors.length) {
  throw new Error("No meaningful text found to index. The document may be scanned or empty.");
}

    console.log("Embedding result shape:", vectors.length, vectors[0]?.length);


  let points = [];

for (let i = 0; i < vectors.length; i++) {
  points.push({
    id: uuid(),
    vector: vectors[i],
    payload: {
      documentId,
      title,
      type,
      chunkIndex: i,
      text: chunks[i],
    },
  });
}



  await qdrantClient.upsert(COLLECTION, { wait: true, points });
  console.log("Indexed:", documentId, "chunks:", chunks.length);
}
