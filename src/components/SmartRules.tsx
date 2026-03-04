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
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 opacity-60">
            <div className="w-8 h-px bg-white"></div>
            <span className="text-white text-[10px] font-mono tracking-wider">008</span>
            <div className="flex-1 h-px bg-white"></div>
          </div>
          <h1 className="text-4xl font-bold tracking-widest uppercase italic transform -skew-x-12">Logic Engine</h1>
          <p className="text-white/40 mt-4 text-sm font-mono uppercase tracking-widest">Automate your workspace with powerful conditional logic.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={runRules}
            disabled={isRunning || rules.length === 0 || files.length === 0}
            className="btn-secondary flex items-center gap-2"
          >
            {isRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            Run All Rules
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-3 h-3" /> Create Rule
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showRunSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-5 rounded-none bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest font-mono flex items-center gap-4"
          >
            <CheckCircle2 className="w-4 h-4" />
            Logic applied successfully / Workspace synchronized.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4">
        {rules.length === 0 ? (
          <div className="glass-panel p-20 flex flex-col items-center justify-center text-center rounded-none relative overflow-hidden">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20" />
            
            <div className="w-20 h-20 rounded-none bg-white/5 border border-white/10 flex items-center justify-center mb-8">
              <Zap className="w-10 h-10 text-white/40" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-widest font-mono">No Rules Defined</h3>
            <p className="text-white/40 mt-4 max-w-md text-[10px] uppercase tracking-widest font-mono">
              Initialize your first automation rule to maintain workspace integrity.
            </p>
            <button 
              onClick={() => setIsAdding(true)}
              className="mt-10 px-10 py-4 rounded-none bg-white text-black font-bold text-[10px] uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl shadow-white/5 font-mono"
            >
              Initialize Rule
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
                "glass-panel p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group transition-all hover:border-white/20 rounded-none relative overflow-hidden",
                !rule.enabled && "opacity-50 grayscale-[0.8]"
              )}
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-white/10 group-hover:bg-white transition-colors" />
              <div className="flex items-center gap-8">
                <div className={cn(
                  "w-12 h-12 rounded-none flex items-center justify-center shrink-0 transition-all group-hover:scale-110 border border-white/10",
                  rule.enabled ? "bg-white/5 text-white" : "bg-white/2 text-white/20"
                )}>
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg uppercase tracking-widest font-mono">{rule.name}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-3">
                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] font-mono">Condition</span>
                    <div className="px-3 py-1 rounded-none bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 font-mono uppercase tracking-widest">
                      {rule.condition} {rule.operator} <span className="text-white">"{rule.value}"</span>
                    </div>
                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.3em] font-mono">Execution</span>
                    <div className="px-3 py-1 rounded-none bg-white/5 border border-white/20 text-[10px] font-bold text-white font-mono uppercase tracking-widest">
                      {rule.action} <ArrowRight className="inline w-3 h-3 mx-1" /> <span className="font-black">"{rule.actionValue}"</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-center">
                <button 
                  onClick={() => toggleRule(rule.id)}
                  className="p-2 hover:bg-white/5 rounded-none transition-all"
                >
                  {rule.enabled ? (
                    <ToggleRight className="w-8 h-8 text-white" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-white/10" />
                  )}
                </button>
                <div className="w-[1px] h-8 bg-white/5 mx-2" />
                <button 
                  onClick={() => deleteRule(rule.id)}
                  className="p-3 rounded-none text-white/10 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                >
                  <Trash2 className="w-4 h-4" />
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
              className="relative w-full max-w-2xl bg-panel rounded-none shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
              <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/2">
                <div>
                  <h3 className="text-2xl font-bold tracking-widest uppercase italic transform -skew-x-12 font-mono">Initialize Logic</h3>
                  <p className="text-white/40 text-[10px] mt-2 font-bold uppercase tracking-widest font-mono">Define automation logic for your workspace.</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="w-12 h-12 rounded-none bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10"
                >
                  <Plus className="w-6 h-6 text-white/40 rotate-45" />
                </button>
              </div>
              <div className="p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">Rule Name</label>
                  <input 
                    type="text" 
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    placeholder="E.G. AUTO_SORT_PDF"
                    className="w-full bg-white/5 border border-white/10 rounded-none px-6 py-4 text-[10px] font-mono uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-white/50 transition-all font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">Condition</label>
                    <select 
                      value={newRule.condition}
                      onChange={(e) => setNewRule({ ...newRule, condition: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-none px-6 py-4 text-[10px] font-mono uppercase tracking-widest appearance-none focus:outline-none focus:ring-1 focus:ring-white/50 transition-all font-bold"
                    >
                      <option value="extension">Extension</option>
                      <option value="name">Name</option>
                      <option value="size">Size</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">Operator</label>
                    <select 
                      value={newRule.operator}
                      onChange={(e) => setNewRule({ ...newRule, operator: e.target.value as any })}
                      className="w-full bg-white/5 border border-white/10 rounded-none px-6 py-4 text-[10px] font-mono uppercase tracking-widest appearance-none focus:outline-none focus:ring-1 focus:ring-white/50 transition-all font-bold"
                    >
                      <option value="equals">Equals</option>
                      <option value="contains">Contains</option>
                      <option value="greaterThan">Greater Than</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">Value</label>
                  <input 
                    type="text" 
                    value={newRule.value}
                    onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                    placeholder="E.G. PDF"
                    className="w-full bg-white/5 border border-white/10 rounded-none px-6 py-4 text-[10px] font-mono uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-white/50 transition-all font-bold"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">Action</label>
                  <div className="flex items-center gap-4">
                    <select 
                      value={newRule.action}
                      onChange={(e) => setNewRule({ ...newRule, action: e.target.value as any })}
                      className="flex-1 bg-white/5 border border-white/10 rounded-none px-6 py-4 text-[10px] font-mono uppercase tracking-widest appearance-none focus:outline-none focus:ring-1 focus:ring-white/50 transition-all font-bold"
                    >
                      <option value="move">Move to Folder</option>
                      <option value="copy">Copy to Folder</option>
                      <option value="delete">Delete File</option>
                    </select>
                    <ArrowRight className="w-5 h-5 text-white/10" />
                    <input 
                      type="text" 
                      value={newRule.actionValue}
                      onChange={(e) => setNewRule({ ...newRule, actionValue: e.target.value })}
                      placeholder="/DOCUMENTS/SORTED"
                      className="flex-1 bg-white/5 border border-white/10 rounded-none px-6 py-4 text-[10px] font-mono uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-white/50 transition-all font-bold"
                    />
                  </div>
                </div>
              </div>
              <div className="p-10 bg-white/2 flex items-center justify-end gap-6 border-t border-white/5">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-8 py-3 rounded-none text-[10px] font-bold uppercase tracking-widest font-mono hover:bg-white/5 transition-all text-white/40 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveRule}
                  className="px-10 py-4 rounded-none bg-white text-black text-[10px] font-bold uppercase tracking-widest font-mono shadow-xl shadow-white/5 transition-all hover:scale-105 active:scale-95"
                >
                  Save Logic
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
