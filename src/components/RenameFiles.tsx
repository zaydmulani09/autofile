import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { 
  Type, 
  Hash, 
  Calendar, 
  Plus, 
  Minus, 
  Play, 
  RefreshCw, 
  CheckCircle2,
  Settings2,
  FileText,
  ChevronRight,
  Trash2,
  Download,
  FolderDown,
  Info
} from 'lucide-react';
import { FileItem } from '../types';
import { cn } from '../utils';

interface RenameFilesProps {
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

export default function RenameFiles({ files, setFiles }: RenameFilesProps) {
  const [pattern, setPattern] = useState('Project_Name');
  const [startNumber, setStartNumber] = useState(1);
  const [includeDate, setIncludeDate] = useState(true);
  const [caseType, setCaseType] = useState<'original' | 'lower' | 'upper' | 'camel'>('original');
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [padding, setPadding] = useState(1);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const getPreviewName = (originalName: string, index: number) => {
    let name = pattern;
    if (includeDate) {
      const date = new Date().toISOString().split('T')[0];
      name += `_${date}`;
    }
    const num = (startNumber + index).toString().padStart(padding, '0');
    name += `_${num}`;

    const ext = originalName.split('.').pop();
    
    switch (caseType) {
      case 'lower': name = name.toLowerCase(); break;
      case 'upper': name = name.toUpperCase(); break;
      case 'camel': name = name.replace(/([-_][a-z])/g, group => group.toUpperCase().replace('-', '').replace('_', '')); break;
    }

    return `${name}.${ext}`;
  };

  const handleRename = () => {
    setIsRenaming(true);
    setTimeout(() => {
      const newFiles = files.map((file, index) => ({
        ...file,
        name: getPreviewName(file.name, index)
      }));
      setFiles(newFiles);
      setIsRenaming(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Use the current name which might have been renamed by handleRename
        const renamedName = file.name;
        
        // Respect the path if it exists (remove leading slash for JSZip)
        const path = file.path.startsWith('/') ? file.path.substring(1) : file.path;
        
        let targetFolder = zip;
        if (path && path !== 'Uploaded') {
          const pathParts = path.split('/').filter(Boolean);
          let currentFolder = zip;
          for (const part of pathParts) {
            currentFolder = currentFolder.folder(part) || currentFolder;
          }
          targetFolder = currentFolder;
        }
        
        if (file.originalFile) {
          targetFolder.file(renamedName, file.originalFile);
        } else {
          const content = `File: ${file.name}\nSize: ${file.size} bytes\nType: ${file.type}\nLast Modified: ${new Date(file.lastModified).toLocaleString()}`;
          targetFolder.file(renamedName, content);
        }
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `organized_workspace_${new Date().getTime()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Rename Files</h1>
          <p className="text-white/40 mt-2 text-lg">Bulk rename your files with powerful sequential patterns.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRename}
            disabled={isRenaming || files.length === 0}
            className="btn-secondary flex items-center gap-2"
          >
            {isRenaming ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Apply Rename
          </button>
          <button 
            onClick={handleDownloadAll}
            disabled={isDownloading || files.length === 0}
            className="btn-primary flex items-center gap-2"
          >
            {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download ZIP
          </button>
        </div>
      </header>

      {files.length === 0 ? (
        <div className="glass-panel p-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-3xl bg-accent/10 flex items-center justify-center mb-8">
            <Type className="w-12 h-12 text-accent" />
          </div>
          <h3 className="text-2xl font-bold">No Files Loaded</h3>
          <p className="text-white/40 mt-3 max-w-md text-lg">
            Please load some files in the "Organize Files" tab to start bulk renaming.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Configuration */}
          <div className="lg:col-span-4 space-y-8">
            <div className="glass-panel p-8 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Settings2 className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-bold text-lg">Configuration</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Base Name</label>
                  <input 
                    type="text" 
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="e.g. Vacation_2024"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-medium"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-white/30" />
                    <span className="text-sm font-bold text-white/60">Include Date</span>
                  </div>
                  <button 
                    onClick={() => setIncludeDate(!includeDate)}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative",
                      includeDate ? "bg-accent" : "bg-white/10"
                    )}
                  >
                    <motion.div 
                      animate={{ x: includeDate ? 26 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Starting Number</label>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Padding</span>
                      <select 
                        value={padding}
                        onChange={(e) => setPadding(parseInt(e.target.value))}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setStartNumber(Math.max(0, startNumber - 1))}
                      className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl h-12 flex items-center justify-center font-mono font-bold text-lg">
                      {startNumber}
                    </div>
                    <button 
                      onClick={() => setStartNumber(startNumber + 1)}
                      className="w-12 h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Case Transformation</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['original', 'lower', 'upper', 'camel'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setCaseType(type)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-xs font-bold border transition-all capitalize tracking-wide",
                          caseType === type ? "bg-accent border-accent text-white shadow-lg shadow-accent/20" : "bg-white/5 border-white/10 text-white/30 hover:text-white hover:border-white/20"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
                <Info className="w-6 h-6 text-blue-400 shrink-0" />
                <p className="text-[11px] text-blue-200/40 leading-relaxed font-medium">
                  The ZIP download will preserve your organized folder structure. Renaming is applied sequentially based on the current file order.
                </p>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-8">
            <div className="glass-panel h-full flex flex-col overflow-hidden">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Play className="w-5 h-5 text-emerald-500" />
                  </div>
                  <h3 className="font-bold text-lg">Live Preview</h3>
                </div>
                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  {files.length} Files
                </span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                {files.map((file, i) => (
                  <div key={file.id} className="flex items-center gap-5 p-4 rounded-2xl bg-white/5 border border-transparent group hover:border-white/10 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-white/5">
                      <FileText className="w-6 h-6 text-white/20" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white/20 truncate tracking-wide">{file.name}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <ChevronRight className="w-4 h-4 text-accent" />
                        <p className="text-sm font-bold text-white truncate tracking-tight">{getPreviewName(file.name, i)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden group-hover:block">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500/50" />
                      </div>
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="p-2.5 rounded-xl text-white/10 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
            <span className="font-bold">Files renamed successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
