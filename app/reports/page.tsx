"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Brain, Activity, TrendingUp, TrendingDown, Calendar, Zap, LayoutDashboard, Settings, Plus, BarChart2, AlertTriangle, Flame } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, YAxis } from 'recharts';

export default function InsightsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  
  // Insights State
  const [insights, setInsights] = useState<any>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchAndProcessInsights = async () => {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        router.push('/login');
        return;
      }

      // 🧠 PART 1: FLEXIBLE DATA FETCH
      const days = range === '30d' ? 30 : 7;
      const startDate = new Date();
      startDate.setUTCHours(0,0,0,0);
      startDate.setDate(startDate.getDate() - days);
      const boundaryDate = startDate.toISOString().split('T')[0];

      // Strict User Isolation
      const { data, error } = await supabase
        .from('score_explanations')
        .select('date, final_score, breakdown')
        .eq('user_id', user.id)
        .gte('date', boundaryDate)
        .order('date', { ascending: true });

      if (error || !data || data.length === 0) {
        setInsights(null);
        setLoading(false);
        setMounted(true);
        return;
      }

      // Format Data for Graph
      const chartData = data.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        score: d.final_score
      }));

      // 🧠 PART 2: TREND ENGINE
      const scores = data.map(d => d.final_score);
      const avg_score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const highest_score = Math.max(...scores);
      const lowest_score = Math.min(...scores);
      const score_change = scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0;
      
      const variance = scores.reduce((a, b) => a + Math.pow(b - avg_score, 2), 0) / scores.length;
      const consistency_score = Math.max(0, Math.round(100 - Math.sqrt(variance) * 2));

            // 🧠 PART 3: BREAKDOWN INTELLIGENCE
      let total_steps_points = 0;
      let total_water_points = 0;
      let total_penalties = 0;
      let total_log_bonus = 0;
      let total_workout_bonus = 0;

      data.forEach(d => {
        total_steps_points += d.breakdown?.steps_points || 0;
        total_water_points += d.breakdown?.water_points || 0;
        total_penalties += d.breakdown?.inactivity_penalty || 0;
        total_log_bonus += d.breakdown?.log_bonus || 0;
        total_workout_bonus += d.breakdown?.workout_bonus || 0;
      });

      // Synchronize with Central Score Engine breakdown structure
      const factors: Record<string, number> = { 
        Steps: total_steps_points, 
        Water: total_water_points, 
        Consistency: total_log_bonus,
        Workouts: total_workout_bonus
      };
      
      const biggest_positive_factor = Object.keys(factors).reduce((a, b) => factors[a] > factors[b] ? a : b);
      const biggest_negative_factor = total_penalties < -20 ? 'Inactivity' : 'None';
      const dominant_behavior = factors[biggest_positive_factor] > (days * 10) ? `${biggest_positive_factor} Strong` : 'Needs Focus';

      // 🧠 PART 4: PATTERN DETECTION
      let streak_days = 0;
      let drop_pattern = false;
      let plateau = false;

      if (scores.length >= 3) {
        const last3 = scores.slice(-3);
        if (last3[2] > last3[1] && last3[1] > last3[0]) streak_days = 3;
        else if (last3[2] < last3[1] && last3[1] < last3[0]) drop_pattern = true;
        else if (last3[2] === last3[1] && last3[1] === last3[0]) plateau = true;
      }

      // 🧠 PART 5: RULE-BASED SUMMARY
      let summary = "";
      if (streak_days > 0 || score_change > 10) {
        summary = "Is week tumne strong comeback kiya hai! Effort dikh raha hai, aise hi momentum maintain karo.";
      } else if (drop_pattern || score_change < -10) {
        summary = "Consistency thodi break ho rahi hai. Kal se wapas track pe aana hai, no excuses!";
      } else if (plateau || Math.abs(score_change) <= 5) {
        summary = "Effort hai but growth stuck hai. Thoda aur push karo agle level pe jaane ke liye.";
      } else {
        summary = "Progress stable hai. Consistency is key, daily goals hit karte raho.";
      }

            // ACTIONABLE INSIGHTS ENGINE
      const generateWhyExplanation = (latestBreakdown: any) => {
        if (!latestBreakdown) return "Data is still syncing.";
        let exp = [];
        if ((latestBreakdown.steps_points || 0) < 20) exp.push("Full step bonus was not applied.");
        if ((latestBreakdown.water_points || 0) < 15) exp.push("Optimal hydration score not reached.");
        if ((latestBreakdown.inactivity_penalty || 0) < 0) exp.push("Inactivity penalty reduced your score.");
        return exp.length > 0 ? exp.join(" ") : "Perfect score! All daily targets achieved.";
      };

      const generateNextActions = (latestBreakdown: any) => {
        if (!latestBreakdown) return ["Log activity to generate actions."];
        let actions = [];
        if ((latestBreakdown.steps_points || 0) < 20) actions.push("Walk more to maximize step bonus (+10 to +20 pts).");
        if ((latestBreakdown.water_points || 0) < 15) actions.push("Drink water to reach the 2000ml target (+8 to +15 pts).");
        if (actions.length === 0) actions.push("Maintain current activity momentum.");
        return actions;
      };

      const detectMissedOpportunities = (latestBreakdown: any) => {
        if (!latestBreakdown) return null;
        if (latestBreakdown.steps_points === 10) return "You were close to the 6000 steps maximum bonus!";
        if (latestBreakdown.water_points === 8) return "You almost hit optimal hydration (2000ml)!";
        return null;
      };

      const latest_bd = data[data.length - 1]?.breakdown || {};

      setInsights({
        trend: { avg_score, highest_score, lowest_score, score_change, consistency_score },
        breakdown: { biggest_positive_factor, biggest_negative_factor, dominant_behavior },
        summary,
        patterns: { streak_days, drop_pattern, plateau },
        latest_breakdown: latest_bd,
        actionable: {
          why: generateWhyExplanation(latest_bd),
          actions: generateNextActions(latest_bd),
          missed: detectMissedOpportunities(latest_bd)
        },
        chartData
      });

      setLoading(false);
      setMounted(true);
    };

    fetchAndProcessInsights();
  }, [supabase.auth, router, range]);

  if (!mounted) return null;

  // Custom Recharts Tooltip styled for Cyber-Zen
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0A0A0A]/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl">
          <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-1">{label}</p>
          <p className="text-[#00FFA3] font-black text-lg">{payload[0].value} pts</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative min-h-screen bg-black text-white pb-28 overflow-hidden selection:bg-[#00FFA3]/30">
      
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00FFA3]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <header className="px-6 pt-10 pb-6 flex items-center gap-4 z-10 relative">
        <button 
          onClick={() => router.push('/dashboard')}
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl hover:bg-white/10 transition-all text-white/60 hover:text-white shadow-lg cursor-pointer"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tighter leading-none">AI <span className="text-[#00FFA3]">Insights</span></h1>
          <p className="text-white/40 text-xs font-medium mt-1 flex items-center gap-1">
            <Brain size={12} className="text-[#00FFA3]" /> Engine Active
          </p>
        </div>
      </header>

      <main className="px-6 space-y-6 z-10 relative">
        
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
          <button 
            onClick={() => setRange('7d')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${range === '7d' ? 'bg-[#00FFA3]/20 text-[#00FFA3] shadow-md' : 'text-white/40 hover:text-white/80'}`}
          >
            Last 7 Days
          </button>
          <button 
            onClick={() => setRange('30d')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${range === '30d' ? 'bg-[#00FFA3]/20 text-[#00FFA3] shadow-md' : 'text-white/40 hover:text-white/80'}`}
          >
            Last 30 Days
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
             <Loader2 size={32} className="animate-spin text-[#00FFA3] mb-4" />
             <p className="text-xs font-bold uppercase tracking-widest text-white/50">Processing Data...</p>
          </div>
        ) : !insights ? (
          <div className="bg-[#0A0A0A]/80 border border-white/10 rounded-[2rem] p-8 text-center backdrop-blur-md shadow-xl">
             <Activity size={40} className="text-white/20 mx-auto mb-4" />
             <h3 className="font-bold text-lg mb-2">Not Enough Data</h3>
             <p className="text-white/50 text-sm">Start logging your daily activity to unlock behavior insights and trends.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={range} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              
              {/* PATTERN DISPLAY BADGE */}
              <div className="flex justify-start">
                {insights.patterns.streak_days > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    <Flame size={12} /> {insights.patterns.streak_days}-Day Streak
                  </span>
                )}
                {insights.patterns.drop_pattern && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    <AlertTriangle size={12} /> Score Drop Detected
                  </span>
                )}
                {insights.patterns.plateau && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                    <Activity size={12} /> Plateau Detected
                  </span>
                )}
              </div>

              {/* SUMMARY CARD */}
              <div className="bg-gradient-to-br from-[#0A0A0A] to-[#0D0D0D] border border-[#00FFA3]/30 rounded-[2rem] p-6 shadow-[0_10px_30px_rgba(0,255,163,0.1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FFA3]/5 rounded-full blur-[40px] pointer-events-none" />
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={18} className="text-[#00FFA3]" fill="#00FFA3" />
                  <span className="text-xs font-bold text-[#00FFA3] uppercase tracking-wider">Coach Conclusion</span>
                </div>
                <p className="text-base font-medium text-white/90 leading-relaxed relative z-10">
                  &quot;{insights.summary}&quot;
                </p>
              </div>

              {/* SCORE TREND GRAPH */}
              <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 shadow-xl">
                 <div className="flex items-center gap-2 mb-6">
                    <TrendingUp size={16} className="text-[#00FFA3]" />
                    <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Score Trend</span>
                 </div>
                 <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={insights.chartData}>
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis domain={['dataMin - 10', 100]} hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(0,255,163,0.2)', strokeWidth: 2 }} />
                        <Line type="monotone" dataKey="score" stroke="#00FFA3" strokeWidth={3} dot={{ fill: '#000', stroke: '#00FFA3', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#00FFA3' }} />
                      </LineChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* LATEST SCORE BREAKDOWN */}
              <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-6 shadow-xl space-y-4">
                 <h3 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-4">Latest Score Breakdown</h3>
                 
                 <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-white/80 text-sm font-medium">Steps Contribution</span>
                    <span className="font-bold text-[#00FFA3]">+{insights.latest_breakdown.steps_points || 0}</span>
                 </div>
                 
                 <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-white/80 text-sm font-medium">Water Contribution</span>
                    <span className="font-bold text-[#00FFA3]">+{insights.latest_breakdown.water_points || 0}</span>
                 </div>

                 <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-white/80 text-sm font-medium">Activity Bonus</span>
                    <span className="font-bold text-[#00FFA3]">+{insights.latest_breakdown.log_bonus || 0}</span>
                 </div>
                 
                 <div className="flex justify-between items-center pb-1">
                    <span className="text-white/80 text-sm font-medium">Inactivity Penalty</span>
                    <span className="font-bold text-red-400">{insights.latest_breakdown.inactivity_penalty || 0}</span>
                 </div>
              </div>

              {/* ACTIONABLE INSIGHTS (NEW LOGIC BINDING) */}
              <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-6 shadow-xl space-y-4">
                 <h3 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-4">Actionable Next Steps</h3>
                 
                 <div className="border-b border-white/5 pb-3">
                    <span className="text-white/80 text-sm font-medium block mb-1">Why Score Changed</span>
                    <span className="font-bold text-[#00FFA3] text-sm">{insights.actionable.why}</span>
                 </div>
                 
                 {insights.actionable.missed && (
                 <div className="border-b border-white/5 pb-3">
                    <span className="text-white/80 text-sm font-medium block mb-1">Missed Opportunity</span>
                    <span className="font-bold text-orange-400 text-sm">{insights.actionable.missed}</span>
                 </div>
                 )}
                 
                 <div className="pb-1">
                    <span className="text-white/80 text-sm font-medium block mb-1">Micro Goals</span>
                    <ul className="list-disc pl-4 text-sm font-bold text-white/90 space-y-1">
                      {insights.actionable.actions.map((act: string, i: number) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                 </div>
              </div>

            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* FIXED BOTTOM NAVIGATION */}
      <div className="fixed bottom-6 left-6 right-6 flex justify-center z-40">
        <nav className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex items-center gap-12 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          <Link href="/dashboard">
            <LayoutDashboard size={24} className="text-white/40 hover:text-white transition-colors cursor-pointer" />
          </Link>
          
          <Link href="/log">
            <motion.div 
              whileTap={{ scale: 0.9 }}
              className="bg-[#00FFA3] p-4 rounded-full shadow-[0_0_30px_rgba(0,255,163,0.4)] text-black cursor-pointer -mt-8 border-4 border-black flex items-center justify-center"
            >
              <Plus size={28} strokeWidth={3} />
            </motion.div>
          </Link>
          
          <Link href="/reports">
             <BarChart2 size={24} className="text-[#00FFA3]" strokeWidth={2.5} />
          </Link>
        </nav>
      </div>

    </div>
  );
}
