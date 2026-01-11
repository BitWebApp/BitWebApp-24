import "./env.js";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./utils/Socket.js";
import "./cron-jobs/notifyProf.js";
import "./cron-jobs/autoMovePreferences.js";
import "./cron-jobs/notifyProfMinor.js";
import "./cron-jobs/autoMovePreferencesMinor.js";
import "./cron-jobs/notifyMajorProf.js";
import "./cron-jobs/autoMovePreferencesMajor.js";

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

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.error("❌ Error in Express app:", err);
      // Don't throw, just log - let global handlers deal with it
    });

    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket"],
    });

    io.on("connection", (socket) => {
      console.log("New socket connected:", socket.id);

      // Handle socket errors
      socket.on("error", (error) => {
        console.error("Socket error:", error);
      });
    });

    initSocket(io);

    const server = httpServer.listen(process.env.PORT || 8000, () => {
      console.log(`✅ Server is listening on port ${process.env.PORT || 8000}`);
    });

    // Handle server errors
    server.on("error", (error) => {
      console.error("❌ Server error:", error);
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${process.env.PORT || 8000} is already in use`);
        process.exit(1);
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      server.close(() => {
        console.log("✅ HTTP server closed");
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error("⚠️ Forcing shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  })
  .catch((error) => {
    console.error("❌ MONGODB connection FAILED:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  });
