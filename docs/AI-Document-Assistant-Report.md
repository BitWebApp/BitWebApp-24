AI Document Assistant — Project Report
=====================================

Executive summary
-----------------
This project implements an AI-powered document assistant that ingests institutional documents (syllabi, timetables, notices, lecture notes, slide decks) and answers user questions by combining a semantic vector search (Qdrant) with an LLM (Ollama). The pipeline follows a retrieval-augmented generation (RAG) approach: documents are converted to clean text, chunked, embedded, indexed into Qdrant, and then retrieved at query time using vector similarity. The retrieved chunks form the context for an LLM which produces concise, provenance-aware answers. The system supports strict (document-only) and expand (document + supplemental knowledge) modes, re-ranking by lexical match for notes, fallback unfiltered search for mislabeled documents, and category-aware chunking for timetables and syllabi.

This report explains the architecture, each component, data flows, key algorithms, design rationales, operational concerns, and next steps.

1. System overview and goals
----------------------------

Goals
- Answer user questions about institution documents accurately and with provenance.
- Support diverse document types: PDF, DOCX, PPTX.
- Preserve structured info (timetables, unit-wise syllabus, slide bullets).
- Provide an "expand" mode where the assistant may add clarifications while labeling added text.
- Be robust to imperfect ingestion (mis-labeled documents) via fallback searches and re-ranking.

High-level functionality
- Ingest document -> Extract raw text -> Categorize -> Chunk -> Embed -> Index (Qdrant)
- At query time -> Embed question -> Vector search -> Re-rank & filter -> Build prompt -> Call LLM -> Return answer + sources

Key design choices
- Use Qdrant for vector storage and efficient nearest-neighbor search.
- Use Ollama locally (llama3 + nomic-embed-text) for embeddings and generation.
- Chunking strategies tailored by category (timetable, syllabus, notes, generic).
- Minimal, explicit provenance returned to the client.

2. Architecture diagram (textual)
---------------------------------

User Browser (Frontend Chat UI)
  ↕ HTTP JSON
Backend (Express)
  - Routes:
    - /api/v1/documents/upload  (File upload + metadata)
    - /api/v1/aichat             (Chat queries)
  ↕ Internal calls
Services:
  - Document Ingestion Service (src/services/documentIngestion.js)
    - extractText (pdf-parse / mammoth)
    - convertFileToRawTextWithOllama (LLM-based Base64 decode + clean)
    - detectCategory (syllabus/notes/timetable/notice/generic)
    - chunkTextByCategory (category-specific chunking)
    - embedTexts (src/lib/ollamaEmbeddings.js → local Ollama embed API)
    - qdrantClient.upsert()
  - Qdrant vector DB (collection: college_docs)
  - LLM client (Ollama HTTP API)
  - Re-ranker & prompt builder (src/routes/chat.js)
  - Frontend Chat UI (frontend/src/components/Chatbot.jsx)

Sequence (upload -> index)
1. User uploads file via frontend to `/api/v1/documents/upload`.
2. Backend saves to `backend/uploads/` (multer).
3. processAndIndexDocument invoked with file path, title, type.
4. createCollectionIfNotExists(COLLECTION).
5. convertFileToRawTextWithOllama(filePath) or extractText for PDFs/DOCX.
6. detectCategory(title, rawText) → category (syllabus, notes, timetable, notice, generic).
7. chunkTextByCategory(category, rawText) → chunks (unit-level or slide-level where possible).
8. Clean chunks (strip weird characters, shorten).
9. embedTexts(chunks) → vectors via Ollama embeddings API.
10. qdrantClient.upsert(COLLECTION, { points: [...] }) writes { id, vector, payload }.

Sequence (query -> answer)
1. Frontend posts { question, mode } to `/api/v1/aichat`.
2. chat route:
   - classifyQuestion(question) → qType (timetable/notice/syllabus/generic)
   - extractMetaFromQuestion(question): subjectCodes, branch, sem heuristics
   - embedTexts([question]) → queryVector
   - Build Qdrant search params:
     - vector = queryVector
     - limit = REQUEST_LIMIT (e.g., 50)
     - with_payload = true
     - optional filter = category match if qType != 'generic'
   - qdrantClient.search(COLLECTION, searchParams)
   - If no results & filter was used: retry unfiltered (fallback)
   - Filter by SCORE_THRESHOLD (default 0.25) to get high-quality hits
   - Re-rank hits by lexical matching (boost if chunk text contains question tokens)
   - For timetable queries: parse lines, deduplicate entries, build a specialized answer
   - For other queries: build systemPrompt and userPrompt, join top hits as context
   - Call Ollama LLM via /api/chat with messages -> get answer
   - Return { answer, sources: [ {id, score, category, title, chunkIndex, text}, ... ] }

3. Components in detail
-----------------------

3.1 Frontend
- File: `frontend/src/components/Chatbot.jsx`
- Responsibilities:
  - UI for entering questions, toggling expand mode, displaying messages and sources.
  - Posts to `/api/v1/aichat` with { question, mode }.
  - Displays provenance (title, chunkIndex, snippet) in a collapsible details list.
- UX considerations:
  - "Expand" toggle uses mode `expand` to allow the model to supplement context.
  - Sources displayed lets users verify claims.
  - The UI uses axios and matches the rest of the repo's conventions.

3.2 Backend (Express)
- File: `backend/src/app.js`
- Registers many routes, including:
  - Chat routes: `backend/src/routes/chat.js` (main RAG orchestration).
  - Document upload routes: `backend/src/routes/documents.js`.
- Middlewares: `express.json()` with limited body size to avoid large payloads through chat.

3.3 Document ingestion
- File: `backend/src/services/documentIngestion.js`.
- Responsibilities:
  - Accept path/title/type, create docId.
  - Extract text:
    - For PDFs: uses `pdf-parse` to get text.
    - For DOCX: uses `mammoth.extractRawText`.
    - For problematic documents, the system can use `convertFileToRawTextWithOllama` which sends Base64-encoded file to an LLM prompt that decodes it and returns cleaned text (used when parser output is poor).
  - Detect category:
    - Uses heuristics: patterns that detect syllabus (unit headings, COs), timetable (keywords), notices (notice/circular), notes (lecture/pptx).
    - Examines a larger slice of the document (first 5k chars) to improve detection.
  - Chunking:
    - Syllabus: split by "Unit I/Unit 1/UNIT 2" headings where possible to preserve unit-level context.
    - Notes: split by slide-like boundaries (lines starting with "Slide 1", "1.", uppercase SLIDE markers) and use smaller chunk size if slide boundaries not found.
    - Timetable: special chunking that tries to keep subject codes + date/time on same chunk using regexes for subject code, date, time.
    - Generic: chunk by paragraph with default chunk size (e.g., 800 chars).
  - Cleaning:
    - Remove bad unicode, collapse whitespace, ensure a chunk length > 30 characters.
  - Embedding:
    - Calls `embedTexts` in `backend/src/lib/ollamaEmbeddings.js` which uses Ollama's embedding endpoint (`/api/embed`) with model `nomic-embed-text`.
  - Indexing:
    - Prepares points with `id`, `vector`, and `payload` containing docId, title, type, category, chunkIndex, text.
    - Calls `qdrantClient.upsert(COLLECTION, { points })`.

3.4 Qdrant
- Client file: `backend/src/lib/qdrantClient.js` (wraps `@qdrant/js-client-rest`).
- Collection: stored in env var `QDRANT_COLLECTION` or default `college_docs`.
- Payload schema:
  - docId: unique per uploaded document
  - title: original filename or title from upload
  - type: user-provided type (optional)
  - category: detected category (syllabus/notes/timetable/notice/generic)
  - chunkIndex: integer
  - text: the chunk text
- Indexing choices:
  - Use standard vector storage; for large deployments enable HNSW config tuning (ef/ef_construction and M).
- Retrieval:
  - Qdrant returns objects with `id`, `payload`, and `score`.
  - Backend uses `search` with `vector`, `limit`, and optional `filter` to prefer category matches.

3.5 Embeddings (Ollama)
- File: `backend/src/lib/ollamaEmbeddings.js`.
- Calls `http://localhost:11434/api/embed` for `nomic-embed-text` model.
- Embedding size is whatever the embedding model returns; ensure vectors saved into Qdrant have a consistent dimension.

3.6 LLM (Ollama chat)
- The backend makes a chat call to Ollama at `/api/chat` (or `/api/generate` depending on function): `llama3` model for text generation.
- Prompt engineering:
  - `systemPrompt` frames the assistant: in strict mode it must answer only using provided context and say "Not found in the documents." when not present; in expand mode it's allowed to supplement missing conceptual information but must label such additions with "Note (added):".
  - `userPrompt` includes the concatenated context from best hits and the actual user question.

3.7 Chat route logic (RAG orchestration)
- File: `backend/src/routes/chat.js`.
- Steps:
  - classifyQuestion → qType: detect whether user intent is timetable/notice/syllabus/generic.
  - extractMetaFromQuestion → parse subject codes and semester hints to later filter or re-rank.
  - Obtain query embedding and search Qdrant.
  - Fallback: if category filter produced no results, retry the search without filter.
  - Scoring: apply a SCORE_THRESHOLD (0.25) to keep only confident hits; if none remain, take top result as fallback.
  - Re-ranking: added a lexical/text-match boost so chunks that literally contain query tokens (like "virtualization") are preferred — helpful for lecture notes and conceptual questions.
  - Special-case timetable: parse lines into structured entries (subjectCode, date, time) and produce a structured human-readable answer.
  - For other categories: gather top chunks into a context string separated by delimiters and send to LLM.
  - Return `answer` and `sources` (each source contains id, score, title, chunkIndex and text snippet).

4. Data models and sample payloads
---------------------------------

Point indexed into Qdrant (example)
{
  id: "uuid-123",
  vector: [0.0012, -0.234, ...],
  payload: {
    docId: "upload-456",
    title: "Cloud Computing - Syllabus.pdf",
    type: "syllabus",
    category: "syllabus",
    chunkIndex: 2,
    text: "Unit 3: Virtualization ... list of topics..."
  }
}

Search result entry returned to frontend:
{
  id: "uuid-123",
  score: 0.776,
  category: "syllabus",
  title: "Cloud Computing - Syllabus.pdf",
  chunkIndex: 2,
  text: "Unit 3: Virtualization ... excerpt..."
}

5. Algorithms and heuristics
---------------------------

5.1 Category detection
Heuristics scan both the title and the first ~5k characters. Regexes catch "Unit 1 / Unit I", "syllabus", "course outcomes", "lecture notes", "pptx", "timetable", "notice", and other phrases. This hybrid approach balances recall and avoids overreliance on file extensions.

5.2 Chunking strategies
- Syllabus: split at Unit boundaries using regex /(?=^Unit\s+(?:[IVX]+|\d+)\b)/im. This preserves unit-level semantic boundaries, crucial when the user asks "Syllabus for Unit 3" or "Cloud Computing - Virtualization topics".
- Notes: split using slide markers such as "Slide 1", uppercase SLIDE tags, or numeric headings; fallback to small paragraph chunks to increase the chance of a query hitting a chunk containing the exact term.
- Timetable: use subject-code regex (e.g., /[A-Z]{2,}\d{3,}[A-Z0-9-]*/) and date/time regex; build chunks to keep codes and dates together.

5.3 Re-ranking and fill-to-N
- Re-rank by combining vector similarity score with a small lexical match boost (0.06 per matching token of length≥3). This prefers chunks that actually contain the searched keyword.
- Fill-to-12 strategy (recommended): request REQUEST_LIMIT (e.g., 50), filter high-score hits, then if fewer than N exist, append highest-scoring remaining hits until N or exhausted.

5.4 Prompting rules
- Strict mode: LLM must only use provided context.
- Expand mode: allowed to add clarifications; added info must be labeled.
- For notices: emphasize extracting exact date strings and deadlines.

6. Error handling & resilience
-----------------------------
- If convert/extract returns very short text (<30 chars), ingestion throws error — prevents indexing garbage.
- If embedding fails or embedding count mismatches chunks, ingestion throws "Embedding mismatch.".
- Chat route catches LLM or Qdrant errors and returns 500 with details in logs but sanitized messages to client.
- Fallback for filtered search: retry unfiltered search to avoid missing content when category labels are imperfect.

7. Performance, scaling, and ops
--------------------------------

7.1 Index scaling
- Qdrant can scale horizontally. Key knobs:
  - HNSW M and ef_construction for indexing; ef for search-time recall/latency tradeoffs.
  - Use shards for very large datasets.
  - Regularly run vector reindexing if embedding model changes.

7.2 Latency budget
- Embedding generation is a client-side cost for queries but here is performed with Ollama local HTTP; keep it fast by batching and caching embeddings for repeated queries if necessary.
- Typical flow: embed (10–50ms locally) + qdrant search (10–50ms) + LLM generation (200–1000ms depending on model & prompt). End-to-end target for short answers is <1.5s on local hardware with small models; adjust expectation for larger LLMs.

7.3 Storage
- Store payload text in Qdrant to show snippets. For very large text, consider storing only a snippet and saving full text in object storage (S3) with a link in payload to avoid bloating vector DB.

7.4 Monitoring and logging
- Log ingestion successes/failures with docId and chunk counts.
- Track search latency, LLM latencies, and average hits returned.
- Monitor Qdrant health and queue times.

8. Security and privacy
-----------------------
- Access control: ensure upload and query endpoints require authentication in production.
- Rate-limiting: chat route should use `ratelimiter.middleware.js` (exists in repo) to prevent abuse.
- Data protection: store sensitive documents encrypted at rest; redact PII when necessary before indexing.
- LLM data handling: if using a hosted LLM, ensure data privacy; Ollama local mitigates external data exfiltration.

9. Example walkthrough (upload notes -> ask "What is virtualization?")
---------------------------------------------------------------------
1. Upload: POST multipart to `/api/v1/documents/upload` with `file=@cloud_notes.pptx`, `title=Cloud Computing - Notes`, `type=notes`.
2. Ingestion:
   - Mammoth / pptx text extraction or LLM-based conversion creates raw text.
   - detectCategory sees "slides", label "notes".
   - chunkTextByCategory splits by slide boundaries; chunks for slide(s) mentioning "virtualization" exist.
   - embedTexts produces vectors; qdrantClient.upsert indexes them.
3. Query:
   - Frontend posts `{question: "What is virtualization?", mode: "expand"}` to `/api/v1/aichat`.
   - chat.js embeds question, queries Qdrant with limit 50 and (optionally) category filter; fallback to unfiltered if needed.
   - Re-ranker bumps chunks containing "virtualization".
   - Top chunks form context; LLM is called:
     - Because `mode=expand`, the system prompt allows the LLM to supplement missing conceptual explanations while labeling added text.
   - The returned answer includes the text drawn from notes (when present) and an added clarifying paragraph preceded by "Note (added):", plus `sources` array listing the matched chunk(s).

10. Limitations and future work
-------------------------------
- OCR missing: scanned PDFs (image-only) are not currently OCRed. Add Tesseract or Google Vision fallback.
- Metadata extraction: currently limited heuristic detection; implementing structured metadata extraction (course code, instructor, semester) at ingestion would enable precise filtering.
- Streaming responses: currently a synchronous call to Ollama; implement streaming websocket or server-sent events for better UX on long answers.
- Soft filters & ranking: convert category filter to soft preference in query rather than hard `filter`.
- Evaluation suite: create test corpus and automated eval to measure precision/recall of retrieval and answer correctness.
- Vector dimension drift: when embedding model changes, re-embedding entire collection is needed—provide migration scripts.

11. Deployment notes
--------------------
- Environment variables:
  - QDRANT_URL (default: http://localhost:6333)
  - QDRANT_COLLECTION (default: college_docs)
  - OLLAMA_URL (default: http://localhost:11434)
  - CORS_ORIGIN for frontend
- Run Qdrant locally in Docker or use managed service. Example Docker:
  - docker run -p 6333:6333 qdrant/qdrant
- Run Ollama server locally or adapt to other LLM providers. Embedding endpoints in `backend/src/lib/ollamaEmbeddings.js` expect Ollama embed API.
- For production, consider containerizing each service: backend, qdrant, ollama; use Kubernetes or docker-compose.

12. File references (where to look in repo)
------------------------------------------
- Backend express app: `backend/src/app.js`
- Chat & RAG pipeline orchestration: `backend/src/routes/chat.js`
- Document upload route: `backend/src/routes/documents.js`
- Document ingestion & chunking: `backend/src/services/documentIngestion.js`
- Ollama embedding wrapper: `backend/src/lib/ollamaEmbeddings.js`
- Qdrant client: `backend/src/lib/qdrantClient.js`
- Frontend Chat UI: `frontend/src/components/Chatbot.jsx`

13. Appendices
--------------

Appendix A — Sample prompts
- Strict system prompt:
  "You are a college assistant AI bot for a university. You answer questions ONLY using the provided context extracted from official documents (notices, timetable, syllabus, circulars, lecture notes, etc). Never invent dates, rules, marks, or deadlines. If the answer is not clearly present, say: 'Not found in the documents.'"

- Expand system prompt:
  "Prefer to answer using the provided context. If the context is missing details required to give a useful explanation (for example conceptual clarifications or common background knowledge about a topic), you may supplement the answer using general knowledge. When you add information that is NOT directly present in the provided documents, label those parts clearly with the prefix 'Note (added):'. Do not fabricate authoritative dates, deadlines, or official rules; those must still come from documents when available."

Appendix B — Recommended parameter defaults
- REQUEST_LIMIT (Qdrant search): 50
- FINAL_SOURCES_N: 12
- SCORE_THRESHOLD: 0.25 (adjustable)
- Text match boost: +0.06 per matched token (token length≥3)
- Syllabus chunk size fallback: 600 chars
- Notes chunk size fallback: 400 chars

Appendix C — Suggested diagrams to include
- Architecture block diagram (Frontend ↔ Backend ↔ Qdrant ↔ Ollama)
- Sequence diagram for upload & ingestion
- Sequence diagram for query & answer (RAG steps)
- Data model diagram for Qdrant payload

Final words
-----------
This AI Document Assistant balances precision and recall through category-aware chunking, re-ranking, fallback searches, and prompt modes. It is designed for educational documents and offers a clear provenance trail for the answers. The next practical improvements I recommend implementing in order of impact:
1. Metadata extraction (course code/title) at ingestion and store in payload.
2. OCR fallback for scanned PDFs.
3. Soft-category search (unfiltered search + category boost) to reduce missed documents.
4. Add frontend upload UI and ingestion status tracking.
5. Add automated evaluation pipeline for retrieval/answer correctness.

If you want, I can:
- Convert this report to a markdown file in the repo (e.g., `docs/AI-Document-Assistant-Report.md`).
- Generate a visual architecture diagram (SVG) and add it to the repo.
- Implement any of the recommended next steps (start with metadata extraction or OCR).
