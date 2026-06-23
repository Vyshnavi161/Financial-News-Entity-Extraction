import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, User, Bot, HelpCircle } from "lucide-react";
import { API_BASE_URL, useAuth } from "../context/AuthContext";

interface ChatMessage {
  sender: "user" | "bot";
  text: string;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "bot", text: "Hello! I am your FinNews AI Intelligence assistant. How can I help you extract financial data today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { token } = useAuth();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const rawText = textToSend || message;
    if (!rawText.trim() || isLoading) return;

    setMessages((prev) => [...prev, { sender: "user", text: rawText }]);
    if (!textToSend) setMessage("");
    setIsLoading(true);

    try {
      const chatHistory = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }));

      const res = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: rawText,
          history: chatHistory
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { sender: "bot", text: "I encountered an issue connecting to the AI brain. Is the server running?" }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Connection error. Please verify the FastAPI backend is online." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    handleSend(suggestion);
  };

  const suggestions = [
    "What is ORG?",
    "Explain model architecture",
    "Analyze: Tesla announced a $5 billion buyback on Monday."
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Closed State Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-full shadow-lg hover:shadow-cyan-500/20 hover:scale-105 transition-all duration-300 group border border-cyan-400/20"
        >
          <MessageSquare className="w-6 h-6 text-white group-hover:rotate-6 transition-transform" />
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 border border-slate-800 text-xs text-slate-100 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            FinNews AI Assistant
          </span>
        </button>
      )}

      {/* Opened State Chat Panel */}
      {isOpen && (
        <div className="flex flex-col w-[360px] md:w-[400px] h-[500px] rounded-2xl border border-darkBorder glass-panel shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-darkBorder bg-slate-900/60">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">FinNews Intelligence Bot</h3>
                <span className="text-[10px] text-cyan-400 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1 animate-pulse"></span>
                  Transformer Core Active
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 hover:bg-slate-800/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Window */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-start space-x-2 max-w-[85%] ${m.sender === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                  
                  {/* Icon */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${m.sender === "user" ? "bg-slate-700" : "bg-gradient-to-tr from-cyan-500 to-purple-600"}`}>
                    {m.sender === "user" ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
                  </div>

                  {/* Message Balloon */}
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed border ${
                    m.sender === "user"
                      ? "bg-cyan-500/10 border-cyan-500/20 text-slate-100 rounded-tr-none"
                      : "bg-slate-800/40 border-slate-700/50 text-slate-300 rounded-tl-none"
                  }`}>
                    {m.text.split("\n").map((line, lIdx) => (
                      <p key={lIdx} className={lIdx > 0 ? "mt-1.5" : ""}>
                        {line}
                      </p>
                    ))}
                  </div>

                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="px-3 py-2 bg-slate-800/30 border border-slate-700/40 rounded-2xl rounded-tl-none flex space-x-1 items-center h-8">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions (if no conversation has happened yet) */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-darkBorder/40 bg-slate-950/20">
              <span className="text-[10px] text-slate-400 flex items-center mb-1.5">
                <HelpCircle className="w-3 h-3 mr-1" /> Frequently Asked Questions
              </span>
              <div className="space-y-1">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestion(s)}
                    className="block w-full text-left px-2.5 py-1.5 bg-slate-900/60 border border-slate-800/80 text-[10px] text-slate-300 rounded-lg hover:border-cyan-500/30 hover:text-cyan-400 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <div className="p-3 border-t border-darkBorder bg-slate-950/30">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about finance entities, model..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};
