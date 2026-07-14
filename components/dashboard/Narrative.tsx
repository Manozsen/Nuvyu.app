import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, ShieldAlert, Activity, Award } from 'lucide-react';

export const RecoveryForecastCard = React.memo(function RecoveryForecastCard({ fp, burnoutRisk }: any) {
  if (!fp) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 shadow-xl">
      <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mb-5"><Activity size={12} /> Recovery Forecast</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div><span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Burnout Risk</span><span className={`text-sm font-black capitalize ${burnoutRisk === 'high' ? 'text-red-400' : burnoutRisk === 'medium' ? 'text-orange-400' : 'text-[#00FFA3]'}`}>{burnoutRisk || 'Low'}</span></div>
        <div><span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Expected Trend</span><span className="text-sm font-black text-white capitalize">{fp.transition_text?.split(' ')[0] || 'Stable'}</span></div>
      </div>
      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
        <span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">3-Day Projection</span>
        <p className="text-sm font-medium text-white/80 leading-snug">{fp.transition_text || 'System trajectory is currently stable. Maintain baseline habits.'}</p>
      </div>
    </motion.div>
  );
});

export const WeeklyStory = React.memo(function WeeklyStory({ tp, mem, fp }: any) {
  if (!tp || !mem) return null;
  
  // Synthesizing Narrative exclusively from existing packets (No LLM)
  const p1 = `This week your overall trajectory is indicating ${tp.trajectory?.toLowerCase()}, accompanied by a ${tp.weekly_trend} weekly trend. Your behavioral drift is currently classified as ${tp.behavior_drift?.replace(/_/g, ' ')}.`;
  const p2 = `Analyzing specific habits, your sleep behavior is tracking as ${mem.sleep_behavior?.replace(/_/g, ' ')} and hydration is ${mem.hydration_behavior?.replace(/_/g, ' ')}. ${fp?.transition_text || ''}`;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-white/[0.08] to-transparent border border-white/10 rounded-[2rem] p-6 shadow-2xl backdrop-blur-md">
      <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 mb-4"><BookOpen size={12} /> Editorial Narrative</h3>
      <div className="space-y-4">
        <p className="text-[15px] font-medium text-white/90 leading-relaxed tracking-tight">{p1}</p>
        <p className="text-[15px] font-medium text-white/80 leading-relaxed tracking-tight">{p2}</p>
      </div>
    </motion.div>
  );
});

export const BehaviorMemoryHighlights = React.memo(function BehaviorMemoryHighlights({ mem, tp }: any) {
  if (!mem || !tp) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 gap-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-5">
        <Award size={14} className="text-[#00FFA3] mb-2" />
        <span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Consistency</span>
        <span className="text-sm font-black text-white capitalize">{mem.adherence_drift?.replace(/_/g, ' ')}</span>
      </div>
      <div className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-5">
        <ShieldAlert size={14} className="text-orange-400 mb-2" />
        <span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">System Risk</span>
        <span className="text-sm font-black text-white capitalize">{mem.sleep_behavior?.replace(/_/g, ' ')}</span>
      </div>
      <div className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-5">
        <Droplets size={14} className="text-blue-400 mb-2" />
        <span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Hydration</span>
        <span className="text-sm font-black text-white capitalize">{mem.hydration_behavior?.replace(/_/g, ' ')}</span>
      </div>
      <div className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-5">
        <TrendingUp size={14} className="text-purple-400 mb-2" />
        <span className="block text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Velocity</span>
        <span className="text-sm font-black text-white capitalize">{tp.habit_velocity}</span>
      </div>
    </motion.div>
  );
});
