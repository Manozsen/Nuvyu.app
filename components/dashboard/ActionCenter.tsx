import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, Play, ArrowRight, Flame } from 'lucide-react';

export const AIExecutionCard = React.memo(function AIExecutionCard({ recoveryRoi, interventionEngine, strainPacket }: any) {
  const confidence = strainPacket?.confidence === 'high' ? '92%' : '84%';
  const benefit = interventionEngine?.intervention_mode?.replace('_', ' ') || 'Optimal Progression';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-[#00FFA3]/10 to-transparent border border-[#00FFA3]/20 rounded-[2rem] p-6 shadow-xl relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[#00FFA3]/80 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
          <Play size={10} fill="currentColor" /> Next Action
        </h3>
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#00FFA3] bg-[#00FFA3]/10 px-2 py-1 rounded-md border border-[#00FFA3]/20">
          {confidence} Confidence
        </span>
      </div>
      <div className="mb-6">
        <div className="text-2xl font-black text-white tracking-tight capitalize mb-2">
          {recoveryRoi?.roi_action || 'Maintain Routine'}
        </div>
        <div className="text-[11px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
           <span className="bg-black/40 px-2 py-1 rounded-md border border-white/5">~ 15 MIN</span>
           <span className="bg-black/40 px-2 py-1 rounded-md border border-white/5 capitalize">Expected Benefit: {benefit}</span>
        </div>
      </div>
      <button className="w-full bg-[#00FFA3] text-black font-black uppercase tracking-widest text-[11px] py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,255,163,0.3)] transition-all active:scale-95">
        Execute Protocol <ArrowRight size={14} />
      </button>
    </motion.div>
  );
});

export const CommitmentContract = React.memo(function CommitmentContract({ cp }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} 
      className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 shadow-xl"
    >
      <div className="flex justify-between items-center mb-5">
         <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
           <CheckCircle2 size={12} className="text-white/60"/> Today's Contract
         </h3>
         <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md transition-all duration-500 ${cp.status === 'completed' ? 'bg-[#00FFA3]/15 text-[#00FFA3] shadow-[0_0_15px_rgba(0,255,163,0.2)]' : 'bg-white/5 text-white/50'}`}>
           {cp.status}
         </span>
       </div>
       
       {cp.non_negotiables?.length > 0 ? (
          <div className="space-y-4">
             {cp.non_negotiables.map((item: string, i: number) => {
                const isDone = cp.completed_items?.includes(item);
                return (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${isDone ? 'bg-[#00FFA3] border-[#00FFA3]' : 'border-white/20 bg-black'}`}>
                       {isDone && <motion.div initial={{scale:0}} animate={{scale:1}} className="w-2.5 h-2.5 bg-black rounded-full" />}
                    </div> 
                    <span className={`truncate text-[15px] transition-colors duration-300 ${isDone ? 'text-white/30 line-through' : 'text-white/90 font-medium'}`}>{item}</span>
                  </div>
                )
             })}
             <div className="flex justify-between items-center mt-4 pt-5 border-t border-white/5">
                <div>
                  <div className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Integrity Score</div>
                  <div className="text-lg font-black text-[#00FFA3]">{cp.commitment_integrity_score}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Completion</div>
                  <div className="text-lg font-black text-white">{cp.contract_completion_rate}%</div>
                </div>
             </div>
          </div>
       ) : (
          <div className="text-sm text-white/30 font-medium pb-2">No non-negotiables set for today. Focus on your baseline targets.</div>
       )}
    </motion.div>
  );
});

export const ActiveChallenge = React.memo(function ActiveChallenge({ chp }: any) {
  if (chp.status !== 'active') return null;

  const isComplete = chp.completion_percentage === 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} 
      className={`bg-gradient-to-br from-[#0A0A0A] to-[#111] border rounded-[2rem] p-6 relative overflow-hidden transition-all duration-1000 ${isComplete ? 'border-[#00FFA3]/40 shadow-[0_0_30px_rgba(0,255,163,0.15)]' : 'border-purple-500/20 shadow-[0_8px_32px_rgba(168,85,247,0.1)]'}`}
    >
       {isComplete && (
         <motion.div 
           initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
           className="absolute inset-0 bg-gradient-to-tr from-[#00FFA3]/5 to-transparent pointer-events-none" 
         />
       )}
       <div className="flex justify-between items-start mb-6 relative z-10">
         <div>
           <h3 className="text-purple-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
             <Target size={12} /> Active Challenge
           </h3>
           <p className="text-white font-black text-lg tracking-tight">{chp.challenge_name}</p>
         </div>
         <div className="text-right">
           <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest block mb-1">Success Prob.</span>
           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${chp.success_probability === 'High' ? 'bg-[#00FFA3]/10 text-[#00FFA3]' : chp.success_probability === 'Moderate' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'}`}>
             {chp.success_probability}
           </span>
         </div>
       </div>
       
       <div className="flex items-center gap-5">
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
              <motion.circle 
                cx="32" cy="32" r="28" stroke="#A855F7" strokeWidth="6" fill="transparent" 
                strokeDasharray={175} 
                strokeDashoffset={175 - (175 * chp.completion_percentage) / 100} 
                strokeLinecap="round" 
                initial={{ strokeDashoffset: 175 }}
                animate={{ strokeDashoffset: 175 - (175 * chp.completion_percentage) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <span className="text-sm font-black text-white">{chp.completion_percentage}%</span>
          </div>
          <div className="flex-1 space-y-2">
             <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
               <span className="text-white/40">Missed Days</span>
               <span className="text-white">{chp.missed_days}</span>
             </div>
             <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }} animate={{ width: `${chp.completion_percentage}%` }} transition={{ duration: 1 }}
                 className="bg-purple-500 h-full" 
               />
             </div>
          </div>
       </div>
    </motion.div>
  );
});
