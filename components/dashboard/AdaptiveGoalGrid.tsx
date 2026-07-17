import React from 'react';
import { motion } from 'framer-motion';
import { Footprints, Droplets, Moon, Flame } from 'lucide-react';

// 🧠 SYSTEM 2: NUVYU TARGETS (PLAN)
// Extremely lightweight daily plan. No analytics. No progress bars.
// Future Architecture: Gemini AI will generate these values dynamically 
// based on Burnout Risk, Identity, and Recovery.
export const NuvyuTargets = React.memo(function NuvyuTargets({ gp }: any) {
  const targetProtein = gp?.target_protein || 145; // Safe default injected for future architecture

  return (
    <div className="space-y-3 px-1">
      <TargetItem icon={Footprints} text={`Walk ${gp?.target_steps || 6000} Steps Today`} />
      <TargetItem icon={Droplets} text={`Drink ${(gp?.target_water || 3000) / 1000}L Water`} />
      <TargetItem icon={Moon} text={`Sleep Around ${gp?.target_sleep || 7.5} Hours Tonight`} />
      <TargetItem icon={Flame} text={`Reach ${targetProtein}g Protein`} />
    </div>
  );
});

const TargetItem = ({ icon: Icon, text }: any) => (
  <div className="flex items-center gap-4 bg-[#050505]/40 border border-white/5 rounded-[16px] p-4">
    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
      <Icon size={16} className="text-white/70" />
    </div>
    <span className="text-[15px] font-medium text-white/90 tracking-tight">{text}</span>
  </div>
);

// 🧠 SYSTEM 3: TODAY'S PROGRESS (EXECUTION ENGINE)
// Generic, highly reusable Progress Engine. 
// Can accept data from local logs, Health Connect, or Wearables without UI changes.
export const TodayProgress = React.memo(function TodayProgress({ metrics, gp, np }: any) {
  const targetProtein = gp?.target_protein || 145;
  const currentProtein = np?.current_protein || (np?.protein_target_hit ? targetProtein : 0);

  return (
    <div className="grid grid-cols-2 gap-3 px-1">
      <ProgressCard 
        icon={Footprints} title="Steps" 
        current={metrics.steps} target={gp?.target_steps || 6000} 
        unit="" color="text-[#00FFA3]" 
      />
      <ProgressCard 
        icon={Droplets} title="Water" 
        current={metrics.water} target={gp?.target_water || 3000} 
        unit="ml" color="text-blue-400" 
      />
      <ProgressCard 
        icon={Moon} title="Sleep" 
        current={metrics.sleep_hours || 0} target={gp?.target_sleep || 7.5} 
        unit="h" color="text-indigo-400" 
      />
      <ProgressCard 
        icon={Flame} title="Protein" 
        current={currentProtein} target={targetProtein} 
        unit="g" color="text-orange-400" 
      />
    </div>
  );
});

// Generic Progress Card UI Component (Logic-free)
const ProgressCard = ({ icon: Icon, title, current, target, unit, color }: any) => {
  const safeCurrent = typeof current === 'number' ? current : parseFloat(current) || 0;
  const safeTarget = typeof target === 'number' ? target : parseFloat(target) || 1;
  const progress = Math.min(100, Math.max(0, (safeCurrent / safeTarget) * 100));

  return (
    <div className="bg-[#050505] border border-white/5 rounded-[20px] p-4 flex flex-col justify-between min-h-[130px] relative">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={14} className={color} />
        <span className="text-white/60 text-[12px] font-medium tracking-tight">{title}</span>
      </div>

      <div className="flex flex-col mt-auto">
        <div className="flex items-end justify-between mb-3">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-semibold text-white tracking-tight">{current}</span>
            <span className="text-white/40 text-[11px] font-medium">/ {target} {unit}</span>
          </div>
          <span className="text-[12px] font-bold text-white/90">{Math.round(progress)}%</span>
        </div>

        {/* Premium Animated Progress Bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#00F58C] to-[#00D975]"
            style={{ filter: progress > 0 ? 'drop-shadow(0px 0px 4px rgba(0,245,140,0.5))' : 'none' }}
          />
        </div>
      </div>
    </div>
  );
};
