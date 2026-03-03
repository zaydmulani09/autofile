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
      <header>
        <h1 className="text-3xl font-bold tracking-tight">File Analytics</h1>
        <p className="text-white/40 mt-1">Deep insights into your storage distribution and file habits.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-lg">File Growth</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold">
                  <ArrowUpRight className="w-4 h-4" /> +12%
                </div>
                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs focus:outline-none">
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
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#ffffff20" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #ffffff10', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6">
              <h3 className="font-bold mb-4">Oldest Files</h3>
              <div className="space-y-4">
                {oldestFiles.length > 0 ? oldestFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white/40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]">{file.name}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">
                          Modified {new Date(file.lastModified).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-white/20 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="w-4 h-4 text-accent" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-white/20 italic">No files loaded yet</p>
                )}
              </div>
            </div>
            <div className="glass-panel p-6">
              <h3 className="font-bold mb-4">Largest Files</h3>
              <div className="space-y-4">
                {largestFiles.length > 0 ? largestFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center">
                        <HardDrive className="w-4 h-4 text-white/40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]">{file.name}</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">{formatBytes(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-white/20 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="w-4 h-4 text-accent" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-white/20 italic">No files loaded yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="font-bold mb-6">Type Distribution</h3>
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
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #ffffff10', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-6">
              {fileTypeData.map((type) => (
                <div key={type.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">{type.name}</span>
                    <span className="font-bold">{type.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ width: `${type.percentage}%`, backgroundColor: type.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 bg-accent/5 border-accent/20">
            <TrendingUp className="w-6 h-6 text-accent mb-4" />
            <h3 className="font-bold mb-2">Optimization Tip</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              You have over <span className="text-white font-bold">{formatBytes(totalSize * 0.15)}</span> of temporary files that haven't been accessed in 6 months. Running a cleanup could save significant space.
            </p>
            <button className="mt-4 w-full py-2 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent-hover transition-all">
              Optimize Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
