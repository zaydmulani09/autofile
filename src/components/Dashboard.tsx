import React from 'react';
import { motion } from 'motion/react';
import { 
  Files, 
  HardDrive, 
  Copy, 
  Zap, 
  ArrowUpRight, 
  Clock, 
  FileText, 
  Image as ImageIcon, 
  FileCode, 
  MoreHorizontal,
  FolderTree,
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
  AreaChart,
  Area
} from 'recharts';
import { FileItem, SmartRule } from '../types';
import { formatBytes, formatDate, cn } from '../utils';

interface DashboardProps {
  files: FileItem[];
  rules: SmartRule[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

import { useAuth } from '../contexts/AuthContext';

export default function Dashboard({ files, rules, setFiles }: DashboardProps) {
  const { user } = useAuth();
  
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);
  const duplicates = files.filter(f => f.isDuplicate).length;
  const activeRulesCount = rules.filter(r => r.enabled).length;
  
  const fileTypeData = [
    { name: 'Documents', value: files.filter(f => f.type.includes('pdf') || f.type.includes('word') || f.type.includes('sheet')).length, color: '#6366f1' },
    { name: 'Images', value: files.filter(f => f.type.includes('image')).length, color: '#ec4899' },
    { name: 'Code', value: files.filter(f => f.type.includes('text') || f.type.includes('code')).length, color: '#10b981' },
    { name: 'Others', value: files.filter(f => !f.type.includes('pdf') && !f.type.includes('image') && !f.type.includes('text')).length, color: '#f59e0b' },
  ];

  const storageHistory = [
    { name: 'Mon', size: 45 },
    { name: 'Tue', size: 52 },
    { name: 'Wed', size: 48 },
    { name: 'Thu', size: 61 },
    { name: 'Fri', size: 55 },
    { name: 'Sat', size: 67 },
    { name: 'Sun', size: 64 },
  ];

  const stats = [
    { label: 'Total Files', value: files.length, icon: Files, color: 'text-indigo-400', bg: 'bg-indigo-400/10', gradient: 'from-indigo-500/20 to-transparent' },
    { label: 'Storage Used', value: formatBytes(totalSize), icon: HardDrive, color: 'text-pink-400', bg: 'bg-pink-400/10', gradient: 'from-pink-500/20 to-transparent' },
    { label: 'Duplicates', value: duplicates, icon: Copy, color: 'text-emerald-400', bg: 'bg-emerald-400/10', gradient: 'from-emerald-500/20 to-transparent' },
    { label: 'Active Rules', value: activeRulesCount, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10', gradient: 'from-amber-500/20 to-transparent' },
  ];

  const recentFiles = [...files].sort((a, b) => b.lastModified - a.lastModified).slice(0, 5);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">
            Dashboard
          </h1>
          <p className="text-white/40 mt-2 text-lg">
            Welcome back, <span className="text-white font-medium">{user?.name || 'Guest'}</span>. Your digital workspace is optimized.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-white/60 uppercase tracking-widest">System Active</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-6 flex flex-col gap-4 group hover:border-white/20 transition-all cursor-default relative overflow-hidden"
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", stat.gradient)} />
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 relative z-10", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-3xl font-bold mt-1 font-display">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Storage Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 lg:col-span-8 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="font-bold text-xl">Storage Analytics</h3>
              <p className="text-sm text-white/30">Visualizing your data growth patterns</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2">
              Full Report <ArrowUpRight className="w-4 h-4 text-accent" />
            </button>
          </div>
          <div className="h-[320px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={storageHistory}>
                <defs>
                  <linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff10" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#ffffff40' }}
                />
                <YAxis 
                  stroke="#ffffff10" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `${val}GB`}
                  tick={{ fill: '#ffffff40' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="size" 
                  stroke="#6366f1" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSize)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* File Type Distribution */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 lg:col-span-4"
        >
          <h3 className="font-bold text-xl mb-8">Distribution</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fileTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {fileTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 10, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4 mt-6">
            {fileTypeData.map((type) => (
              <div key={type.name} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-transparent hover:border-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.3)]" style={{ backgroundColor: type.color }} />
                  <span className="text-sm font-medium text-white/60">{type.name}</span>
                </div>
                <span className="text-sm font-bold font-mono">{type.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel overflow-hidden lg:col-span-7"
        >
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-bold text-lg">Recent Activity</h3>
            </div>
            <button className="p-2 hover:bg-white/5 rounded-xl transition-colors text-white/20 hover:text-white">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {recentFiles.map((file) => (
              <div key={file.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-white/5 group-hover:border-white/10">
                    {file.type.includes('image') ? <ImageIcon className="w-6 h-6 text-indigo-400" /> : 
                     file.type.includes('pdf') ? <FileText className="w-6 h-6 text-pink-400" /> :
                     <FileCode className="w-6 h-6 text-emerald-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-wide group-hover:text-accent transition-colors">{file.name}</p>
                    <p className="text-xs text-white/30 mt-1 font-mono">{file.path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-white/60">{formatDate(file.lastModified)}</p>
                    <p className="text-[10px] text-white/20 mt-1 uppercase tracking-[0.2em] font-mono">{formatBytes(file.size)}</p>
                  </div>
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
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-8 lg:col-span-5"
        >
          <h3 className="font-bold text-lg mb-8">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-6">
            <button className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all flex flex-col items-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-2xl shadow-indigo-500/40 group-hover:scale-110 transition-transform group-hover:rotate-6">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-bold tracking-wide">Run Rules</span>
            </button>
            <button className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all flex flex-col items-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40 group-hover:scale-110 transition-transform group-hover:-rotate-6">
                <Copy className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-bold tracking-wide">Scan Dups</span>
            </button>
            <button className="p-6 rounded-3xl bg-pink-500/5 border border-pink-500/10 hover:bg-pink-500/10 hover:border-pink-500/30 transition-all flex flex-col items-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-pink-500 flex items-center justify-center shadow-2xl shadow-pink-500/40 group-hover:scale-110 transition-transform group-hover:rotate-6">
                <FolderTree className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-bold tracking-wide">Organize</span>
            </button>
            <button className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all flex flex-col items-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:-rotate-6">
                <HardDrive className="w-7 h-7 text-white" />
              </div>
              <span className="text-sm font-bold tracking-wide">Audit</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
