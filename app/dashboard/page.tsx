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
  
        const [metrics, setMetrics] = useState({ 
    score: 0, 
    steps: 0, 
    water: 0, 
    logsCount: 0,
    energy_burned: 0,
    energy_intake: 0,
    score_summary: ""
  });

  // Intelligence System State
  const [coachMessage, setCoachMessage] = useState("Analyzing your progress...");

  const getScoreSummary = (breakdown: any) => {
    if (!breakdown) return "";
    const parts = [];
    if (breakdown.steps_points) parts.push(`+${breakdown.steps_points} steps`);
    if (breakdown.water_points) parts.push(`+${breakdown.water_points} hydration`);
    if (breakdown.log_bonus) parts.push(`+${breakdown.log_bonus} logs`);
    if (breakdown.inactivity_penalty) parts.push(`${breakdown.inactivity_penalty} inactivity`);
    return parts.length > 0 ? parts.join(", ") : "No changes yet";
  };

    const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. CONTEXT BUILDER
  const buildCoachContext = (user: any, profile: any, todayLogs: any[], pastLogs: any[], currentScore: number) => {
    let stepsToday = 0;
    let waterToday = 0;
    let lastLogTime = 0;

    todayLogs.forEach(log => {
      const val = Number(log.data?.amount) || 0;
      if (log.log_type === 'steps') stepsToday += val;
      if (log.log_type === 'water') waterToday += val;
      const logTime = new Date(log.created_at).getTime();
      if (logTime > lastLogTime) lastLogTime = logTime;
    });

    let pastSteps = 0;
    let pastWater = 0;
    pastLogs.forEach(log => {
      const val = Number(log.data?.amount) || 0;
      if (log.log_type === 'steps') pastSteps += val;
      if (log.log_type === 'water') pastWater += val;
    });

    const avgSteps = Math.round(pastSteps / 3);
    const avgWater = Math.round(pastWater / 3);

    return {
      id: profile.id,
      age: profile.age,
      gender: profile.gender,
      goal: profile.desired_identity,
      activity_level: profile.activity_level,
      workout_type: profile.workout_type,
      coach_tone: profile.coach_tone,
      plan_type: profile.plan_type || 'free',
      daily_ai_calls_count: profile.daily_ai_calls_count || 0,
      last_reset_date: profile.last_reset_date,
      primary_problem: profile.primary_problem,
      steps_today: stepsToday,
      water_today: waterToday,
      avg_steps_3_days: avgSteps,
      avg_water_3_days: avgWater,
      current_score: currentScore,
      consistency_level: (avgSteps > 3000 && avgWater > 1500) ? 'high' : 'low',
      hoursSinceLastLog: todayLogs.length === 0 ? 24 : (Date.now() - lastLogTime) / (1000 * 60 * 60)
    };
  };

  // 2. BEHAVIOR DETECTION ENGINE
  const detectUserState = (context: any) => {
    return {
      isInactive: context.hoursSinceLastLog >= 4,
      lowWater: context.water_today < 1000,
      lowSteps: context.steps_today < 3000,
      improving: context.steps_today > context.avg_steps_3_days,
      consistent: context.consistency_level === 'high'
    };
  };

  // 3. HYBRID AI COACH (Rule-based Fallback + API + Rate Limiter)
  const generateCoachNudge = async (context: any) => {
    const state = detectUserState(context);

    // Secure Instant Fallback Logic
    const ruleBasedFallback = () => {
      const isFatLoss = context.goal === 'Lean & Fit';
      const isMuscle = context.goal === 'Muscular';
      const isOlder = (context.age || 25) >= 40;

      if (state.lowWater) return `Hydration critical hai. Ek glass paani abhi piyo!`;
      if (state.isInactive) return isOlder ? `Kafi time rest ho gaya. Thoda light walk kar lo.` : `Time is ticking bhai. Get moving, no excuses!`;
      if (state.lowSteps) return isFatLoss ? `Calorie burn low hai aaj. Thoda step it up karo!` : `Activity drop ho rahi hai. Move a bit!`;
      if (state.improving) return `Great momentum today! Aise hi push karte raho.`;
      if (state.consistent) return isMuscle ? `Solid consistency. Recovery aur protein pe focus rakhna.` : `On track! Yeh discipline maintain karna hai.`;

      return `Good progress. Keep going!`;
    };

    // Rate Limit / Monetization DB Check
    const limit = context.plan_type === 'pro' ? 50 : 5;
    const todayDate = new Date().toISOString().split('T')[0];

    let currentCount = context.daily_ai_calls_count;
    let lastReset = context.last_reset_date;

    if (lastReset !== todayDate) {
      currentCount = 0;
      lastReset = todayDate;
    }

    if (currentCount < limit) {
      try {
        const prompt = `Coach tone: ${context.coach_tone || 'strict'}. User: ${context.age}yo ${context.gender}, Goal: ${context.goal}. State: ${JSON.stringify(state)}. Context: ${JSON.stringify(context)}. Give a 2-line Hinglish motivational nudge.`;

        const res = await fetch('/api/ai/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, userId: context.id })
        });

        if (!res.ok) throw new Error("AI unavailable");
        const data = await res.json();

        // Increment usage count completely scoped to user
        await supabase.from('profiles').update({
          daily_ai_calls_count: currentCount + 1,
          last_reset_date: todayDate
        }).eq('id', context.id);

        return data.nudge || ruleBasedFallback();
      } catch (error) {
        return ruleBasedFallback();
      }
    }

    return ruleBasedFallback();
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/login');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        router.push('/onboarding');
        return;
      }

      // Safely attach the user email for avatar fallback logic
      setUserProfile({ ...profile, email: user.email });

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay.toISOString());

      let totalSteps = 0;
      let totalWater = 0;
      let energyIntake = 0;
      let workoutLogsCount = 0;
      let lastLogTime = 0;
      let logsCount = logs ? logs.length : 0;

      if (logs) {
        logs.forEach(log => {
          // SAFE PARSING
          const val = Number(log.data?.amount) || 0;
          
          if (log.log_type === 'steps') totalSteps += val;
          if (log.log_type === 'water') totalWater += val;
          if (log.log_type === 'food') energyIntake += val; 
          if (log.log_type === 'workout') workoutLogsCount += 1;
          
          const logTime = new Date(log.created_at).getTime();
          if (logTime > lastLogTime) lastLogTime = logTime;
        });
      }

      // 1. Energy Clarity Fix
      const energyBurned = Math.round(totalSteps * 0.04);
      const safeEnergyIntake = energyIntake || 0;

            // 2. Exact Score Engine Calculation with Breakdown
      const effectiveSteps = Math.min(totalSteps, 12000);
      let calculatedScore = profile.onboarding_score || 50; 
      
      let steps_points = 0;
      let water_points = 0;
      let log_bonus = 0;
      let inactivity_penalty = 0;

      if (effectiveSteps >= 6000) steps_points = 20;
      else if (effectiveSteps >= 3000) steps_points = 10;
      calculatedScore += steps_points;

      if (totalWater >= 2000) water_points = 15;
      else if (totalWater >= 1000) water_points = 8;
      calculatedScore += water_points;

      if (logsCount >= 2) log_bonus += 5;
      if (workoutLogsCount > 0) log_bonus += (workoutLogsCount * 5);
      calculatedScore += log_bonus;

      const currentHour = new Date().getHours();
      if (logsCount === 0) {
        if (currentHour >= 14) inactivity_penalty = -10;
        else if (currentHour >= 10) inactivity_penalty = -5;
      } else {
        const hoursSinceLast = (Date.now() - lastLogTime) / (1000 * 60 * 60);
        if (hoursSinceLast >= 6) inactivity_penalty = -10;
        else if (hoursSinceLast >= 4) inactivity_penalty = -5;
      }
      calculatedScore += inactivity_penalty;

      calculatedScore = Math.max(0, Math.min(100, Math.floor(calculatedScore)));

      const scoreBreakdown = { steps_points, water_points, log_bonus, inactivity_penalty };
      const todayDateStr = startOfDay.toISOString().split('T')[0];

      // Safe Upsert Explanation (Avoids duplicate writes)
      await supabase.from('score_explanations').upsert({
        user_id: user.id,
        date: todayDateStr,
        breakdown: scoreBreakdown,
        final_score: calculatedScore
      }, { onConflict: 'user_id, date' });

      // Fetch today's explanation safely for state injection
      const { data: explData } = await supabase
        .from('score_explanations')
        .select('breakdown')
        .eq('user_id', user.id)
        .eq('date', todayDateStr)
        .single();

            // 3. Strict Profile Update Sync
      if (calculatedScore !== profile.current_score) {
        await supabase.from('profiles').update({ current_score: calculatedScore }).eq('id', user.id);
      }

      // INTEGRATION CHECK: Connect to 3-day history for accurate context
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const { data: pastLogs } = await supabase
        .from('daily_logs')
        .select('log_type, data')
        .eq('user_id', user.id)
        .gte('created_at', threeDaysAgo.toISOString())
        .lt('created_at', startOfDay.toISOString());

      // EXECUTE FULL ENGINE FLOW
      const coachContext = buildCoachContext(user, profile, logs || [], pastLogs || [], calculatedScore);
      const finalNudge = await generateCoachNudge(coachContext);
      setCoachMessage(finalNudge);

      // Safe state update (Fixed Syntax Error)
      setMetrics({
        score: calculatedScore,
        steps: totalSteps,
        water: totalWater,
        logsCount: logsCount,
        energy_burned: energyBurned,
        energy_intake: safeEnergyIntake,
        score_summary: getScoreSummary(explData?.breakdown || scoreBreakdown)
      });

      setMounted(true);
      setIsCheckingAuth(false);
    }; // <-- THIS CLOSES THE ASYNC FUNCTION (Fixes 'await' error)

    fetchDashboardData();
  }, [supabase.auth, router]);

    const handleLogout = async () => {
    setIsLoggingOut(true);
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00FFA3]" size={32} />
      </div>
    );
  }

  if (!mounted || !userProfile) return null;

  const targetCalories = userProfile.target_calories || userProfile.tdee || 2000;
  let energyColorClass = "text-[#00FFA3]";
  if (metrics.energy_intake > 0) {
    const intakeRatio = metrics.energy_intake / targetCalories;
    if (intakeRatio > 1.1) energyColorClass = "text-red-500";
    else if (intakeRatio >= 0.9) energyColorClass = "text-yellow-500";
  }

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
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all text-white/60 shrink-0"
            >
              {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
            </motion.button>
            
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
              <Bell size={18} className="text-white/80" />
            </div>

            <Link href="/profile">
              <motion.div 
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md overflow-hidden hover:border-[#00FFA3]/50 transition-all cursor-pointer shrink-0"
              >
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userProfile.full_name || userProfile.email || 'user')}&backgroundColor=00FFA3&textColor=000000`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </Link>
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
              &quot;{coachMessage}&quot;
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
          {/* Target injected: / 6000 steps */}
          <BentoCard icon={Footprints} label="Steps" value={metrics.steps} target="/ 6000" color="text-[#00FFA3]" delay={0.2} />
          
          {/* Target injected: intake / target calories */}
          <BentoCard icon={Flame} label="Burned" value={metrics.energy_burned} target={`(In: ${metrics.energy_intake} / ${targetCalories})`} color={energyColorClass} delay={0.3} />
          
          {/* Target injected: / 3000 ml */}
          <BentoCard icon={Droplets} label="Water" value={metrics.water} target="/ 3000 ml" color="text-blue-400" delay={0.4} />
          
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
          
          <Link href="/profile">
            <Settings size={24} className="text-white/40 hover:text-white transition-colors cursor-pointer" />
          </Link>
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
