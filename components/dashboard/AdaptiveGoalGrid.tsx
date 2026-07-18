import React from 'react';
import { motion } from 'framer-motion';
import { Footprints, Droplets, Moon, Flame, CheckCircle, Activity } from 'lucide-react';
import type { DashboardUITarget } from '../../lib/presentation/mappers';

const resolveIcon = (name: string) => {
  if (name === 'droplets') return Droplets;
  if (name === 'footprints') return Footprints;
  if (name === 'flame') return Flame;
  if (name === 'moon') return Moon;
  return Activity;
};

// 🧠 SYSTEM 2: NUVYU TARGETS (PLAN)
// Receives pre-computed, pre-ordered DashboardUITargets. Absolutely no rendering logic.
export const NuvyuTargets = React.memo(function NuvyuTargets({ targets }: { targets: DashboardUITarget[] }) {
  if (!targets || targets.length === 0) return null;
  return (
    <div className="space-y-3 px-1">
      {targets.map(target => (
        <TargetItem 
          key={target.id}
          icon={resolveIcon(target.ui.icon)} 
          text={`${target.ui.action} (${target.value}${target.unit !== 'hit' ? target.unit : ''})`} 
          isCompleted={target.lifecycle === 'completed'}
        />
      ))}
    </div>
  );
});

const TargetItem = ({ icon: Icon, text, isCompleted }: any) => (
  <div className={`flex items-center gap-4 border border-white/5 rounded-[16px] p-4 transition-all duration-300 ${isCompleted ? 'bg-[#00FFA3]/5 opacity-50' : 'bg-[#050505]/40'}`}>
    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? 'bg-[#00FFA3]/20' : 'bg-white/5'}`}>
      {isCompleted ? <CheckCircle size={16} className="text-[#00FFA3]" /> : <Icon size={16} className="text-white/70" />}
    </div>
    <span className={`text-[15px] font-medium tracking-tight ${isCompleted ? 'text-white/40 line-through' : 'text-white/90'}`}>{text}</span>
  </div>
);

// 🧠 SYSTEM 3: TODAY'S PROGRESS (EXECUTION ENGINE)
// Generic Progress Engine mapping DashboardUITargets. 
export const TodayProgress = React.memo(function TodayProgress({ targets }: { targets: DashboardUITarget[] }) {
  if (!targets || targets.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 px-1">
      {targets.map(target => (
        <ProgressCard key={target.id} target={target} />
      ))}
    </div>
  );
});

// Generic Progress Card UI Component (Logic-free)
const ProgressCard = ({ target }: { target: DashboardUITarget }) => {
  const Icon = resolveIcon(target.ui.icon);
  const { current, target: targetAmount, percentage } = target.progress;
  const isCompleted = target.lifecycle === 'completed';

  return (
    <div className={`bg-[#050505] border rounded-[20px] p-4 flex flex-col justify-between min-h-[130px] relative transition-all duration-500 ${isCompleted ? 'border-[#00FFA3]/20 shadow-[0_0_15px_rgba(0,255,163,0.05)]' : 'border-white/5'}`}>
      <div className="flex items-center gap-2 mb-4 justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} className={isCompleted ? 'text-[#00FFA3]' : target.ui.color} />
          <span className="text-white/60 text-[12px] font-medium tracking-tight">{target.ui.focus}</span>
        </div>
        {isCompleted && <span className="text-[9px] font-bold uppercase tracking-widest text-[#00FFA3] bg-[#00FFA3]/10 px-1.5 py-0.5 rounded">Done</span>}
      </div>

      <div className="flex flex-col mt-auto">
        <div className="flex items-end justify-between mb-3">
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-semibold tracking-tight ${isCompleted ? 'text-[#00FFA3]' : 'text-white'}`}>{current}</span>
            <span className="text-white/40 text-[11px] font-medium">{target.unit !== 'hit' ? `/ ${targetAmount} ${target.unit}` : ''}</span>
          </div>
          <span className="text-[12px] font-bold text-white/90">{Math.round(percentage)}%</span>
        </div>

        {/* Premium Animated Progress Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={`absolute top-0 left-0 h-full rounded-full ${isCompleted ? 'bg-[#00FFA3]' : 'bg-gradient-to-r from-[#00F58C] to-[#00D975]'}`}
            style={{ filter: percentage > 0 && !isCompleted ? 'drop-shadow(0px 0px 4px rgba(0,245,140,0.5))' : 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

// 🧠 SYSTEM 4: FUEL & BURN (METABOLIC STATE)
// Independent dashboard insight. Represents metabolic state, not behavior completion.
export const FuelAndBurnInsight = React.memo(function FuelAndBurnInsight({ metrics, targetCalories, np, energyColorClass }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-20px" }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }} 
      className="bg-[#050505] border border-white/5 rounded-[24px] p-5 flex flex-col justify-between shadow-sm cursor-pointer"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center">
          <Flame size={12} className={energyColorClass || "text-orange-400"} />
        </div>
        <span className="text-white/60 text-[13px] font-medium tracking-tight">Fuel & Burn</span>
      </div>
      <div className="flex justify-between items-end mb-5 border-b border-white/5 pb-5">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-semibold text-white tracking-tight">{metrics.energy_stats?.totalBurn || 0}</span>
            <span className="text-white/40 text-[13px] font-medium">Out</span>
          </div>
          <div className="text-[#00FFA3] text-[12px] font-medium mt-1">{metrics.energy_stats?.activityBurn || 0} Active</div>
        </div>
        <div className="text-right flex flex-col">
          <div className="flex items-baseline gap-1.5 justify-end">
            <span className="text-2xl font-semibold text-orange-400 tracking-tight">{metrics.energy_stats?.intakeCalories || 0}</span>
            <span className="text-white/40 text-[13px] font-medium">/ {metrics.energy_stats?.targetCalories || targetCalories} In</span>
          </div>
         <div className="text-white/40 text-[12px] font-medium mt-1">{metrics.energy_stats?.deficit ? 'Deficit' : 'Surplus'}</div>
        </div>
      </div>
    </motion.div>
  );
});

// 🧠 SCORE ENGINE V3 ARCHITECTURE (EXPLAINABLE AI)
// Prepared for future Gemini provider. Does not modify current logic.
// Architecture: Base Score + Earned Score - Penalties = Final Score
export interface ScoreV3Breakdown {
  baseScore: number;     // e.g. 60 (Morning readiness: Recovery, Sleep, Stress)
  earnedScore: number;   // e.g. +22 (Walk +6, Water +4, Protein +5, Sleep +7)
  penalties: number;     // e.g. -5 (Late Sleep -3, High Screen Time -2)
  finalScore: number;
  earnedDetails?: Array<{ label: string; points: number }>;
  penaltyDetails?: Array<{ label: string; points: number }>;
}

// Reusable UI component for Future Analytics (Section 8 & 9)
// Unexposed on main dashboard until Engine V3 is fully populated.
export const ExplainableScoreBreakdown = React.memo(function ExplainableScoreBreakdown({ breakdown }: { breakdown: ScoreV3Breakdown }) {
  if (!breakdown) return null;
  return (
    <div className="bg-[#050505] border border-white/5 rounded-[24px] p-5">
      <h3 className="text-white/90 font-medium text-[15px] mb-4">Today's Score Breakdown</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-3 border-b border-white/5">
          <span className="text-white/60 text-[13px]">Morning Base Score</span>
          <span className="text-white font-semibold">{breakdown.baseScore}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-white/5">
          <span className="text-white/60 text-[13px]">Earned Today</span>
          <span className="text-[#00FFA3] font-semibold">+{breakdown.earnedScore}</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-white/5">
          <span className="text-white/60 text-[13px]">Penalties</span>
          <span className="text-red-400 font-semibold">{breakdown.penalties < 0 ? breakdown.penalties : `-${breakdown.penalties}`}</span>
        </div>
        <div className="flex justify-between items-center pt-1">
          <span className="text-white/90 font-medium text-[14px]">Final Score</span>
          <span className="text-white font-bold text-[18px]">{breakdown.finalScore}</span>
        </div>
      </div>
    </div>
  );
});

