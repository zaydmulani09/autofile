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
        <h2 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">Focus Timer</h2>
        <p className="text-white/40 mt-3 text-lg font-medium">Boost your productivity with the Pomodoro technique</p>
      </div>

      <div className="glass-panel p-16 w-full flex flex-col items-center relative overflow-hidden rounded-[3rem]">
        {/* Progress Background */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full bg-accent/10"
          initial={{ height: 0 }}
          animate={{ height: `${progress * 100}%` }}
          transition={{ duration: 0.5 }}
        />

        <div className="flex gap-3 mb-16 relative z-10 bg-white/5 p-1.5 rounded-2xl border border-white/5">
          {(Object.keys(MODES) as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => changeMode(m)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                mode === m 
                  ? 'bg-white/10 text-white shadow-xl ring-1 ring-white/20' 
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        <div className="relative mb-16 z-10">
          <motion.div 
            key={timeLeft}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[10rem] font-mono font-bold tracking-tighter leading-none text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            {formatTime(timeLeft)}
          </motion.div>
        </div>

        <div className="flex gap-6 relative z-10">
          <button
            onClick={toggleTimer}
            className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${
              isActive 
                ? 'bg-white/10 text-white ring-1 ring-white/20' 
                : 'bg-accent text-white shadow-2xl shadow-accent/40 hover:scale-110 active:scale-95'
            }`}
          >
            {isActive ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
          </button>
          <button
            onClick={resetTimer}
            className="w-20 h-20 rounded-3xl bg-white/5 text-white/20 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all ring-1 ring-white/5 hover:ring-white/20"
          >
            <RotateCcw className="w-8 h-8" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mt-16 w-full">
        <div className="glass-panel p-8 text-center group hover:border-accent/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Brain className="w-6 h-6 text-accent" />
          </div>
          <h4 className="text-sm font-bold tracking-widest uppercase text-white/60">Focus</h4>
          <p className="text-xs text-white/30 mt-2 font-medium">25 min deep work</p>
        </div>
        <div className="glass-panel p-8 text-center group hover:border-emerald-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Coffee className="w-6 h-6 text-emerald-500" />
          </div>
          <h4 className="text-sm font-bold tracking-widest uppercase text-white/60">Break</h4>
          <p className="text-xs text-white/30 mt-2 font-medium">5 min recharge</p>
        </div>
        <div className="glass-panel p-8 text-center group hover:border-blue-500/30 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <TimerIcon className="w-6 h-6 text-blue-500" />
          </div>
          <h4 className="text-sm font-bold tracking-widest uppercase text-white/60">Rest</h4>
          <p className="text-xs text-white/30 mt-2 font-medium">15 min rest</p>
        </div>
      </div>
    </div>
  );
}
