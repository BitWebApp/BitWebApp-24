// src/routes/chat.js

import express from "express";
import qdrantClient from "../lib/qdrantClient.js";
import { embedTexts } from "../lib/ollamaEmbeddings.js";

const router = express.Router();
const COLLECTION = process.env.QDRANT_COLLECTION || "college_docs";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";

/* ------------------ Helpers: classify & parse ------------------ */

function classifyQuestion(question) {
  const q = question.toLowerCase();

  if (/exam|paper|timetable|time table|slot|midsem|endsem|semester exam|date sheet/.test(q)) {
    return "timetable";
  }
  if (/notice|circular|deadline|last date|due date|form|submission|fees?|fine/.test(q)) {
    return "notice";
  }
  if (/syllabus|unit|module|chapter|course outcome|topics|what is in unit/.test(q)) {
    return "syllabus";
  }
  return "generic";
}

// extract subject codes & hints like "7th sem", "EEE"
function extractMetaFromQuestion(question) {
  const subjectCodes = [...question.matchAll(/\b[A-Z]{2,}\d{3,}[A-Z0-9-]*\b/g)].map(m => m[0]);
  const branch = (question.match(/\b[cse|cs|it|ece|eee|mech|me|ce|civil|ee]\b/i) || [null])[0];
  const semMatch = question.match(/(\b[1-8](st|nd|rd|th)\s+sem(ester)?\b|\bsem\s*[1-8]\b)/i);
  const sem = semMatch ? semMatch[0] : null;
  return { subjectCodes, branch, sem };
}

// timetable line parser: tries to extract subject, date, weekday, etc.
const DATE_REGEX = /\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{1,2}\s+\w+\s+\d{4})\b/i;
const WEEKDAY_REGEX = /\b(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\b/i;
const TIME_REGEX = /\b(\d{1,2}[:.]\d{2}\s*(AM|PM)?|FN|AN)\b/i;
const SUBJECT_CODE_REGEX = /\b[A-Z]{2,}\d{3,}[A-Z0-9-]*\b/;

function parseTimetableLine(text) {
  const subjectCodeMatch = text.match(SUBJECT_CODE_REGEX);
  if (!subjectCodeMatch) return null;

  const subjectCode = subjectCodeMatch[0];
  // assume name is between code and date
  let namePart = text.replace(subjectCode, "");
  const dateMatch = text.match(DATE_REGEX);
  if (dateMatch) {
    const idx = namePart.indexOf(dateMatch[0]);
    if (idx !== -1) namePart = namePart.slice(0, idx);
  }
  const subjectName = namePart.replace(/\s+/g, " ").trim();

  const date = dateMatch ? dateMatch[0] : null;
  const weekdayMatch = text.match(WEEKDAY_REGEX);
  const weekday = weekdayMatch ? weekdayMatch[0] : null;
  const timeMatch = text.match(TIME_REGEX);
  const time = timeMatch ? timeMatch[0] : null;

  const hasXXXX = /X{3,}/i.test(text);

  return {
    raw: text,
    subjectCode,
    subjectName,
    date,
    weekday,
    time,
    hasPartial: hasXXXX,
  };
}

function buildTimetableAnswer(question, entries) {
  if (!entries.length) {
    return "Not found in the documents.";
  }

  const { subjectCodes } = extractMetaFromQuestion(question);

  // if user asked for specific subject(s), filter by those codes
  let filtered = entries;
  if (subjectCodes.length) {
    filtered = entries.filter(e => subjectCodes.includes(e.subjectCode));
    if (!filtered.length) filtered = entries; // fallback to all
  }

  // deduplicate by subject+date
  const uniq = [];
  const seen = new Set();
  for (const e of filtered) {
    const key = `${e.subjectCode}-${e.date || "nodate"}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniq.push(e);
    }
  }

  if (uniq.length === 1) {
    const e = uniq[0];
    let line = `Exam for ${e.subjectCode}`;
    if (e.subjectName) line += ` – ${e.subjectName}`;
    if (e.date) line += ` is on ${e.date}`;
    if (e.weekday) line += ` (${e.weekday})`;
    if (!e.date && !e.weekday) line += " is present in the timetable, but date is not readable.";

    if (!e.time) {
      line += `. Time is not clearly provided in the document.`;
    } else {
      line += `. Time: ${e.time}.`;
    }
    return line;
  }

  // multiple subjects / full branch style
  let answer = "Here are the exams I found:\n\n";
  for (const e of uniq) {
    answer += `• ${e.subjectCode}`;
    if (e.subjectName) answer += ` – ${e.subjectName}`;
    if (e.date) answer += ` → ${e.date}`;
    if (e.weekday) answer += ` (${e.weekday})`;
    if (!e.time) answer += ` – time not clearly given`;
    else answer += ` – time: ${e.time}`;
    answer += "\n";
  }
  return answer.trim();
}

/* ------------------ Main Chat Route ------------------ */

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Question is required" });
    }

    const qType = classifyQuestion(question);
    const meta = extractMetaFromQuestion(question);
    console.log(`[Chat] qType=${qType}, meta=`, meta, `q="${question}"`);

    // 1️⃣ Embed question
    const qEmbeds = await embedTexts([question]);
    const queryVector = qEmbeds[0];

    if (!queryVector) {
      return res.status(500).json({ error: "Failed to generate embedding for question." });
    }

    // 2️⃣ Filter by category
    const filter =
      qType === "generic"
        ? undefined
        : {
            must: [{ key: "category", match: { value: qType } }],
          };

    const searchParams = {
      vector: queryVector,
      limit: 12,
      with_payload: true,
    };
    if (filter) searchParams.filter = filter;

    let results = await qdrantClient.search(COLLECTION, searchParams);

    console.log(
      "[Chat] qdrant results count (initial):",
      results.length,
      "ids:",
      results.map(r => r.id)
    );

    // If we applied a category filter (e.g. syllabus/notice/timetable) and got no results,
    // retry without the filter as a fallback. This helps when documents weren't auto-labeled
    // as the expected category during ingestion but still contain the requested content.
    if (!results.length && filter) {
      try {
        console.log("[Chat] filtered search returned 0 results, retrying without category filter...");
        const fallbackParams = { ...searchParams };
        delete fallbackParams.filter;
        const fallback = await qdrantClient.search(COLLECTION, fallbackParams);
        results = fallback || [];
        console.log("[Chat] fallback (unfiltered) results count:", results.length);
      } catch (e) {
        console.error("[Chat] fallback unfiltered search failed:", e);
      }
    }

    if (!results.length) {
      return res.json({
        answer: "Not found in the documents.",
        sources: [],
      });
    }

    // Score threshold
    const SCORE_THRESHOLD = 0.25;
    let hits = results.filter(r => r.score === undefined || r.score >= SCORE_THRESHOLD);
    if (!hits.length) hits = [results[0]];

    /* ---------- Special handling for timetable questions ---------- */
    if (qType === "timetable") {
      const allLines = hits
        .map(h => (h.payload && h.payload.text ? h.payload.text : ""))
        .join("\n")
        .split(/\n+/)
        .map(l => l.trim())
        .filter(Boolean);

      const parsedEntries = allLines
        .map(parseTimetableLine)
        .filter(Boolean);

      const answer = buildTimetableAnswer(question, parsedEntries);

      return res.json({
        answer,
        sources: hits.map(h => ({
          id: h.id,
          score: h.score,
          category: h.payload?.category,
          title: h.payload?.title,
          chunkIndex: h.payload?.chunkIndex,
          text: h.payload?.text,
        })),
      });
    }

    /* ---------- For notice & syllabus, build better prompt ---------- */

    const context = hits
      .map(h => (h.payload && h.payload.text ? h.payload.text : ""))
      .filter(Boolean)
      .join("\n\n---\n\n");

    let systemPrompt = `
You are a college assistant AI bot for a university.
You answer questions ONLY using the provided context extracted from official documents (notices, timetable, syllabus, circulars, etc).
Never invent dates, rules, marks, or deadlines.
If the answer is not clearly present, say: "Not found in the documents."
`.trim();

    if (qType === "notice") {
      systemPrompt += `
When dealing with notices, pay special attention to phrases like:
"last date", "deadline", "must be submitted by", "schedule", "from - to" etc.
If you find a clear deadline/date in the notice relevant to the question, return it exactly as written.
`;
    }

    if (qType === "syllabus") {
      systemPrompt += `
When dealing with syllabus, structure your answer by units/modules.
If the question is about a specific unit, extract only that unit's topics from context.
If multiple subjects appear, pick the one whose code or name is closest to the question.
`;
    }

    const userPrompt = `
Context from documents:
${context}

Question: ${question}

Answer clearly and concisely.
If the exact information (date, deadline, unit topics, etc.) is not present, reply: "Not found in the documents."
`.trim();

    // 3️⃣ Call Ollama llama3
    const llmRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        stream: false,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!llmRes.ok) {
      const body = await llmRes.text();
      console.error("[Ollama Chat] Error:", llmRes.status, body);
      return res.status(500).json({ error: "LLM call failed" });
    }

    const llmJson = await llmRes.json();
    const answer = llmJson?.message?.content || "Not found in the documents.";

    return res.json({
      answer,
      sources: hits.map(h => ({
        id: h.id,
        score: h.score,
        category: h.payload?.category,
        title: h.payload?.title,
        chunkIndex: h.payload?.chunkIndex,
        text: h.payload?.text,
      })),
    });
  } catch (err) {
    console.error("[Chat] Error:", err);
    res.status(500).json({ error: "Chat failed", details: err.message });
  }
});

export default router;
