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
    { name: 'Documents', value: files.filter(f => f.type.includes('pdf') || f.type.includes('word') || f.type.includes('sheet')).length, color: '#ef4444' },
    { name: 'Images', value: files.filter(f => f.type.includes('image')).length, color: '#3b82f6' },
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
    { label: 'Total Files', value: files.length, icon: Files, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Storage Used', value: formatBytes(totalSize), icon: HardDrive, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { label: 'Duplicates', value: duplicates, icon: Copy, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Active Rules', value: activeRulesCount, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  ];

  const recentFiles = [...files].sort((a, b) => b.lastModified - a.lastModified).slice(0, 5);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-white/40 mt-1">Welcome back, {user?.name || 'Guest'}. Here's what's happening with your files.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-5 flex items-center gap-4 group hover:border-white/10 transition-all cursor-default"
          >
            <div className={cn("p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold mt-0.5">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Storage Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg">Storage Usage</h3>
              <p className="text-sm text-white/40">Daily storage growth over the last week</p>
            </div>
            <button className="text-accent hover:text-accent-hover text-sm font-medium flex items-center gap-1">
              View Report <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={storageHistory}>
                <defs>
                  <linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                  tickFormatter={(val) => `${val}GB`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #ffffff10', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="size" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSize)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* File Type Distribution */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6"
        >
          <h3 className="font-bold text-lg mb-6">File Distribution</h3>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fileTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
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
          <div className="space-y-3 mt-4">
            {fileTypeData.map((type) => (
              <div key={type.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color }} />
                  <span className="text-sm text-white/60">{type.name}</span>
                </div>
                <span className="text-sm font-bold">{type.value} files</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              <h3 className="font-bold">Recent Activity</h3>
            </div>
            <button className="text-white/40 hover:text-white transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {recentFiles.map((file) => (
              <div key={file.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    {file.type.includes('image') ? <ImageIcon className="w-5 h-5 text-blue-400" /> : 
                     file.type.includes('pdf') ? <FileText className="w-5 h-5 text-red-400" /> :
                     <FileCode className="w-5 h-5 text-emerald-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{file.name}</p>
                    <p className="text-xs text-white/40 mt-1">{file.path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs font-medium">{formatDate(file.lastModified)}</p>
                    <p className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wider">{formatBytes(file.size)}</p>
                  </div>
                  <button 
                    onClick={() => removeFile(file.id)}
                    className="p-2 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
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
          className="glass-panel p-6"
        >
          <h3 className="font-bold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 rounded-2xl bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-all flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-bold">Run Smart Rules</span>
            </button>
            <button className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Copy className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-bold">Scan Duplicates</span>
            </button>
            <button className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-all flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <FolderTree className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-bold">Auto Organize</span>
            </button>
            <button className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HardDrive className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-bold">Storage Audit</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
