import express from "express";
import qdrantClient from "../lib/qdrantClient.js";
import { voyage } from "../lib/voyageClient.js";
import { groq } from "../lib/groqClient.js";

const router = express.Router();
const COLLECTION = process.env.QDRANT_COLLECTION;

router.post("/", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "Question required" });

    const embedResp = await voyage.embed({
      input: [question],
      model: "voyage-code-2",
    });
    const queryVector = embedResp.data[0];

    const results = await qdrantClient.search(COLLECTION, {
      vector: queryVector,
      limit: 6,
      with_payload: true,
    });

    const context = results.map(r => r.payload.text).join("\n\n");

    const prompt = `
Answer based only on the provided document context.
If the answer is not found, reply: "Not found in the documents."

CONTEXT:
${context}

QUESTION:
${question}

ANSWER:
`;

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    const answer = completion.choices[0].message.content;

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
