import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  FolderTree, 
  Type, 
  Copy, 
  Zap, 
  BarChart3, 
  Settings as SettingsIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  Bell,
  User,
  Sparkles,
  Timer,
  StickyNote
} from 'lucide-react';
import { TabId, FileItem, SmartRule } from './types';
import { MOCK_FILES, MOCK_RULES } from './constants';
import { cn } from './utils';

// Components
import Dashboard from './components/Dashboard';
import OrganizeFiles from './components/OrganizeFiles';
import RenameFiles from './components/RenameFiles';
import DuplicateCleaner from './components/DuplicateCleaner';
import SmartRules from './components/SmartRules';
import FileAnalytics from './components/FileAnalytics';
import Settings from './components/Settings';
import AIAssistant from './components/AIAssistant';
import FocusTimer from './components/FocusTimer';
import SmartNotes from './components/SmartNotes';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import HeroAscii from './components/ui/hero-ascii';

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Initialize files from localStorage or MOCK_FILES
  const [files, setFiles] = useState<FileItem[]>(() => {
    const saved = localStorage.getItem('autofile_files');
    return saved ? JSON.parse(saved) : MOCK_FILES;
  });

  const [rules, setRules] = useState<SmartRule[]>(MOCK_RULES);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  // Persist files to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('autofile_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    const handleOpenAuth = () => setIsAuthModalOpen(true);
    window.addEventListener('open-auth-modal', handleOpenAuth);
    return () => window.removeEventListener('open-auth-modal', handleOpenAuth);
  }, []);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'organize', name: 'Organize Files', icon: FolderTree },
    { id: 'rename', name: 'Rename Files', icon: Type },
    { id: 'duplicates', name: 'Duplicate Cleaner', icon: Copy },
    { id: 'rules', name: 'Smart Rules', icon: Zap },
    { id: 'analytics', name: 'File Analytics', icon: BarChart3 },
    { id: 'ai', name: 'AI Assistant', icon: Sparkles },
    { id: 'timer', name: 'Focus Timer', icon: Timer },
    { id: 'notes', name: 'Smart Notes', icon: StickyNote },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard files={files} rules={rules} setFiles={setFiles} setActiveTab={setActiveTab} />;
      case 'organize': return <OrganizeFiles files={files} setFiles={setFiles} onNavigateToRename={() => setActiveTab('rename')} />;
      case 'rename': return <RenameFiles files={files} setFiles={setFiles} />;
      case 'duplicates': return <DuplicateCleaner files={files} setFiles={setFiles} />;
      case 'rules': return <SmartRules rules={rules} setRules={setRules} files={files} setFiles={setFiles} />;
      case 'analytics': return <FileAnalytics files={files} setFiles={setFiles} />;
      case 'ai': return <AIAssistant />;
      case 'timer': return <FocusTimer />;
      case 'notes': return <SmartNotes />;
      case 'settings': return <Settings setFiles={setFiles} setRules={setRules} />;
      default: return <Dashboard files={files} rules={rules} setFiles={setFiles} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-black overflow-hidden font-mono selection:bg-white/30 selection:text-white">
      <HeroAscii />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? '80px' : '280px' }}
        className="hidden md:flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-3xl relative z-20"
      >
        <div className="p-8 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-white rounded-none flex items-center justify-center shadow-xl shadow-white/5 ring-1 ring-white/20">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <span className="font-display font-bold text-xl tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 uppercase italic transform -skew-x-12">AutoFile</span>
            </motion.div>
          )}
          {isSidebarCollapsed && (
            <div className="w-10 h-10 bg-white rounded-none flex items-center justify-center mx-auto shadow-xl shadow-white/5 ring-1 ring-white/20">
              <Zap className="w-6 h-6 text-black" />
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
          {navigation.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabId)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-300 group relative overflow-hidden",
                  isActive 
                    ? "bg-white/10 text-white" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "group-hover:text-white")} />
                {!isSidebarCollapsed && (
                  <span className="font-bold text-[10px] tracking-[0.2em] uppercase">{item.name}</span>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-4 bg-white rounded-none shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 space-y-4 border-t border-white/5">
          {user && !isSidebarCollapsed && (
            <div className="p-4 rounded-none bg-white/5 border border-white/10 flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-none flex items-center justify-center text-xs font-bold shadow-lg"
                style={{ backgroundColor: user.avatarColor }}
              >
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold truncate uppercase tracking-wider">{user.name}</p>
                <p className="text-[8px] text-white/40 truncate font-mono">{user.email}</p>
              </div>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center p-3 rounded-none hover:bg-white/5 transition-colors text-white/20 hover:text-white border border-transparent hover:border-white/10"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-black/95 backdrop-blur-2xl z-50 md:hidden flex flex-col border-r border-white/10"
            >
              <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-none flex items-center justify-center shadow-lg shadow-white/5">
                    <Zap className="w-6 h-6 text-black" />
                  </div>
                  <span className="font-display font-bold text-xl tracking-widest uppercase italic transform -skew-x-12">AutoFile</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-none">
                  <X className="w-6 h-6 text-white/40" />
                </button>
              </div>
              <nav className="flex-1 px-6 space-y-2 mt-4 overflow-y-auto">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as TabId);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-4 px-5 py-4 rounded-none transition-all",
                      activeTab === item.id 
                        ? "bg-white text-black shadow-xl shadow-white/10" 
                        : "text-white/40 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-bold text-[10px] tracking-[0.2em] uppercase">{item.name}</span>
                  </button>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2.5 hover:bg-white/5 rounded-none border border-white/10"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
              <input 
                type="text" 
                placeholder="SEARCH SYSTEM..."
                className="bg-white/5 border border-white/10 rounded-none pl-10 pr-6 py-2 text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-white/50 w-64 transition-all placeholder:text-white/20 uppercase tracking-widest"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <button className="p-2.5 hover:bg-white/5 rounded-none relative text-white/40 hover:text-white transition-all border border-transparent hover:border-white/10">
                <Bell className="w-4 h-4" />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-white rounded-none border border-black" />
              </button>
              <button 
                onClick={() => setActiveTab('ai')}
                className="p-2.5 hover:bg-white/5 rounded-none text-white/40 hover:text-white transition-all border border-transparent hover:border-white/10"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
            
            <div className="h-6 w-[1px] bg-white/10 mx-1" />
            
            {user ? (
              <div className="flex items-center gap-3 pl-3 pr-1.5 py-1.5 rounded-none hover:bg-white/5 transition-all group relative border border-transparent hover:border-white/10 cursor-pointer">
                <span className="text-[10px] font-bold text-white/60 group-hover:text-white hidden sm:block uppercase tracking-widest">
                  {user.name}
                </span>
                <div 
                  className="w-8 h-8 rounded-none flex items-center justify-center text-[10px] font-bold shadow-xl ring-1 ring-white/20"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div className="absolute top-full right-0 mt-2 w-48 bg-black/90 backdrop-blur-xl border border-white/10 rounded-none p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 z-50">
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="w-full flex items-center gap-2 px-4 py-2 text-[10px] font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-none transition-all uppercase tracking-widest"
                  >
                    <SettingsIcon className="w-3 h-3" /> Settings
                  </button>
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-[10px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-none transition-all uppercase tracking-widest"
                  >
                    <LogOut className="w-3 h-3" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="btn-primary flex items-center gap-2"
              >
                <User className="w-3 h-3" /> Sign In
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="max-w-7xl mx-auto"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
