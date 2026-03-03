import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, Loader2, Trash2, Info } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('autofile_ai_messages');
    return saved ? JSON.parse(saved) : [
      { role: 'assistant', content: "Hello! I'm your AutoFile productivity assistant. I can help you with file organization strategies, workflow optimization, or any questions you have about managing your digital workspace. How can I help you today?" }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('autofile_ai_messages', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is not configured. Please add it to your environment variables.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-3-flash-preview";
      
      // Filter out the very first assistant message if it's just a greeting, 
      // as Gemini expects the conversation to start with a user message.
      const apiMessages = newMessages
        .filter((m, i) => !(i === 0 && m.role === 'assistant'))
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

      // If after filtering we have no messages (shouldn't happen as we just added one), 
      // or if the first message is still not 'user', we need to adjust.
      if (apiMessages.length > 0 && apiMessages[0].role !== 'user') {
        apiMessages.shift();
      }

      const response = await ai.models.generateContent({
        model,
        contents: apiMessages,
        config: {
          systemInstruction: "You are AutoFile Assistant, a world-class productivity and file management expert. Your goal is to help users organize their digital lives. You are helpful, professional, and concise. You specialize in file naming conventions, folder structures, and digital decluttering. Always provide actionable advice.",
        }
      });

      const assistantMessage: Message = { 
        role: 'assistant', 
        content: response.text || "I'm sorry, I couldn't generate a response. Please try rephrasing your request." 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `**Error:** ${error.message || "I encountered a connection issue. Please check your API key configuration and try again."}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: "Chat history cleared. I'm ready for new questions!" }]);
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-accent" />
            AI Assistant
          </h2>
          <p className="text-white/40 mt-1">Your personal productivity co-pilot</p>
        </div>
        <button 
          onClick={clearChat}
          className="p-2.5 rounded-xl bg-white/5 text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Clear Chat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 glass-panel overflow-hidden flex flex-col mb-4 border border-white/5">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 ${
                msg.role === 'assistant' ? 'bg-accent/20 text-accent' : 'bg-white/10 text-white/60'
              }`}>
                {msg.role === 'assistant' ? <Bot className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>
              <div className={`max-w-[85%] p-5 rounded-[2rem] ${
                msg.role === 'assistant' 
                  ? 'bg-white/5 text-white/90 rounded-tl-none border border-white/5' 
                  : 'bg-accent text-white rounded-tr-none shadow-lg shadow-accent/10'
              }`}>
                <div className="markdown-body text-sm leading-relaxed">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-accent/20 text-accent flex items-center justify-center border border-accent/10">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div className="bg-white/5 p-5 rounded-[2rem] rounded-tl-none border border-white/5">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-accent/40 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-accent/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-accent/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 border-t border-white/5 bg-white/[0.02]">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about file organization, naming rules..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-medium"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-accent text-white rounded-xl hover:bg-accent-hover transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-accent/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest justify-center">
            <Info className="w-3 h-3" />
            <span>Powered by Gemini 3 Flash</span>
          </div>
        </div>
      </div>
    </div>
  );
}
