import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Target, Lock } from 'lucide-react';

export const EditorialInsightStrip = React.memo(function EditorialInsightStrip({ sp, tp, memConfidence }: any) {
  return (
    <div className="bg-black/50 border border-white/10 rounded-[1.5rem] p-4 flex flex-col gap-3 mb-6 backdrop-blur-md">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Today's Biggest Risk</span>
        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest capitalize">{sp?.dominant_driver?.replace(/_/g, ' ') || 'None'}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Momentum Indicator</span>
        <span className="text-[10px] font-black text-[#00FFA3] uppercase tracking-widest capitalize">{tp?.momentum_direction || 'Stable'}</span>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-white/5">
         <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest">AI Confidence Map</span>
         <span className="text-[9px] font-bold text-white/70 uppercase tracking-widest">{(memConfidence || 0.9) * 100}% Accuracy</span>
      </div>
    </div>
  );
});

export const BehaviorTimeline = React.memo(function BehaviorTimeline({ logs, sp, tp, mem }: any) {
  const [activeFilter, setActiveFilter] = useState('today');
  const [filterMsg, setFilterMsg] = useState('');

  // 🧠 STRICT RULE 3: Gracefully disable filtering without faking data or executing queries
  const handleFilter = (type: string) => {
    if (type !== 'today') {
      setFilterMsg('Historical timeline syncing available soon.');
      setTimeout(() => setFilterMsg(''), 3000);
      return;
    }
    setActiveFilter(type);
  };

  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-4 pb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-white/60 font-bold uppercase tracking-widest text-[10px] ml-2">Behavior Timeline</h3>
      </div>

      <EditorialInsightStrip sp={sp} tp={tp} memConfidence={mem?.memory_confidence} />

      {/* Timeline Filters */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => handleFilter('today')} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${activeFilter === 'today' ? 'bg-white text-black' : 'bg-white/5 text-white/40'}`}>Today</button>
        <button onClick={() => handleFilter('7day')} className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/5 text-white/20 border border-white/5 flex items-center gap-1"><Lock size={10}/> 7 Days</button>
        <button onClick={() => handleFilter('30day')} className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/5 text-white/20 border border-white/5 flex items-center gap-1"><Lock size={10}/> 30 Days</button>
      </div>
      
      {filterMsg && <div className="text-[10px] text-orange-400 font-bold uppercase tracking-widest mb-4 text-center bg-orange-500/10 py-2 rounded-lg">{filterMsg}</div>}

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-white/10 before:to-transparent">
        {(!logs || logs.length === 0) ? (
           <div className="text-center py-10 text-white/30 text-[11px] font-bold uppercase tracking-widest">No events logged today.</div>
        ) : (
          logs.map((log: any, i: number) => {
            const timeStr = new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            let icon = <Target size={12} className="text-white/60" />;
            let title = "Logged Activity";
            let color = "border-white/20 bg-black";

            if (log.log_type === 'steps') { title = `Walked ${log.data?.amount} steps`; icon = <Zap size={12} className="text-[#00FFA3]"/>; color = "border-[#00FFA3]/30 bg-[#00FFA3]/10"; }
            if (log.log_type === 'water') { title = `Hydrated ${log.data?.amount}ml`; icon = <Zap size={12} className="text-blue-400"/>; color = "border-blue-500/30 bg-blue-500/10"; }
            if (log.log_type === 'sleep') { title = `Slept ${log.data?.sleep_hours} hrs`; icon = <Clock size={12} className="text-indigo-400"/>; color = "border-indigo-500/30 bg-indigo-500/10"; }
            if (log.log_type === 'food') { title = `Nutrition Logged`; icon = <Zap size={12} className="text-orange-400"/>; color = "border-orange-500/30 bg-orange-500/10"; }

            return (
              <div key={log.id || i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${color} relative z-10`}>
                  {icon}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-[#0A0A0A] border border-white/5 p-4 rounded-[1.5rem] shadow-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm tracking-tight">{title}</span>
                  </div>
                  <div className="text-[9px] font-black text-white/40 uppercase tracking-widest">{timeStr} • {log.log_type}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </motion.section>
  );
});
