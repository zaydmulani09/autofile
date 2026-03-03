import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Play, 
  Settings2, 
  ChevronRight, 
  ToggleLeft, 
  ToggleRight,
  Search,
  ArrowRight,
  Folder,
  Type,
  Maximize2,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { SmartRule, FileItem } from '../types';
import { cn } from '../utils';

interface SmartRulesProps {
  rules: SmartRule[];
  setRules: React.Dispatch<React.SetStateAction<SmartRule[]>>;
  files: FileItem[];
  setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
}

export default function SmartRules({ rules, setRules, files, setFiles }: SmartRulesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showRunSuccess, setShowRunSuccess] = useState(false);
  const [newRule, setNewRule] = useState<Partial<SmartRule>>({
    name: '',
    condition: 'extension',
    operator: 'equals',
    value: '',
    action: 'move',
    actionValue: '',
    enabled: true
  });

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const handleSaveRule = () => {
    if (!newRule.name || !newRule.value || !newRule.actionValue) return;

    const rule: SmartRule = {
      id: Math.random().toString(36).substr(2, 9),
      name: newRule.name || 'Untitled Rule',
      condition: newRule.condition as any,
      operator: newRule.operator as any,
      value: newRule.value || '',
      action: newRule.action as any,
      actionValue: newRule.actionValue || '',
      enabled: true
    };

    setRules(prev => [...prev, rule]);
    setIsAdding(false);
    setNewRule({
      name: '',
      condition: 'extension',
      operator: 'equals',
      value: '',
      action: 'move',
      actionValue: '',
      enabled: true
    });
  };

  const runRules = () => {
    setIsRunning(true);
    setTimeout(() => {
      const activeRules = rules.filter(r => r.enabled);
      let updatedFiles = [...files];
      let affectedCount = 0;

      activeRules.forEach(rule => {
        updatedFiles = updatedFiles.map(file => {
          let matches = false;
          const fileValue = rule.condition === 'extension' ? file.extension : 
                           rule.condition === 'name' ? file.name : 
                           file.size.toString();

          if (rule.operator === 'equals') matches = fileValue.toLowerCase() === rule.value.toLowerCase();
          else if (rule.operator === 'contains') matches = fileValue.toLowerCase().includes(rule.value.toLowerCase());
          else if (rule.operator === 'greaterThan') matches = parseFloat(fileValue) > parseFloat(rule.value);

          if (matches) {
            affectedCount++;
            if (rule.action === 'move') {
              return { ...file, path: rule.actionValue };
            }
            // Delete is handled by filtering after the loop if we want, 
            // but for simplicity let's just mark it or handle it here
          }
          return file;
        });

        if (rule.action === 'delete') {
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
      setIsRunning(false);
      setShowRunSuccess(true);
      setTimeout(() => setShowRunSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Smart Rules</h1>
          <p className="text-white/40 mt-2 text-lg">Automate your workspace with powerful conditional logic.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={runRules}
            disabled={isRunning || rules.length === 0 || files.length === 0}
            className="btn-secondary flex items-center gap-2"
          >
            {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run All Rules
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Rule
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showRunSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5" />
            Rules applied successfully! Your files have been organized.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {rules.length === 0 ? (
          <div className="glass-panel p-20 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-3xl bg-accent/10 flex items-center justify-center mb-8">
              <Zap className="w-12 h-12 text-accent" />
            </div>
            <h3 className="text-2xl font-bold">No Rules Defined</h3>
            <p className="text-white/40 mt-3 max-w-md text-lg font-medium">
              Create your first automation rule to keep your workspace organized automatically.
            </p>
            <button 
              onClick={() => setIsAdding(true)}
              className="mt-10 px-10 py-4 rounded-2xl bg-white text-charcoal font-bold hover:bg-white/90 transition-all shadow-2xl shadow-white/10"
            >
              Create First Rule
            </button>
          </div>
        ) : (
          rules.map((rule, i) => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "glass-panel p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group transition-all hover:border-white/20",
                !rule.enabled && "opacity-50 grayscale-[0.8]"
              )}
            >
              <div className="flex items-center gap-8">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110 shadow-lg",
                  rule.enabled ? "bg-accent/20 text-accent shadow-accent/10" : "bg-white/5 text-white/20"
                )}>
                  <Zap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-xl tracking-tight">{rule.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">If</span>
                    <div className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/60">
                      {rule.condition} {rule.operator} <span className="text-white">"{rule.value}"</span>
                    </div>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Then</span>
                    <div className="px-3 py-1 rounded-lg bg-accent/10 border border-accent/20 text-xs font-bold text-accent">
                      {rule.action} to <span className="font-black">"{rule.actionValue}"</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-center">
                <button 
                  onClick={() => toggleRule(rule.id)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-all"
                >
                  {rule.enabled ? (
                    <ToggleRight className="w-10 h-10 text-accent" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-white/10" />
                  )}
                </button>
                <div className="w-[1px] h-10 bg-white/5 mx-2" />
                <button 
                  onClick={() => deleteRule(rule.id)}
                  className="p-3 rounded-xl text-white/10 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Rule Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-2xl bg-panel rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/2">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Create Smart Rule</h3>
                  <p className="text-white/40 text-sm mt-1 font-medium">Define automation logic for your workspace.</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                >
                  <Plus className="w-6 h-6 text-white/40 rotate-45" />
                </button>
              </div>
              <div className="p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Rule Name</label>
                  <input 
                    type="text" 
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    placeholder="e.g. Auto-sort Screenshots"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Condition</label>
                    <select 
                      value={newRule.condition}
                      onChange={(e) => setNewRule({ ...newRule, condition: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-bold"
                    >
                      <option value="extension">Extension</option>
                      <option value="name">Name</option>
                      <option value="size">Size</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Operator</label>
                    <select 
                      value={newRule.operator}
                      onChange={(e) => setNewRule({ ...newRule, operator: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-bold"
                    >
                      <option value="equals">Equals</option>
                      <option value="contains">Contains</option>
                      <option value="greaterThan">Greater Than</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Value</label>
                  <input 
                    type="text" 
                    value={newRule.value}
                    onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                    placeholder="e.g. pdf"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-medium"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Action</label>
                  <div className="flex items-center gap-4">
                    <select 
                      value={newRule.action}
                      onChange={(e) => setNewRule({ ...newRule, action: e.target.value as any })}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-bold"
                    >
                      <option value="move">Move to Folder</option>
                      <option value="copy">Copy to Folder</option>
                      <option value="delete">Delete File</option>
                    </select>
                    <ArrowRight className="w-6 h-6 text-white/10" />
                    <input 
                      type="text" 
                      value={newRule.actionValue}
                      onChange={(e) => setNewRule({ ...newRule, actionValue: e.target.value })}
                      placeholder="/Documents/Sorted"
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
              <div className="p-10 bg-white/2 flex items-center justify-end gap-4 border-t border-white/5">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-8 py-3 rounded-2xl text-sm font-bold hover:bg-white/5 transition-all text-white/40 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveRule}
                  className="px-10 py-4 rounded-2xl bg-accent hover:bg-accent-hover text-sm font-bold shadow-2xl shadow-accent/20 transition-all hover:scale-105 active:scale-95"
                >
                  Save Rule
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
