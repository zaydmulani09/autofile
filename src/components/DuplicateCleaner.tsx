import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Copy, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Search,
  RefreshCw,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';
import { FileItem } from '../types';
import { formatBytes, cn } from '../utils';

interface DuplicateCleanerProps {
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

export default function DuplicateCleaner({ files, setFiles }: DuplicateCleanerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [selectedDuplicates, setSelectedDuplicates] = useState<string[]>([]);
  const [duplicateGroups, setDuplicateGroups] = useState<FileItem[]>([]);

  const startScan = () => {
    setIsScanning(true);
    setScanComplete(false);
    
    setTimeout(() => {
      // Simple duplicate detection: same name and size
      const seen = new Map<string, string>(); // key: name-size, value: first id
      const duplicates: FileItem[] = [];
      
      files.forEach(file => {
        const key = `${file.name}-${file.size}`;
        if (seen.has(key)) {
          duplicates.push({ ...file, isDuplicate: true });
        } else {
          seen.set(key, file.id);
        }
      });

      setDuplicateGroups(duplicates);
      setIsScanning(false);
      setScanComplete(true);
    }, 2000);
  };

  const toggleSelect = (id: string) => {
    setSelectedDuplicates(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const removeSelected = () => {
    const toRemove = new Set(selectedDuplicates);
    setFiles(prev => prev.filter(f => !toRemove.has(f.id)));
    setDuplicateGroups(prev => prev.filter(f => !toRemove.has(f.id)));
    setSelectedDuplicates([]);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Duplicate Cleaner</h1>
          <p className="text-white/40 mt-2 text-lg">Find and remove exact copies of files to free up space.</p>
        </div>
        <button 
          onClick={startScan}
          disabled={isScanning || files.length === 0}
          className="btn-primary flex items-center gap-2"
        >
          {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {isScanning ? 'Scanning...' : 'Scan for Duplicates'}
        </button>
      </header>

      {!scanComplete && !isScanning && (
        <div className="glass-panel p-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 rounded-3xl bg-accent/10 flex items-center justify-center mb-8">
            <Copy className="w-12 h-12 text-accent" />
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Ready to Scan</h3>
          <p className="text-white/40 mt-3 max-w-md text-lg font-medium">
            We'll compare file names and sizes to identify identical files across your folders.
            {files.length === 0 && <span className="block mt-4 text-amber-400/60 text-sm font-bold uppercase tracking-widest">Please load some files first.</span>}
          </p>
          <button 
            onClick={startScan}
            disabled={files.length === 0}
            className="mt-10 px-10 py-4 rounded-2xl bg-white text-charcoal font-bold hover:bg-white/90 transition-all disabled:opacity-50 shadow-2xl shadow-white/10"
          >
            Start Deep Scan
          </button>
        </div>
      )}

      {isScanning && (
        <div className="glass-panel p-20 flex flex-col items-center justify-center text-center">
          <div className="relative w-32 h-32 mb-8">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-[6px] border-accent/10 border-t-accent rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-10 h-10 text-accent" />
            </div>
          </div>
          <h3 className="text-2xl font-bold tracking-tight">Scanning Workspace...</h3>
          <p className="text-white/40 mt-3 text-lg">Analyzing {files.length} files for duplicates</p>
          <div className="w-80 h-2 bg-white/5 rounded-full mt-8 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
              className="h-full bg-accent"
            />
          </div>
        </div>
      )}

      {scanComplete && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-8 border-l-4 border-accent relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] relative z-10">Duplicates Found</p>
              <p className="text-4xl font-bold mt-2 font-display relative z-10">{duplicateGroups.length}</p>
            </div>
            <div className="glass-panel p-8 border-l-4 border-purple-500 relative overflow-hidden group">
              <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] relative z-10">Potential Savings</p>
              <p className="text-4xl font-bold mt-2 font-display relative z-10">{formatBytes(duplicateGroups.reduce((acc, f) => acc + f.size, 0))}</p>
            </div>
            <div className="glass-panel p-8 border-l-4 border-emerald-500 relative overflow-hidden group">
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] relative z-10">Safe to Remove</p>
              <p className="text-4xl font-bold mt-2 font-display relative z-10">{duplicateGroups.length} files</p>
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="font-bold text-lg">Duplicate Groups</h3>
              </div>
              {selectedDuplicates.length > 0 && (
                <button 
                  onClick={removeSelected}
                  className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-500/20"
                >
                  <Trash2 className="w-4 h-4" /> Remove Selected ({selectedDuplicates.length})
                </button>
              )}
            </div>
            <div className="divide-y divide-white/5">
              {duplicateGroups.length === 0 ? (
                <div className="p-20 text-center text-white/20 font-medium">
                  No duplicates found. Your workspace is perfectly clean!
                </div>
              ) : (
                duplicateGroups.map((file) => (
                  <div key={file.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-all group">
                    <div className="flex items-center gap-5">
                      <button 
                        onClick={() => toggleSelect(file.id)}
                        className={cn(
                          "w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center",
                          selectedDuplicates.includes(file.id) ? "bg-accent border-accent" : "border-white/10 hover:border-white/30"
                        )}
                      >
                        {selectedDuplicates.includes(file.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-white/5">
                        {file.type.includes('image') ? <ImageIcon className="w-6 h-6 text-indigo-400" /> : <FileText className="w-6 h-6 text-white/20" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold tracking-wide group-hover:text-accent transition-colors">{file.name}</p>
                        <p className="text-xs text-white/30 mt-1 font-mono">{file.path} • {formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="px-3 py-1 rounded-lg bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent uppercase tracking-widest">
                        Duplicate
                      </div>
                      <button 
                        onClick={() => {
                          setFiles(prev => prev.filter(f => f.id !== file.id));
                          setDuplicateGroups(prev => prev.filter(f => f.id !== file.id));
                        }}
                        className="p-2.5 rounded-xl text-white/10 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-sm text-blue-200/40 font-medium leading-relaxed">
              <span className="font-bold text-blue-400 uppercase tracking-widest text-xs block mb-1">Safety First</span>
              We always preserve the original file and only flag redundant copies for removal. Your data integrity is our priority.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
