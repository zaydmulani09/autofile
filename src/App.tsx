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
      case 'dashboard': return <Dashboard files={files} rules={rules} setFiles={setFiles} />;
      case 'organize': return <OrganizeFiles files={files} setFiles={setFiles} onNavigateToRename={() => setActiveTab('rename')} />;
      case 'rename': return <RenameFiles files={files} setFiles={setFiles} />;
      case 'duplicates': return <DuplicateCleaner files={files} setFiles={setFiles} />;
      case 'rules': return <SmartRules rules={rules} setRules={setRules} />;
      case 'analytics': return <FileAnalytics files={files} setFiles={setFiles} />;
      case 'ai': return <AIAssistant />;
      case 'timer': return <FocusTimer />;
      case 'notes': return <SmartNotes />;
      case 'settings': return <Settings />;
      default: return <Dashboard files={files} rules={rules} setFiles={setFiles} />;
    }
  };

  return (
    <div className="flex h-screen bg-charcoal overflow-hidden font-sans">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? '80px' : '260px' }}
        className="hidden md:flex flex-col border-r border-white/5 bg-panel/50 backdrop-blur-xl relative z-20"
      >
        <div className="p-6 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg shadow-accent/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">AutoFile Pro</span>
            </motion.div>
          )}
          {isSidebarCollapsed && (
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mx-auto">
              <Zap className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {navigation.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabId)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-accent text-white shadow-lg shadow-accent/20" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "group-hover:text-white")} />
                {!isSidebarCollapsed && (
                  <span className="font-medium text-sm">{item.name}</span>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-panel z-50 md:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-lg">AutoFile Pro</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-6 h-6 text-white/60" />
                </button>
              </div>
              <nav className="flex-1 px-4 space-y-2 mt-4">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as TabId);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      activeTab === item.id ? "bg-accent text-white" : "text-white/60 hover:bg-white/5"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
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
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-charcoal/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-white/5 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input 
                type="text" 
                placeholder="Search files, rules..."
                className="bg-white/5 border border-white/5 rounded-full pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 w-64 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-full relative text-white/60 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border-2 border-charcoal" />
            </button>
            <div className="h-8 w-[1px] bg-white/5 mx-1" />
            
            {user ? (
              <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-white/5 transition-colors group relative">
                <span className="text-sm font-medium text-white/80 group-hover:text-white hidden sm:block">
                  {user.name}
                </span>
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg shadow-accent/10"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <button 
                  onClick={logout}
                  className="absolute top-full right-0 mt-2 bg-panel border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all opacity-0 group-hover:opacity-100"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-1.5 rounded-full bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-lg shadow-accent/20 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
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
