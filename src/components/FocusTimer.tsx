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
    <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight">Focus Timer</h2>
        <p className="text-white/40 mt-1">Boost your productivity with the Pomodoro technique</p>
      </div>

      <div className="glass-panel p-12 w-full flex flex-col items-center relative overflow-hidden">
        {/* Progress Background */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full bg-accent/5"
          initial={{ height: 0 }}
          animate={{ height: `${progress * 100}%` }}
          transition={{ duration: 0.5 }}
        />

        <div className="flex gap-2 mb-12 relative z-10">
          {(Object.keys(MODES) as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => changeMode(m)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === m 
                  ? 'bg-white/10 text-white shadow-lg' 
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>

        <div className="relative mb-12 z-10">
          <motion.div 
            key={timeLeft}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-8xl font-mono font-bold tracking-tighter"
          >
            {formatTime(timeLeft)}
          </motion.div>
        </div>

        <div className="flex gap-4 relative z-10">
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isActive 
                ? 'bg-white/10 text-white' 
                : 'bg-accent text-white shadow-xl shadow-accent/20 hover:scale-105'
            }`}
          >
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <button
            onClick={resetTimer}
            className="w-16 h-16 rounded-full bg-white/5 text-white/40 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mt-12 w-full">
        <div className="glass-panel p-6 text-center">
          <Brain className="w-6 h-6 text-accent mx-auto mb-2" />
          <h4 className="text-sm font-bold">Focus</h4>
          <p className="text-xs text-white/40 mt-1">25 min deep work</p>
        </div>
        <div className="glass-panel p-6 text-center">
          <Coffee className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold">Short Break</h4>
          <p className="text-xs text-white/40 mt-1">5 min recharge</p>
        </div>
        <div className="glass-panel p-6 text-center">
          <TimerIcon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold">Long Break</h4>
          <p className="text-xs text-white/40 mt-1">15 min rest</p>
        </div>
      </div>
    </div>
  );
}
