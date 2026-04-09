import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Mic, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', text: 'Namaste! I am Lorven AI. How can I accelerate your learning today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // ✅ FIXED: Only backend call (no Gemini in frontend)
  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          text: data.reply
        }
      ]);

    } catch (error) {
      console.error("Error:", error);

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          text: "Server error. Try again."
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return toast.error('Voice not supported in this browser');

    const rec = new SpeechRecognition();

    rec.onstart = () => toast.info('Lorven AI is listening...', { icon: '🎙️' });

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      handleSend(transcript);
    };

    rec.start();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-zinc-950 p-5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Lorven AI</h3>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Always Active</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-50">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${m.role === 'user'
                    ? 'bg-zinc-900 text-white rounded-tr-none'
                    : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none shadow-sm'
                    }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start italic text-xs text-zinc-400 font-bold ml-2">
                  Lorven AI is thinking...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-zinc-100 flex items-center gap-2">
              <button onClick={startVoice} className="p-3 text-zinc-400 hover:text-orange-600 transition-colors">
                <Mic className="w-5 h-5" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className="flex-1 bg-zinc-100 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-orange-600 outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-3 bg-zinc-950 text-white rounded-xl hover:bg-orange-600 transition-all disabled:opacity-20"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/30 hover:bg-orange-500 transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
}