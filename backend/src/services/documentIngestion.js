import fs from "fs/promises";
import path from "path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { v4 as uuid } from "uuid";
import ollama from "ollama";

import qdrantClient from "../lib/qdrantClient.js";
import { createCollectionIfNotExists } from "../utils/qdrantSetup.js";
import { embedTexts } from "../lib/ollamaEmbeddings.js";

const COLLECTION = process.env.QDRANT_COLLECTION || "college_docs";

export async function convertFileToRawTextWithOllama(filePath) {
  const buffer = await fs.readFile(filePath);
  const base64 = buffer.toString("base64");

  const prompt = `
Convert this document into clean raw text that can be fed into a vector database.
RULES:
- Do NOT summarize
- Do NOT remove information
- Do NOT add information
- Preserve order
- Preserve tables (row by row)
- No JSON, no markdown, no bullets

<document_base64>
${base64}
</document_base64>

Decode the Base64 and return 100% raw text only.
`;

  const response = await ollama.chat({
    model: "llama3",
    messages: [
      { role: "system", content: "You convert files to raw text." },
      { role: "user", content: prompt }
    ]
  });

  return response.message.content;
}

async function extractText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = await fs.readFile(filePath);

  if (ext === ".pdf") {
    const uint8Array = new Uint8Array(buffer);
    const parser = new PDFParse(uint8Array);
    const data = await parser.getText();
    console.log("[PDF Extraction] Raw text:", data.text);
    return data.text;
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  throw new Error("Unsupported file type: " + ext);
}

function detectCategory(title = "", text = "") {
  const t = (title || "").toLowerCase();
  const s = (text.slice(0, 2000) || "").toLowerCase();

  if (t.includes("timetable") || t.includes("time table") || /exam schedule|exam timetable/.test(s)) {
    return "timetable";
  }
  if (/notice|circular|hereby informed|office order/.test(t) || /notice|hereby informed|principal/.test(s)) {
    return "notice";
  }
  if (/syllabus|course outcome|unit 1|unit i/.test(t) || /syllabus|unit\-?1|unit i/.test(s)) {
    return "syllabus";
  }
  return "generic";
}

const SUBJECT_CODE_REGEX = /\b[A-Z]{2,}\d{3,}[A-Z0-9-]*\b/;
const DATE_REGEX = /\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{1,2}\s+\w+\s+\d{4})\b/i;
const TIME_REGEX = /\b(\d{1,2}[:.]\d{2}\s*(AM|PM)?|FN|AN)\b/i;

function chunkTimetableText(text) {
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const chunks = [];
  let buffer = "";

  for (const line of lines) {
    const hasSubject = SUBJECT_CODE_REGEX.test(line);
    const hasDateOrTime = DATE_REGEX.test(line) || TIME_REGEX.test(line);

    if (hasSubject) {
      if (buffer.trim()) chunks.push(buffer.trim());
      buffer = line;
    } else if (hasDateOrTime) {
      buffer += " " + line;
    } else {
      if (line.length < 80) buffer += " " + line;
      else {
        if (buffer.trim()) {
          chunks.push(buffer.trim());
          buffer = "";
        }
        chunks.push(line);
      }
    }
  }
  if (buffer.trim()) chunks.push(buffer.trim());
  return chunks;
}

function chunkGenericText(text, chunkSize = 800) {
  const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(Boolean);
  const chunks = [];
  let current = "";

  for (const p of paragraphs) {
    if ((current + " " + p).length > chunkSize) {
      if (current.trim()) chunks.push(current.trim());
      current = p;
    } else current += " " + p;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function chunkTextByCategory(category, text) {
  if (category === "timetable") return chunkTimetableText(text);
  return chunkGenericText(text, category === "notice" ? 600 : 800);
}

export async function processAndIndexDocument({ filePath, title, type }) {
  const docId = uuid();
  await createCollectionIfNotExists(COLLECTION);

  const rawText = await convertFileToRawTextWithOllama(filePath);
  if (!rawText || rawText.trim().length < 30) {
    throw new Error("Extracted text too short.");
  }

  const category = detectCategory(title, rawText);
  console.log(`[Ingestion] docId=${docId}, category=${category}`);

  let chunks = chunkTextByCategory(category, rawText);

  chunks = chunks
    .map(t => t.replace(/[^\w\s.,:/\-()\[\]]/g, "").replace(/\s+/g, " ").trim())
    .filter(t => t.length > 30);

  console.log(`[Ingestion] total cleaned chunks: ${chunks.length}`);

  if (chunks.length === 0) throw new Error("No valid chunks.");

  const vectors = await embedTexts(chunks);
  if (!vectors || vectors.length !== chunks.length) throw new Error("Embedding mismatch.");

  const points = chunks.map((chunk, i) => ({
    id: uuid(),
    vector: vectors[i],
    payload: {
      docId,
      title,
      type,
      category,
      chunkIndex: i,
      text: chunk
    }
  }));

  await qdrantClient.upsert(COLLECTION, { wait: true, points });

  console.log(`🎯 Document indexed successfully: ${docId} (chunks=${chunks.length})`);
}
