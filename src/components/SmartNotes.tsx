import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Trash2, FileText, Plus, Search, Clock } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export default function SmartNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('productivity_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    localStorage.setItem('productivity_notes', JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const createNote = () => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Untitled Note',
      content: '',
      updatedAt: Date.now()
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(notes.find(n => n.id !== id)?.id || null);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex gap-8">
      {/* Sidebar */}
      <div className="w-80 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Notes</h2>
          <button 
            onClick={createNote}
            className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/20 hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent transition-colors" />
          <input 
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-accent/50 transition-all text-sm font-medium"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`w-full text-left p-5 rounded-2xl transition-all group relative overflow-hidden ${
                activeNoteId === note.id 
                  ? 'bg-accent/10 border border-accent/20' 
                  : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10'
              }`}
            >
              {activeNoteId === note.id && (
                <motion.div 
                  layoutId="active-note-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-accent"
                />
              )}
              <h3 className={`font-bold tracking-wide truncate ${activeNoteId === note.id ? 'text-accent' : 'text-white/80'}`}>
                {note.title || 'Untitled'}
              </h3>
              <p className="text-xs text-white/30 mt-2 truncate font-medium">{note.content || 'No content yet...'}</p>
              <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                <Clock className="w-3 h-3" />
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 glass-panel flex flex-col overflow-hidden relative">
        {activeNote ? (
          <>
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
              <input 
                type="text"
                value={activeNote.title}
                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                className="bg-transparent text-2xl font-bold focus:outline-none w-full tracking-tight placeholder:text-white/10"
                placeholder="Note Title"
              />
              <button 
                onClick={() => deleteNote(activeNote.id)}
                className="p-3 rounded-xl text-white/10 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <textarea 
              value={activeNote.content}
              onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
              className="flex-1 bg-transparent p-8 focus:outline-none resize-none text-white/70 leading-relaxed font-sans text-lg placeholder:text-white/5"
              placeholder="Start writing your thoughts..."
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/10">
            <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
              <FileText className="w-12 h-12" />
            </div>
            <p className="text-lg font-bold tracking-tight">Select a note to view or edit</p>
            <p className="text-sm mt-2 font-medium opacity-50">Choose from the list or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
