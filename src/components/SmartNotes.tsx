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
    <div className="h-full flex gap-6">
      {/* Sidebar */}
      <div className="w-80 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Notes</h2>
          <button 
            onClick={createNote}
            className="p-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-accent/50 transition-colors text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={`w-full text-left p-4 rounded-xl transition-all group ${
                activeNoteId === note.id 
                  ? 'bg-accent/10 border border-accent/20' 
                  : 'bg-white/5 border border-transparent hover:bg-white/10'
              }`}
            >
              <h3 className={`font-medium truncate ${activeNoteId === note.id ? 'text-accent' : 'text-white/80'}`}>
                {note.title || 'Untitled'}
              </h3>
              <p className="text-xs text-white/40 mt-1 truncate">{note.content || 'No content yet...'}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-white/20">
                <Clock className="w-3 h-3" />
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 glass-panel flex flex-col overflow-hidden">
        {activeNote ? (
          <>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <input 
                type="text"
                value={activeNote.title}
                onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                className="bg-transparent text-xl font-bold focus:outline-none w-full"
                placeholder="Note Title"
              />
              <button 
                onClick={() => deleteNote(activeNote.id)}
                className="p-2 text-white/20 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <textarea 
              value={activeNote.content}
              onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
              className="flex-1 bg-transparent p-6 focus:outline-none resize-none text-white/80 leading-relaxed font-sans"
              placeholder="Start writing..."
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20">
            <FileText className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
