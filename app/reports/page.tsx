"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Brain, Activity, TrendingUp, TrendingDown, Calendar, Zap, LayoutDashboard, Settings, Plus, BarChart2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

      // 🧠 PART 2: TREND ENGINE
      const scores = data.map(d => d.final_score);
      const avg_score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      const highest_score = Math.max(...scores);
      const lowest_score = Math.min(...scores);
      const score_change = scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0;
      
      // Consistency based on standard deviation
      const variance = scores.reduce((a, b) => a + Math.pow(b - avg_score, 2), 0) / scores.length;
      const consistency_score = Math.max(0, Math.round(100 - Math.sqrt(variance) * 2));

      // 🧠 PART 3: BREAKDOWN INTELLIGENCE
      let total_steps_points = 0;
      let total_water_points = 0;
      let total_penalties = 0;
      let total_log_bonus = 0;

      data.forEach(d => {
        total_steps_points += d.breakdown?.steps_points || 0;
        total_water_points += d.breakdown?.water_points || 0;
        total_penalties += d.breakdown?.inactivity_penalty || 0;
        total_log_bonus += d.breakdown?.log_bonus || 0;
      });

      const factors: Record<string, number> = { 
        Steps: total_steps_points, 
        Water: total_water_points, 
        Consistency: total_log_bonus 
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

      // 🧠 PART 5: RULE-BASED SUMMARY (Hinglish tone)
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

      // 🧠 PART 6: AI CONTEXT BUILDER (Prepared for Future Gemini Inject)
      const aiContextReady = {
        avg_score,
        score_change,
        consistency_score,
        best_day: highest_score,
        worst_day: lowest_score,
        dominant_behavior,
        main_issue: biggest_negative_factor,
        main_strength: biggest_positive_factor,
        pattern_type: drop_pattern ? 'declining' : plateau ? 'plateau' : 'improving'
      };

      setInsights({
        trend: { avg_score, highest_score, lowest_score, score_change, consistency_score },
        breakdown: { biggest_positive_factor, biggest_negative_factor, dominant_behavior },
        summary,
        aiContext: aiContextReady,
        dataPoints: data.slice(-7) // Show max 7 nodes in UI for simplicity
      });

      setLoading(false);
      setMounted(true);
    };

    fetchAndProcessInsights();
  }, [supabase.auth, router, range]);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-black text-white pb-28 overflow-hidden selection:bg-[#00FFA3]/30">
      
      {/* Background Glows (NUVYU Design System) */}
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
        
        {/* RANGE SELECTOR */}
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
              {/* SUMMARY CARD (Rule-based Intelligence) */}
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

              {/* TREND METRICS GRID */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart2 size={16} className="text-[#00FFA3]" />
                    <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Avg Score</span>
                  </div>
                  <div className="text-3xl font-black">{insights.trend.avg_score}</div>
                </div>

                <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    {insights.trend.score_change >= 0 ? <TrendingUp size={16} className="text-blue-400" /> : <TrendingDown size={16} className="text-red-400" />}
                    <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Momentum</span>
                  </div>
                  <div className="text-3xl font-black flex items-baseline gap-1">
                    {insights.trend.score_change > 0 ? '+' : ''}{insights.trend.score_change}
                    <span className="text-[10px] text-white/30 uppercase tracking-widest">pts</span>
                  </div>
                </div>
              </div>

              {/* BEHAVIOR BREAKDOWN */}
              <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-6 shadow-xl space-y-4">
                 <h3 className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-4">Behavior Breakdown</h3>
                 
                 <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-white/50 text-sm font-medium">Strongest Habit</span>
                    <span className="font-bold text-[#00FFA3] flex items-center gap-1">
                      {insights.breakdown.biggest_positive_factor} <TrendingUp size={14} />
                    </span>
                 </div>
                 
                 <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-white/50 text-sm font-medium">Consistency Rating</span>
                    <span className="font-bold text-white">{insights.trend.consistency_score} / 100</span>
                 </div>
                 
                 <div className="flex justify-between items-center pb-1">
                    <span className="text-white/50 text-sm font-medium">Risk Area</span>
                    <span className="font-bold text-orange-400">{insights.breakdown.biggest_negative_factor}</span>
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
