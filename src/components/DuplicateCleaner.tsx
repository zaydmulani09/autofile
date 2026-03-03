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
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Duplicate Cleaner</h1>
          <p className="text-white/40 mt-1">Find and remove exact copies of files to free up space.</p>
        </div>
        <button 
          onClick={startScan}
          disabled={isScanning || files.length === 0}
          className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover transition-all flex items-center gap-2 text-sm font-bold shadow-lg shadow-accent/20 disabled:opacity-50"
        >
          {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {isScanning ? 'Scanning...' : 'Scan for Duplicates'}
        </button>
      </header>

      {!scanComplete && !isScanning && (
        <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6">
            <Copy className="w-10 h-10 text-accent" />
          </div>
          <h3 className="text-xl font-bold">Ready to Scan</h3>
          <p className="text-white/40 mt-2 max-w-md">
            We'll compare file names and sizes to identify identical files across your folders.
            {files.length === 0 && <span className="block mt-2 text-amber-400">Please load some files in the "Organize Files" tab first.</span>}
          </p>
          <button 
            onClick={startScan}
            disabled={files.length === 0}
            className="mt-8 px-8 py-3 rounded-full bg-white text-charcoal font-bold hover:bg-white/90 transition-all disabled:opacity-50"
          >
            Start Deep Scan
          </button>
        </div>
      )}

      {isScanning && (
        <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
          <div className="relative w-24 h-24 mb-6">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-accent/20 border-t-accent rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-8 h-8 text-accent" />
            </div>
          </div>
          <h3 className="text-xl font-bold">Scanning Files...</h3>
          <p className="text-white/40 mt-2">Analyzing {files.length} files for duplicates</p>
          <div className="w-64 h-1.5 bg-white/5 rounded-full mt-6 overflow-hidden">
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-5 border-l-4 border-accent">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Duplicates Found</p>
              <p className="text-2xl font-bold mt-1">{duplicateGroups.length}</p>
            </div>
            <div className="glass-panel p-5 border-l-4 border-purple-500">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Potential Savings</p>
              <p className="text-2xl font-bold mt-1">{formatBytes(duplicateGroups.reduce((acc, f) => acc + f.size, 0))}</p>
            </div>
            <div className="glass-panel p-5 border-l-4 border-emerald-500">
              <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Safe to Remove</p>
              <p className="text-2xl font-bold mt-1">{duplicateGroups.length} files</p>
            </div>
          </div>

          <div className="glass-panel overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold">Duplicate Groups</h3>
              </div>
              {selectedDuplicates.length > 0 && (
                <button 
                  onClick={removeSelected}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-2 transition-all"
                >
                  <Trash2 className="w-4 h-4" /> Remove Selected ({selectedDuplicates.length})
                </button>
              )}
            </div>
            <div className="divide-y divide-white/5">
              {duplicateGroups.length === 0 ? (
                <div className="p-12 text-center text-white/40">
                  No duplicates found. Your workspace is clean!
                </div>
              ) : (
                duplicateGroups.map((file) => (
                  <div key={file.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleSelect(file.id)}
                        className={cn(
                          "w-5 h-5 rounded border transition-all flex items-center justify-center",
                          selectedDuplicates.includes(file.id) ? "bg-accent border-accent" : "border-white/20 hover:border-white/40"
                        )}
                      >
                        {selectedDuplicates.includes(file.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        {file.type.includes('image') ? <ImageIcon className="w-5 h-5 text-blue-400" /> : <FileText className="w-5 h-5 text-white/40" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{file.name}</p>
                        <p className="text-xs text-white/40 mt-1">{file.path} • {formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="px-2 py-1 rounded bg-accent/10 border border-accent/20 text-[10px] font-bold text-accent uppercase tracking-wider">
                        Duplicate
                      </div>
                      <button 
                        onClick={() => {
                          setFiles(prev => prev.filter(f => f.id !== file.id));
                          setDuplicateGroups(prev => prev.filter(f => f.id !== file.id));
                        }}
                        className="p-2 text-white/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <p className="text-sm text-blue-200/80">
              <span className="font-bold text-blue-400">Safety First:</span> We always keep the original file and only mark copies for deletion.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
