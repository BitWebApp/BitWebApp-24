import io from "socket.io-client";

let socket = null;

const createSocket = () => {
  if (!socket) {
    const API_URL = import.meta.env.REACT_APP_API_URL || "http://localhost:8000";
    socket = io(API_URL, {
      withCredentials: true,
    });

    socket.on("connect_error", (err) => {
      console.error("Socket Connection Error:", err);
    });
  }
  return socket;
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
