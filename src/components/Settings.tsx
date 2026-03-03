import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Globe, 
  Moon, 
  Cpu,
  ChevronRight,
  LogOut,
  Check,
  X,
  Trash2,
  Lock,
  Sun,
  Languages,
  Zap,
  HardDrive
} from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';

type SettingsSubView = 'none' | 'profile' | 'security' | 'notifications' | 'language' | 'appearance' | 'storage' | 'performance';

export default function Settings() {
  const { user, logout, updateProfile } = useAuth();
  const [activeSubView, setActiveSubView] = useState<SettingsSubView>('none');
  const [newName, setNewName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Settings states
  const [notifications, setNotifications] = useState({ email: true, push: true, weekly: false });
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [performanceMode, setPerformanceMode] = useState(true);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(newName);
      setActiveSubView('none');
      triggerSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleClearCache = () => {
    // Mock clearing cache
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      triggerSuccess();
    }, 1000);
  };

  const renderSubView = () => {
    switch (activeSubView) {
      case 'profile':
        return (
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Profile Information</h3>
              <button onClick={() => setActiveSubView('none')} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Email Address</label>
                <input type="email" disabled value={user?.email || 'guest@example.com'} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm opacity-50" />
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold flex items-center justify-center gap-2">
                {isSaving ? 'Saving...' : <><Check className="w-4 h-4" /> Save Changes</>}
              </button>
            </form>
          </div>
        );
      case 'security':
        return (
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Security & Privacy</h3>
              <button onClick={() => setActiveSubView('none')} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-white/40" />
                  <div>
                    <p className="text-sm font-bold">Two-Factor Authentication</p>
                    <p className="text-xs text-white/40">Add an extra layer of security.</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-accent">Enable</button>
              </div>
              <button className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-bold">Change Password</button>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Notifications</h3>
              <button onClick={() => setActiveSubView('none')} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-sm font-bold capitalize">{key} Notifications</span>
                  <button 
                    onClick={() => setNotifications(prev => ({ ...prev, [key]: !val }))}
                    className={cn("w-10 h-5 rounded-full relative transition-colors", val ? "bg-accent" : "bg-white/10")}
                  >
                    <motion.div animate={{ x: val ? 22 : 2 }} className="absolute top-1 w-3 h-3 bg-white rounded-full" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'language':
        return (
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Language & Region</h3>
              <button onClick={() => setActiveSubView('none')} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {['English', 'Spanish', 'French', 'German', 'Japanese'].map(lang => (
                <button 
                  key={lang}
                  onClick={() => { setLanguage(lang); triggerSuccess(); }}
                  className={cn("p-4 rounded-xl border flex items-center justify-between transition-all", language === lang ? "bg-accent/10 border-accent text-accent" : "bg-white/5 border-white/10 text-white/60 hover:text-white")}
                >
                  <span className="text-sm font-bold">{lang}</span>
                  {language === lang && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Appearance</h3>
              <button onClick={() => setActiveSubView('none')} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setTheme('dark')}
                className={cn("p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all", theme === 'dark' ? "bg-accent/10 border-accent text-accent" : "bg-white/5 border-white/10 text-white/40")}
              >
                <Moon className="w-8 h-8" />
                <span className="text-sm font-bold">Dark Mode</span>
              </button>
              <button 
                onClick={() => setTheme('light')}
                className={cn("p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all", theme === 'light' ? "bg-accent/10 border-accent text-accent" : "bg-white/5 border-white/10 text-white/40")}
              >
                <Sun className="w-8 h-8" />
                <span className="text-sm font-bold">Light Mode</span>
              </button>
            </div>
          </div>
        );
      case 'storage':
        return (
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Storage Management</h3>
              <button onClick={() => setActiveSubView('none')} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white/40 uppercase">Local Cache</span>
                  <span className="text-xs font-bold">12.4 MB</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-1/4 h-full bg-accent" />
                </div>
              </div>
              <button 
                onClick={handleClearCache}
                disabled={isSaving}
                className="w-full py-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-sm font-bold flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> {isSaving ? 'Clearing...' : 'Clear Application Cache'}
              </button>
            </div>
          </div>
        );
      case 'performance':
        return (
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Performance</h3>
              <button onClick={() => setActiveSubView('none')} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <div>
                    <p className="text-sm font-bold">Hardware Acceleration</p>
                    <p className="text-xs text-white/40">Use GPU for smoother animations.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPerformanceMode(!performanceMode)}
                  className={cn("w-10 h-5 rounded-full relative transition-colors", performanceMode ? "bg-accent" : "bg-white/10")}
                >
                  <motion.div animate={{ x: performanceMode ? 22 : 2 }} className="absolute top-1 w-3 h-3 bg-white rounded-full" />
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile Information', desc: 'Manage your personal details and avatar.', action: () => setActiveSubView('profile') },
        { icon: Shield, label: 'Security & Privacy', desc: 'Password, 2FA, and connected devices.', action: () => setActiveSubView('security') },
      ]
    },
    {
      title: 'Application',
      items: [
        { icon: Bell, label: 'Notifications', desc: 'Configure how you receive alerts.', action: () => setActiveSubView('notifications') },
        { icon: Globe, label: 'Language & Region', desc: 'Select your preferred language.', action: () => setActiveSubView('language') },
        { icon: Moon, label: 'Appearance', desc: 'Customize themes and visual effects.', action: () => setActiveSubView('appearance') },
      ]
    },
    {
      title: 'System',
      items: [
        { icon: Database, label: 'Storage Management', desc: 'Configure default paths and limits.', action: () => setActiveSubView('storage') },
        { icon: Cpu, label: 'Performance', desc: 'Manage background processes and cache.', action: () => setActiveSubView('performance') },
      ]
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-white/40 mt-1">Manage your application preferences and account settings.</p>
      </header>

      <div className="space-y-8">
        <AnimatePresence mode="wait">
          {activeSubView !== 'none' ? (
            <motion.div
              key="subview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {renderSubView()}
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {sections.map((section) => (
                <div key={section.title} className="space-y-4">
                  <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider px-2">{section.title}</h3>
                  <div className="glass-panel overflow-hidden divide-y divide-white/5">
                    {section.items.map((item) => (
                      <button 
                        key={item.label}
                        onClick={item.action}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-all group text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-accent/10 group-hover:text-accent transition-all">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{item.label}</p>
                            <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-4">
                {user ? (
                  <button 
                    onClick={logout}
                    className="w-full p-4 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-all flex items-center justify-center gap-2 font-bold"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                ) : (
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}
                    className="w-full p-4 rounded-2xl bg-accent hover:bg-accent-hover text-white transition-all flex items-center justify-center gap-2 font-bold shadow-lg shadow-accent/20"
                  >
                    <User className="w-5 h-5" /> Sign In to Sync Data
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center pt-8">
          <p className="text-xs text-white/20">Auto File Organizer Pro v2.4.0</p>
          <p className="text-[10px] text-white/10 mt-1">© 2026 Digital Workspace Solutions Inc.</p>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
          >
            <Check className="w-5 h-5" />
            <span className="font-bold">Settings updated successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
