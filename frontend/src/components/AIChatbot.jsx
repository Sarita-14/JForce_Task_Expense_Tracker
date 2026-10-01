import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send, Sparkles, X } from "lucide-react";
import { api } from "../api.js";

const STARTERS = [
  "How much did I spend this month?",
  "Which category costs me the most?",
  "Am I overspending on food?",
  "What's my average expense?"
];

export default function AIChatbot({ expenses, categoryMap }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI finance assistant 👋 Ask me anything about your expenses — like which category you spend the most on, or how your spending compares month to month."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  async function sendMessage(text) {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    const userMessage = { role: "user", content: userText };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      // Only pass actual conversation history (skip the welcome message)
      const history = nextMessages.slice(1, -1);
      const data = await api.chatWithAI(
        expenses,
        categoryMap,
        userText,
        history
      );
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.success
            ? data.reply
            : data.message || "Sorry, I couldn't process that. Try again."
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${err.message || "Something went wrong. Please try again."}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        className={`chatbot-fab ${open ? "chatbot-fab--open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI Finance Assistant"
        title="AI Finance Assistant"
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <Bot size={16} />
              </div>
              <div>
                <span className="chatbot-header-title">Finance Assistant</span>
                <span className="chatbot-header-sub">Powered by Gemini AI</span>
              </div>
            </div>
            <button
              className="chatbot-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`chatbot-msg ${msg.role === "user" ? "chatbot-msg--user" : "chatbot-msg--ai"}`}
              >
                {msg.role === "assistant" && (
                  <span className="chatbot-msg-avatar">
                    <Bot size={13} />
                  </span>
                )}
                <div className="chatbot-msg-bubble">{msg.content}</div>
              </div>
            ))}

            {loading && (
              <div className="chatbot-msg chatbot-msg--ai">
                <span className="chatbot-msg-avatar">
                  <Bot size={13} />
                </span>
                <div className="chatbot-msg-bubble chatbot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Starter prompts — only show when only the welcome message exists */}
          {messages.length === 1 && (
            <div className="chatbot-starters">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  className="chatbot-starter-btn"
                  onClick={() => sendMessage(s)}
                  disabled={loading}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input-row">
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input"
              placeholder="Ask about your expenses…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="chatbot-send"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              {loading ? <Loader2 size={17} className="spin" /> : <Send size={17} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}