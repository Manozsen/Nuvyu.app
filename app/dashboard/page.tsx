"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Footprints, Droplets, Camera, Zap, LayoutDashboard, Settings, Bell, ChevronRight, LogOut, Loader2, Plus, Activity } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [metrics, setMetrics] = useState({ score: 0, steps: 0, water: 0, logsCount: 0 });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/login');
        return;
      }

      // 1. Fetch specific user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        router.push('/onboarding');
        return;
      }

      setUserProfile(profile);

      // 2. Fetch today's logs & Run Dynamic Engine
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay.toISOString());

      let totalSteps = 0;
      let totalWater = 0;
      let lastLogTime = 0;
      let logsCount = logs ? logs.length : 0;

      if (logs) {
        logs.forEach(log => {
          const val = Number(log.data?.amount || 0);
          if (log.log_type === 'steps') totalSteps += val;
          if (log.log_type === 'water') totalWater += val;
          
          const logTime = new Date(log.created_at).getTime();
          if (logTime > lastLogTime) lastLogTime = logTime;
        });
      }

      let dynamicScore = 40; // Base
      
      if (totalSteps >= 6000) dynamicScore += 20;
      else if (totalSteps >= 3000) dynamicScore += 10;

      if (totalWater >= 2000) dynamicScore += 15;
      else if (totalWater >= 1000) dynamicScore += 8;

      if (logsCount >= 2) dynamicScore += 5;

      // Time Penalty Check
      const currentHour = new Date().getHours();
      if (logsCount === 0) {
        if (currentHour >= 14) dynamicScore -= 10; // 2 PM
        else if (currentHour >= 10) dynamicScore -= 5; // 10 AM
      } else {
        const hoursSinceLast = (Date.now() - lastLogTime) / (1000 * 60 * 60);
        if (hoursSinceLast >= 6) dynamicScore -= 10;
        else if (hoursSinceLast >= 4) dynamicScore -= 5;
      }

      dynamicScore = Math.max(0, Math.min(100, Math.floor(dynamicScore)));

      // If score changed due to time penalty, save it to DB silently
      if (dynamicScore !== profile.current_score) {
        await supabase.from('profiles').update({ current_score: dynamicScore }).eq('id', user.id);
      }

      setMetrics({
        score: dynamicScore,
        steps: totalSteps,
        water: totalWater,
        logsCount: logsCount
      });

      setMounted(true);
      setIsCheckingAuth(false);
    };

    fetchDashboardData();
  }, [supabase.auth, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Rule-based Smart Nudge (No AI)
  const getSmartNudge = () => {
    const hour = new Date().getHours();
    
    if (metrics.water < 1000 && hour >= 15) {
      return "Paani pee le bhai. Target hit kar.";
    }
    if (metrics.steps < 2000 && hour >= 14) {
      return "Move kar. 10 min walk kar.";
    }
    
    if (metrics.score >= 80) return "Beast mode ON! Kya solid score hai aaj.";
    if (metrics.logsCount === 0) return "Din shuru ho chuka hai. Pehla log enter kar!";
    
    return "Good progress. Keep going.";
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00FFA3]" size={32} />
      </div>
    );
  }

  if (!mounted || !userProfile) return null;

  return (
    <div className="relative min-h-screen bg-black text-white pb-28 overflow-hidden selection:bg-[#00FFA3]/30">
      
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00FFA3]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <header className="px-6 pt-10 pb-6 flex justify-between items-center z-10 relative">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black tracking-tighter"
          >
            NUVYU<span className="text-[#00FFA3]">.AI</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-white/50 text-sm font-medium mt-1 capitalize"
          >
            Good Evening, {userProfile.full_name ? userProfile.full_name.split(' ')[0] : 'Athlete'}.
          </motion.p>
        </div>
        <div className="flex gap-3 items-center">
            <motion.button 
              whileTap={{ scale: 0.9 }} 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all text-white/60"
            >
              {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
            </motion.button>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
              <Bell size={18} className="text-white/80" />
            </div>
        </div>
      </header>

      <main className="px-6 space-y-6 z-10 relative">
        
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 flex flex-col items-center relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        >
          <div className="relative w-52 h-52 flex items-center justify-center mb-4">
              <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="104" cy="104" r="90" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                  <motion.circle 
                      cx="104" cy="104" r="90" stroke="#00FFA3" strokeWidth="12" fill="transparent"
                      strokeDasharray={565}
                      initial={{ strokeDashoffset: 565 }}
                      animate={{ strokeDashoffset: 565 - (565 * metrics.score) / 100 }}
                      transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_15px_rgba(0,255,163,0.5)]"
                  />
              </svg>
              <div className="text-center">
                  <motion.span 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="text-6xl font-black tracking-tighter drop-shadow-lg"
                  >
                    {metrics.score}
                  </motion.span>
                  <p className="text-[#00FFA3] text-xs font-bold uppercase tracking-widest mt-1">Daily Score</p>
              </div>
          </div>

          <div className="w-full bg-gradient-to-r from-[#00FFA3]/10 to-transparent border-l-4 border-[#00FFA3] p-4 rounded-r-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-[#00FFA3]" fill="#00FFA3" />
              <span className="text-xs font-bold text-[#00FFA3] uppercase tracking-wider">Coach Nudge</span>
            </div>
            <p className="text-sm font-medium text-white/90 leading-relaxed">
              &quot;{getSmartNudge()}&quot;
            </p>
          </div>
        </motion.section>

        <div className="flex justify-between items-end">
           <h3 className="text-white/60 font-bold uppercase tracking-widest text-[10px] ml-2">Today's Activity</h3>
           <Link 
             href="/log"
             className="flex items-center gap-1 text-[#00FFA3] text-xs font-bold uppercase tracking-widest bg-[#00FFA3]/10 px-3 py-1.5 rounded-full border border-[#00FFA3]/30 hover:bg-[#00FFA3]/20 transition-all"
           >
             <Plus size={14} /> Add Log
           </Link>
        </div>

        <section className="grid grid-cols-2 gap-4">
          <BentoCard icon={Footprints} label="Steps" value={metrics.steps} target="" color="text-[#00FFA3]" delay={0.2} />
          
          {/* Energy Card mapped to TDEE Target */}
          <BentoCard icon={Flame} label="Energy" value={0} target={`/ ${userProfile.tdee || 0} kcal`} color="text-orange-500" delay={0.3} />
          
          <BentoCard icon={Droplets} label="Water" value={metrics.water} target="ml" color="text-blue-400" delay={0.4} />
          
          {/* BMR Display mapping seamlessly onto 4th card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-5 flex flex-col justify-between shadow-xl"
          >
            <div className="flex justify-between items-center">
              <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Base Met.</span>
              <Activity size={16} className="text-white/30" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-bold">{userProfile.bmr || 0}</span>
                <span className="text-white/40 text-[10px] font-medium">kcal/day</span>
              </div>
              <div className="text-[#00FFA3] text-[10px] font-bold uppercase tracking-widest">BMR</div>
            </div>
          </motion.div>
        </section>

      </main>

      <div className="fixed bottom-6 left-6 right-6 flex justify-center z-40">
        <nav className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex items-center gap-12 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          <LayoutDashboard size={24} className="text-[#00FFA3]" strokeWidth={2.5} />
          
          <Link href="/log">
            <motion.div 
              whileTap={{ scale: 0.9 }}
              className="bg-[#00FFA3] p-4 rounded-full shadow-[0_0_30px_rgba(0,255,163,0.4)] text-black cursor-pointer -mt-8 border-4 border-black flex items-center justify-center"
            >
              <Plus size={28} strokeWidth={3} />
            </motion.div>
          </Link>
          
          <Settings size={24} className="text-white/40 hover:text-white transition-colors" />
        </nav>
      </div>

    </div>
  );
}

function BentoCard({ icon: Icon, label, value, target, color, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-5 flex flex-col justify-between h-32 shadow-xl"
    >
      <div className="flex items-center gap-2">
        <Icon size={18} className={color} />
        <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mt-4">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-white/40 text-xs font-medium pl-1">{target}</span>
      </div>
    </motion.div>
  );
}
