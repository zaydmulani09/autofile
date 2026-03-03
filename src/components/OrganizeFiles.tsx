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
  Type,
  RefreshCw,
  Zap
} from 'lucide-react';
import JSZip from 'jszip';
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

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const startOrganizing = () => {
    if (files.length === 0) return;
    setIsOrganizing(true);
    
    setTimeout(() => {
      const newFiles = files.map(file => {
        let newPath = file.path;
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        
        switch (organizeBy) {
          case 'type':
            if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) newPath = '/Images';
            else if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) newPath = '/Documents';
            else if (['xlsx', 'xls', 'csv', 'ods'].includes(ext)) newPath = '/Spreadsheets';
            else if (['js', 'ts', 'tsx', 'py', 'cpp', 'html', 'css', 'json', 'md'].includes(ext)) newPath = '/Code';
            else if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) newPath = '/Videos';
            else if (['mp3', 'wav', 'flac', 'm4a'].includes(ext)) newPath = '/Audio';
            else newPath = '/Others';
            break;
          case 'date':
            const date = new Date(file.lastModified);
            newPath = `/${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            break;
          case 'size':
            if (file.size > 100 * 1024 * 1024) newPath = '/Large_Files';
            else if (file.size > 10 * 1024 * 1024) newPath = '/Medium_Files';
            else newPath = '/Small_Files';
            break;
        }
        
        return { ...file, path: newPath };
      });

      setFiles(newFiles);
      setIsOrganizing(false);
      setIsPreviewMode(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const handleDownloadOrganized = async () => {
    const zip = new JSZip();
    
    files.forEach(file => {
      const path = file.path.startsWith('/') ? file.path.substring(1) : file.path;
      let targetFolder = zip;
      
      if (path && path !== 'Uploaded') {
        const parts = path.split('/').filter(Boolean);
        let current = zip;
        for (const part of parts) {
          current = current.folder(part) || current;
        }
        targetFolder = current;
      }
      
      if (file.originalFile) {
        targetFolder.file(file.name, file.originalFile);
      } else {
        targetFolder.file(file.name, `Simulated content for ${file.name}`);
      }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `organized_files_${new Date().getTime()}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPreviewStructure = () => {
    const folders = new Set(files.map(f => f.path));
    return Array.from(folders).map(path => ({
      name: path === '/Uploaded' ? 'Root' : path.replace(/^\//, '').replace(/\//g, ' > '),
      count: files.filter(f => f.path === path).length,
      path
    })).sort((a, b) => a.name.localeCompare(b.name));
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Organize Workspace</h1>
          <p className="text-white/40 mt-2 text-lg">Automatically sort your files into a clean, logical structure.</p>
        </div>
        <div className="flex items-center gap-3">
          {files.length > 0 && (
            <>
              <button 
                onClick={() => setFiles([])}
                className="btn-secondary flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Clear
              </button>
              <button 
                onClick={handleDownloadOrganized}
                className="btn-secondary flex items-center gap-2"
              >
                <FolderPlus className="w-4 h-4" /> Download ZIP
              </button>
              <button 
                onClick={() => setIsPreviewMode(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Zap className="w-4 h-4" /> Organize Now
              </button>
            </>
          )}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upload & Rules */}
        <div className="lg:col-span-4 space-y-8">
          {/* Upload Area */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "glass-panel border-2 border-dashed p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer group",
              isDragging ? "border-accent bg-accent/5 scale-[0.98]" : "border-white/10 hover:border-white/20"
            )}
          >
            <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Upload className={cn("w-10 h-10 transition-colors", isDragging ? "text-accent" : "text-white/20")} />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Drop files or folders</h3>
            <p className="text-white/40 mt-3 max-w-xs text-sm font-medium">
              We'll scan your selection and prepare them for organization.
            </p>
            <div className="mt-8 flex flex-col w-full gap-3">
              <button className="w-full py-3 rounded-2xl bg-white text-charcoal font-bold text-sm hover:bg-white/90 transition-all shadow-xl shadow-white/5">
                Select Files
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const input = document.createElement('input');
                  input.type = 'file';
                  (input as any).webkitdirectory = true;
                  input.onchange = (ev: any) => handleFiles(ev.target.files);
                  input.click();
                }}
                className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 font-bold text-sm hover:bg-white/10 transition-all"
              >
                Select Folder
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="glass-panel p-8 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Filter className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-bold text-lg">Organization Rules</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Organize By</label>
                <div className="relative">
                  <select 
                    value={organizeBy}
                    onChange={(e) => setOrganizeBy(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-bold"
                  >
                    <option value="type">File Type (Extension)</option>
                    <option value="date">Date (Year/Month)</option>
                    <option value="size">Size (Small/Large)</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Naming Conflict</label>
                <div className="relative">
                  <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-bold">
                    <option>Add Suffix (e.g. file_1.pdf)</option>
                    <option>Skip Existing</option>
                    <option>Overwrite</option>
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: File List */}
        <div className="lg:col-span-8">
          <div className="glass-panel h-full flex flex-col overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="font-bold text-lg">Workspace Files</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  {files.length} Total
                </span>
                <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40")}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white/10 text-white" : "text-white/20 hover:text-white/40")}
                  >
                    <Folder className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {files.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                  <Folder className="w-20 h-20 mb-4" />
                  <p className="font-bold text-xl tracking-tight">No files in workspace</p>
                  <p className="text-sm mt-2">Upload files to start organizing</p>
                </div>
              ) : (
                <div className={cn(
                  "gap-4",
                  viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "flex flex-col"
                )}>
                  {files.map(file => (
                    <div 
                      key={file.id} 
                      className={cn(
                        "group transition-all border border-transparent hover:border-white/10",
                        viewMode === 'grid' 
                          ? "glass-panel p-5 flex flex-col items-center text-center" 
                          : "flex items-center justify-between p-4 rounded-2xl bg-white/5"
                      )}
                    >
                      <div className={cn(
                        "flex items-center gap-4",
                        viewMode === 'grid' ? "flex-col" : "flex-row"
                      )}>
                        <div className={cn(
                          "rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-white/5",
                          viewMode === 'grid' ? "w-16 h-16 mb-3" : "w-12 h-12"
                        )}>
                          {file.type.includes('image') ? <ImageIcon className="w-6 h-6 text-blue-400" /> : 
                           file.type.includes('code') ? <FileCode className="w-6 h-6 text-emerald-400" /> :
                           <FileText className="w-6 h-6 text-white/20" />}
                        </div>
                        <div className={cn(
                          "min-w-0",
                          viewMode === 'grid' ? "w-full" : ""
                        )}>
                          <p className="text-sm font-bold truncate tracking-tight">{file.name}</p>
                          <div className={cn(
                            "flex items-center gap-2 mt-1",
                            viewMode === 'grid' ? "justify-center" : ""
                          )}>
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{formatBytes(file.size)}</span>
                            <span className="w-1 h-1 rounded-full bg-white/10" />
                            <span className="text-[10px] font-bold text-accent uppercase tracking-widest truncate max-w-[100px]">{file.path}</span>
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        "flex items-center gap-2",
                        viewMode === 'grid' ? "mt-4 w-full justify-center" : ""
                      )}>
                        <button 
                          onClick={() => removeFile(file.id)}
                          className="p-2.5 rounded-xl text-white/10 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewMode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewMode(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-2xl bg-panel rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/2">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Organization Preview</h3>
                  <p className="text-white/40 text-sm mt-1 font-medium">Review the proposed folder structure.</p>
                </div>
                <button 
                  onClick={() => setIsPreviewMode(false)}
                  className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                >
                  <X className="w-6 h-6 text-white/40" />
                </button>
              </div>
              <div className="p-10">
                <div className="flex items-center justify-between gap-12 mb-12">
                  <div className="flex-1 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                      <Folder className="w-10 h-10 text-white/20" />
                    </div>
                    <p className="font-bold text-lg">Current</p>
                    <p className="text-xs text-white/30 mt-1 font-bold uppercase tracking-widest">{files.length} Files in root</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <ArrowRight className="w-10 h-10 text-accent animate-pulse" />
                    <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Sorting</span>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-accent/20 flex items-center justify-center mx-auto mb-4 border border-accent/20 shadow-xl shadow-accent/10">
                      <FolderPlus className="w-10 h-10 text-accent" />
                    </div>
                    <p className="font-bold text-lg">Proposed</p>
                    <p className="text-xs text-white/30 mt-1 font-bold uppercase tracking-widest">{getPreviewStructure().length} Folders</p>
                  </div>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-4">New Structure</p>
                  {getPreviewStructure().map((folder) => (
                    <div key={folder.path} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                          <Folder className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-sm font-bold tracking-tight">{folder.name}</span>
                      </div>
                      <span className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest">{folder.count} files</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-10 bg-white/2 flex items-center justify-end gap-4 border-t border-white/5">
                <button 
                  onClick={() => setIsPreviewMode(false)}
                  className="px-8 py-3 rounded-2xl text-sm font-bold hover:bg-white/5 transition-all text-white/40 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={startOrganizing}
                  disabled={isOrganizing}
                  className="px-10 py-4 rounded-2xl bg-accent hover:bg-accent-hover text-sm font-bold shadow-2xl shadow-accent/20 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isOrganizing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Organizing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Confirm & Move
                    </>
                  )}
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
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20"
          >
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight">Workspace organized successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
