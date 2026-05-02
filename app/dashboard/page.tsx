"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Footprints, Droplets, Zap, LayoutDashboard, Settings, Bell, ChevronRight, LogOut, Loader2, Plus, X } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Metrics state
  const [metrics, setMetrics] = useState({ score: 0, cal: 0, steps: 0, water: 0 });

  // Logging Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logType, setLogType] = useState<'water' | 'steps'>('water');
  const [logValue, setLogValue] = useState('');
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchTodayLogs = async (uid: string, baseScore: number) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data: logs, error: logsError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', uid)
      .gte('created_at', startOfDay.toISOString());

    let totalSteps = 0;
    let totalWater = 0;
    let totalCal = 0;

    if (logs && !logsError) {
      logs.forEach(log => {
        const val = Number(log.data?.value || log.data?.amount || log.data?.[log.log_type] || 0);
        if (log.log_type === 'steps') totalSteps += val;
        if (log.log_type === 'water') totalWater += val;
        if (log.log_type === 'calories' || log.log_type === 'food') totalCal += val;
      });
    }

    let dynamicScore = baseScore; 
    
    if (totalSteps > 0) dynamicScore += Math.min(20, (totalSteps / 1000) * 2);
    if (totalWater > 0) dynamicScore += Math.min(10, totalWater * 2);
    if (totalCal > 0) dynamicScore += 5;

    setMetrics({
      score: Math.floor(dynamicScore),
      steps: totalSteps,
      water: totalWater,
      cal: totalCal
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        window.location.href = '/login';
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        window.location.href = '/onboarding';
        return;
      }

      setUserProfile(profile);
      await fetchTodayLogs(user.id, profile.current_score || 40);

      setMounted(true);
      setIsCheckingAuth(false);
    };

    fetchUserData();
  }, [supabase.auth]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleAddLog = async () => {
    if (!logValue || isNaN(Number(logValue)) || !userProfile) return;
    setIsSubmittingLog(true);

    const { error } = await supabase.from('daily_logs').insert({
      user_id: userProfile.id,
      log_type: logType,
      data: { amount: Number(logValue) }
    });

    if (!error) {
      await fetchTodayLogs(userProfile.id, userProfile.current_score || 40);
      setIsModalOpen(false);
      setLogValue('');
    } else {
      console.error("Failed to add log:", error);
    }
    
    setIsSubmittingLog(false);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00FFA3]" size={32} />
      </div>
    );
  }

  if (!mounted || !userProfile) return null;

  const generateNudge = (profile: any) => {
    const name = profile.full_name ? profile.full_name.split(' ')[0] : 'Bhai';
    if (profile.desired_identity === 'Lean & Fit') {
      return `${name}, lean banne ka rasta consistency se shuru hota hai. Aaj cardio aur diet pe focus rakho!`;
    }
    if (profile.desired_identity === 'Muscular') {
      return `${name}, muscles build karne hain! Aaj protein intake hit karna compulsory hai, no excuses.`;
    }
    return `${name}, consistency solid rakh bhai! Aaj ka target poora karke hi rest lena.`;
  };

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
            className="text-white/50 text-sm font-medium mt-1"
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
              &quot;{generateNudge(userProfile)}&quot;
            </p>
          </div>
        </motion.section>

        <div className="flex justify-between items-end">
           <h3 className="text-white/60 font-bold uppercase tracking-widest text-[10px] ml-2">Today's Activity</h3>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-1 text-[#00FFA3] text-xs font-bold uppercase tracking-widest bg-[#00FFA3]/10 px-3 py-1.5 rounded-full border border-[#00FFA3]/30 hover:bg-[#00FFA3]/20 transition-all"
           >
             <Plus size={14} /> Add Log
           </button>
        </div>

        <section className="grid grid-cols-2 gap-4">
          <BentoCard icon={Footprints} label="Steps" value={metrics.steps} target="/ 10k" color="text-[#00FFA3]" delay={0.2} />
          <BentoCard icon={Flame} label="Energy" value={metrics.cal} target="kcal" color="text-orange-500" delay={0.3} />
          <BentoCard icon={Droplets} label="Water" value={metrics.water} target="Liters" color="text-blue-400" delay={0.4} />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-5 flex flex-col justify-between shadow-xl"
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
                    className="h-full bg-gradient-to-r from-blue-500 to-[#00FFA3] rounded-full" 
                  />
              </div>
            </div>
          </motion.div>
        </section>

      </main>

      <div className="fixed bottom-6 left-6 right-6 flex justify-center z-40">
        <nav className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex items-center gap-12 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          <LayoutDashboard size={24} className="text-[#00FFA3]" strokeWidth={2.5} />
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-[#00FFA3] p-4 rounded-full shadow-[0_0_30px_rgba(0,255,163,0.4)] text-black cursor-pointer -mt-8 border-4 border-black flex items-center justify-center"
          >
            <Plus size={28} strokeWidth={3} />
          </motion.button>
          
          <Settings size={24} className="text-white/40 hover:text-white transition-colors" />
        </nav>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative"
            >
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-5 right-5 text-white/40 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              
              <h3 className="text-2xl font-black tracking-tighter mb-6">Add Log</h3>

              <div className="flex gap-2 mb-6">
                {['water', 'steps'].map((type) => (
                  <button 
                    key={type} 
                    onClick={() => { setLogType(type as 'water' | 'steps'); setLogValue(''); }} 
                    className={`flex-1 py-4 rounded-2xl border font-bold capitalize transition-all ${
                      logType === type 
                        ? 'bg-[#00FFA3]/10 border-[#00FFA3] text-[#00FFA3] shadow-[0_0_15px_rgba(0,255,163,0.15)]' 
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="relative mb-6">
                <input 
                  type="number" 
                  value={logValue} 
                  onChange={e => setLogValue(e.target.value)} 
                  placeholder={logType === 'water' ? 'Amount (e.g. 1.5 Liters)' : 'Amount (e.g. 2000 steps)'} 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-xl font-bold text-white placeholder:text-white/20 focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3] focus:outline-none transition-all" 
                />
              </div>

              <button 
                onClick={handleAddLog} 
                disabled={!logValue || isSubmittingLog} 
                className="w-full bg-[#00FFA3] text-black font-black text-lg py-5 rounded-2xl flex justify-center items-center gap-2 disabled:opacity-50 disabled:grayscale transition-all hover:shadow-[0_0_20px_rgba(0,255,163,0.4)]"
              >
                {isSubmittingLog ? <Loader2 className="animate-spin" size={24}/> : "Save Progress"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
        <span className="text-white/40 text-xs font-medium">{target}</span>
      </div>
    </motion.div>
  );
}
