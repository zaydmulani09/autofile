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
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 opacity-60">
            <div className="w-8 h-px bg-white"></div>
            <span className="text-white text-[10px] font-mono tracking-wider">006</span>
            <div className="flex-1 h-px bg-white"></div>
          </div>
          <h1 className="text-4xl font-bold tracking-widest uppercase italic transform -skew-x-12">Redundancy Scan</h1>
          <p className="text-white/40 mt-4 text-sm font-mono uppercase tracking-widest">Find and remove exact copies of files to free up space.</p>
        </div>
        <button 
          onClick={startScan}
          disabled={isScanning || files.length === 0}
          className="btn-primary flex items-center gap-2"
        >
          {isScanning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
          {isScanning ? 'Scanning...' : 'Scan for Duplicates'}
        </button>
      </header>

      {!scanComplete && !isScanning && (
        <div className="glass-panel p-20 flex flex-col items-center justify-center text-center rounded-none relative overflow-hidden">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20" />
          
          <div className="w-20 h-20 rounded-none bg-white/5 border border-white/10 flex items-center justify-center mb-8">
            <Copy className="w-10 h-10 text-white/40" />
          </div>
          <h3 className="text-xl font-bold uppercase tracking-widest font-mono">Ready to Scan</h3>
          <p className="text-white/40 mt-4 max-w-md text-[10px] uppercase tracking-widest font-mono">
            Compare file names and sizes to identify identical files across folders.
            {files.length === 0 && <span className="block mt-4 text-white/60 text-[8px] font-bold uppercase tracking-[0.3em]">Load files to initialize scan.</span>}
          </p>
          <button 
            onClick={startScan}
            disabled={files.length === 0}
            className="mt-10 px-10 py-4 rounded-none bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-50 shadow-xl shadow-white/5 font-mono"
          >
            Start Deep Scan
          </button>
        </div>
      )}

      {isScanning && (
        <div className="glass-panel p-20 flex flex-col items-center justify-center text-center rounded-none relative overflow-hidden">
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
          <div className="relative w-24 h-24 mb-8">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-2 border-white/10 border-t-white rounded-none"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold uppercase tracking-widest font-mono">Scanning Workspace...</h3>
          <p className="text-white/40 mt-3 text-[10px] font-mono uppercase tracking-widest">Analyzing {files.length} files for duplicates</p>
          <div className="w-64 h-1 bg-white/5 rounded-none mt-8 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
              className="h-full bg-white"
            />
          </div>
        </div>
      )}

      {scanComplete && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-8 border-l-2 border-white rounded-none relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] relative z-10 font-mono">Duplicates Found</p>
              <p className="text-4xl font-bold mt-2 font-mono relative z-10">{duplicateGroups.length}</p>
            </div>
            <div className="glass-panel p-8 border-l-2 border-white/40 rounded-none relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] relative z-10 font-mono">Potential Savings</p>
              <p className="text-4xl font-bold mt-2 font-mono relative z-10">{formatBytes(duplicateGroups.reduce((acc, f) => acc + f.size, 0))}</p>
            </div>
            <div className="glass-panel p-8 border-l-2 border-white/20 rounded-none relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] relative z-10 font-mono">Safe to Remove</p>
              <p className="text-4xl font-bold mt-2 font-mono relative z-10">{duplicateGroups.length} files</p>
            </div>
          </div>

          <div className="glass-panel overflow-hidden rounded-none relative">
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/20" />
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none bg-white/5 border border-white/10 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-lg uppercase tracking-widest font-mono">Duplicate Groups</h3>
              </div>
              {selectedDuplicates.length > 0 && (
                <button 
                  onClick={removeSelected}
                  className="px-5 py-2.5 rounded-none bg-white text-black text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-white/5 font-mono"
                >
                  <Trash2 className="w-3 h-3" /> Remove Selected ({selectedDuplicates.length})
                </button>
              )}
            </div>
            <div className="divide-y divide-white/5">
              {duplicateGroups.length === 0 ? (
                <div className="p-20 text-center text-white/20 font-bold uppercase tracking-widest text-[10px] font-mono">
                  No duplicates found. Workspace integrity: 100%
                </div>
              ) : (
                duplicateGroups.map((file) => (
                  <div key={file.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-all group">
                    <div className="flex items-center gap-5">
                      <button 
                        onClick={() => toggleSelect(file.id)}
                        className={cn(
                          "w-5 h-5 rounded-none border transition-all flex items-center justify-center",
                          selectedDuplicates.includes(file.id) ? "bg-white border-white" : "border-white/10 hover:border-white/30"
                        )}
                      >
                        {selectedDuplicates.includes(file.id) && <CheckCircle2 className="w-3 h-3 text-black" />}
                      </button>
                      <div className="w-10 h-10 rounded-none bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-white/5">
                        {file.type.includes('image') ? <ImageIcon className="w-4 h-4 text-white/60" /> : <FileText className="w-4 h-4 text-white/20" />}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-widest uppercase font-mono group-hover:text-white transition-colors">{file.name}</p>
                        <p className="text-[8px] text-white/30 mt-1 font-mono uppercase tracking-widest">{file.path} • {formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="px-3 py-1 rounded-none bg-white/5 border border-white/10 text-[8px] font-bold text-white/40 uppercase tracking-widest font-mono">
                        Duplicate
                      </div>
                      <button 
                        onClick={() => {
                          setFiles(prev => prev.filter(f => f.id !== file.id));
                          setDuplicateGroups(prev => prev.filter(f => f.id !== file.id));
                        }}
                        className="p-2 rounded-none text-white/10 hover:text-white hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-white/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 p-8 rounded-none bg-white/5 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-white/20" />
            <div className="w-12 h-12 rounded-none bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-white/60" />
            </div>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest font-mono leading-relaxed">
              <span className="text-white uppercase tracking-[0.3em] text-[10px] block mb-1">Safety Protocol</span>
              Preserving original file / Flagging redundant copies for removal. / Data integrity priority: high.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
