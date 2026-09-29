// Single entry point for BITAcademia.
//
// Runs one HTTP server that hosts:
//   - the Express REST API under /api
//   - locally stored uploads under /uploads (and /temp)
//   - Socket.IO for group chat
//   - the node-cron jobs
//   - the Next.js frontend for every other route
//
// `npm run dev` starts it in development mode (Next.js HMR),
// `npm run build && npm start` runs the production build.
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import "./server/env.js";
import fs from "node:fs";
import path from "node:path";
import { createServer } from "node:http";
import express from "express";
import next from "next";
import { Server } from "socket.io";
import connectDB from "./server/db/index.js";
import { app as apiApp } from "./server/app.js";
import { initSocket } from "./server/utils/Socket.js";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";

// Global error handlers
process.on("uncaughtException", (error) => {
  console.error("💥 UNCAUGHT EXCEPTION! Shutting down gracefully...");
  console.error("Error:", error.name, "-", error.message);
  console.error("Stack:", error.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 UNHANDLED REJECTION! Shutting down gracefully...");
  console.error("Promise:", promise);
  console.error("Reason:", reason);
  process.exit(1);
});

// Upload directories written to by multer and the local "Cloudinary" util
const publicDir = path.resolve(process.cwd(), "public");
fs.mkdirSync(path.join(publicDir, "temp"), { recursive: true });
fs.mkdirSync(path.join(publicDir, "uploads"), { recursive: true });

const startCronJobs = async () => {
  if (process.env.DISABLE_CRON === "true") {
    console.log("⏸️  Cron jobs disabled (DISABLE_CRON=true)");
    return;
  }
  await Promise.all([
    import("./server/cron-jobs/notifyProf.js"),
    import("./server/cron-jobs/autoMovePreferences.js"),
    import("./server/cron-jobs/notifyProfMinor.js"),
    import("./server/cron-jobs/autoMovePreferencesMinor.js"),
    import("./server/cron-jobs/notifyMajorProf.js"),
    import("./server/cron-jobs/autoMovePreferencesMajor.js"),
    import("./server/cron-jobs/notifyProfProject1.js"),
    import("./server/cron-jobs/autoMovePreferencesProject1.js"),
  ]);
};

const main = async () => {
  const nextApp = next({ dev, hostname, port });
  const handleNext = nextApp.getRequestHandler();

  await Promise.all([connectDB(), nextApp.prepare()]);
  await startCronJobs();

  const server = express();
  server.disable("x-powered-by");

  // Files uploaded at runtime are not known to Next.js, so serve them here.
  server.use("/uploads", express.static(path.join(publicDir, "uploads")));
  server.use("/temp", express.static(path.join(publicDir, "temp")));

  // REST API
  server.use((req, res, nextMiddleware) => {
    if (req.path === "/api" || req.path.startsWith("/api/")) {
      return apiApp(req, res, nextMiddleware);
    }
    return nextMiddleware();
  });

  // Everything else is rendered by Next.js
  server.all("*", (req, res) => handleNext(req, res));

  const httpServer = createServer(server);

  const io = new Server(httpServer, {
    cors: process.env.CORS_ORIGIN
      ? {
          origin: process.env.CORS_ORIGIN,
          methods: ["GET", "POST"],
          credentials: true,
        }
      : undefined,
    transports: ["websocket"],
    // Leave other websocket upgrades (e.g. Next.js HMR) alone
    destroyUpgrade: false,
  });

  io.on("connection", (socket) => {
    console.log("New socket connected:", socket.id);
    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  initSocket(io);

  httpServer.listen(port, hostname, () => {
    console.log(
      `✅ BITAcademia ready on http://${hostname === "0.0.0.0" ? "localhost" : hostname}:${port} (${dev ? "development" : "production"})`
    );
  });

  httpServer.on("error", (error) => {
    console.error("❌ Server error:", error);
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use`);
      process.exit(1);
    }
  });

  // Graceful shutdown
  const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    // Closes Socket.IO connections and the underlying HTTP server
    io.close(() => {
      console.log("✅ HTTP server closed");
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error("⚠️ Forcing shutdown after timeout");
      process.exit(1);
    }, 10000).unref();
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};

main().catch((error) => {
  console.error("❌ Failed to start server:", error.message);
  console.error("Stack:", error.stack);
  process.exit(1);
});
