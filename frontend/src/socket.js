import io from "socket.io-client";

let socket = null;

const createSocket = () => {
  if (!socket) {
    const API_URL = import.meta.env.VITE_CORS || "http://localhost:8000";
    socket = io(API_URL, {
      withCredentials: true,
      secure: true, // Force secure connection
      transports: ["websocket"], // WebSocket only mode
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      agent: false,
      reconnectionAttempts: 5, 
    });
    socket.on("connect_error", (err) => {
      console.error("Connection error:", err.message);
      console.error("Details:", err.description);
    });
  return socket;
  }
};

export const joinRoom = (roomId) => {
  if (!socket) createSocket();
  socket.emit("joinRoom", roomId);
};

export const sendMessage = (roomId, message) => {
  if (!socket) createSocket();
  socket.emit("sendMessage", { roomId, message });
};

export const onNewMessage = (callback) => {
  if (!socket) createSocket();
  socket.on("newMessage", callback);
};

export const offNewMessage = (callback) => {
  if (!socket) createSocket();
  socket.off("newMessage", callback);
};

export default createSocket;
