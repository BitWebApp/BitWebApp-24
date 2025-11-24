import express from "express";
import qdrantClient from "../lib/qdrantClient.js";
// import { voyage } from "../lib/voyageClient.js";
// import { groq } from "../lib/groqClient.js";
import { embedTexts, ollamaChatCompletion } from "../lib/ollamaEmbeddings.js";

const router = express.Router();
const COLLECTION = process.env.QDRANT_COLLECTION;

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question required" });

    // Use Ollama for embedding
    const [queryVector] = await embedTexts([question]);

    const results = await qdrantClient.search(COLLECTION, {
      vector: queryVector,
      with_payload: true,
    });

    const context = results.map(r => r.payload.text).join("\n\n");
    console.log(context)
    const prompt = `Answer based only on the provided document context.\nIf the answer is not found, reply: 'Not found in the documents.'\n\nCONTEXT:\n${context}\n\nQUESTION:\n${question}\n\nANSWER:`;

    // Use Ollama for LLM completion
    const answer = await ollamaChatCompletion(prompt);
    console.log(answer)
    res.json({
      answer,
      sources: results.map(r => ({
        title: r.payload.title,
        chunkIndex: r.payload.chunkIndex,
      })),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Chat failed" });
  }
});

export default router;
