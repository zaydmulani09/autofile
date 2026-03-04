import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Trash2, FileText, Plus, Search, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function SmartNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/notes/${user?.id}`);
      const data = await response.json();
      setNotes(data);
      if (data.length > 0 && !activeNoteId) {
        setActiveNoteId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const activeNote = notes.find(n => n.id === activeNoteId);

  const createNote = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: 'Untitled Note',
          content: '',
        }),
      });
      
      if (response.ok) {
        const newNote = await response.json();
        setNotes([newNote, ...notes]);
        setActiveNoteId(newNote.id);
      }
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    // Optimistic update
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    
    // In a real app, you'd debounce this and send to server
    // For now, we'll just keep it in state and assume the user will "Save" or it's auto-saved
  };

  const deleteNote = async (id: string) => {
    // In a real app, call delete API
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(notes.find(n => n.id !== id)?.id || null);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/20">
        <FileText className="w-16 h-16 mb-4" />
        <h2 className="text-xl font-bold">Please sign in to use Notes</h2>
        <p className="text-sm mt-2">Your notes are securely stored in Supabase</p>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-8">
      {/* Sidebar */}
      <div className="w-80 flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1 opacity-60">
              <div className="w-4 h-px bg-white"></div>
              <span className="text-white text-[8px] font-mono tracking-wider">010</span>
            </div>
            <h2 className="text-2xl font-bold tracking-widest uppercase italic transform -skew-x-12 font-mono">Archive</h2>
          </div>
          <button 
            onClick={createNote}
            disabled={isSaving}
            className="w-10 h-10 rounded-none bg-white flex items-center justify-center text-black shadow-lg shadow-white/5 hover:scale-105 transition-all disabled:opacity-50 border border-white/10"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within:text-white transition-colors" />
          <input 
            type="text"
            placeholder="SEARCH_ARCHIVE..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-none py-3 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-white/50 transition-all text-[10px] font-mono uppercase tracking-widest font-bold"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
            </div>
          ) : filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`w-full text-left p-5 rounded-none transition-all group relative overflow-hidden border ${
                activeNoteId === note.id 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-white/2 border-transparent hover:bg-white/5 hover:border-white/10'
              }`}
            >
              {activeNoteId === note.id && (
                <motion.div 
                  layoutId="active-note-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-white"
                />
              )}
              <h3 className={`font-bold text-[10px] uppercase tracking-widest font-mono truncate ${activeNoteId === note.id ? 'text-white' : 'text-white/40'}`}>
                {note.title || 'UNTITLED_ENTRY'}
              </h3>
              <p className="text-[8px] text-white/20 mt-2 truncate font-mono uppercase tracking-widest">{note.content || 'NULL_CONTENT'}</p>
              <div className="flex items-center gap-2 mt-4 text-[8px] font-bold text-white/10 uppercase tracking-[0.2em] font-mono">
                <Clock className="w-2.5 h-2.5" />
                {new Date(note.created_at).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 glass-panel flex flex-col overflow-hidden relative rounded-none border-white/10">
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20" />
        
        {activeNote ? (
          <>
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
              <input 
                type="text"
                value={activeNote.title}
                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                className="bg-transparent text-xl font-bold focus:outline-none w-full tracking-widest uppercase italic transform -skew-x-6 font-mono placeholder:text-white/10"
                placeholder="ENTRY_TITLE"
              />
              <div className="flex items-center gap-4">
                <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest hidden sm:block">
                  ID: {activeNote.id.slice(0, 8)}
                </div>
                <button 
                  onClick={() => deleteNote(activeNote.id)}
                  className="p-3 rounded-none text-white/10 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <textarea 
              value={activeNote.content}
              onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
              className="flex-1 bg-transparent p-10 focus:outline-none resize-none text-white/60 leading-relaxed font-mono text-sm uppercase tracking-widest placeholder:text-white/5"
              placeholder="INITIALIZING_INPUT_STREAM..."
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/10">
            <div className="w-20 h-20 rounded-none bg-white/5 border border-white/10 flex items-center justify-center mb-8">
              <FileText className="w-10 h-10" />
            </div>
            <p className="text-sm font-bold tracking-widest uppercase font-mono italic">Select entry for decryption</p>
            <p className="text-[10px] mt-4 font-mono uppercase tracking-widest opacity-30">Choose from the archive or initialize new entry</p>
          </div>
        )}
      </div>
    </div>
  );
}
