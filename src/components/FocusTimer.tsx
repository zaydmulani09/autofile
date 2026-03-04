import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Coffee, Brain, Timer as TimerIcon } from 'lucide-react';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const MODES: Record<TimerMode, { label: string, minutes: number, color: string }> = {
  work: { label: 'Focus', minutes: 25, color: '#F27D26' },
  shortBreak: { label: 'Short Break', minutes: 5, color: '#10b981' },
  longBreak: { label: 'Long Break', minutes: 15, color: '#3b82f6' }
};

export default function FocusTimer() {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(MODES.work.minutes * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      // Play sound or notification could go here
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].minutes * 60);
  };

  const changeMode = (newMode: TimerMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(MODES[newMode].minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = 1 - (timeLeft / (MODES[mode].minutes * 60));

  return (
    <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto py-10">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-60">
          <div className="w-8 h-px bg-white"></div>
          <span className="text-white text-[10px] font-mono tracking-wider italic">CHRONOS_V1.0</span>
          <div className="w-8 h-px bg-white"></div>
        </div>
        <h2 className="text-4xl font-bold tracking-widest uppercase italic transform -skew-x-12">Temporal Control</h2>
        <p className="text-white/40 mt-4 text-[10px] font-mono uppercase tracking-widest">Optimize cognitive output via rhythmic interval management.</p>
      </div>

      <div className="glass-panel p-16 w-full flex flex-col items-center relative overflow-hidden rounded-none border-white/10">
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/20" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/20" />
        
        {/* Progress Background */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full bg-white/5 border-t border-white/10"
          initial={{ height: 0 }}
          animate={{ height: `${progress * 100}%` }}
          transition={{ duration: 0.5 }}
        />

        <div className="flex gap-4 mb-16 relative z-10 bg-white/2 p-2 rounded-none border border-white/5">
          {(Object.keys(MODES) as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => changeMode(m)}
              className={`px-8 py-3 rounded-none text-[10px] font-mono font-bold uppercase tracking-widest transition-all ${
                mode === m 
                  ? 'bg-white text-black shadow-xl' 
                  : 'text-white/30 hover:text-white/60 hover:bg-white/5'
              }`}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        <div className="relative mb-16 z-10">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[8px] font-mono text-white/20 tracking-[0.5em] uppercase">
            System_Clock_Active
          </div>
          <motion.div 
            key={timeLeft}
            initial={{ scale: 0.98, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[10rem] font-mono font-bold tracking-tighter leading-none text-white italic transform -skew-x-6"
          >
            {formatTime(timeLeft)}
          </motion.div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
            <div className="w-1 h-1 bg-white/20" />
            <div className="w-1 h-1 bg-white/20" />
            <div className="w-1 h-1 bg-white/20" />
          </div>
        </div>

        <div className="flex gap-8 relative z-10">
          <button
            onClick={toggleTimer}
            className={`w-24 h-24 rounded-none flex items-center justify-center transition-all border ${
              isActive 
                ? 'bg-white/5 text-white border-white/20' 
                : 'bg-white text-black border-white shadow-2xl shadow-white/10 hover:scale-105 active:scale-95'
            }`}
          >
            {isActive ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
          </button>
          <button
            onClick={resetTimer}
            className="w-24 h-24 rounded-none bg-white/2 text-white/20 flex items-center justify-center hover:bg-white/5 hover:text-white transition-all border border-white/5 hover:border-white/20"
          >
            <RotateCcw className="w-8 h-8" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mt-16 w-full">
        <div className="glass-panel p-8 text-center group hover:border-white/30 transition-all rounded-none relative">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10" />
          <div className="w-12 h-12 rounded-none bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <Brain className="w-5 h-5 text-white/60" />
          </div>
          <h4 className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/60">Phase_Focus</h4>
          <p className="text-[8px] font-mono text-white/20 mt-3 uppercase tracking-widest">25m Deep_Work</p>
        </div>
        <div className="glass-panel p-8 text-center group hover:border-white/30 transition-all rounded-none relative">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10" />
          <div className="w-12 h-12 rounded-none bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <Coffee className="w-5 h-5 text-white/60" />
          </div>
          <h4 className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/60">Phase_Break</h4>
          <p className="text-[8px] font-mono text-white/20 mt-3 uppercase tracking-widest">05m Recharge</p>
        </div>
        <div className="glass-panel p-8 text-center group hover:border-white/30 transition-all rounded-none relative">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10" />
          <div className="w-12 h-12 rounded-none bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <TimerIcon className="w-5 h-5 text-white/60" />
          </div>
          <h4 className="text-[10px] font-mono font-bold tracking-widest uppercase text-white/60">Phase_Rest</h4>
          <p className="text-[8px] font-mono text-white/20 mt-3 uppercase tracking-widest">15m System_Rest</p>
        </div>
      </div>
    </div>
  );
}
