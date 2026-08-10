import React, { useState, useRef, useEffect } from 'react';
import { Send, BookOpen, Bot, User, Loader2, RefreshCw, FileText, ExternalLink, AlertTriangle, Copy, Check } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your JAC Chandigarh Counselling AI Assistant. Ask me anything regarding eligibility criteria, seat matrix, quotas, fee structure, or required documents.',
      citations: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);

  const PDF_URL = 'https://cdnbbsr.s3waas.gov.in/s3dd28e50635038e9cf3a648c2dd17ad0a/uploads/2026/06/202606141034175296.pdf';

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput('');

    // Append user message immediately
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userQuery, citations: [] }
    ]);
    setLoading(true);

    try {
      // Connect to Python FastAPI backend
      const response = await fetch('http://localhost:8000/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userQuery }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      // Append bot response with citations
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: data.answer,
          citations: data.citations || []
        }
      ]);
    } catch (err) {
      console.error('Error fetching RAG response:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Unable to connect to the backend server. Please verify that your FastAPI backend service is running on port 8000.',
          citations: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-3 md:p-6 font-sans">
      
      {/* Header */}
      <header className="w-full max-w-3xl bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30 flex-shrink-0 mt-0.5">
            <Bot size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">
                JAC Chandigarh AI Assistant
              </h1>
            </div>
            
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5 text-slate-300">
                <FileText size={13} className="text-blue-400" /> Grounded on official brochure
              </span>
              <span className="text-slate-600">•</span>
              <a
                href={PDF_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1 font-medium transition-colors"
              >
                View PDF <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
          <div className="flex items-center gap-1.5 text-[11px] bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg">
            <AlertTriangle size={12} className="text-amber-400 flex-shrink-0" />
            <span>AI can make mistakes</span>
          </div>

          <button 
            onClick={() => setMessages([messages[0]])}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
            title="Clear Chat"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* Chat Container */}
      <main className="w-full max-w-3xl flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-6 overflow-y-auto mb-4 space-y-5 shadow-2xl custom-scrollbar">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0 mt-1 shadow-sm">
                <Bot size={18} />
              </div>
            )}

            <div
              className={`relative group max-w-[88%] md:max-w-[80%] rounded-2xl p-4 shadow-md transition-all ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {msg.sender === 'user' ? 'You' : 'JAC Assistant'}
                </span>
                
                {msg.sender === 'bot' && (
                  <button
                    onClick={() => handleCopy(msg.text, index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-200 p-1 rounded"
                    title="Copy response"
                  >
                    {copiedIndex === index ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                )}
              </div>

              <div className="text-sm leading-relaxed whitespace-pre-wrap font-normal">
                {msg.text}
              </div>

              {/* Source Page Citations & Brochure Reference Links */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-slate-400 font-medium">
                    <BookOpen size={13} className="text-blue-400" /> Sources:
                  </span>
                  {msg.citations.map((page, idx) => (
                    <a
                      key={idx}
                      href={`${PDF_URL}#page=${page}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-950/80 hover:bg-blue-900 border border-blue-700/50 text-blue-300 hover:text-white px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 transition-colors"
                      title={`Open brochure page ${page}`}
                    >
                      Page {page} <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 mt-1 shadow-sm">
                <User size={18} />
              </div>
            )}
          </div>
        ))}

        {/* Loading State */}
        {loading && (
          <div className="flex gap-3 justify-start items-center text-slate-400 text-sm py-2">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 flex-shrink-0">
              <Bot size={18} />
            </div>
            <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 px-4 py-3 rounded-2xl rounded-tl-xs shadow-md">
              <Loader2 className="animate-spin text-blue-400" size={16} />
              <span className="text-xs text-slate-300">Searching brochure and generating verified response...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </main>

      {/* Input Form & Footer */}
      <footer className="w-full max-w-3xl">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask e.g., What are the document requirements for physical reporting?"
            className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 focus:outline-none text-slate-100 placeholder-slate-500 text-sm md:text-base rounded-2xl py-3.5 pl-4 pr-14 shadow-lg transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all flex items-center justify-center shadow-md"
          >
            <Send size={18} />
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 mt-2.5 px-2 text-center flex-wrap">
          <span>AI can make mistakes. Verify important counselling rules directly in the</span>
          <a
            href={PDF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline font-medium inline-flex items-center gap-0.5"
          >
            Official JAC Brochure PDF <ExternalLink size={10} />
          </a>
        </div>
      </footer>

    </div>
  );
}