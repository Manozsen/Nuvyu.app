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
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 flex flex-col items-center relative shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
    >
      <div className="w-full flex justify-between items-center mb-4 px-2">
        <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-widest">System Status</h3>
        <span className="text-[#00FFA3] bg-[#00FFA3]/10 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-[#00FFA3]/20">
          {operatingState?.replace('_', ' ') || 'Optimal'}
        </span>
      </div>

      <div className="relative w-48 h-48 flex items-center justify-center mb-4">
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle cx="96" cy="96" r="84" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="transparent" />
          <motion.circle 
            cx="96" cy="96" r="84" stroke="#00FFA3" strokeWidth="10" fill="transparent"
            strokeDasharray={527} strokeDashoffset={527 - (527 * score) / 100} strokeLinecap="round"
            initial={{ strokeDashoffset: 527 }} animate={{ strokeDashoffset: 527 - (527 * score) / 100 }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            className="drop-shadow-[0_0_15px_rgba(0,255,163,0.4)]"
          />
        </svg>
         <div className="text-center z-10">
          <motion.span className="text-6xl font-black tracking-tighter drop-shadow-lg text-white">
            {rounded}
          </motion.span>
          <p className="text-[#00FFA3] text-[10px] font-bold uppercase tracking-widest mt-1">Daily Score</p>
        </div>
      </div>

      <div className="w-full grid grid-cols-4 gap-2 pt-4 border-t border-white/5">
        <div className="text-center"><span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Level</span><span className="text-sm font-black text-white">{level}</span></div>
        <div className="text-center"><span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">XP</span><span className="text-sm font-black text-[#A855F7]">{xp}</span></div>
        <div className="text-center"><span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Momentum</span><span className="text-sm font-black text-[#00FFA3]">{momentum}</span></div>
        <div className="text-center flex flex-col items-center justify-center"><span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Trend</span><TrendIcon size={16} className={trend === 'improving' ? 'text-[#00FFA3]' : trend === 'declining' ? 'text-red-400' : 'text-white/50'} /></div>
      </div>
    </motion.section>
  );
});

export const CapacityBudgetCard = React.memo(function CapacityBudgetCard({ cap, cab }: any) {
  if (!cap || !cab) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-cyan-500/5 border border-cyan-500/20 rounded-[1.5rem] p-5 shadow-xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-cyan-400/80 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><Activity size={12} /> Capacity Budget</h3>
        <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md">{cap.capacity_level}</span>
      </div>
      <div className="flex justify-between items-end mb-3">
        <div>
           <span className="text-3xl font-black text-white tracking-tight">{cap.capacity_score}</span><span className="text-[10px] text-white/40 font-bold ml-1 uppercase">/ 100</span>
        </div>
        <div className="text-right">
           <span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-0.5">Effort Units</span>
           <span className="text-sm font-bold text-cyan-400">{cab.available_effort_units} Remaining</span>
        </div>
      </div>
      <div className="text-[10px] font-medium text-white/60 leading-relaxed border-t border-white/5 pt-3">
        Limiting Factor: <span className="capitalize text-white font-bold">{cap.limiting_factor?.replace('_', ' ')}</span>. {cab.max_friction_tolerance === 'high' ? 'Safe to push boundaries today.' : 'Keep friction low.'}
      </div>
    </motion.div>
  );
});

export const DecisionBudgetCard = React.memo(function DecisionBudgetCard({ dbp }: any) {
  if (!dbp) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-5 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><Brain size={12} /> Decision Budget</h3>
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${dbp.budget_status === 'Optimal' ? 'bg-[#00FFA3]/10 text-[#00FFA3]' : 'bg-red-500/10 text-red-400'}`}>{dbp.budget_status}</span>
      </div>
      <div className="mb-4">
        <p className="text-sm font-medium text-white/90 leading-snug">&quot;{dbp.recommendation}&quot;</p>
      </div>
      <div className="bg-white/5 rounded-xl p-3 space-y-2">
         {dbp.reason_chain?.map((reason: string, idx: number) => (
           <div key={idx} className="text-[9px] font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
             <div className="w-1 h-1 rounded-full bg-white/20" /> {reason}
           </div>
         ))}
      </div>
    </motion.div>
  );
});

export const BehaviorTrendCard = React.memo(function BehaviorTrendCard({ tp }: any) {
  if (!tp) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-5 shadow-xl">
      <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mb-4"><Zap size={12} /> Behavior Trend</h3>
      <div className="grid grid-cols-2 gap-4">
         <div><span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">7-Day Trajectory</span><span className="text-xs font-black text-white capitalize">{tp.weekly_trend}</span></div>
         <div><span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Behavior Drift</span><span className="text-xs font-black text-white capitalize">{tp.behavior_drift?.replace(/_/g, ' ')}</span></div>
         <div className="col-span-2 border-t border-white/5 pt-3"><span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">AI Projection</span><span className="text-sm font-medium text-[#00FFA3] capitalize">{tp.trajectory}</span></div>
      </div>
    </motion.div>
  );
});
