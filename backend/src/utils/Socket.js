import jwt from "jsonwebtoken";
import { Chat } from "../models/chat.model.js";
import { Group } from "../models/group.model.js";
import { Minor } from "../models/minor.model.js";
import { Major } from "../models/major.model.js";
import { User } from "../models/user.model.js";
import { Professor } from "../models/professor.model.js";
let io;

const findGroupByGroupId = async (groupId) => {
  return (
    (await Group.findOne({ groupId })) ||
    (await Minor.findOne({ groupId })) ||
    (await Major.findOne({ groupId }))
  );
};

const checkGroupMembership = (group, userId) => {
  const uid = userId.toString();
  return (
    (group.leader && group.leader.toString() === uid) ||
    (group.members &&
      group.members.some((m) => m.toString() === uid)) ||
    (group.summerAppliedProfs &&
      group.summerAppliedProfs.some((p) => p.toString() === uid)) ||
    (group.summerAllocatedProf &&
      group.summerAllocatedProf.toString() === uid) ||
    (group.minorAllocatedProf &&
      group.minorAllocatedProf.toString() === uid) ||
    (group.majorAllocatedProf &&
      group.majorAllocatedProf.toString() === uid)
  );
};

export const initSocket = (ioInstance) => {
  io = ioInstance;

  // Authentication middleware — require valid JWT (cookie-based or token-based)
  io.use(async (socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");
    if (!token) {
      return next(new Error("Authentication required"));
    }
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const userId = decoded._id || decoded.id;

      // Resolve user's full name for chat display
      const user = await User.findById(userId).select("fullName");
      const professor = user ? null : await Professor.findById(userId).select("fullName");
      if (!user && !professor) {
        return next(new Error("User not found"));
      }

      socket.userId = userId;
      socket.userFullName = user?.fullName || professor?.fullName;
      next();
    } catch (err) {
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("joinRoom", async (roomId) => {
      try {
        const group = await findGroupByGroupId(roomId);
        if (!group) {
          socket.emit("roomError", "Group not found");
          return;
        }
        const isMember = checkGroupMembership(group, socket.userId);
        if (!isMember) {
          socket.emit("roomError", "Not authorized to join this room");
          return;
        }
        socket.join(roomId);
      } catch (error) {
        socket.emit("roomError", "Failed to join room");
      }
    });

    socket.on("sendMessage", async (data) => {
      try {
        const { roomId, message } = data;
        const { text } = message;

        const group = await findGroupByGroupId(roomId);
        if (!group) {
          socket.emit("messageError", "Group not found");
          return;
        }
        if (!checkGroupMembership(group, socket.userId)) {
          socket.emit("messageError", "Not authorized to send messages in this room");
          return;
        }

        let chat = await Chat.findOne({ groupId: roomId });
        if (!chat) {
          chat = new Chat({ groupId: roomId, messages: [] });
        }

        // Use server-derived sender name for security (prevents spoofing)
        const sender = socket.userFullName;
        const newMessage = { sender, text, date: new Date() };
        chat.messages.push(newMessage);
        await chat.save();
        socket.to(roomId).emit("newMessage", newMessage);
      } catch (error) {
        socket.emit("messageError", "Failed to send message");
      }
    });

    socket.on("disconnect", () => {
      // Socket disconnected
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
