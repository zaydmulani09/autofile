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
  Trash2,
  Type
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
import { FileItem, SmartRule, TabId } from '../types';
import { formatBytes, formatDate, cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  files: FileItem[];
  rules: SmartRule[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
  setActiveTab: (tab: TabId) => void;
}

export default function Dashboard({ files, rules, setFiles, setActiveTab }: DashboardProps) {
  const { user } = useAuth();
  const [isRunningRules, setIsRunningRules] = React.useState(false);
  
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const runAllRules = () => {
    if (files.length === 0 || rules.length === 0) return;
    setIsRunningRules(true);
    
    setTimeout(() => {
      const activeRules = rules.filter(r => r.enabled);
      let updatedFiles = [...files];

      activeRules.forEach(rule => {
        if (rule.action === 'move') {
          updatedFiles = updatedFiles.map(file => {
            let matches = false;
            const fileValue = rule.condition === 'extension' ? file.extension : 
                             rule.condition === 'name' ? file.name : 
                             file.size.toString();

            if (rule.operator === 'equals') matches = fileValue.toLowerCase() === rule.value.toLowerCase();
            else if (rule.operator === 'contains') matches = fileValue.toLowerCase().includes(rule.value.toLowerCase());
            else if (rule.operator === 'greaterThan') matches = parseFloat(fileValue) > parseFloat(rule.value);

            return matches ? { ...file, path: rule.actionValue } : file;
          });
        } else if (rule.action === 'delete') {
          updatedFiles = updatedFiles.filter(file => {
            let matches = false;
            const fileValue = rule.condition === 'extension' ? file.extension : 
                             rule.condition === 'name' ? file.name : 
                             file.size.toString();
            if (rule.operator === 'equals') matches = fileValue.toLowerCase() === rule.value.toLowerCase();
            else if (rule.operator === 'contains') matches = fileValue.toLowerCase().includes(rule.value.toLowerCase());
            else if (rule.operator === 'greaterThan') matches = parseFloat(fileValue) > parseFloat(rule.value);
            return !matches;
          });
        }
      });

      setFiles(updatedFiles);
      setIsRunningRules(false);
    }, 1500);
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
    { label: 'Total Files', value: files.length, icon: Files, color: 'text-white', bg: 'bg-white/5', border: 'border-white/10' },
    { label: 'Storage Used', value: formatBytes(totalSize), icon: HardDrive, color: 'text-white', bg: 'bg-white/5', border: 'border-white/10' },
    { label: 'Duplicates', value: duplicates, icon: Copy, color: 'text-white', bg: 'bg-white/5', border: 'border-white/10' },
    { label: 'Active Rules', value: activeRulesCount, icon: Zap, color: 'text-white', bg: 'bg-white/5', border: 'border-white/10' },
  ];

  const recentFiles = [...files].sort((a, b) => b.lastModified - a.lastModified).slice(0, 5);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 opacity-60">
            <div className="w-8 h-px bg-white"></div>
            <span className="text-white text-[10px] font-mono tracking-wider">001</span>
            <div className="flex-1 h-px bg-white"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-widest uppercase italic transform -skew-x-12">
            Dashboard
          </h1>
          <p className="text-white/40 mt-4 text-sm font-mono uppercase tracking-widest">
            Welcome back, <span className="text-white font-bold">{user?.name || 'Guest'}</span>. System optimized.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-none bg-white/5 border border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-none bg-white animate-pulse" />
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest font-mono">System Active</span>
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
            className="glass-panel p-6 flex flex-col gap-4 group hover:border-white/40 transition-all cursor-default relative overflow-hidden rounded-none"
          >
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20 group-hover:border-white/60 transition-colors" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20 group-hover:border-white/60 transition-colors" />
            
            <div className={cn("w-10 h-10 rounded-none flex items-center justify-center transition-transform group-hover:scale-110 relative z-10 border border-white/10", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">{stat.label}</p>
              <p className="text-2xl font-bold mt-1 font-mono tracking-widest">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Storage Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 lg:col-span-8 relative overflow-hidden rounded-none"
        >
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="font-bold text-lg uppercase tracking-widest font-mono">Storage Analytics</h3>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Growth patterns / System load</p>
            </div>
            <button className="px-4 py-2 rounded-none bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold tracking-widest uppercase transition-all flex items-center gap-2 font-mono">
              Full Report <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="h-[320px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={storageHistory}>
                <defs>
                  <linearGradient id="colorSize" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff10" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#ffffff40', fontFamily: 'JetBrains Mono' }}
                />
                <YAxis 
                  stroke="#ffffff10" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `${val}GB`}
                  tick={{ fill: '#ffffff40', fontFamily: 'JetBrains Mono' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#fff', fontSize: '10px', fontFamily: 'JetBrains Mono' }}
                  cursor={{ stroke: '#ffffff', strokeWidth: 1 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="size" 
                  stroke="#ffffff" 
                  strokeWidth={2}
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
          className="glass-panel p-8 lg:col-span-4 rounded-none"
        >
          <h3 className="font-bold text-lg mb-8 uppercase tracking-widest font-mono">Distribution</h3>
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
                  contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '0px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#fff', fontSize: '10px', fontFamily: 'JetBrains Mono' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-6">
            {fileTypeData.map((type) => (
              <div key={type.name} className="flex items-center justify-between p-3 rounded-none bg-white/5 border border-transparent hover:border-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-none" style={{ backgroundColor: type.color }} />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest font-mono">{type.name}</span>
                </div>
                <span className="text-[10px] font-bold font-mono">{type.value}</span>
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
          className="glass-panel overflow-hidden lg:col-span-7 rounded-none"
        >
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none bg-white/5 border border-white/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-bold text-lg uppercase tracking-widest font-mono">Recent Activity</h3>
            </div>
            <button className="p-2 hover:bg-white/5 rounded-none transition-colors text-white/20 hover:text-white">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {recentFiles.map((file) => (
              <div key={file.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-none bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-white/5 group-hover:border-white/10">
                    {file.type.includes('image') ? <ImageIcon className="w-4 h-4 text-white/60" /> : 
                     file.type.includes('pdf') ? <FileText className="w-4 h-4 text-white/60" /> :
                     <FileCode className="w-4 h-4 text-white/60" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase group-hover:text-white transition-colors font-mono">{file.name}</p>
                    <p className="text-[8px] text-white/20 mt-1 font-mono uppercase tracking-widest">{file.path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-bold text-white/40 font-mono uppercase tracking-widest">{formatDate(file.lastModified)}</p>
                    <p className="text-[8px] text-white/20 mt-1 uppercase tracking-widest font-mono">{formatBytes(file.size)}</p>
                  </div>
                  <button 
                    onClick={() => removeFile(file.id)}
                    className="p-2 rounded-none text-white/10 hover:text-white hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-white/10"
                  >
                    <Trash2 className="w-3 h-3" />
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
          className="glass-panel p-8 lg:col-span-5 rounded-none"
        >
          <h3 className="font-bold text-lg mb-8 uppercase tracking-widest font-mono">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={runAllRules}
              disabled={isRunningRules || rules.length === 0}
              className="p-6 rounded-none bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all flex flex-col items-center gap-4 group disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-none bg-white flex items-center justify-center shadow-xl shadow-white/10 group-hover:scale-110 transition-transform">
                <Zap className={cn("w-6 h-6 text-black", isRunningRules && "animate-pulse")} />
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase font-mono">{isRunningRules ? 'Running...' : 'Run Rules'}</span>
            </button>
            <button 
              onClick={() => setActiveTab('duplicates')}
              className="p-6 rounded-none bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all flex flex-col items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-none bg-white flex items-center justify-center shadow-xl shadow-white/10 group-hover:scale-110 transition-transform">
                <Copy className="w-6 h-6 text-black" />
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase font-mono">Scan Dups</span>
            </button>
            <button 
              onClick={() => setActiveTab('organize')}
              className="p-6 rounded-none bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all flex flex-col items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-none bg-white flex items-center justify-center shadow-xl shadow-white/10 group-hover:scale-110 transition-transform">
                <FolderTree className="w-6 h-6 text-black" />
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase font-mono">Organize</span>
            </button>
            <button 
              onClick={() => setActiveTab('rename')}
              className="p-6 rounded-none bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all flex flex-col items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-none bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Type className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase font-mono">Bulk Rename</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
