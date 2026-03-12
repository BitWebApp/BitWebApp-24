import io from "socket.io-client";

let socket = null;

const getAccessToken = () => {
  // Try cookie first (primary auth method)
  const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
  if (match) return match[1];
  // Fallback to localStorage (used by FacultyAutoLogin)
  return localStorage.getItem("accessToken") || null;
};

const createSocket = () => {
  if (!socket) {
    const API_URL = import.meta.env.VITE_CORS || "http://localhost:8000";
    const token = getAccessToken();
    socket = io(API_URL, {
      withCredentials: true,
      secure: true,
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      agent: false,
      auth: {
        token: token,
      },
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
