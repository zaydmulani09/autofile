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
    <div className="h-full flex flex-col max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 opacity-60">
            <div className="w-8 h-px bg-white"></div>
            <span className="text-white text-[10px] font-mono tracking-wider">004</span>
            <div className="flex-1 h-px bg-white"></div>
          </div>
          <h1 className="text-4xl font-bold tracking-widest uppercase italic transform -skew-x-12">Neural Interface</h1>
          <p className="text-white/40 mt-4 text-sm font-mono uppercase tracking-widest">Your personal productivity co-pilot</p>
        </div>
        <button 
          onClick={clearChat}
          className="p-3 rounded-none bg-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all border border-white/10"
          title="Clear Chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </header>

      <div className="flex-1 glass-panel overflow-hidden flex flex-col mb-4 border border-white/10 rounded-none relative">
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20" />
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-none flex items-center justify-center shrink-0 border border-white/10 ${
                msg.role === 'assistant' ? 'bg-white/5 text-white' : 'bg-white/10 text-white/60'
              }`}>
                {msg.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div className={`max-w-[85%] p-6 rounded-none relative ${
                msg.role === 'assistant' 
                  ? 'bg-white/5 text-white/90 border border-white/5' 
                  : 'bg-white text-black shadow-xl shadow-white/5'
              }`}>
                <div className={`absolute top-0 ${msg.role === 'user' ? 'right-0' : 'left-0'} w-2 h-2 bg-white/20`} />
                
                <div className="markdown-body text-[10px] font-mono uppercase tracking-widest leading-relaxed">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex gap-6">
              <div className="w-10 h-10 rounded-none bg-white/5 text-white flex items-center justify-center border border-white/10">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div className="bg-white/5 p-6 rounded-none border border-white/5">
                <div className="flex gap-2">
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-none animate-pulse" />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-none animate-pulse [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-none animate-pulse [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-8 border-t border-white/10 bg-white/[0.02]">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="COMMAND_INPUT_STREAM..."
              className="w-full bg-white/5 border border-white/10 rounded-none py-5 pl-6 pr-16 focus:outline-none focus:ring-1 focus:ring-white/50 transition-all font-mono text-[10px] uppercase tracking-widest font-bold"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white text-black rounded-none hover:bg-white/90 transition-all disabled:opacity-50 disabled:grayscale shadow-xl shadow-white/5"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-6 flex items-center gap-3 text-[8px] font-mono font-bold text-white/20 uppercase tracking-[0.3em] justify-center">
            <div className="w-4 h-px bg-white/10" />
            <span>Core: Gemini 3 Flash / Protocol: v1.0.4</span>
            <div className="w-4 h-px bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
