import React from 'react';
import { motion } from 'framer-motion';
import { AdaptiveBentoCard } from './Cards';
import { Footprints, Droplets, Moon, Activity, Flame, Zap } from 'lucide-react';

export const AdaptiveGoalGrid = React.memo(function AdaptiveGoalGrid({ metrics, gp, np, sp, energyColorClass, targetCalories }: any) {
  return (
    <section className="grid grid-cols-2 gap-4">
      {/* Primary Movement & Intake */}
      <AdaptiveBentoCard icon={Footprints} label="Steps" value={metrics.steps} target={gp.target_steps} source={gp.goal_source} reason={gp.override_warning || "AI optimized target."} color="text-[#00FFA3]" delay={0.1} />
      <AdaptiveBentoCard icon={Droplets} label="Water" value={metrics.water} target={`${gp.target_water}ml`} source={gp.goal_source} reason={"Hydration baseline."} color="text-blue-400" delay={0.15} />
      
      {/* Energy & Nutrition Block */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-5 flex flex-col justify-between shadow-xl col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <Flame size={16} className={energyColorClass} />
          <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Energy Balance & Nutrition</span>
        </div>
        <div className="flex justify-between items-end mb-4 border-b border-white/5 pb-4">
          <div><div className="flex items-baseline gap-1"><span className="text-4xl font-black text-white">{metrics.energy_stats?.totalBurn || 0}</span><span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Out</span></div><div className="text-[#00FFA3] text-[10px] font-bold uppercase tracking-widest mt-1">{metrics.energy_stats?.activityBurn || 0} active</div></div>
          <div className="text-right"><div className="flex items-baseline gap-1 justify-end"><span className="text-2xl font-bold text-orange-400">{metrics.energy_stats?.intakeCalories || 0}</span><span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">/ {metrics.energy_stats?.targetCalories || targetCalories} In</span></div><div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">{metrics.energy_stats?.deficit ? 'Deficit' : 'Maintenance'}</div></div>
        </div>
        <div className="flex justify-between items-center text-[11px] font-bold tracking-widest uppercase">
          <span className="text-white/50">Protein: <span className={np.protein_target_hit ? "text-[#00FFA3]" : "text-orange-400"}>{np.protein_target_hit ? 'Hit' : 'Pending'}</span></span>
          <span className="text-white/50">Sugar Free: <span className="text-white">{np.sugar_avoidance_streak} Days</span></span>
        </div>
      </motion.div>

      {/* Recovery Block */}
      <AdaptiveBentoCard icon={Moon} label="Sleep" value={metrics.sleep_hours || 0} target={`${gp.target_sleep || 7.5}h`} source="auto" reason={`Optimal required.`} color="text-indigo-400" delay={0.25} />
      <AdaptiveBentoCard icon={Activity} label="Recovery" value={`${metrics.recovery_score || 0}%`} target={metrics.recovery_state} source="auto" reason={sp?.daily_strain_score > 30 ? 'High physical strain.' : 'Stable capacity.'} color="text-purple-400" delay={0.3} />
    </section>
  );
});
