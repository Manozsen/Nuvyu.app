import React from 'react';
import { motion } from 'framer-motion';

export const BentoCard = React.memo(function BentoCard({ icon: Icon, label, value, target, color, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-4 sm:p-5 flex flex-col justify-between h-28 sm:h-32 shadow-xl overflow-hidden"
    >
      <div className="flex items-center gap-2 truncate">
        <Icon size={16} className={`shrink-0 ${color}`} />
        <span className="text-white/50 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">{label}</span>
      </div>
      <div className="mt-2">
        <div className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">{value}</div>
        <div className="text-[10px] sm:text-xs font-medium text-white/40 mt-0.5 truncate">{target}</div>
      </div>
     </motion.div>
  );
});

export const AdaptiveBentoCard = React.memo(function AdaptiveBentoCard({ icon: Icon, label, value, target, source, reason, color, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-4 sm:p-5 flex flex-col justify-between h-36 shadow-xl overflow-hidden relative"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 truncate">
          <Icon size={16} className={`shrink-0 ${color}`} />
          <span className="text-white/50 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">{label}</span>
        </div>
        <span className={`text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${source === 'auto' ? 'bg-[#00FFA3]/10 text-[#00FFA3]' : 'bg-orange-500/10 text-orange-400'}`}>
          {source === 'auto' ? 'AI GOAL' : 'MANUAL'}
        </span>
      </div>
      <div className="mt-2">
        <div className="flex items-baseline gap-1 truncate">
          <span className="text-xl sm:text-2xl font-black text-white tracking-tight">{value}</span>
          <span className="text-[10px] sm:text-xs font-medium text-white/40">/ {target}</span>
        </div>
        <div className="text-[9px] font-medium text-white/40 mt-1.5 truncate leading-tight border-t border-white/5 pt-1.5">
          {reason}
        </div>
      </div>
    </motion.div>
  );
});
