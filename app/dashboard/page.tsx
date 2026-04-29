"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Footprints, Droplets, Camera, Zap, LayoutDashboard, History, Settings, Bell } from 'lucide-react';

export default function Dashboard() {
  const data = { score: 75, cal: 1800, steps: 6000, water: 2.5 };

  return (
    <div className="min-h-screen bg-[#000] text-white p-5 pb-32 selection:bg-mint/30">
      
      {/* --- PREMIUM HEADER --- */}
      <header className="flex justify-between items-center py-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tighter italic">NUVYU<span className="text-mint">.AI</span></h1>
          <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Premium Member</p>
        </div>
        <div className="flex gap-3">
            <div className="p-2 bg-white/5 border border-white/10 rounded-full"><Bell size={20} /></div>
            <div className="w-10 h-10 rounded-full border-2 border-mint p-0.5">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-mint to-blue-600" />
            </div>
        </div>
      </header>

      {/* --- THE MASTER GAUGE (CENTRAL PIECE) --- */}
      <section className="relative bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-[2.5rem] p-8 mb-6 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-mint/20 blur-[100px]" />
        
        <div className="flex flex-col items-center">
            <div className="relative w-56 h-56 flex items-center justify-center">
                {/* Background Ring */}
                <svg className="absolute w-full h-full transform -rotate-90">
                    <circle cx="112" cy="112" r="100" stroke="rgba(255,255,255,0.05)" strokeWidth="16" fill="transparent" />
                    <motion.circle 
                        cx="112" cy="112" r="100" stroke="#00FFA3" strokeWidth="16" fill="transparent"
                        strokeDasharray={628}
                        initial={{ strokeDashoffset: 628 }}
                        animate={{ strokeDashoffset: 628 - (628 * data.score) / 100 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_15px_rgba(0,255,163,0.6)]"
                    />
                </svg>
                <div className="text-center">
                    <span className="text-6xl font-black tracking-tighter">{data.score}</span>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Score</p>
                </div>
            </div>

            {/* AI COACH MESSAGE (STITCHED STYLE) */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-8 bg-mint text-black p-4 rounded-2xl flex items-start gap-3 shadow-[0_10px_30px_rgba(0,255,163,0.3)]"
            >
                <Zap size={24} fill="black" />
                <p className="text-sm font-bold leading-tight">
                    "Bhai, score solid hai par aaj steps kam hain. Dinner se pehle 2000 steps aur maaro!"
                </p>
            </motion.div>
        </div>
      </section>

      {/* --- STATS GRID (CLEAN & ACCURATE) --- */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={Footprints} label="Steps" value="6,000" target="/ 8,000" color="text-mint" />
        <StatCard icon={Flame} label="Energy" value="1,800" target="kcal" color="text-orange-500" />
        <StatCard icon={Droplets} label="Hydration" value="2.5" target="Liters" color="text-blue-400" />
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col justify-center items-center gap-2">
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Next Goal</span>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-mint w-[70%]" />
            </div>
            <span className="text-xs font-bold text-mint">70% Reached</span>
        </div>
      </div>

      {/* --- PREMIUM BOTTOM BAR --- */}
      <nav className="fixed bottom-8 left-6 right-6 h-20 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] flex justify-around items-center px-4 shadow-2xl z-50">
        <NavIcon icon={LayoutDashboard} active />
        <NavIcon icon={History} />
        <div className="bg-mint p-5 rounded-full -mt-16 shadow-[0_15px_40px_rgba(0,255,163,0.5)] active:scale-90 transition-transform">
            <Camera className="text-black" size={28} strokeWidth={2.5} />
        </div>
        <NavIcon icon={Zap} />
        <NavIcon icon={Settings} />
      </nav>
    </div>
  );
}

// --- REUSABLE COMPONENTS ---

function StatCard({ icon: Icon, label, value, target, color }: any) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={color} />
        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-gray-600 text-xs font-medium">{target}</span>
      </div>
    </div>
  );
}

function NavIcon({ icon: Icon, active = false }: any) {
    return (
        <div className={`p-3 rounded-2xl transition-all ${active ? 'bg-mint/10 text-mint' : 'text-gray-500 hover:text-white'}`}>
            <Icon size={24} strokeWidth={active ? 2.5 : 2} />
        </div>
    )
}
