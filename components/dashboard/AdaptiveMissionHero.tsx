import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Zap, Footprints, Droplets, Activity } from 'lucide-react';

interface AdaptiveMissionHeroProps {
  goalPacket: any;
  recoveryRoi: any;
  operatingState: any;
}

export function AdaptiveMissionHero({ goalPacket, recoveryRoi, operatingState }: AdaptiveMissionHeroProps) {
  const shouldReduceMotion = useReducedMotion();
  // Haptic feedback can be added later on native platforms.
  
  // 🧠 FUTURE AI PLACEHOLDER
  // This component is preserved for future Gemini-generated adaptive missions.
  // Render is currently hidden behind a feature flag to prevent visual duplication.
  const FEATURE_MISSIONS_ENABLED = false;
  if (!FEATURE_MISSIONS_ENABLED) return null;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.1, duration: 0.4 }}
      className="px-4 w-full"
    >
      <div className="w-full bg-[#0A0A0A]/40 border border-white/5 rounded-3xl p-5 shadow-xl relative overflow-hidden backdrop-blur-md">
         <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] shadow-[0_0_8px_rgba(0,255,163,0.8)]" />
            <div className="flex-1 flex justify-between items-baseline">
              <span className="text-[16px] font-medium text-white/90">Walk</span>
              <span className="text-[15px] font-bold text-white">{goalPacket?.target_steps || 6000} <span className="text-[12px] font-medium text-white/40">steps</span></span>
            </div>
          </div>
          
          <div className="w-full h-px bg-white/5" />
          
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            <div className="flex-1 flex justify-between items-baseline">
              <span className="text-[16px] font-medium text-white/90">Hydrate</span>
              <span className="text-[15px] font-bold text-white">{goalPacket?.target_water || 3000} <span className="text-[12px] font-medium text-white/40">ml</span></span>
            </div>
          </div>

          <div className="w-full h-px bg-white/5" />
          
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
            <div className="flex-1 flex justify-between items-baseline">
              <span className="text-[16px] font-medium text-white/90 capitalize">{recoveryRoi?.roi_action || 'Consistency'}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
