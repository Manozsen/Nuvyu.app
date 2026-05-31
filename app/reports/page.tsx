"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Brain, Activity, TrendingUp, TrendingDown, Calendar, Zap, LayoutDashboard, Settings, Plus, BarChart2, AlertTriangle, Flame, Footprints, Droplets, Utensils } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, YAxis, AreaChart, Area, BarChart, Bar, Legend } from 'recharts';
import { getAnalytics, buildAIAnalyticsContext } from '../../lib/analytics/engine';

export default function InsightsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  
    // Insights State
  const [insights, setInsights] = useState<any>(null);
  
  // 🧠 RUNTIME HARDENING: Normalization Layers for UI Rendering
  const safeInsights = useMemo(() => {
    if (!insights) return null;
    return {
      ...insights,
      advancedAnalytics: {
        ...insights.advancedAnalytics,
        dailyData: Array.isArray(insights.advancedAnalytics?.dailyData) ? insights.advancedAnalytics.dailyData : [],
      },
      actionable: {
        ...insights.actionable,
        actions: Array.isArray(insights.actionable?.actions) ? insights.actionable.actions : ["Log consistently to generate insights."],
      }
    };
  }, [insights]);

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
      // 🧠 PERFORMANCE OPTIMIZATION ENGINE (Parallel Data Fetching)
const [
  scoreResponse,
  sleepResponse,
  advancedAnalytics
] = await Promise.all([
  supabase
    .from('score_explanations')
    .select('date, final_score, breakdown')
    .eq('user_id', user.id)
    .gte('date', boundaryDate)
    .order('date', { ascending: true }),

  supabase
    .from('sleep_logs')
    .select('date, sleep_hours, recovery_score')
    .eq('user_id', user.id)
    .gte('date', boundaryDate)
    .order('date', { ascending: true }),

  getAnalytics(supabase, user.id, days)
]);

const { data, error } = scoreResponse;
const { data: sleepData } = sleepResponse;

const aiAnalyticsContext = buildAIAnalyticsContext(
  advancedAnalytics || {}
);

      if (error || !data || data.length === 0) {
        setInsights(null);
        setLoading(false);
        setMounted(true);
        return;
      }

      // 🧠 SAFE NORMALIZATION LAYER
      const safeData = Array.isArray(data) ? data : [];
      const safeSleepData = Array.isArray(sleepData) ? sleepData : [];

      // Format Data for Graph
      const chartData = safeData.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        score: d.final_score || 0
      }));

      // 🧠 PART 2: TREND ENGINE
      const scores = safeData.map(d => d.final_score || 0);
      const avg_score = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const highest_score = scores.length > 0 ? Math.max(...scores) : 0;
      const lowest_score = scores.length > 0 ? Math.min(...scores) : 0;
      const score_change = scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0;
      const variance = scores.length > 0 ? scores.reduce((a, b) => a + Math.pow(b - avg_score, 2), 0) / scores.length : 0;
      const consistency_score = Math.max(0, Math.round(100 - Math.sqrt(variance) * 2));

      // 🧠 PART 3: BREAKDOWN INTELLIGENCE
      let total_steps_points = 0;
      let total_water_points = 0;
      let total_penalties = 0;
      let total_log_bonus = 0;
      let total_workout_bonus = 0;
      
      safeData.forEach(d => {
        total_steps_points += d.breakdown?.steps_points || 0;
        total_water_points += d.breakdown?.water_points || 0;
        total_penalties += d.breakdown?.inactivity_penalty || 0;
        total_log_bonus += d.breakdown?.log_bonus || 0;
        total_workout_bonus += d.breakdown?.workout_bonus || 0;
      });

      const factors: Record<string, number> = { 
        Steps: total_steps_points, 
        Water: total_water_points, 
        Consistency: total_log_bonus,
        Workouts: total_workout_bonus
      };
      
      const biggest_positive_factor = Object.keys(factors).reduce((a, b) => factors[a] > factors[b] ? a : b, 'Consistency');
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
        if (!latestBreakdown || Object.keys(latestBreakdown).length === 0) return "Data is still syncing.";
        let exp = [];
        if ((latestBreakdown.steps_points || 0) < 20) exp.push("Full step bonus was not applied.");
        if ((latestBreakdown.water_points || 0) < 15) exp.push("Optimal hydration score not reached.");
        if ((latestBreakdown.inactivity_penalty || 0) < 0) exp.push("Inactivity penalty reduced your score.");
        return exp.length > 0 ? exp.join(" ") : "Perfect score! All daily targets achieved.";
      };
      
      const generateNextActions = (latestBreakdown: any) => {
        if (!latestBreakdown || Object.keys(latestBreakdown).length === 0) return ["Log activity to generate actions."];
        let actions = [];
        if ((latestBreakdown.steps_points || 0) < 20) actions.push("Walk more to maximize step bonus (+10 to +20 pts).");
        if ((latestBreakdown.water_points || 0) < 15) actions.push("Drink water to reach the 2000ml target (+8 to +15 pts).");
        if (actions.length === 0) actions.push("Maintain current activity momentum.");
        return actions;
      };
      
      const detectMissedOpportunities = (latestBreakdown: any) => {
        if (!latestBreakdown || Object.keys(latestBreakdown).length === 0) return null;
        if (latestBreakdown.steps_points === 10) return "You were close to the 6000 steps maximum bonus!";
        if (latestBreakdown.water_points === 8) return "You almost hit optimal hydration (2000ml)!";
        return null;
      };
      
      const latest_bd = safeData.length > 0 ? (safeData[safeData.length - 1]?.breakdown || {}) : {};

      setInsights({
        trend: { 
          avg_score: avg_score || 0, 
          highest_score: highest_score || 0, 
          lowest_score: lowest_score || 0, 
          score_change: score_change || 0, 
          consistency_score: consistency_score || 0 
        },
        breakdown: { 
          biggest_positive_factor: biggest_positive_factor || 'None', 
          biggest_negative_factor: biggest_negative_factor || 'None', 
          dominant_behavior: dominant_behavior || 'stable' 
        },
        summary: summary || "Progress tracking is active.",
        patterns: { 
          streak_days: streak_days || 0, 
          drop_pattern: !!drop_pattern, 
          plateau: !!plateau 
        },
        latest_breakdown: latest_bd,
        actionable: {
          why: generateWhyExplanation(latest_bd),
          actions: generateNextActions(latest_bd),
          missed: detectMissedOpportunities(latest_bd)
        },
        chartData: chartData || [],
        sleepTrends: safeSleepData,
        advancedAnalytics: {
          ...advancedAnalytics,
          dailyData: Array.isArray(advancedAnalytics?.dailyData) ? advancedAnalytics.dailyData : [],
          stats: advancedAnalytics?.stats || {}
        },
        aiAnalyticsContext: aiAnalyticsContext || {}
      });

      setLoading(false);
      setMounted(true);
    };

    fetchAndProcessInsights();
  }, [supabase.auth, router, range]);

  if (!mounted) return null;

    // Custom Recharts Tooltip styled for Cyber-Zen
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && Array.isArray(payload) && payload.length > 0 && payload[0]) {
      return (
        <div className="bg-[#0A0A0A]/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-xl">
          <p className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-1">{label || 'Metric'}</p>
          <p className="text-[#00FFA3] font-black text-lg">{payload[0].value || 0}</p>
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

              {/* ENERGY & METABOLIC INTELLIGENCE */}
              <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 shadow-xl">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Flame size={16} className="text-orange-500" />
                      <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Energy Balance</span>
                    </div>
                   <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{insights?.advancedAnalytics?.stats?.calorieBurnTrend || 'stable'}</span>
                 </div>
                 <div className="h-40 w-full">
                    {(insights?.advancedAnalytics?.dailyData || []).filter((d:any) => (d?.calorie_burn || 0) > 0).length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={insights.advancedAnalytics.dailyData}>
                          <defs>
                            <linearGradient id="colorBurn" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis domain={['dataMin - 200', 'dataMax + 200']} hide />
                          <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} verticalAlign="bottom" height={36} />
                          <Area type="monotone" dataKey="calorie_burn" stroke="#f97316" fillOpacity={1} fill="url(#colorBurn)" strokeWidth={2} name="Burned (kcal)" />
                          <Area type="step" dataKey="calorie_target" stroke="rgba(255,255,255,0.2)" fill="transparent" strokeDasharray="4 4" strokeWidth={2} name="Target (kcal)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-medium">Energy tracking initializing...</div>
                    )}
                 </div>
              </div>

             {/* RECOVERY & HABIT ACTIVITY */}
              <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 shadow-xl">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Activity size={16} className="text-indigo-400" />
                      <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Recovery & Sleep</span>
                    </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{insights?.advancedAnalytics?.stats?.recoveryTrend || 'stable'}</span>
                 </div>
                 <div className="h-40 w-full">
                    {(insights?.advancedAnalytics?.dailyData || []).filter((d:any) => (d?.recovery_score || 0) > 0 || (d?.sleep_hours || 0) > 0).length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={insights.advancedAnalytics.dailyData}>
                          <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                          <Bar dataKey="recovery_score" fill="#6366f1" radius={[4, 4, 0, 0]} name="Recovery Score" maxBarSize={20} />
                          <Bar dataKey="sleep_hours" fill="#818cf8" radius={[4, 4, 0, 0]} name="Sleep (hrs)" maxBarSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-medium">No sleep data yet. Log sleep to see trends.</div>
                    )}
                 </div>
              </div>

              {/* STEPS & MOVEMENT TREND */}
              <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 shadow-xl">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Footprints size={16} className="text-[#00FFA3]" />
                      <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Movement Pattern</span>
                    </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{insights?.advancedAnalytics?.stats?.stepsTrend || 'stable'}</span>
                 </div>
                 <div className="h-40 w-full">
                    {(insights?.advancedAnalytics?.dailyData || []).filter((d:any) => (d?.steps || 0) > 0).length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={insights.advancedAnalytics.dailyData}>
                          <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                          <Bar dataKey="steps" fill="#00FFA3" radius={[4, 4, 0, 0]} name="Steps" maxBarSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-medium">Start walking to build movement trends.</div>
                    )}
                 </div>
              </div>

              {/* HYDRATION TREND */}
              <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 shadow-xl">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Droplets size={16} className="text-blue-400" />
                      <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Hydration Consistency</span>
                    </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{insights?.advancedAnalytics?.stats?.waterTrend || 'stable'}</span>
                 </div>
                 <div className="h-40 w-full">
                    {(insights?.advancedAnalytics?.dailyData || []).filter((d:any) => (d?.water || 0) > 0).length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={insights.advancedAnalytics.dailyData}>
                          <defs>
                            <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                          <Area type="monotone" dataKey="water" stroke="#60a5fa" fillOpacity={1} fill="url(#colorWater)" strokeWidth={2} name="Water (ml)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-medium">Log water to see your hydration pattern.</div>
                    )}
                 </div>
              </div>

          {/* 🧠 FOOD ANALYTICS VISUALIZATION SYSTEM */}
          <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Utensils size={16} className="text-orange-400" />
                <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Nutrition Intelligence</span>
              </div>
            </div>
            <div className="h-40 w-full">
              {(insights?.advancedAnalytics?.dailyData || []).filter((d:any) => (d?.calories_in || 0) > 0).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insights.advancedAnalytics.dailyData}>
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 'bold' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar dataKey="calories_in" fill="#f97316" radius={[4, 4, 0, 0]} name="Intake (kcal)" maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-medium">Log meals to build nutrition trends.</div>
              )}
            </div>
          </div>

          {/* 🧠 SCREEN TIME INTELLIGENCE GRAPH SYSTEM */}
          <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-pink-400" />
                <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Screen Fatigue Trend</span>
              </div>
            </div>
              <div className="h-40 w-full">
               {(insights?.advancedAnalytics?.dailyData || []).filter((d:any) => (d?.screen || 0) > 0).length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={insights.advancedAnalytics.dailyData}>
                    <defs>
                      <linearGradient id="colorScreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f472b6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 'bold' }} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                    <Area type="monotone" dataKey="screen" stroke="#f472b6" strokeWidth={3} fillOpacity={1} fill="url(#colorScreen)" name="Screen Hrs" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-medium">Log screen time to view fatigue correlation.</div>
              )}
            </div>
          </div>

              {/* STREAK & CONSISTENCY TREND */}
              <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 shadow-xl">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-yellow-400" />
                      <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Streak & Consistency</span>
                    </div>
                 </div>
                 <div className="h-40 w-full">
                    {insights.advancedAnalytics?.dailyData?.filter((d:any) => d.streak > 0).length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={insights.advancedAnalytics.dailyData}>
                          <XAxis dataKey="date" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }} cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 2 }} />
                          <Line type="step" dataKey="streak" stroke="#eab308" strokeWidth={3} dot={{ fill: '#000', stroke: '#eab308', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#eab308' }} name="Streak Days" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-medium">Log daily to build your streak.</div>
                    )}
                 </div>
              </div>
              
              {/* FOOD TIMELINE SECTION */}
              <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-6 shadow-xl space-y-4">
                 <h3 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2"><Utensils size={14} className="text-orange-400"/> Food & Intake Timeline</h3>
                 {(insights.advancedAnalytics?.dailyData?.[insights.advancedAnalytics.dailyData.length - 1]?.meal_timeline?.length > 0) ? (
                   insights.advancedAnalytics.dailyData[insights.advancedAnalytics.dailyData.length - 1].meal_timeline.map((meal: any, i: number) => (
                     <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3">
                        <div>
                          <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block">{meal.time}</span>
                          <span className="text-white/90 text-sm font-medium">{meal.food}</span>
                        </div>
                        <span className="font-bold text-orange-400">{meal.calories} kcal</span>
                     </div>
                   ))
                 ) : (
                   <div className="text-center text-white/30 text-xs font-medium py-2">No meals logged today.</div>
                 )}
              </div>

              {/* ENERGY BREAKDOWN SECTION */}
              <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-6 shadow-xl space-y-4">
                 <h3 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-4 flex items-center gap-2"><Flame size={14} className="text-[#00FFA3]"/> Burn Breakdown</h3>
                 
                 <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-white/80 text-sm font-medium">BMR (Progressive)</span>
                    <span className="font-bold text-[#00FFA3]">{insights.advancedAnalytics?.dailyData?.[insights.advancedAnalytics.dailyData.length - 1]?.bmr_burn || 0} kcal</span>
                 </div>

                 {(insights.advancedAnalytics?.dailyData?.[insights.advancedAnalytics.dailyData.length - 1]?.activity_breakdown || []).map((act: any, i: number) => (
                   <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3">
                      <span className="text-white/80 text-sm font-medium capitalize">{act.name}</span>
                      <span className="font-bold text-[#00FFA3]">{act.burn} kcal</span>
                   </div>
                 ))}
                 
                 <div className="flex justify-between items-center pt-1">
                    <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Net Balance Status</span>
                    <span className="font-bold text-white/80 text-xs uppercase tracking-widest">{insights.advancedAnalytics?.dailyData?.[insights.advancedAnalytics.dailyData.length - 1]?.energy_status || 'Maintenance'}</span>
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

              {/* 🧠 PHASE 8: FORECASTING & TRAJECTORY INTELLIGENCE */}
              <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-6 shadow-xl space-y-4 mt-6">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-white/90 font-black text-lg flex items-center gap-2">
                     <Brain size={20} className="text-[#00FFA3]" /> AI Behavioral Forecast
                   </h3>
                   <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold px-3 py-1 bg-white/5 rounded-full">3-Day Projection</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1">Burnout Trajectory</span>
                      <span className="text-white font-black text-sm capitalize">{safeInsights.advancedAnalytics?.streak_risk === "high" ? "Escalating" : "Stable"}</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1">Cognitive Load</span>
                      <span className="text-white font-black text-sm capitalize">{safeInsights.advancedAnalytics?.cognitive_load?.replace('_', ' ') || "Stable"}</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1">Adherence Forecast</span>
                      <span className="text-white font-black text-sm">{safeInsights.actionable?.adherence_risk === "high" ? "Decline Risk" : "Stable Momentum"}</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1">Resilience Adapt</span>
                      <span className="text-white font-black text-sm">Adaptive Mode</span>
                    </div>
                 </div>
              </div>

              {/* 🧠 PHASE 8: EXECUTIVE RECOVERY DASHBOARD */}
              <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-6 shadow-xl space-y-4 mt-6 mb-8">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-white/90 font-black text-lg flex items-center gap-2">
                     <Zap size={20} className="text-[#00FFA3]" /> Lifeload & Capacity
                   </h3>
                   <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold px-3 py-1 bg-white/5 rounded-full">Executive Summary</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1">Lifeload Score</span>
                      <span className="text-white font-black text-xl">{safeInsights.aiAnalyticsContext?.lifeload_packet?.lifeload_score || 100}</span>
                      <span className="text-white/60 text-xs font-bold block mt-1 capitalize">{safeInsights.aiAnalyticsContext?.lifeload_packet?.lifeload_level || "Optimal"}</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-1">Cognitive Freshness</span>
                      <span className="text-[#00FFA3] font-black text-xl capitalize">{safeInsights.aiAnalyticsContext?.cognitive_energy_packet?.cognitive_freshness || "Stable"}</span>
                      <span className="text-white/60 text-xs font-bold block mt-1">Energy Model</span>
                    </div>
                    <div className="col-span-2 p-4 bg-[#00FFA3]/10 rounded-xl border border-[#00FFA3]/20">
                      <span className="text-[#00FFA3]/60 text-[10px] font-bold uppercase tracking-widest block mb-1">Dominant Load Driver</span>
                      <span className="text-white font-bold text-sm capitalize">{(safeInsights.aiAnalyticsContext?.lifeload_packet?.dominant_load_driver || "None").replace('_', ' ')}</span>
                    </div>
                 </div>
              </div>

            </motion.div>
          </AnimatePresence>
         )}
        
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
