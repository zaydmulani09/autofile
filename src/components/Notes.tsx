import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Save, StickyNote, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`/api/notes/${user?.id}`);
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newNote.title.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: newNote.title,
          content: newNote.content,
        }),
      });
      
      if (response.ok) {
        setNewNote({ title: '', content: '' });
        fetchNotes();
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 opacity-60">
            <div className="w-8 h-px bg-white"></div>
            <span className="text-white text-[10px] font-mono tracking-wider">003</span>
            <div className="flex-1 h-px bg-white"></div>
          </div>
          <h1 className="text-4xl font-bold tracking-widest uppercase italic transform -skew-x-12">Data Logs</h1>
          <p className="text-white/40 mt-4 text-sm font-mono uppercase tracking-widest">Quick thoughts and reminders stored in Supabase</p>
        </div>
      </header>

      <form onSubmit={handleAddNote} className="glass-panel p-8 space-y-6 rounded-none relative overflow-hidden">
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20" />
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">Entry Title</label>
            <input
              type="text"
              placeholder="IDENTIFIER_01"
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-none px-5 py-4 text-[10px] font-mono uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-white/50 transition-all font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">Content Body</label>
            <textarea
              placeholder="INPUT_DATA_STREAM..."
              value={newNote.content}
              onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-none px-5 py-4 h-32 text-[10px] font-mono uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-white/50 transition-all font-bold resize-none"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !newNote.title.trim()}
          className="flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-white/90 rounded-none font-bold text-[10px] tracking-widest uppercase transition-all disabled:opacity-50 font-mono"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Commit Entry
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 space-y-4 relative group rounded-none border border-white/10 hover:border-white/30 transition-all"
          >
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/10 group-hover:border-white/40 transition-colors" />
            
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-widest font-mono">{note.title}</h3>
              <div className="w-2 h-2 bg-white/20 group-hover:bg-white transition-colors" />
            </div>
            
            <p className="text-white/60 text-[10px] font-mono uppercase tracking-widest whitespace-pre-wrap leading-relaxed">{note.content}</p>
            
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-white/40" />
                <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.3em]">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3 h-3 text-white/20 hover:text-white transition-colors" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
