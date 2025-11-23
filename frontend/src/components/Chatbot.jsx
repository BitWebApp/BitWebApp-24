import { useState } from "react";
import axios from "axios";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const question = input;
    setMessages(prev => [...prev, { from: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("/api/chat", { question });
      setMessages(prev => [...prev, { from: "bot", text: res.data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { from: "bot", text: "⚠ Something went wrong." }]);
    }

    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 border border-gray-300 rounded-xl shadow-sm bg-white">
      <h2 className="text-center py-4 text-2xl font-semibold border-b">🎓 College AI Assistant</h2>

      <div className="h-[470px] p-4 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] px-4 py-2 rounded-lg whitespace-pre-wrap ${
              m.from === "user"
                ? "bg-blue-600 text-white ml-auto"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="bg-gray-200 text-gray-800 max-w-[80%] px-4 py-2 rounded-lg">
            Thinking…
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 border-t p-4">
        <textarea
          className="flex-1 border border-gray-400 rounded-lg p-3 focus:ring outline-none resize-none h-[70px]"
          placeholder="Ask about notices, rules, exam dates, deadlines..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
        ></textarea>

        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          Send
        </button>
      </div>
    </div>
  );
}
