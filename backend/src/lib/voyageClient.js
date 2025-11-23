import { VoyageAIClient } from "voyageai";
import dotenv from "dotenv";
dotenv.config();

export const voyage = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY,
});
