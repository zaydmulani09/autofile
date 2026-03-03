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
      const folder = zip.folder("Renamed_Files");
      
      files.forEach((file, index) => {
        const renamedName = getPreviewName(file.name, index);
        // Since we don't have real file content in this demo, 
        // we create a placeholder text file with metadata
        const content = `File: ${file.name}\nRenamed to: ${renamedName}\nSize: ${file.size} bytes\nType: ${file.type}\nLast Modified: ${new Date(file.lastModified).toLocaleString()}`;
        folder?.file(renamedName, content);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `organized_files_${new Date().getTime()}.zip`;
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
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Rename</h1>
        <p className="text-white/40 mt-1">Apply powerful naming patterns to hundreds of files instantly.</p>
      </header>

      {files.length === 0 ? (
        <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
            <Type className="w-10 h-10 text-accent" />
          </div>
          <h3 className="text-xl font-bold">No Files Loaded</h3>
          <p className="text-white/40 mt-2 max-w-md">
            Please load some files in the "Organize Files" tab to start bulk renaming.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Type className="w-5 h-5 text-accent" />
                <h3 className="font-bold">Naming Pattern</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Base Name</label>
                  <input 
                    type="text" 
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="e.g. Vacation_2024"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-white/40" />
                    <span className="text-sm font-medium">Include Date</span>
                  </div>
                  <button 
                    onClick={() => setIncludeDate(!includeDate)}
                    className={cn(
                      "w-10 h-5 rounded-full transition-colors relative",
                      includeDate ? "bg-accent" : "bg-white/10"
                    )}
                  >
                    <motion.div 
                      animate={{ x: includeDate ? 22 : 2 }}
                      className="absolute top-1 w-3 h-3 bg-white rounded-full"
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Starting Number</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/20 uppercase">Padding</span>
                      <select 
                        value={padding}
                        onChange={(e) => setPadding(parseInt(e.target.value))}
                        className="bg-white/5 border border-white/10 rounded px-1 text-[10px] focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setStartNumber(Math.max(0, startNumber - 1))}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center font-bold">
                      {startNumber}
                    </div>
                    <button 
                      onClick={() => setStartNumber(startNumber + 1)}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Case Transformation</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['original', 'lower', 'upper', 'camel'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setCaseType(type)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-xs font-bold border transition-all capitalize",
                          caseType === type ? "bg-accent border-accent text-white" : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleRename}
                  disabled={isRenaming}
                  className="py-4 rounded-2xl bg-accent hover:bg-accent-hover text-white font-bold shadow-lg shadow-accent/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isRenaming ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                  Apply
                </button>
                <button 
                  onClick={handleDownloadAll}
                  disabled={isDownloading}
                  className="py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isDownloading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <FolderDown className="w-5 h-5" />}
                  Download ZIP
                </button>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0" />
                <p className="text-[10px] text-blue-200/60 leading-relaxed">
                  The ZIP download will package all files into a single folder. Since this is a demo, files will contain metadata descriptions.
                </p>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-2">
            <div className="glass-panel h-full flex flex-col">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold">Live Preview</h3>
                <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{files.length} Files Selected</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                {files.map((file, i) => (
                  <div key={file.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/40 truncate">{file.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <ChevronRight className="w-3 h-3 text-accent" />
                        <p className="text-sm font-bold text-white truncate">{getPreviewName(file.name, i)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="hidden group-hover:block">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-white/20 hover:text-red-400 transition-colors"
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
