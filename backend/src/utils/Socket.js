import { Chat } from "../models/chat.model.js";
let io; 

export const initSocket = (ioInstance) => {
    io = ioInstance;
    io.on("connection", (socket) => {

        socket.on("joinRoom", (roomId) => {
            socket.join(roomId);
        });

        socket.on("sendMessage", async (data) => {
            try {
                const { roomId, message } = data;
                const { sender, text } = message;

    
                let chat = await Chat.findOne({ groupId: roomId });
                if (!chat) {
                    chat = new Chat({ groupId: roomId, messages: [] });
                }

                const newMessage = { sender: sender, text, date: new Date() };    
                chat.messages.push(newMessage);
                await chat.save();    
                socket.to(roomId).emit("newMessage", newMessage);

            } catch (error) {
                console.error("Error saving message:", error);
                socket.emit("messageError", "Failed to send message");
            }
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
