import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FolderPlus, 
  ArrowRight, 
  Undo2, 
  CheckCircle2, 
  File, 
  Folder, 
  Filter,
  ChevronDown,
  X,
  Trash2,
  FileText,
  Image as ImageIcon,
  FileCode,
  Type
} from 'lucide-react';
import { FileItem } from '../types';
import { formatBytes, cn } from '../utils';

interface OrganizeFilesProps {
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  onNavigateToRename?: () => void;
}

export default function OrganizeFiles({ files, setFiles, onNavigateToRename }: OrganizeFilesProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [organizeBy, setOrganizeBy] = useState<'type' | 'date' | 'size'>('type');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleFiles = (selectedFiles: FileList | File[]) => {
    const newFiles: FileItem[] = Array.from(selectedFiles).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      extension: file.name.split('.').pop() || '',
      lastModified: file.lastModified,
      path: '/Uploaded',
      isDuplicate: false,
      originalFile: file instanceof File ? file : undefined
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const startOrganizing = () => {
    if (files.length === 0) return;
    setIsOrganizing(true);
    
    // Simulate organization process
    setTimeout(() => {
      const newFiles = files.map(file => {
        let newPath = file.path;
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        
        switch (organizeBy) {
          case 'type':
            if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) newPath = '/Images';
            else if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) newPath = '/Documents';
            else if (['xlsx', 'xls', 'csv'].includes(ext)) newPath = '/Spreadsheets';
            else if (['js', 'ts', 'tsx', 'py', 'cpp', 'html', 'css'].includes(ext)) newPath = '/Code';
            else newPath = '/Others';
            break;
          case 'date':
            const date = new Date(file.lastModified);
            newPath = `/${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            break;
          case 'size':
            if (file.size > 100 * 1024 * 1024) newPath = '/Large';
            else if (file.size > 10 * 1024 * 1024) newPath = '/Medium';
            else newPath = '/Small';
            break;
        }
        
        return { ...file, path: newPath };
      });

      setFiles(newFiles);
      setIsOrganizing(false);
      setIsPreviewMode(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  const getPreviewStructure = () => {
    if (organizeBy === 'type') {
      const types = ['Documents', 'Images', 'Spreadsheets', 'Code', 'Others'];
      return types.map(type => ({
        name: type,
        count: files.filter(f => {
          if (type === 'Documents') return f.type.includes('pdf') || f.type.includes('word');
          if (type === 'Images') return f.type.includes('image');
          if (type === 'Spreadsheets') return f.type.includes('sheet');
          if (type === 'Code') return f.type.includes('text') || f.type.includes('code');
          return !f.type.includes('pdf') && !f.type.includes('image') && !f.type.includes('sheet') && !f.type.includes('text');
        }).length
      })).filter(t => t.count > 0);
    }
    return [
      { name: '2024', count: files.filter(f => new Date(f.lastModified).getFullYear() === 2024).length },
      { name: '2023', count: files.filter(f => new Date(f.lastModified).getFullYear() === 2023).length },
      { name: 'Older', count: files.filter(f => new Date(f.lastModified).getFullYear() < 2023).length },
    ].filter(t => t.count > 0);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organize Files</h1>
          <p className="text-white/40 mt-1">Automatically sort your files into a clean folder structure.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setFiles([])}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 text-sm font-medium"
          >
            <X className="w-4 h-4" /> Clear All
          </button>
          {files.length > 0 && onNavigateToRename && (
            <button 
              onClick={onNavigateToRename}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition-all flex items-center gap-2 text-sm font-medium"
            >
              <Type className="w-4 h-4" /> Go to Rename
            </button>
          )}
          <button 
            onClick={() => setIsPreviewMode(true)}
            disabled={files.length === 0}
            className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover transition-all flex items-center gap-2 text-sm font-bold shadow-lg shadow-accent/20 disabled:opacity-50"
          >
            <FolderPlus className="w-4 h-4" /> Organize Now
          </button>
        </div>
      </header>

      {/* Hidden File Input */}
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        onChange={onFileInputChange} 
        className="hidden" 
      />

      {/* Upload Area */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "glass-panel border-2 border-dashed p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer",
          isDragging ? "border-accent bg-accent/5 scale-[0.99]" : "border-white/10 hover:border-white/20"
        )}
      >
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <Upload className={cn("w-8 h-8 transition-colors", isDragging ? "text-accent" : "text-white/40")} />
        </div>
        <h3 className="text-xl font-bold">Drag and drop folders or files</h3>
        <p className="text-white/40 mt-2 max-w-sm">
          Select a folder to scan or drag files here to automatically organize them into subfolders.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <button className="px-6 py-2.5 rounded-full bg-white text-charcoal font-bold text-sm hover:bg-white/90 transition-all">
            Select Files
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Standard file input doesn't support folder selection well without webkitdirectory
              const input = document.createElement('input');
              input.type = 'file';
              (input as any).webkitdirectory = true;
              input.onchange = (ev: any) => handleFiles(ev.target.files);
              input.click();
            }}
            className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 font-bold text-sm hover:bg-white/10 transition-all"
          >
            Select Folder
          </button>
        </div>
      </div>

      {/* File List (Mini) */}
      {files.length > 0 && (
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Loaded Files ({files.length})</h3>
            <span className="text-xs text-white/40">{formatBytes(files.reduce((a, b) => a + b.size, 0))} Total</span>
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
            {files.slice(0, 10).map(file => (
              <div key={file.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs group/file">
                <div className="flex items-center gap-2 truncate">
                  {file.type.includes('image') ? <ImageIcon className="w-3 h-3 text-blue-400" /> : <File className="w-3 h-3 text-white/40" />}
                  <span className="truncate">{file.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/40 shrink-0 group-hover/file:hidden">{formatBytes(file.size)}</span>
                  <button 
                    onClick={() => removeFile(file.id)}
                    className="hidden group-hover/file:flex p-1 text-white/20 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            {files.length > 10 && (
              <p className="text-center text-[10px] text-white/20 pt-2">And {files.length - 10} more files...</p>
            )}
          </div>
        </div>
      )}

      {/* Options */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-accent" />
          <h3 className="font-bold">Organization Rules</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Organize By</label>
            <div className="relative">
              <select 
                value={organizeBy}
                onChange={(e) => setOrganizeBy(e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="type">File Type (PDF, Images, etc.)</option>
                <option value="date">Date Created (Year/Month)</option>
                <option value="size">File Size (Small, Medium, Large)</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Destination</label>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm">
              <Folder className="w-4 h-4 text-accent" />
              <span className="text-white/60 truncate">/Virtual/Sorted</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Naming Conflict</label>
            <div className="relative">
              <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent/50">
                <option>Add Suffix (e.g. file_1.pdf)</option>
                <option>Skip Existing</option>
                <option>Overwrite</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewMode(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-panel rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold">Organization Preview</h3>
                <button onClick={() => setIsPreviewMode(false)}>
                  <X className="w-6 h-6 text-white/40 hover:text-white" />
                </button>
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between gap-8 mb-8">
                  <div className="flex-1 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                      <Folder className="w-8 h-8 text-white/40" />
                    </div>
                    <p className="font-bold">Current</p>
                    <p className="text-xs text-white/40">{files.length} files in root</p>
                  </div>
                  <ArrowRight className="w-8 h-8 text-accent animate-pulse" />
                  <div className="flex-1 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto mb-3">
                      <FolderPlus className="w-8 h-8 text-accent" />
                    </div>
                    <p className="font-bold">Proposed</p>
                    <p className="text-xs text-white/40">Sorted into {getPreviewStructure().length} subfolders</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-wider">New Structure</p>
                  {getPreviewStructure().map((folder) => (
                    <div key={folder.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <Folder className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium">{folder.name}</span>
                      </div>
                      <span className="text-xs text-white/40">{folder.count} files</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-white/5 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setIsPreviewMode(false)}
                  className="px-6 py-2 rounded-xl text-sm font-bold hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={startOrganizing}
                  disabled={isOrganizing}
                  className="px-8 py-2 rounded-xl bg-accent hover:bg-accent-hover text-sm font-bold shadow-lg shadow-accent/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isOrganizing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Organizing...
                    </>
                  ) : 'Confirm & Move'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold">Files organized successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
