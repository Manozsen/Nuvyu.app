"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Footprints, Droplets, Camera, Zap, LayoutDashboard, Settings, Bell, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const data = { score: 82, cal: 1800, steps: 6400, water: 2.5 };

  // Hydration fix for animations
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-black text-white pb-28 overflow-hidden selection:bg-mint/30">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-mint/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER */}
      <header className="px-6 pt-10 pb-6 flex justify-between items-center z-10 relative">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black tracking-tighter"
          >
            NUVYU<span className="text-mint">.AI</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-white/50 text-sm font-medium mt-1"
          >
            Good Evening, Manoj.
          </motion.p>
        </div>
        <div className="flex gap-4 items-center">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
              <Bell size={18} className="text-white/80" />
            </div>
            <div className="w-10 h-10 rounded-full border border-mint p-0.5">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-mint to-blue-500" />
            </div>
        </div>
      </header>

      {/* MAIN CONTENT WRAPPER */}
      <main className="px-6 space-y-6 z-10 relative">
        
        {/* THE GAUGE & COACH CARD */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-obsidian border border-white/10 rounded-[2rem] p-6 flex flex-col items-center relative overflow-hidden shadow-2xl"
        >
          {/* Animated Ring */}
          <div className="relative w-52 h-52 flex items-center justify-center mb-4">
              <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="104" cy="104" r="90" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                  <motion.circle 
                      cx="104" cy="104" r="90" stroke="#00FFA3" strokeWidth="12" fill="transparent"
                      strokeDasharray={565}
                      initial={{ strokeDashoffset: 565 }}
                      animate={{ strokeDashoffset: 565 - (565 * data.score) / 100 }}
                      transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_12px_rgba(0,255,163,0.4)]"
                  />
              </svg>
              <div className="text-center">
                  <motion.span 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="text-6xl font-black tracking-tighter"
                  >
                    {data.score}
                  </motion.span>
                  <p className="text-mint text-xs font-bold uppercase tracking-widest mt-1">Daily Score</p>
              </div>
          </div>

          {/* AI Nudge Stitched UI */}
          <div className="w-full bg-gradient-to-r from-mint/10 to-transparent border-l-4 border-mint p-4 rounded-r-xl">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-mint" fill="#00FFA3" />
              <span className="text-xs font-bold text-mint uppercase tracking-wider">Coach Nudge</span>
            </div>
            <p className="text-sm font-medium text-white/90 leading-relaxed">
              "Consistency solid hai bhai! Bas thoda protein low lag raha hai, dinner mein paneer ya soy chunks zaroor add karna."
            </p>
          </div>
        </motion.section>

        {/* BENTO STATS GRID */}
        <section className="grid grid-cols-2 gap-4">
          <BentoCard icon={Footprints} label="Steps" value={data.steps} target="/ 10k" color="text-mint" delay={0.2} />
          <BentoCard icon={Flame} label="Energy" value={data.cal} target="kcal" color="text-orange-500" delay={0.3} />
          <BentoCard icon={Droplets} label="Water" value={data.water} target="Liters" color="text-blue-400" delay={0.4} />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-obsidian border border-white/10 rounded-[1.5rem] p-5 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Next Level</span>
              <ChevronRight size={16} className="text-white/30" />
            </div>
            <div>
              <div className="text-xl font-bold mb-2">Level 4</div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 1, delay: 0.8 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-mint rounded-full" 
                  />
              </div>
            </div>
          </motion.div>
        </section>

      </main>

      {/* FLOATING GLASS NAVIGATION */}
      <div className="fixed bottom-6 left-6 right-6 flex justify-center z-50">
        <nav className="bg-obsidian/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex items-center gap-12 shadow-2xl">
          <LayoutDashboard size={24} className="text-mint" strokeWidth={2.5} />
          
          {/* Main Action Button */}
          <motion.div 
            whileTap={{ scale: 0.9 }}
            className="bg-mint p-4 rounded-full shadow-[0_0_30px_rgba(0,255,163,0.3)] text-black cursor-pointer -mt-8"
          >
            <Camera size={28} strokeWidth={2.5} />
          </motion.div>
          
          <Settings size={24} className="text-white/40 hover:text-white transition-colors" />
        </nav>
      </div>

    </div>
  );
}

// Reusable Stat Card Component
function BentoCard({ icon: Icon, label, value, target, color, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-obsidian border border-white/10 rounded-[1.5rem] p-5 flex flex-col justify-between h-32"
    >
      <div className="flex items-center gap-2">
        <Icon size={18} className={color} />
        <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mt-4">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-white/40 text-xs font-medium">{target}</span>
      </div>
    </motion.div>
  );
}
