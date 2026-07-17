import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from 'framer-motion';
import { Brain, Activity, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const SystemStatusHero = React.memo(function SystemStatusHero({ score, level, xp, streak, momentum, trend, operatingState }: any) {
  // 🧠 PHASE 14E: Premium Delight & Earned Metrics Count-Up Animation
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  const shouldReduceMotion = useReducedMotion();

      useEffect(() => {
    console.log("========== HERO ==========");
    console.log({ receivedScore: score });
    const controls = animate(count, score || 0, { duration: shouldReduceMotion ? 0 : 1.5, ease: "easeOut", delay: 0.2 });
    return () => controls.stop();
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
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-1">TODAY'S SCORE</span>
          <motion.span className="text-7xl font-black tracking-tighter text-white drop-shadow-md leading-none">
            {rounded}
          </motion.span>
        </div>
      </div>

       <div className="w-full max-w-[280px] flex justify-between px-6 py-2.5 bg-[#050505]/50 border border-white/5 rounded-[16px] backdrop-blur-md shadow-sm">
        <div className="text-center relative overflow-hidden">
          {!shouldReduceMotion && <motion.div initial={{ x: '-100%' }} animate={{ x: '200%' }} transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none" />}
          <div className="flex items-baseline gap-1"><span className="text-[15px] font-semibold text-white tracking-tight">{level}</span><span className="text-[12px] text-white/40 font-medium">Level</span></div>
        </div>
        <div className="w-px h-full bg-white/5" />
        <div className="text-center relative overflow-hidden">
          {!shouldReduceMotion && <motion.div initial={{ x: '-100%' }} animate={{ x: '200%' }} transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }} className="absolute inset-0 bg-gradient-to-r from-transparent via-[#A855F7]/30 to-transparent skew-x-12 pointer-events-none" />}
          <div className="flex items-baseline gap-1"><span className="text-[15px] font-semibold text-[#A855F7] tracking-tight">{xp}</span><span className="text-[12px] text-white/40 font-medium">XP</span></div>
        </div>
        <div className="w-px h-full bg-white/5" />
        <div className="text-center flex items-center justify-center gap-1.5">
          <TrendIcon size={14} className={trend === 'improving' ? 'text-[#00FFA3]' : trend === 'declining' ? 'text-red-400' : 'text-white/50'} />
          <span className="text-[15px] font-semibold text-white tracking-tight">{momentum}</span>
        </div>
      </div>
    </motion.section>
  );
});

export const CapacityBudgetCard = React.memo(function CapacityBudgetCard({ cap, cab }: any) {
  if (!cap || !cab) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-[#050505] border border-white/5 rounded-[24px] p-5">
       <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center">
            <Activity size={12} className="text-cyan-400" />
          </div>
          <h3 className="text-white/60 text-[13px] font-medium">Energy Today</h3>
        </div>
        <span className="text-[11px] font-medium text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full capitalize">{cap.capacity_level}</span>
      </div>
      <div className="flex justify-between items-end mb-5">
        <div className="flex items-baseline gap-1">
           <span className="text-4xl font-semibold text-white tracking-tight">{cap.capacity_score}</span>
           <span className="text-[13px] text-white/40 font-medium">/ 100</span>
        </div>
        <div className="text-right flex flex-col">
           <span className="text-[16px] font-semibold text-white tracking-tight">{cab.available_effort_units}</span>
           <span className="text-[11px] text-white/40 font-medium">Effort Units</span>
        </div>
      </div>
      <div className="pt-4 border-t border-white/5 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[12px] text-white/40 font-medium">Limiting Factor</span>
          <span className="text-[12px] font-medium text-white capitalize">{cap.limiting_factor?.replace('_', ' ')}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[12px] text-white/40 font-medium">Friction Tolerance</span>
          <span className="text-[12px] font-medium text-white capitalize">{cab.max_friction_tolerance}</span>
        </div>
      </div>
    </motion.div>
  );
});

export const DecisionBudgetCard = React.memo(function DecisionBudgetCard({ dbp }: any) {
  if (!dbp) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#050505] border border-white/5 rounded-[24px] p-5">
       <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#00FFA3]/10 flex items-center justify-center">
            <Brain size={12} className="text-[#00FFA3]" />
          </div>
          <h3 className="text-white/60 text-[13px] font-medium">Mental Focus</h3>
        </div>
        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${dbp.budget_status === 'Optimal' ? 'bg-[#00FFA3]/10 text-[#00FFA3]' : 'bg-red-500/10 text-red-400'}`}>{dbp.budget_status}</span>
      </div>
      <div className="mb-5">
        <p className="text-[15px] font-medium text-white/90 leading-relaxed tracking-tight">&quot;{dbp.recommendation}&quot;</p>
      </div>
      {dbp.reason_chain && dbp.reason_chain.length > 0 && (
        <div className="pt-4 border-t border-white/5 space-y-2.5">
           {dbp.reason_chain.map((reason: string, idx: number) => (
             <div key={idx} className="text-[12px] font-medium text-white/50 flex items-start gap-2.5 leading-snug">
               <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1 shrink-0" /> 
               <span>{reason}</span>
             </div>
           ))}
        </div>
      )}
    </motion.div>
  );
});

export const BehaviorTrendCard = React.memo(function BehaviorTrendCard({ tp }: any) {
  if (!tp) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#050505] border border-white/5 rounded-[24px] p-5">
     <div className="flex items-center gap-2 mb-6">
        <div className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center">
          <Zap size={12} className="text-purple-400" />
        </div>
        <h3 className="text-white/60 text-[13px] font-medium">Weekly Progress</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
         <div className="flex flex-col gap-1">
           <span className="text-[12px] text-white/40 font-medium">7-Day Trajectory</span>
           <span className="text-[15px] font-semibold text-white tracking-tight capitalize">{tp.weekly_trend}</span>
         </div>
         <div className="flex flex-col gap-1">
           <span className="text-[12px] text-white/40 font-medium">Habit Consistency</span>
           <span className="text-[15px] font-semibold text-white tracking-tight capitalize">{tp.behavior_drift?.replace(/_/g, ' ')}</span>
         </div>
         <div className="col-span-2 flex flex-col gap-1 pt-4 border-t border-white/5">
           <span className="text-[12px] text-white/40 font-medium">Looking Ahead</span>
           <span className="text-[15px] font-semibold text-[#00FFA3] tracking-tight capitalize">{tp.trajectory}</span>
         </div>
      </div>
    </motion.div>
  );
});

