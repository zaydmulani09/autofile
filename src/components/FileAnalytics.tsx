import React from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Calendar, 
  HardDrive, 
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Trash2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { FileItem } from '../types';
import { formatBytes, cn } from '../utils';

interface FileAnalyticsProps {
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

export default function FileAnalytics({ files, setFiles }: FileAnalyticsProps) {
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const totalFiles = files.length;
  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  const fileTypeData = [
    { name: 'Images', value: files.filter(f => f.type.includes('image')).length, color: '#3b82f6' },
    { name: 'Videos', value: files.filter(f => f.type.includes('video')).length, color: '#a855f7' },
    { name: 'Documents', value: files.filter(f => f.type.includes('pdf') || f.type.includes('word')).length, color: '#ef4444' },
    { name: 'Code', value: files.filter(f => f.type.includes('text') || f.type.includes('code')).length, color: '#10b981' },
    { name: 'Others', value: files.filter(f => !f.type.includes('image') && !f.type.includes('video') && !f.type.includes('pdf') && !f.type.includes('text')).length, color: '#f59e0b' },
  ].map(type => ({
    ...type,
    percentage: totalFiles > 0 ? Math.round((type.value / totalFiles) * 100) : 0
  }));

  const oldestFiles = [...files].sort((a, b) => a.lastModified - b.lastModified).slice(0, 3);
  const largestFiles = [...files].sort((a, b) => b.size - a.size).slice(0, 3);

  const distributionData = [
    { name: 'Jan', count: 400 },
    { name: 'Feb', count: 300 },
    { name: 'Mar', count: 600 },
    { name: 'Apr', count: 800 },
    { name: 'May', count: 500 },
    { name: 'Jun', count: 900 },
  ];

  return (
    <div className="space-y-8">
      <header className="border-b border-white/10 pb-8">
        <div className="flex items-center gap-2 mb-2 opacity-60">
          <div className="w-8 h-px bg-white"></div>
          <span className="text-white text-[10px] font-mono tracking-wider">009</span>
          <div className="flex-1 h-px bg-white"></div>
        </div>
        <h1 className="text-4xl font-bold tracking-widest uppercase italic transform -skew-x-12">Data Intelligence</h1>
        <p className="text-white/40 mt-4 text-sm font-mono uppercase tracking-widest">Deep insights into your storage distribution and file habits.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-8 rounded-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg uppercase tracking-widest font-mono italic">File Growth</h3>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-white text-[10px] font-mono font-bold uppercase tracking-widest">
                  <ArrowUpRight className="w-3 h-3" /> +12% DELTA
                </div>
                <select className="bg-white/5 border border-white/10 rounded-none px-4 py-2 text-[10px] font-mono uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-white/50 transition-all font-bold">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    fontFamily="JetBrains Mono"
                  />
                  <YAxis 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    fontFamily="JetBrains Mono"
                  />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '0px', fontFamily: 'JetBrains Mono', fontSize: '10px', textTransform: 'uppercase' }}
                  />
                  <Bar dataKey="count" fill="#ffffff" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-8 rounded-none relative overflow-hidden">
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
              <h3 className="font-bold mb-6 uppercase tracking-widest font-mono italic text-sm">Oldest Files</h3>
              <div className="space-y-6">
                {oldestFiles.length > 0 ? oldestFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between group cursor-pointer border-b border-white/5 pb-4 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-none bg-white/5 border border-white/10 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white/40" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest font-mono truncate max-w-[150px]">{file.name}</p>
                        <p className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-mono mt-1">
                          MODIFIED {new Date(file.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-white/20 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 border border-white/10">
                        <ArrowUpRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="text-[10px] text-white/20 uppercase tracking-widest font-mono italic">No files loaded yet</p>
                )}
              </div>
            </div>
            <div className="glass-panel p-8 rounded-none relative overflow-hidden">
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
              <h3 className="font-bold mb-6 uppercase tracking-widest font-mono italic text-sm">Largest Files</h3>
              <div className="space-y-6">
                {largestFiles.length > 0 ? largestFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between group cursor-pointer border-b border-white/5 pb-4 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-none bg-white/5 border border-white/10 flex items-center justify-center">
                        <HardDrive className="w-4 h-4 text-white/40" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest font-mono truncate max-w-[150px]">{file.name}</p>
                        <p className="text-[8px] text-white/20 uppercase tracking-[0.2em] font-mono mt-1">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-white/20 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 border border-white/10">
                        <ArrowUpRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="text-[10px] text-white/20 uppercase tracking-widest font-mono italic">No files loaded yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
            <h3 className="font-bold mb-8 uppercase tracking-widest font-mono italic text-sm">Type Distribution</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fileTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {fileTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ffffff' : '#ffffff20'} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '0px', fontFamily: 'JetBrains Mono', fontSize: '10px', textTransform: 'uppercase' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4 mt-8">
              {fileTypeData.map((type) => (
                <div key={type.name} className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest">
                    <span className="text-white/60">{type.name}</span>
                    <span className="font-bold">{type.percentage}%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-none overflow-hidden">
                    <div 
                      className="h-full rounded-none bg-white" 
                      style={{ width: `${type.percentage}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-8 bg-white/5 border-white/20 rounded-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/40" />
            <TrendingUp className="w-6 h-6 text-white mb-6" />
            <h3 className="font-bold mb-4 uppercase tracking-widest font-mono italic text-sm">Optimization Tip</h3>
            <p className="text-[10px] text-white/60 leading-relaxed font-mono uppercase tracking-widest">
              You have over <span className="text-white font-bold">{formatBytes(totalSize * 0.15)}</span> of temporary files that haven't been accessed in 6 months. Running a cleanup could save significant space.
            </p>
            <button className="mt-8 w-full py-4 rounded-none bg-white text-black text-[10px] font-bold uppercase tracking-widest font-mono hover:bg-white/90 transition-all">
              Optimize Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
