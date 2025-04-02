import {
  useEffect,
  useState,
  useRef,
  useCallback,
  memo,
} from "react";
import { FaPaperPlane } from "react-icons/fa";
import axios from "axios";
import createSocket, { joinRoom, sendMessage, onNewMessage, offNewMessage } from "../socket";

const api = axios.create({
  baseURL: "/api/v1/chat",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const ChatBoxComponent = ({ groupId }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState("");
  const [senderColors, setSenderColors] = useState({});
  const chatBoxRef = useRef(null);
  const [userType, setUserType] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    let user = localStorage.getItem("user");
    let faculty = localStorage.getItem("faculty");
    let fullName = null;

    if (user) {
      try {
        user = JSON.parse(user);
        fullName = user?.fullName;
        setUserType("user");
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    } else if (faculty) {
      try {
        faculty = JSON.parse(faculty);
        fullName = faculty?.fullName;
        setUserType("faculty");
      } catch (e) {
        console.error("Error parsing faculty from localStorage", e);
      }
    }

    setName(fullName);
  }, []);

  const fetchChat = useCallback(async () => {
    try {
      let endpoint = `/${groupId}`;
      if (userType === "user") {
        endpoint = `/user/${groupId}`;
      } else if (userType === "faculty") {
        endpoint = `/prof/${groupId}`;
      }
      const response = await api.get(endpoint);
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Error fetching chat:", error);
    }
  }, [groupId, userType]);

  useEffect(() => {
    if (groupId && userType) {
      fetchChat();
    }
  }, [groupId, userType, fetchChat]);

  useEffect(() => {
    socketRef.current = createSocket();

    console.log("Joining room:", groupId);

    joinRoom(groupId);

    const handleNewMessage = (msg) => {
      console.log("Received newMessage:", msg);
      setMessages((prev) => [...prev, msg]);
    };

    onNewMessage(handleNewMessage);

    return () => {
      offNewMessage(handleNewMessage);
    };
  }, [groupId]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const uniqueSenders = [...new Set(messages.map((msg) => msg.sender))];
    const colorMap = {};
    const colors = [
      "bg-red-100",
      "bg-yellow-100",
      "bg-green-100",
      "bg-purple-100",
      "bg-orange-100",
    ];
    uniqueSenders.forEach((sender, index) => {
      colorMap[sender] = colors[index % colors.length];
    });
    setSenderColors(colorMap);
  }, [messages]);

  const getSenderColor = useCallback((sender) => {
    return senderColors[sender] || "bg-gray-100";
  }, [senderColors]);

  const sendMsg = useCallback(() => {
    if (message.trim()) {
      const msgObj = {
        roomId: groupId,
        message: {
          text: message,
          date: new Date(),
          sender: name,
        },
      };
      console.log("Sending message:", msgObj);
      sendMessage(groupId, msgObj.message);
      setMessages((prev) => [
        ...prev,
        { sender: name, text: message, date: new Date() },
      ]);
      setMessage("");
    }
  }, [groupId, message, name]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMsg();
    }
  };

  return (
    <div className="bg-white shadow rounded-2xl p-4 mt-4 flex flex-col w-full max-w-2xl mx-auto h-[400px] sm:h-[500px]">
      <div
        ref={chatBoxRef}
        className="mb-4 h-full overflow-y-auto border border-gray-200 p-2 rounded flex-grow"
      >
        <div className="flex flex-col">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 p-3 rounded-xl break-words ${
                msg.sender === name
                  ? "bg-green-100 ml-auto text-right"
                  : `${getSenderColor(msg.sender)} mr-auto text-left`
              }`}
              style={{ maxWidth: "80%", display: "inline-block" }}
            >
              <div className="text-sm text-gray-600">{msg.sender}</div>
              <div className="text-gray-800" style={{ wordBreak: "break-word" }}>
                {msg.text}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(msg.date).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMsg}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-lg shadow-md"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

const ChatBox = memo(ChatBoxComponent);

export default ChatBox;
