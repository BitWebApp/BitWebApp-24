import qdrantClient from "../lib/qdrantClient.js";

const VECTOR_SIZE = 1024; // VoyageAI "voyage-code-2" embedding size

export async function createCollectionIfNotExists(collection) {
  const collections = await qdrantClient.getCollections();
  const exists = collections.collections.some(c => c.name === collection);

  if (!exists) {
    console.log(`🔹 Creating Qdrant collection: ${collection}`);
    await qdrantClient.createCollection(collection, {
      vectors: {
        size: VECTOR_SIZE,
        distance: "Cosine",
      },
    });
  }
}
