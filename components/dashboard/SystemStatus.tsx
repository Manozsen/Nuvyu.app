import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';
import { Brain, Activity, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const SystemStatusHero = React.memo(function SystemStatusHero({ score, level, xp, streak, momentum, trend, operatingState }: any) {
  // 🧠 PHASE 14E: Premium Delight & Earned Metrics Count-Up Animation
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const controls = animate(count, score || 0, { duration: shouldReduceMotion ? 0 : 1.5, ease: "easeOut", delay: 0.2 });
    return controls.stop;
  }, [score, count, shouldReduceMotion]);
    const TrendIcon = trend === 'improving' ? TrendingUp : trend === 'declining' ? TrendingDown : Minus;
  
  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex flex-col items-center relative pt-2 pb-4"
    >
      <div className="relative w-56 h-56 flex items-center justify-center mb-6">
        {/* Ambient Hero Glow */}
        <motion.div 
          animate={shouldReduceMotion ? { opacity: 0.1, scale: 1 } : { opacity: [0.1, 0.2, 0.1], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 blur-[60px] rounded-full pointer-events-none bg-[#00FFA3]" 
        />
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle cx="112" cy="112" r="100" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="transparent" />
          <motion.circle 
            cx="112" cy="112" r="100" stroke="#00FFA3" strokeWidth="4" fill="transparent"
            strokeDasharray={628} strokeLinecap="round"
            initial={{ strokeDashoffset: 628, filter: "drop-shadow(0px 0px 0px rgba(0,255,163,0))" }} 
            animate={{ 
              strokeDashoffset: 628 - (628 * score) / 100,
              filter: score >= 80 ? "drop-shadow(0px 0px 25px rgba(0,255,163,0.4))" : "drop-shadow(0px 0px 10px rgba(0,255,163,0.2))"
            }}
            transition={{ duration: shouldReduceMotion ? 0 : 1.5, delay: 0.2, ease: "easeOut" }}
          />
        </svg>
         <div className="text-center z-10 flex flex-col items-center">
          <motion.span className="text-7xl font-black tracking-tighter text-white drop-shadow-md">
            {rounded}
          </motion.span>
          <span className="text-[12px] font-medium text-white/40 mt-1 capitalize">{operatingState?.replace('_', ' ') || 'Ready'}</span>
        </div>
      </div>

       <div className="w-full max-w-[280px] flex justify-between px-6 py-2 bg-white/[0.02] border border-white/5 rounded-full backdrop-blur-sm">
        <div className="text-center relative overflow-hidden">
          {!shouldReduceMotion && <motion.div initial={{ x: '-100%' }} animate={{ x: '200%' }} transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none" />}
          <div className="flex items-baseline gap-1"><span className="text-[14px] font-bold text-white">{level}</span><span className="text-[10px] text-white/40 font-medium">Lvl</span></div>
        </div>
        <div className="w-px h-full bg-white/10" />
        <div className="text-center relative overflow-hidden">
          {!shouldReduceMotion && <motion.div initial={{ x: '-100%' }} animate={{ x: '200%' }} transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-transparent via-[#A855F7]/30 to-transparent skew-x-12 pointer-events-none" />}
          <div className="flex items-baseline gap-1"><span className="text-[14px] font-bold text-[#A855F7]">{xp}</span><span className="text-[10px] text-white/40 font-medium">XP</span></div>
        </div>
        <div className="w-px h-full bg-white/10" />
        <div className="text-center flex items-center justify-center gap-1">
          <TrendIcon size={12} className={trend === 'improving' ? 'text-[#00FFA3]' : trend === 'declining' ? 'text-red-400' : 'text-white/50'} />
          <span className="text-[14px] font-bold text-white">{momentum}</span>
        </div>
      </div>
    </motion.section>
  );
});

export const CapacityBudgetCard = React.memo(function CapacityBudgetCard({ cap, cab }: any) {
  if (!cap || !cab) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-cyan-500/5 border border-cyan-500/20 rounded-[1.5rem] p-5 shadow-xl relative overflow-hidden">
       <div className="flex justify-between items-center mb-4">
        <h3 className="text-cyan-400/80 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><Activity size={12} /> Energy Today</h3>
        <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md">{cap.capacity_level}</span>
      </div>
      <div className="flex items-end">
        <div>
           <span className="text-3xl font-black text-white tracking-tight">{cap.capacity_score}</span><span className="text-[10px] text-white/40 font-bold ml-1 uppercase">/ 100</span>
        </div>
      </div>
    </motion.div>
  );
});

export const DecisionBudgetCard = React.memo(function DecisionBudgetCard({ dbp }: any) {
  if (!dbp) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-5 shadow-xl">
       <div className="flex justify-between items-center mb-4">
        <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><Brain size={12} /> Mental Focus</h3>
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${dbp.budget_status === 'Optimal' ? 'bg-[#00FFA3]/10 text-[#00FFA3]' : 'bg-red-500/10 text-red-400'}`}>{dbp.budget_status}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-white/90 leading-snug">&quot;{dbp.recommendation}&quot;</p>
      </div>
    </motion.div>
  );
});

export const BehaviorTrendCard = React.memo(function BehaviorTrendCard({ tp }: any) {
  if (!tp) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-5 shadow-xl">
     <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mb-4"><Zap size={12} /> Weekly Progress</h3>
      <div className="grid grid-cols-2 gap-4">
         <div><span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">7-Day Trajectory</span><span className="text-xs font-black text-white capitalize">{tp.weekly_trend}</span></div>
         <div><span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Habit Consistency</span><span className="text-xs font-black text-white capitalize">{tp.behavior_drift?.replace(/_/g, ' ')}</span></div>
         <div className="col-span-2 border-t border-white/5 pt-3"><span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Looking Ahead</span><span className="text-sm font-medium text-[#00FFA3] capitalize">{tp.trajectory}</span></div>
      </div>
    </motion.div>
  );
});
