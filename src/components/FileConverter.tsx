import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  File, 
  ArrowRight, 
  Download, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  FileVideo,
  FileImage,
  FileText,
  Loader2
} from 'lucide-react';
import { cn } from '../utils';

interface ConversionTask {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  targetFormat: string;
  resultUrl?: string;
  error?: string;
  originalSize: number;
  resultSize?: number;
  expiresAt?: number;
}

const SUPPORTED_FORMATS: Record<string, string[]> = {
  image: ['png', 'jpg', 'webp', 'gif', 'avif'],
  video: ['mp4', 'webm', 'mov', 'avi'],
  document: ['pdf', 'docx', 'txt']
};

export default function FileConverter() {
  const [tasks, setTasks] = useState<ConversionTask[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, []);

  const addFiles = (files: File[]) => {
    const newTasks: ConversionTask[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0,
      targetFormat: '',
      originalSize: file.size
    }));
    setTasks(prev => [...prev, ...newTasks]);
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const startConversion = async (task: ConversionTask) => {
    if (!task.targetFormat) return;

    setTasks(prev => prev.map(t => 
      t.id === task.id ? { ...t, status: 'processing', progress: 0 } : t
    ));

    const formData = new FormData();
    formData.append('file', task.file);
    formData.append('targetFormat', task.targetFormat);

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Conversion failed');

      const data = await response.json();
      
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { 
          ...t, 
          status: 'completed', 
          progress: 100, 
          resultUrl: data.url,
          resultSize: data.size,
          expiresAt: Date.now() + 3600000 // 1 hour
        } : t
      ));
    } catch (err: any) {
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, status: 'error', error: err.message } : t
      ));
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className="w-6 h-6" />;
    if (type.startsWith('video/')) return <FileVideo className="w-6 h-6" />;
    return <FileText className="w-6 h-6" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 opacity-60">
            <div className="w-4 h-px bg-white"></div>
            <span className="text-white text-[8px] font-mono tracking-wider">011</span>
          </div>
          <h2 className="text-2xl font-bold tracking-widest uppercase italic transform -skew-x-12 font-mono">Universal Converter</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-[8px] font-mono uppercase tracking-widest text-white/40">
            <Clock className="w-3 h-3" />
            Auto-Delete: 60M
          </div>
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative border-2 border-dashed transition-all duration-300 p-12 flex flex-col items-center justify-center gap-4 group cursor-pointer",
          isDragging ? "border-white bg-white/10" : "border-white/10 bg-white/2 hover:border-white/30 hover:bg-white/5"
        )}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
        />
        <div className="w-16 h-16 rounded-none bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8 text-white/40 group-hover:text-white" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold tracking-widest uppercase font-mono italic">Initialize Upload Sequence</p>
          <p className="text-[10px] mt-2 font-mono uppercase tracking-widest opacity-30">Drag and drop files or click to browse (Max 500MB)</p>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/2 border border-white/10 p-6 relative overflow-hidden group"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* File Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {getFileIcon(task.file.type)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[10px] font-bold font-mono uppercase tracking-widest truncate text-white/80">
                      {task.file.name}
                    </h3>
                    <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest mt-1">
                      {formatSize(task.originalSize)} • {task.file.type.split('/')[1]?.toUpperCase() || 'UNKNOWN'}
                    </p>
                  </div>
                </div>

                {/* Conversion Logic */}
                <div className="flex items-center gap-4">
                  {task.status === 'pending' && (
                    <>
                      <ArrowRight className="w-4 h-4 text-white/20" />
                      <select
                        value={task.targetFormat}
                        onChange={(e) => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, targetFormat: e.target.value } : t))}
                        className="bg-black border border-white/10 text-[10px] font-mono uppercase tracking-widest px-3 py-2 focus:outline-none focus:ring-1 focus:ring-white/50"
                      >
                        <option value="">Select Format</option>
                        {task.file.type.startsWith('image/') && SUPPORTED_FORMATS.image.map(f => (
                          <option key={f} value={f}>{f.toUpperCase()}</option>
                        ))}
                        {task.file.type.startsWith('video/') && SUPPORTED_FORMATS.video.map(f => (
                          <option key={f} value={f}>{f.toUpperCase()}</option>
                        ))}
                        {(task.file.type.includes('pdf') || task.file.type.includes('word') || task.file.type.includes('text')) && SUPPORTED_FORMATS.document.map(f => (
                          <option key={f} value={f}>{f.toUpperCase()}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => startConversion(task)}
                        disabled={!task.targetFormat}
                        className="px-4 py-2 bg-white text-black text-[10px] font-mono font-bold uppercase tracking-widest disabled:opacity-30 hover:scale-105 transition-transform"
                      >
                        Convert
                      </button>
                    </>
                  )}

                  {task.status === 'processing' && (
                    <div className="flex items-center gap-3 text-white/40">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">Processing...</span>
                    </div>
                  )}

                  {task.status === 'completed' && (
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Result Size</p>
                        <p className="text-[10px] font-mono font-bold text-white/80">{formatSize(task.resultSize || 0)}</p>
                      </div>
                      <a
                        href={task.resultUrl}
                        download
                        className="px-4 py-2 bg-white text-black text-[10px] font-mono font-bold uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </a>
                    </div>
                  )}

                  {task.status === 'error' && (
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">Error</span>
                    </div>
                  )}

                  <button
                    onClick={() => removeTask(task.id)}
                    className="p-2 text-white/10 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              {task.status === 'processing' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${task.progress}%` }}
                    className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  />
                </div>
              )}

              {/* Expiry Countdown */}
              {task.status === 'completed' && task.expiresAt && (
                <div className="absolute top-0 right-0 px-3 py-1 bg-white/5 border-l border-b border-white/10 text-[8px] font-mono uppercase tracking-widest text-white/20">
                  Expires in: {Math.max(0, Math.floor((task.expiresAt - Date.now()) / 60000))}M
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-white/10 border border-white/5 bg-white/2">
            <RefreshCw className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-[10px] font-mono uppercase tracking-[0.2em]">Queue Empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
