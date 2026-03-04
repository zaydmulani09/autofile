import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Shield, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2,
  Lock,
  Zap,
  Clock,
  Info,
  Loader2
} from 'lucide-react';
import zxcvbn from 'zxcvbn';
import { cn } from '../utils';

export default function PasswordChecker() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwnedCount, setPwnedCount] = useState<number | null>(null);
  const [isCheckingPwned, setIsCheckingPwned] = useState(false);

  const result = useMemo(() => zxcvbn(password), [password]);

  useEffect(() => {
    if (!password) {
      setPwnedCount(null);
      return;
    }

    const checkPwned = async () => {
      setIsCheckingPwned(true);
      try {
        // SHA-1 hashing client-side
        const msgUint8 = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        
        const prefix = hashHex.slice(0, 5);
        const suffix = hashHex.slice(5);

        const response = await fetch(`/api/auth/pwned/${prefix}`);
        if (!response.ok) throw new Error('Failed to check pwned status');
        
        const data = await response.json();
        const match = data.hashes.find((h: any) => h.suffix === suffix);
        setPwnedCount(match ? match.count : 0);
      } catch (err) {
        console.error('Pwned check error:', err);
      } finally {
        setIsCheckingPwned(false);
      }
    };

    const timer = setTimeout(checkPwned, 500);
    return () => clearTimeout(timer);
  }, [password]);

  const strengthColor = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-emerald-500'
  ][result.score];

  const strengthLabel = [
    'CRITICAL_WEAKNESS',
    'LOW_SECURITY',
    'MODERATE_PROTECTION',
    'HIGH_SECURITY',
    'OPTIMAL_ENCRYPTION'
  ][result.score];

  const generateStrongPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let pass = '';
    for (let i = 0; i < 16; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 opacity-60">
            <div className="w-4 h-px bg-white"></div>
            <span className="text-white text-[8px] font-mono tracking-wider">012</span>
          </div>
          <h2 className="text-2xl font-bold tracking-widest uppercase italic transform -skew-x-12 font-mono">Safety Checker</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-[8px] font-mono uppercase tracking-widest text-white/40">
            <ShieldCheck className="w-3 h-3" />
            K-Anonymity Protocol Active
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Checker */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/2 border border-white/10 p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] font-mono">Input Sequence</label>
                <button 
                  onClick={generateStrongPassword}
                  className="text-[8px] font-mono uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Generate Strong
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ENTER_PASSWORD_FOR_ANALYSIS..."
                  className="w-full bg-white/5 border border-white/10 rounded-none pl-12 pr-12 py-4 text-[12px] font-mono uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-white/50 transition-all font-bold"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Strength Meter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Strength Level</span>
                <span className={cn("text-[10px] font-mono font-bold uppercase tracking-widest", result.score < 2 ? "text-red-400" : "text-emerald-400")}>
                  {strengthLabel}
                </span>
              </div>
              <div className="h-1 bg-white/5 w-full flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className={cn(
                      "h-full flex-1 transition-all duration-500",
                      i <= result.score && password ? strengthColor : "bg-white/5"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-white/5 border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3 h-3 text-white/40" />
                  <span className="text-[8px] font-mono uppercase tracking-widest text-white/40">Entropy</span>
                </div>
                <p className="text-xl font-mono font-bold italic transform -skew-x-12">
                  {password ? Math.round(result.guesses_log10 * 3.322) : 0} <span className="text-[10px] not-italic opacity-40">BITS</span>
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3 h-3 text-white/40" />
                  <span className="text-[8px] font-mono uppercase tracking-widest text-white/40">Crack Time</span>
                </div>
                <p className="text-sm font-mono font-bold uppercase tracking-widest truncate">
                  {password ? result.crack_times_display.offline_slow_hashing_1e4_per_second : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Pwned Status */}
          <AnimatePresence>
            {password && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "p-6 border flex items-center gap-4",
                  pwnedCount === null ? "bg-white/5 border-white/10" :
                  pwnedCount > 0 ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"
                )}
              >
                {isCheckingPwned ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                ) : pwnedCount === 0 ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                )}
                <div>
                  <h4 className="text-[10px] font-bold font-mono uppercase tracking-widest">
                    {isCheckingPwned ? 'QUERYING_PWNED_DATABASE...' : 
                     pwnedCount === 0 ? 'CLEAN_DATA_RECORD' : 'DATA_BREACH_DETECTED'}
                  </h4>
                  <p className="text-[8px] font-mono uppercase tracking-widest text-white/40 mt-1">
                    {isCheckingPwned ? 'Verifying hash suffix via k-anonymity...' :
                     pwnedCount === 0 ? 'This password was not found in any known public data breaches.' :
                     `Warning: This password has appeared in ${pwnedCount.toLocaleString()} data breaches.`}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Analysis */}
        <div className="space-y-6">
          <div className="bg-white/2 border border-white/10 p-6 space-y-6">
            <h3 className="text-[10px] font-bold font-mono uppercase tracking-widest border-b border-white/10 pb-4 flex items-center gap-2">
              <Info className="w-3 h-3" />
              Structural Analysis
            </h3>
            
            <div className="space-y-4">
              {result.feedback.warning && (
                <div className="flex gap-3">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-[9px] font-mono uppercase tracking-widest text-red-400 leading-relaxed">
                    {result.feedback.warning}
                  </p>
                </div>
              )}
              
              {result.feedback.suggestions.length > 0 ? (
                result.feedback.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-3">
                    <Shield className="w-4 h-4 text-white/20 shrink-0" />
                    <p className="text-[9px] font-mono uppercase tracking-widest text-white/40 leading-relaxed">
                      {s}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <p className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 leading-relaxed">
                    Optimal structural complexity detected.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/2 border border-white/10 p-6">
            <h3 className="text-[10px] font-bold font-mono uppercase tracking-widest border-b border-white/10 pb-4 mb-4">
              Security Protocol
            </h3>
            <ul className="space-y-3">
              {[
                'Client-side SHA-1 hashing',
                'K-Anonymity API transmission',
                'Zero-log input processing',
                'Real-time entropy analysis'
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-2 text-[8px] font-mono uppercase tracking-widest text-white/20">
                  <div className="w-1 h-1 bg-white/20" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
