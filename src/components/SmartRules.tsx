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
  Maximize2
} from 'lucide-react';
import { SmartRule } from '../types';
import { cn } from '../utils';

interface SmartRulesProps {
  rules: SmartRule[];
  setRules: React.Dispatch<React.SetStateAction<SmartRule[]>>;
}

export default function SmartRules({ rules, setRules }: SmartRulesProps) {
  const [isAdding, setIsAdding] = useState(false);
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

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smart Rules</h1>
          <p className="text-white/40 mt-1">Automate your workflow with powerful conditional rules.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover transition-all flex items-center gap-2 text-sm font-bold shadow-lg shadow-accent/20"
        >
          <Plus className="w-4 h-4" /> Create New Rule
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {rules.map((rule, i) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group transition-all",
              !rule.enabled && "opacity-60 grayscale-[0.5]"
            )}
          >
            <div className="flex items-center gap-6">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                rule.enabled ? "bg-accent/20 text-accent" : "bg-white/5 text-white/20"
              )}>
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{rule.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider">If</span>
                  <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs font-medium">
                    {rule.condition} {rule.operator} "{rule.value}"
                  </div>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Then</span>
                  <div className="px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-xs font-medium text-accent">
                    {rule.action} to "{rule.actionValue}"
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center">
              <button 
                onClick={() => toggleRule(rule.id)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                {rule.enabled ? (
                  <ToggleRight className="w-8 h-8 text-accent" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-white/20" />
                )}
              </button>
              <div className="w-[1px] h-8 bg-white/5 mx-1" />
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white">
                <Settings2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => deleteRule(rule.id)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-red-400"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Rule Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-panel rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold">Create Smart Rule</h3>
                <button onClick={() => setIsAdding(false)}>
                  <Plus className="w-6 h-6 text-white/40 hover:text-white rotate-45" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Rule Name</label>
                  <input 
                    type="text" 
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    placeholder="e.g. Auto-sort Screenshots"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Condition</label>
                    <div className="relative">
                      <select 
                        value={newRule.condition}
                        onChange={(e) => setNewRule({ ...newRule, condition: e.target.value as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent/50"
                      >
                        <option value="extension">Extension</option>
                        <option value="name">Name</option>
                        <option value="size">Size</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Operator</label>
                    <div className="relative">
                      <select 
                        value={newRule.operator}
                        onChange={(e) => setNewRule({ ...newRule, operator: e.target.value as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent/50"
                      >
                        <option value="equals">Equals</option>
                        <option value="contains">Contains</option>
                        <option value="greaterThan">Greater Than</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Value</label>
                  <input 
                    type="text" 
                    value={newRule.value}
                    onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                    placeholder="e.g. pdf"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider">Action</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <select 
                        value={newRule.action}
                        onChange={(e) => setNewRule({ ...newRule, action: e.target.value as any })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-accent/50"
                      >
                        <option value="move">Move to Folder</option>
                        <option value="copy">Copy to Folder</option>
                        <option value="delete">Delete File</option>
                      </select>
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/20" />
                    <div className="flex-1 relative">
                      <input 
                        type="text" 
                        value={newRule.actionValue}
                        onChange={(e) => setNewRule({ ...newRule, actionValue: e.target.value })}
                        placeholder="/Documents/Sorted"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white/5 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="px-6 py-2 rounded-xl text-sm font-bold hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveRule}
                  className="px-8 py-2 rounded-xl bg-accent hover:bg-accent-hover text-sm font-bold shadow-lg shadow-accent/20"
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
