"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Footprints, 
  Droplets, 
  Moon, 
  Camera, 
  Zap, 
  LayoutDashboard, 
  History, 
  Settings 
} from 'lucide-react';

// --- Components ---

const StatCard = ({ icon: Icon, label, value, unit, colorClass }: any) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-xl ${colorClass} bg-opacity-20`}>
        <Icon className={`${colorClass.replace('bg-', 'text-')}`} size={24} />
      </div>
      <span className="text-white/40 text-xs font-medium uppercase tracking-widest">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <h3 className="text-2xl font-bold text-white">{value}</h3>
      <span className="text-white/40 text-sm">{unit}</span>
    </div>
  </motion.div>
);

const Gauge = ({ score }: { score: number }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-48 h-48 transform -rotate-90">
        <circle
          cx="96" cy="96" r={radius}
          stroke="currentColor" strokeWidth="12" fill="transparent"
          className="text-white/5"
        />
        <motion.circle
          cx="96" cy="96" r={radius}
          stroke="currentColor" strokeWidth="12" fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-[#00FFA3] drop-shadow-[0_0_8px_rgba(0,255,163,0.5)]"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-5xl font-black text-white">{score}</span>
        <p className="text-white/40 text-xs uppercase tracking-tighter">Nuvyu Score</p>
      </div>
    </div>
  );
};

// --- Main Dashboard Page ---

export default function Dashboard() {
  const dummyData = {
    score: 75,
    calories: 1800,
    steps: 6000,
    water: 2.5,
    sleep: 7
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white font-sans p-6 pb-24">
      
      {/* Top Header */}
      <header className="flex justify-between items-center mb-10 max-w-5xl mx-auto">
        <div>
          <h1 className="text-xl font-bold tracking-tight">NUVYU<span className="text-[#00FFA3]">.AI</span></h1>
          <p className="text-white/40 text-sm">Good Evening, Bhai.</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2E5BFF] to-[#00FFA3]" />
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Gauge Section */}
        <section className="md:col-span-2 bg-white/5 border border-white/10 rounded-[40px] p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[#2E5BFF]/5 blur-[120px] -z-10" />
          <Gauge score={dummyData.score} />
          
          {/* AI Coach Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white/10 border border-white/20 p-4 rounded-2xl w-full backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <Zap size={18} className="text-[#00FFA3]" />
              <span className="text-xs font-bold uppercase text-[#00FFA3]">AI Coach</span>
            </div>
            <p className="text-sm text-white/80 italic">
              "Bhai, 6000 steps sahi hain par goal 8k ka hai. Dinner ke baad ek choti walk banti hai!"
            </p>
          </motion.div>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-1 gap-4">
          <StatCard icon={Flame} label="Calories" value={dummyData.calories} unit="kcal" colorClass="bg-orange-500" />
          <StatCard icon={Footprints} label="Steps" value={dummyData.steps} unit="steps" colorClass="bg-[#00FFA3]" />
          <StatCard icon={Droplets} label="Water" value={dummyData.water} unit="Liters" colorClass="bg-blue-400" />
        </section>

      </main>

      {/* Futuristic Bottom Tab Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/5 border border-white/10 backdrop-blur-2xl px-6 py-4 rounded-full flex items-center gap-10 z-50">
        <LayoutDashboard className="text-[#00FFA3]" size={22} />
        <History className="text-white/40 hover:text-white transition-colors" size={22} />
        <div className="bg-[#00FFA3] p-4 rounded-full -mt-12 shadow-[0_0_20px_rgba(0,255,163,0.4)] cursor-pointer">
          <Camera className="text-black" size={24} />
        </div>
        <Moon className="text-white/40 hover:text-white transition-colors" size={22} />
        <Settings className="text-white/40 hover:text-white transition-colors" size={22} />
      </nav>

    </div>
  );
}
