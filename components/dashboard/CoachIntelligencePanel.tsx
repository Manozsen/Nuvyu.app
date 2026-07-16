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
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }}
      className="px-6 w-full text-center flex flex-col items-center my-6"
    >
      <div className="max-w-xs">
        <p className="text-[18px] font-medium text-white/90 leading-snug tracking-tight">
          &quot;{coachMessage}&quot;
        </p>
      </div>

      <div className="mt-4 flex flex-col items-center">
         <motion.div 
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 cursor-pointer text-white/40 hover:text-white/60 transition-colors w-max"
        >
          <Brain size={12} />
          <span className="text-[12px] font-medium">Behind the plan</span>
          <ChevronDown size={12} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </motion.div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="overflow-hidden w-full flex justify-center"
            >
              <div className="flex flex-wrap justify-center items-center gap-y-1.5 gap-x-1 text-[11px] font-medium text-white/50 pt-2 pb-1">
                <span className="bg-white/5 px-2 py-1 rounded-md border border-white/5">
                  Sleep is low
                </span>
                <ChevronRight size={10} className="text-white/20" />
                <span className="bg-white/5 px-2 py-1 rounded-md border border-white/5">
                  Body is tired
                </span>
                <ChevronRight size={10} className="text-white/20" />
                <span className="bg-white/5 px-2 py-1 rounded-md border border-white/5">
                  Staying on track
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
