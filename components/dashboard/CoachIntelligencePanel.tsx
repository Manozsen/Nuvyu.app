import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronRight, ChevronDown } from 'lucide-react';

interface CoachIntelligencePanelProps {
  coachMessage: string;
  operatingState: any;
  strainPacket: any;
  forecastPacket: any;
}

export function CoachIntelligencePanel({ coachMessage, operatingState, strainPacket, forecastPacket }: CoachIntelligencePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const confidence = strainPacket?.confidence === 'high' ? '92%' : '78%';

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay: 0.15, duration: 0.4 }}
      className="px-2"
    >
      <div className="bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 rounded-[2rem] p-6 shadow-2xl backdrop-blur-md">
        
      {/* Executive Coach Message */}
        <div className="mb-5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Coach's Note</h3>
          <p className="text-lg font-medium text-white/90 leading-snug">
            &quot;{coachMessage}&quot;
          </p>
        </div>

        {/* AI WHY Panel */}
        <div className="pt-4 border-t border-white/10">
           <motion.div 
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex justify-between items-center mb-3 cursor-pointer group"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00FFA3] flex items-center gap-1.5">
              <Brain size={12} strokeWidth={2.5} /> Behind the plan
              <ChevronDown size={12} className={`text-white/30 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </span>
          </motion.div>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center gap-y-2 gap-x-1 text-[10px] font-bold uppercase tracking-widest text-white/60 pb-2">
                  <span className="bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                    Sleep is low
                  </span>
                  <ChevronRight size={10} className="text-white/30" />
                  <span className="bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                    Body is tired
                  </span>
                  <ChevronRight size={10} className="text-white/30" />
                  <span className="bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                    Staying on track
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.section>
  );
}
