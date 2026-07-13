import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Footprints, Droplets, Activity } from 'lucide-react';

interface AdaptiveMissionHeroProps {
  goalPacket: any;
  recoveryRoi: any;
  operatingState: any;
}

export function AdaptiveMissionHero({ goalPacket, recoveryRoi, operatingState }: AdaptiveMissionHeroProps) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.1, duration: 0.4 }}
      className="px-2"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-3xl font-black tracking-tighter text-white">Today's Mission</h2>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FFA3] bg-[#00FFA3]/10 px-2 py-1 rounded-md border border-[#00FFA3]/20">
          {operatingState?.operating_state?.replace('_', ' ') || 'Optimal'}
        </span>
      </div>

      <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
        {/* Subtle background glow based on state */}
        <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[60px] rounded-full opacity-20 pointer-events-none ${goalPacket?.challenge_difficulty === 'Low' ? 'bg-orange-500' : 'bg-[#00FFA3]'}`} />
        
        <div className="space-y-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/20 flex items-center justify-center shrink-0 mt-1">
              <Footprints size={14} className="text-[#00FFA3]" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">{goalPacket?.target_steps || 6000} Steps</div>
              <div className="text-[11px] text-white/50 font-medium uppercase tracking-wider">{goalPacket?.goal_source === 'manual' ? 'Manual Target' : 'AI Adaptive Target'}</div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-1">
              <Droplets size={14} className="text-blue-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight">{goalPacket?.target_water || 3000} ml Water</div>
              <div className="text-[11px] text-white/50 font-medium uppercase tracking-wider">Hydration Baseline</div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-1">
              <Activity size={14} className="text-purple-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-white tracking-tight capitalize">{recoveryRoi?.roi_action || 'Consistency'}</div>
              <div className="text-[11px] text-white/50 font-medium uppercase tracking-wider">Highest Recovery ROI</div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
