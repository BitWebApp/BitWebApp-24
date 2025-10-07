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

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.log("error in app running ", err);
      throw err;
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
    });

    initSocket(io);

    httpServer.listen(process.env.PORT || 8000, () => {
      console.log(`Server is listening on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    // The error will be logged here
    console.log("MONGODB connection FAILED ", error);
    process.exit(1);
  });
