import fs from "fs";
import os from "os";
import path from "path";

// Serverless hosts such as Vercel only allow writes to the OS temp dir, so
// files live there when VERCEL is set (they are not kept between requests).
// Everywhere else they go to ./public, served by server.js.
const baseDir = process.env.VERCEL
  ? path.join(os.tmpdir(), "bitwebapp")
  : path.resolve(process.cwd(), "public");

export const tempDir = path.join(baseDir, "temp");
export const uploadsDir = path.join(baseDir, "uploads");

fs.mkdirSync(tempDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });
