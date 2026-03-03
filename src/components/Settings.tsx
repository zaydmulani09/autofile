import React, { useState } from 'react';
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
  Check
} from 'lucide-react';
import { cn } from '../utils';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user, logout, updateProfile } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(newName);
      setIsEditingProfile(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile Information', desc: 'Manage your personal details and avatar.', action: () => setIsEditingProfile(true) },
        { icon: Shield, label: 'Security & Privacy', desc: 'Password, 2FA, and connected devices.' },
      ]
    },
    {
      title: 'Application',
      items: [
        { icon: Bell, label: 'Notifications', desc: 'Configure how you receive alerts.' },
        { icon: Globe, label: 'Language & Region', desc: 'Select your preferred language.' },
        { icon: Moon, label: 'Appearance', desc: 'Customize themes and visual effects.' },
      ]
    },
    {
      title: 'System',
      items: [
        { icon: Database, label: 'Storage Management', desc: 'Configure default paths and limits.' },
        { icon: Cpu, label: 'Performance', desc: 'Manage background processes and cache.' },
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
        {isEditingProfile ? (
          <div className="glass-panel p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Edit Profile</h3>
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="text-white/40 hover:text-white text-sm"
              >
                Cancel
              </button>
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
                <input 
                  type="email" 
                  disabled
                  value={user?.email || ''}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm opacity-50 cursor-not-allowed"
                />
              </div>
              <button 
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold shadow-lg shadow-accent/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : <><Check className="w-4 h-4" /> Save Changes</>}
              </button>
            </form>
          </div>
        ) : (
          sections.map((section) => (
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
          ))
        )}

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
              onClick={() => {
                // We need a way to trigger the modal from here. 
                // Since Settings is a child of App, we could pass down the setter or use a custom event.
                // For now, let's just use a window event or similar if we don't want to prop drill.
                // Actually, let's just add a simple "Sign In" button that explains the benefits.
                window.dispatchEvent(new CustomEvent('open-auth-modal'));
              }}
              className="w-full p-4 rounded-2xl bg-accent hover:bg-accent-hover text-white transition-all flex items-center justify-center gap-2 font-bold shadow-lg shadow-accent/20"
            >
              <User className="w-5 h-5" /> Sign In to Sync Data
            </button>
          )}
        </div>

        <div className="text-center pt-8">
          <p className="text-xs text-white/20">Auto File Organizer Pro v2.4.0</p>
          <p className="text-[10px] text-white/10 mt-1">© 2026 Digital Workspace Solutions Inc.</p>
        </div>
      </div>
    </div>
  );
}
