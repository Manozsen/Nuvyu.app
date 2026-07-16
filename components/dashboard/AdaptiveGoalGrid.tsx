import React from 'react';
import { motion } from 'framer-motion';
import { AdaptiveBentoCard } from './Cards';
import { Footprints, Droplets, Moon, Activity, Flame, Zap } from 'lucide-react';

export const AdaptiveGoalGrid = React.memo(function AdaptiveGoalGrid({ metrics, gp, np, sp, energyColorClass, targetCalories }: any) {
  return (
    <section className="grid grid-cols-2 gap-4">
      {/* Primary Movement & Intake */}
      <AdaptiveBentoCard icon={Footprints} label="Walk Today" value={metrics.steps} target={gp.target_steps} source={gp.goal_source} reason={gp.override_warning || "A daily walking goal maintains your cardiovascular baseline."} color="text-[#00FFA3]" delay={0.1} />
      <AdaptiveBentoCard icon={Droplets} label="Stay Hydrated" value={metrics.water} target={`${gp.target_water}ml`} source={gp.goal_source} reason={"Proper hydration will support muscle recovery today."} color="text-blue-400" delay={0.15} />
      
       {/* Energy & Nutrition Block */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        whileInView={{ opacity: 1, y: 0 }} 
        viewport={{ once: true, margin: "-20px" }}
        whileTap={{ scale: 0.98 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }} 
        className="bg-[#050505]/50 border border-white/5 rounded-[24px] p-5 flex flex-col justify-between shadow-sm col-span-2 cursor-pointer"
      >
        <div className="flex items-center gap-2 mb-5">
          <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Flame size={12} className={energyColorClass} />
          </div>
          <span className="text-white/60 text-[13px] font-medium tracking-tight">Fuel Your Body</span>
        </div>
        <div className="flex justify-between items-end mb-5 border-b border-white/5 pb-5">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold text-white tracking-tight">{metrics.energy_stats?.totalBurn || 0}</span>
              <span className="text-white/40 text-[13px] font-medium">burned</span>
            </div>
            <div className="text-[#00FFA3] text-[12px] font-medium mt-1">{metrics.energy_stats?.activityBurn || 0} from activity</div>
          </div>
          <div className="text-right flex flex-col">
            <div className="flex items-baseline gap-1.5 justify-end">
              <span className="text-2xl font-semibold text-orange-400 tracking-tight">{metrics.energy_stats?.intakeCalories || 0}</span>
              <span className="text-white/40 text-[13px] font-medium">/ {metrics.energy_stats?.targetCalories || targetCalories} eaten</span>
            </div>
            <div className="text-white/40 text-[12px] font-medium mt-1">{metrics.energy_stats?.deficit ? 'On track for fat loss' : 'Maintaining energy'}</div>
          </div>
        </div>
        <div className="flex justify-between items-center text-[13px] font-medium tracking-tight">
          <span className="text-white/60">Protein: <span className={np.protein_target_hit ? "text-[#00FFA3]" : "text-orange-400"}>{np.protein_target_hit ? 'Target reached' : 'Keep eating protein'}</span></span>
          <span className="text-white/60">Sugar-free for <span className="text-white">{np.sugar_avoidance_streak} days</span></span>
        </div>
      </motion.div>

      {/* Recovery Block */}
      <AdaptiveBentoCard icon={Moon} label="Prioritize Sleep" value={metrics.sleep_hours || 0} target={`${gp.target_sleep || 7.5}h`} source="auto" reason={`Deep rest is critical to rebuild your nervous system.`} color="text-indigo-400" delay={0.25} />
      <AdaptiveBentoCard icon={Activity} label="Recover Well" value={`${metrics.recovery_score || 0}%`} target={metrics.recovery_state} source="auto" reason={sp?.daily_strain_score > 30 ? 'Prioritize rest after recent physical strain.' : 'Your capacity is stable. You are ready to push.'} color="text-purple-400" delay={0.3} />
    </section>
  );
});
