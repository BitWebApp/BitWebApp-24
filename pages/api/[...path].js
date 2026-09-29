// Serves the Express API as a Next.js API route. This is what handles /api on
// hosts that run `next start` or serverless functions (e.g. Vercel) instead of
// server.js. When server.js is used it answers /api itself and this never runs.
import mongoose from "mongoose";
import connectDB from "../../server/db/index.js";
import { app } from "../../server/app.js";

export const config = {
  api: {
    // Express parses bodies (JSON, forms, multipart uploads) itself
    bodyParser: false,
    externalResolver: true,
  },
};

let connecting;

const ensureDB = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  connecting ??= connectDB().finally(() => {
    connecting = undefined;
  });
  return connecting;
};

export default async function handler(req, res) {
  await ensureDB();
  return app(req, res);
}
