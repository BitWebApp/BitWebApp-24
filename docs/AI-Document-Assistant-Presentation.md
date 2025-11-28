---
title: AI Document Assistant — Project Presentation
author: Your Name (BTech CSE)
institute: [Your Institute Name]
course: Minor Project — 3 Credits
date: \today
---

# AI Document Assistant

_A smart assistant to query university documents (syllabus, notes, timetables, notices)_

**Presenter:** Your Name — BTech CSE

---

## Talk Outline

1. Motivation & Goals
2. High-level Architecture
3. RAG pipeline (detailed)
4. Component walkthrough
5. Demo flow (upload → Q&A)
6. Performance & optimizations
7. Evaluation, limitations & future work
8. Conclusion & Q/A

Note: Keep each section ~3–6 minutes; total ~20–25 minutes.

---

## Motivation

- Students & faculty struggle to find relevant info across PDFs, slides, and notices.
- Official documents are long, unstructured, and spread across multiple files.
- Goal: Provide accurate, provenance-aware answers quickly.

**Why this project**
- Real utility for an academic environment.
- Good application of modern NLP (embeddings + LLM).
- Fits a compact minor project scope with engineering and research elements.

Note: emphasize practical impact — reduces manual search time and helps new students.

---

## Project Goals & Requirements

- Ingest: PDF/DOCX/PPTX, preserve units/slide boundaries.
- Retrieve: semantic search (vector DB) to find relevant chunks.
- Answer: use LLM but provide provenance (sources) and strict/expand modes.
- UX: simple chat UI for queries and an upload flow.

Success criteria:
- Accurate retrieval for syllabus/notes queries.
- Answers cite source chunks.
- System responds in < 3s for typical queries (goal).

Note: mention that initial implementation targeted local resources (Qdrant + Ollama).

---

## High-Level Architecture

Front-end Chat UI ↔ Backend (Express)

Backend components:
- Document ingestion
- Embedding service
- Qdrant vector store
- RAG orchestration (search, re-rank, prompt)
- LLM (Ollama)

 (Architecture diagram below — include visual in final slides)

 <div style="text-align:center; margin: 10px 0;">
   <img src="./images/architecture.svg" alt="Architecture" width="800"/>
 </div>

Note: I'll walk through each component next.

---

## Document Ingestion (Overview)

Steps:
1. Save uploaded file (multer)
2. Extract text (pdf-parse, mammoth)
3. Optionally use LLM-assisted conversion for messy files
4. Detect category (syllabus/notes/timetable/notice/generic)
5. Chunk text (unit-level, slide-level, generic)
6. Embed chunks & upsert to Qdrant

Note: Explain heuristics for category detection and chunking.


## Chunking Strategies (Details)


Why it matters:

 <div style="text-align:center; margin: 10px 0;">
   <img src="./images/sequence.svg" alt="Sequence" width="780"/>
 </div>

---

## Embeddings & Indexing

- Embeddings via Ollama (nomic-embed-text)
- Each indexed point: { id, vector, payload: { docId, title, category, chunkIndex, text } }
- Qdrant stores vectors and payload; supports fast nearest neighbor search

Note: mention embedding dimension consistency and re-embedding if model changes.

---

## Query-time RAG Flow

1. User asks question → embed the question
2. Semantic search in Qdrant (limit N results)
3. Fallback: retry unfiltered if category filter returns nothing
4. Re-rank by lexical match and score
5. Build prompt (system + context + question)
6. Call LLM → answer
7. Return answer + sources to UI

Note: there is a strict mode (only use docs) and expand mode (can supplement).

---

## Chat Route — Key Heuristics

- classifyQuestion: detect if question refers to timetable/notice/syllabus
- extractMetaFromQuestion: subject codes, semester, branch
- SCORE_THRESHOLD (0.25) used to filter low-confidence results
- Re-rank: small lexical boost for exact term matches
- Context size tuned (4 chunks) to balance latency and quality

Note: show small code snippet or pseudocode on slide if time permits.

---

## Frontend & User Experience

- React-based simple Chat UI (`Chatbot.jsx`)
- Features:
  - Ask question textbox
  - Toggle: Strict vs Expand modes
  - Shows answer and expandable sources list with snippet and score

Note: show screenshots or live demo during presentation.

---

## Demo Flow (Script)

1. Upload `Cloud_Notes.pptx` via upload endpoint
2. Wait for ingestion log: "Document indexed successfully"
3. In chat UI, ask: "What is virtualization?"
4. Switch to "Expand" to allow clarifications
5. Show answer and expand sources to point to Unit/Slide

Note: rehearse the demo; if live demo fails, show recorded screenshots.

---

## Performance Improvements

Implemented:
- Reduced number of chunks sent to LLM (default 4)
- In-memory caches for embeddings and answers (fast repeat queries)
- Tunable request limit to Qdrant (default 30)

Further options:
- Redis cache, streaming responses, faster LLMs, increased ef for Qdrant

Note: show before/after timings if available (e.g., 20–30s → 2–4s typical).

---

## Evaluation & Results

- Functional tests: sample queries for syllabus, timetables, notes
- Qualitative: answers include source citations
- Performance: typical response time after tuning: ~2–5s (depends on local hardware & model)

Limitations:
- No OCR for scanned PDFs yet
- Metadata extraction is heuristic-based; needs improvement for exact filtering

---

## Security & Privacy

- Recommendation: restrict upload and chat endpoints with authentication
- Rate-limiting to prevent abuse
- Keep LLM on-premises (Ollama) to reduce data exfiltration risk
- Encrypt documents at rest for sensitive data

---

## Future Work (Roadmap)

1. Add OCR (Tesseract) for scanned documents
2. Extract structured metadata (course code/title/instructor) at ingestion
3. Persistent caching (Redis) and horizontal scaling
4. Streaming LLM responses and improved UI
5. End-to-end test suite and evaluation metrics

---

## Conclusion

- Built a robust RAG pipeline for academic documents
- Supports multiple doc types, category-aware chunking, and provenance-aware answers
- Ready for further improvements (OCR, metadata, scalability)

---

## References & Files

- Key files: `backend/src/services/documentIngestion.js`, `backend/src/routes/chat.js`, `backend/src/lib/ollamaEmbeddings.js`, `frontend/src/components/Chatbot.jsx`
- Qdrant: https://qdrant.tech
- Ollama: https://ollama.com
- Suggested reading: RAG papers & vector search tutorials

---

# Q & A

Thank you — I'm ready for questions.

Notes:
- Keep backup slides showing code snippets and logs for troubleshooting the demo.
