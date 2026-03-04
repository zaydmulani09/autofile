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
  HardDrive,
  AlertTriangle,
  RefreshCcw
} from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';
import { FileItem, SmartRule } from '../types';
import { MOCK_FILES, MOCK_RULES } from '../constants';

type SettingsSubView = 'none' | 'profile' | 'security' | 'notifications' | 'language' | 'appearance' | 'storage' | 'performance' | 'danger';

interface SettingsProps {
  setFiles?: React.Dispatch<React.SetStateAction<FileItem[]>>;
  setRules?: React.Dispatch<React.SetStateAction<SmartRule[]>>;
}

export default function Settings({ setFiles, setRules }: SettingsProps) {
  const { user, logout, updateProfile } = useAuth();
  const [activeSubView, setActiveSubView] = useState<SettingsSubView>('none');
  const [newName, setNewName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Settings updated successfully!');

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
      triggerSuccess('Profile updated successfully!');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const triggerSuccess = (message: string = 'Settings updated successfully!') => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleClearCache = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      triggerSuccess('Application cache cleared!');
    }, 1000);
  };

  const handleResetApp = () => {
    if (window.confirm('Are you sure you want to reset the application? This will delete all files and rules.')) {
      setIsSaving(true);
      setTimeout(() => {
        if (setFiles) setFiles(MOCK_FILES);
        if (setRules) setRules(MOCK_RULES);
        localStorage.removeItem('autofile_files');
        setIsSaving(false);
        setActiveSubView('none');
        triggerSuccess('Application reset to defaults!');
      }, 1500);
    }
  };

  const renderSubView = () => {
    switch (activeSubView) {
      case 'profile':
        return (
          <div className="glass-panel p-8 space-y-8 rounded-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg uppercase tracking-widest font-mono">Profile Information</h3>
              <button onClick={() => setActiveSubView('none')} className="text-white/40 hover:text-white border border-transparent hover:border-white/10 p-2"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">Full Name</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-none px-5 py-4 text-[10px] font-mono uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-white/50 transition-all font-bold"
                  placeholder="USER_NAME"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">Email Address</label>
                <input type="email" disabled value={user?.email || 'GUEST@EXAMPLE.COM'} className="w-full bg-white/5 border border-white/10 rounded-none px-5 py-4 text-[10px] font-mono uppercase tracking-widest opacity-50 font-bold" />
              </div>
              <button type="submit" disabled={isSaving} className="w-full py-4 rounded-none bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl shadow-white/5 font-mono flex items-center justify-center gap-2">
                {isSaving ? 'SAVING...' : <><Check className="w-4 h-4" /> Save Changes</>}
              </button>
            </form>
          </div>
        );
      case 'security':
        return (
          <div className="glass-panel p-8 space-y-8 rounded-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg uppercase tracking-widest font-mono">Security & Privacy</h3>
              <button onClick={() => setActiveSubView('none')} className="text-white/40 hover:text-white border border-transparent hover:border-white/10 p-2"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="p-5 rounded-none bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-none bg-white/5 border border-white/10 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-white/40" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest font-mono">Two-Factor Auth</p>
                    <p className="text-[8px] text-white/30 uppercase tracking-widest font-mono mt-1">Extra security layer.</p>
                  </div>
                </div>
                <button 
                  onClick={() => triggerSuccess('2FA setup initiated!')}
                  className="text-[10px] font-bold text-white hover:underline uppercase tracking-widest font-mono"
                >
                  Enable
                </button>
              </div>
              <button 
                onClick={() => triggerSuccess('Password reset email sent!')}
                className="w-full py-4 rounded-none border border-white/10 hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest font-mono transition-all"
              >
                Change Password
              </button>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="glass-panel p-8 space-y-8 rounded-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg uppercase tracking-widest font-mono">Notifications</h3>
              <button onClick={() => setActiveSubView('none')} className="text-white/40 hover:text-white border border-transparent hover:border-white/10 p-2"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              {Object.entries(notifications).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-5 rounded-none bg-white/5 border border-white/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest font-mono">{key} Notifications</span>
                  <button 
                    onClick={() => {
                      setNotifications(prev => ({ ...prev, [key]: !val }));
                      triggerSuccess(`${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${!val ? 'enabled' : 'disabled'}`);
                    }}
                    className={cn("w-10 h-5 rounded-none relative transition-colors", val ? "bg-white" : "bg-white/10")}
                  >
                    <motion.div animate={{ x: val ? 22 : 2 }} className={cn("absolute top-1 w-3 h-3 rounded-none", val ? "bg-black" : "bg-white")} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'language':
        return (
          <div className="glass-panel p-8 space-y-8 rounded-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg uppercase tracking-widest font-mono">Language & Region</h3>
              <button onClick={() => setActiveSubView('none')} className="text-white/40 hover:text-white border border-transparent hover:border-white/10 p-2"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {['English', 'Spanish', 'French', 'German', 'Japanese'].map(lang => (
                <button 
                  key={lang}
                  onClick={() => { setLanguage(lang); triggerSuccess(`Language changed to ${lang}`); }}
                  className={cn("p-5 rounded-none border flex items-center justify-between transition-all font-mono uppercase tracking-widest", language === lang ? "bg-white border-white text-black" : "bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20")}
                >
                  <span className="text-[10px] font-bold">{lang}</span>
                  {language === lang && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="glass-panel p-8 space-y-8 rounded-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg uppercase tracking-widest font-mono">Appearance</h3>
              <button onClick={() => setActiveSubView('none')} className="text-white/40 hover:text-white border border-transparent hover:border-white/10 p-2"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => { setTheme('dark'); triggerSuccess('Dark theme applied'); }}
                className={cn("p-8 rounded-none border flex flex-col items-center gap-4 transition-all font-mono uppercase tracking-widest", theme === 'dark' ? "bg-white border-white text-black" : "bg-white/5 border-white/10 text-white/40")}
              >
                <Moon className="w-6 h-6" />
                <span className="text-[10px] font-bold">Dark Mode</span>
              </button>
              <button 
                onClick={() => { setTheme('light'); triggerSuccess('Light theme applied'); }}
                className={cn("p-8 rounded-none border flex flex-col items-center gap-4 transition-all font-mono uppercase tracking-widest", theme === 'light' ? "bg-white border-white text-black" : "bg-white/5 border-white/10 text-white/40")}
              >
                <Sun className="w-6 h-6" />
                <span className="text-[10px] font-bold">Light Mode</span>
              </button>
            </div>
          </div>
        );
      case 'storage':
        return (
          <div className="glass-panel p-8 space-y-8 rounded-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg uppercase tracking-widest font-mono">Storage Management</h3>
              <button onClick={() => setActiveSubView('none')} className="text-white/40 hover:text-white border border-transparent hover:border-white/10 p-2"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-6">
              <div className="p-5 rounded-none bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest font-mono">Local Cache</span>
                  <span className="text-[10px] font-bold font-mono">12.4 MB</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-none overflow-hidden">
                  <div className="w-1/4 h-full bg-white" />
                </div>
              </div>
              <button 
                onClick={handleClearCache}
                disabled={isSaving}
                className="w-full py-4 rounded-none border border-white/10 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest font-mono flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 className="w-3 h-3" /> {isSaving ? 'CLEARING...' : 'Clear Application Cache'}
              </button>
            </div>
          </div>
        );
      case 'performance':
        return (
          <div className="glass-panel p-8 space-y-8 rounded-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg uppercase tracking-widest font-mono">Performance</h3>
              <button onClick={() => setActiveSubView('none')} className="text-white/40 hover:text-white border border-transparent hover:border-white/10 p-2"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 rounded-none bg-white/5 border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-none bg-white/5 border border-white/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white/40" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest font-mono">Hardware Acceleration</p>
                    <p className="text-[8px] text-white/30 uppercase tracking-widest font-mono mt-1">GPU optimization.</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setPerformanceMode(!performanceMode);
                    triggerSuccess(`Hardware acceleration ${!performanceMode ? 'enabled' : 'disabled'}`);
                  }}
                  className={cn("w-10 h-5 rounded-none relative transition-colors", performanceMode ? "bg-white" : "bg-white/10")}
                >
                  <motion.div animate={{ x: performanceMode ? 22 : 2 }} className={cn("absolute top-1 w-3 h-3 rounded-none", performanceMode ? "bg-black" : "bg-white")} />
                </button>
              </div>
            </div>
          </div>
        );
      case 'danger':
        return (
          <div className="glass-panel p-8 space-y-8 rounded-none relative overflow-hidden border-white/20">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/40" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <AlertTriangle className="w-5 h-5 text-white" />
                <h3 className="font-bold text-lg uppercase tracking-widest font-mono">Danger Zone</h3>
              </div>
              <button onClick={() => setActiveSubView('none')} className="text-white/40 hover:text-white border border-transparent hover:border-white/10 p-2"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 rounded-none bg-white/5 border border-white/10 space-y-6">
              <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase tracking-widest font-mono">
                Resetting the application will permanently delete all uploaded files, custom rules, and settings. / Action irreversible.
              </p>
              <button 
                onClick={handleResetApp}
                disabled={isSaving}
                className="w-full py-5 rounded-none bg-white text-black font-bold uppercase tracking-widest font-mono flex items-center justify-center gap-3 transition-all shadow-xl shadow-white/5"
              >
                {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Reset All Data
              </button>
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
        { icon: AlertTriangle, label: 'Danger Zone', desc: 'Reset app and delete all data.', action: () => setActiveSubView('danger'), color: 'text-red-400' },
      ]
    }
  ];

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <header className="border-b border-white/10 pb-8">
        <div className="flex items-center gap-2 mb-2 opacity-60">
          <div className="w-8 h-px bg-white"></div>
          <span className="text-white text-[10px] font-mono tracking-wider">007</span>
          <div className="flex-1 h-px bg-white"></div>
        </div>
        <h1 className="text-4xl font-bold tracking-widest uppercase italic transform -skew-x-12">System Config</h1>
        <p className="text-white/40 mt-4 text-sm font-mono uppercase tracking-widest">Manage your application preferences and account settings.</p>
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
                  <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] px-2 font-mono">{section.title}</h3>
                  <div className="glass-panel overflow-hidden divide-y divide-white/5 rounded-none relative">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
                    {section.items.map((item) => (
                      <button 
                        key={item.label}
                        onClick={item.action}
                        className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-all group text-left"
                      >
                        <div className="flex items-center gap-5">
                          <div className={cn("w-10 h-10 rounded-none bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-all", item.color)}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={cn("text-[10px] font-bold uppercase tracking-widest font-mono", item.color)}>{item.label}</p>
                            <p className="text-[8px] text-white/30 mt-1 uppercase tracking-widest font-mono">{item.desc}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="pt-4">
                {user ? (
                  <button 
                    onClick={logout}
                    className="w-full p-5 rounded-none border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[10px] font-mono"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                ) : (
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}
                    className="w-full p-5 rounded-none bg-white text-black transition-all flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-[10px] font-mono shadow-xl shadow-white/5"
                  >
                    <User className="w-4 h-4" /> Sign In to Sync Data
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
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white text-black px-8 py-4 rounded-none shadow-2xl flex items-center gap-4 border border-white/20"
          >
            <Check className="w-4 h-4" />
            <span className="font-bold uppercase tracking-widest text-[10px] font-mono">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
