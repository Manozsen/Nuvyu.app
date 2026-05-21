"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Droplets, Footprints, Utensils, Dumbbell, CheckCircle2, Moon, Zap, Plus, X, Calendar as CalIcon, Activity } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

// Core Engines
import { calculateDailyScore } from '../../lib/score/engine';
import { calculateRecoveryScore } from '../../lib/recovery/engine';
import { updateHabit } from '../../lib/habit/engine';
import { calculateXP, calculateLevel, didLevelUp } from '../../lib/xp/engine';
import { estimateActivityCalories, generateWorkoutSuggestions } from '../../lib/activity/engine';
import { safeNumber, safeString } from '../../lib/utils/safe';

// 🧠 LOGS INTELLIGENCE HELPERS
const getMealType = () => {
  const hour = new Date().getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
};

const getHydrationMessage = (currentWater: number) => {
  if (currentWater === 0) return "Morning hydration incomplete";
  if (currentWater < 1500) return "Keep drinking! Recovery depends on it.";
  if (currentWater < 3000) return `${Math.ceil((3000 - currentWater)/250)} glasses away from target!`;
  return "Hydration optimal today 💧";
};

export default function LogsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Feed Architecture
  const [feedLogs, setFeedLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'nutrition' | 'workout' | 'recovery'>('all');

    // Quick Add Modal State
  const [modalType, setModalType] = useState<'water' | 'steps' | 'food' | 'workout' | 'sleep' | 'activity' | 'screen' | null>(null);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);

  // Input States
    // 🧠 Intelligence States
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(getMealType());
  const [waterProgress, setWaterProgress] = useState(0);

  // Auto-calculate hydration for intelligence visuals
  useEffect(() => {
    const totalWater = feedLogs.filter(l => l.log_type === 'water').reduce((acc, l) => acc + safeNumber(l.data?.amount), 0);
    setWaterProgress(Math.min(100, Math.round((totalWater / 3000) * 100)));
  }, [feedLogs]);
  const [amount, setAmount] = useState('');
  const [textInput, setTextInput] = useState('');
  const [sleepQuality, setSleepQuality] = useState('average');

    // 🧠 SMART VALIDATION & EDITING ENGINE
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  
  const openEditModal = (log: any) => {
    setEditingLogId(log.id);
    setModalType(log.log_type);
    if (log.log_type === 'water' || log.log_type === 'steps') setAmount(log.data?.amount?.toString() || '');
    if (log.log_type === 'sleep') { setAmount(log.data?.sleep_hours?.toString() || ''); setSleepQuality(log.data?.sleep_quality || 'average'); }
    if (log.log_type === 'food') { setTextInput(log.data?.text || ''); setMealType(log.data?.meal_type || getMealType()); }
    if (log.log_type === 'workout') setWorkoutData({ exercise: log.data?.exercise||'', sets: log.data?.sets||'', reps: log.data?.reps||'', duration: log.data?.duration||'' });
    if (log.log_type === 'activity') setActivityData({ type: log.data?.activity_name||log.data?.type||'', duration: log.data?.duration_mins||'', intensity: log.data?.intensity||'medium' });
  };
  
  // Workout & Activity Intelligence
  const [workoutData, setWorkoutData] = useState({ exercise: '', sets: '', reps: '', duration: '' });
  const [activityData, setActivityData] = useState({ type: '', duration: '', intensity: 'medium' });
  
  const [workoutSuggestions, setWorkoutSuggestions] = useState(["Push-ups", "Pull-ups", "Squats", "Plank", "Running", "HIIT"]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

    useEffect(() => {
    const init = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
      
      // 🧠 PERFORMANCE OPTIMIZATION ENGINE (Parallel Timeline Loading)
      const [feedResponse, profileResponse] = await Promise.all([
        supabase.from('daily_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100),
        supabase.from('profiles').select('goal, primary_target').eq('id', user.id).single()
      ]);
      
      if (feedResponse.data) setFeedLogs(feedResponse.data);
      if (profileResponse.data) setWorkoutSuggestions(generateWorkoutSuggestions(profileResponse.data));
      setLoading(false);
    };
    init();
  }, [supabase.auth, router]);

  const fetchFeed = async (uid: string) => {
    const { data } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setFeedLogs(data);
  };

    const handleCloseModal = () => {
    setModalType(null);
    setAmount('');
    setTextInput('');
    setWorkoutData({ exercise: '', sets: '', reps: '', duration: '' });
    setActivityData({ type: '', duration: '', intensity: 'medium' });
    setSuccessFeedback(null);
    setValidationWarning(null);
    setEditingLogId(null);
  };

    const isFormValid = () => {
    if (modalType === 'water' || modalType === 'steps' || modalType === 'sleep' || modalType === 'screen') return parseFloat(amount) > 0;
    if (modalType === 'food') return textInput.trim().length > 2;
    if (modalType === 'workout') return workoutData.exercise.trim().length > 2;
    if (modalType === 'activity') return activityData.type.trim().length > 2 && parseFloat(activityData.duration) > 0;
    return false;
  };

  const executeSave = async () => {
    if (!userId || !isFormValid()) return; 

    // 🧠 SMART LOG VALIDATION SYSTEM (Soft Anomalies)
    if (!validationWarning) {
      if (modalType === 'steps' && parseFloat(amount) > 40000) { setValidationWarning("40K+ steps detected. Save again to confirm."); return; }
      if (modalType === 'water' && parseFloat(amount) > 6000) { setValidationWarning("6L+ water detected. Save again to confirm."); return; }
      if (modalType === 'sleep' && parseFloat(amount) > 16) { setValidationWarning("16h+ sleep detected. Save again to confirm."); return; }
      if (modalType === 'workout' && parseFloat(workoutData.duration) > 180) { setValidationWarning("3hr+ workout detected. Save again to confirm."); return; }
    }

    setSaving(true);
    setValidationWarning(null);

    try {
      // 1. Prepare Payload (Strictly Typed)
      let payloadData: any = {};
      if (modalType === 'water' || modalType === 'steps' || modalType === 'screen') payloadData = { amount: safeNumber(amount) };
      else if (modalType === 'food') payloadData = { 
        text: safeString(textInput).trim(), meal_type: mealType,
        ai_nutrition_prep: { status: 'pending', sync_ready: true } // 🧠 Phase 5 scalable architecture setup
      };
      else if (modalType === 'sleep') payloadData = { sleep_hours: safeNumber(amount), sleep_quality: sleepQuality }
      else if (modalType === 'workout') payloadData = { 
        exercise: safeString(workoutData.exercise), sets: safeNumber(workoutData.sets), reps: safeNumber(workoutData.reps), duration: safeNumber(workoutData.duration) 
      };
      else if (modalType === 'activity') {
        const duration = safeNumber(activityData.duration);
        const estCals = estimateActivityCalories(activityData.type, duration, activityData.intensity);
        payloadData = { activity_name: activityData.type, duration_mins: duration, intensity: activityData.intensity, estimated_calories: estCals };
      }

      // 2. Save or Update Core Log
      if (editingLogId) {
        await supabase.from('daily_logs').update({ data: payloadData }).eq('id', editingLogId);
      } else {
        await supabase.from('daily_logs').insert({ user_id: userId, log_type: modalType, data: payloadData });
      }

       // 3. FIX: Properly Save Sleep Log (Constraint: user_id, date)
      if (modalType === 'sleep') {
        const hrs = parseFloat(amount) || 0;
        const { recovery_score } = calculateRecoveryScore(hrs, sleepQuality);
        
        // Generate robust local date string to prevent UTC duplicates
        const now = new Date();
        const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        
        await supabase.from('sleep_logs').upsert({
          user_id: userId, date: localDateStr, sleep_hours: hrs, sleep_quality: sleepQuality, recovery_score
        }, { onConflict: 'user_id, date' });
      }

      // 4. Sync Score, Habit & XP Engines
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0); 
      const todayDateStr = startOfDay.toISOString().split('T')[0];

      const [{ data: profile }, { data: logs }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('daily_logs').select('*').eq('user_id', userId).gte('created_at', startOfDay.toISOString())
      ]);

      if (profile && logs) {
        // Score Engine
        const baseScore = profile.onboarding_score || 50;
        const { finalScore, breakdown, totals } = calculateDailyScore(logs, baseScore);

        await supabase.from('score_explanations').upsert({
          user_id: userId, date: todayDateStr, breakdown, final_score: finalScore
        }, { onConflict: 'user_id, date' });

        await supabase.from('profiles').update({ current_score: finalScore }).eq('id', userId);

        // Habit Engine
        await updateHabit(supabase, userId, { steps_today: totals.totalSteps, water_today: totals.totalWater, current_score: finalScore }, true);

        // XP Engine
        const xpEarned = calculateXP(totals.totalSteps, totals.totalWater, totals.logsCount, totals.workoutLogsCount, modalType === 'sleep' ? 1 : 0);
        const newXP = (profile.xp || 0) + xpEarned;
        const newLevel = calculateLevel(newXP);
        await supabase.from('profiles').update({ xp: newXP, level: newLevel }).eq('id', userId);

        setSuccessFeedback(`+${xpEarned} XP Gained!`);
      }

      // Refresh Feed smoothly without reloading page
      fetchFeed(userId);
      
      setTimeout(() => {
        handleCloseModal();
        setSaving(false);
      }, 1200);
      
    } catch (error) {
      console.error("Engine Sync Error:", error);
      setSaving(false);
    }
  };

      // 🧠 LOGS PERFORMANCE ENGINE: Memoized rendering and filtering
  const filteredFeed = useMemo(() => {
    return feedLogs.filter(log => {
      // 🧠 TIMELINE RETENTION ENGINE: 7-day rolling window
      const logDate = new Date(log.created_at);
      const daysOld = (new Date().getTime() - logDate.getTime()) / (1000 * 3600 * 24);
      if (daysOld > 7) return false;

      if (activeTab === 'all') return true;
      if (activeTab === 'nutrition') return log.log_type === 'food' || log.log_type === 'water';
      if (activeTab === 'workout') return log.log_type === 'workout' || log.log_type === 'activity' || log.log_type === 'steps';
      if (activeTab === 'recovery') return log.log_type === 'sleep';
      return true;
    });
  }, [feedLogs, activeTab]);

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-[#00FFA3]" size={32} /></div>;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col relative overflow-hidden">
      
      {/* HEADER */}
      <header className="px-6 pt-10 pb-4 bg-black/60 backdrop-blur-xl sticky top-0 z-30 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white transition-all">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight">Timeline Feed</h1>
              <p className="text-[#00FFA3] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5"><CalIcon size={10} /> {todayStr}</p>
            </div>
          </div>
        </div>
        
        {/* QUICK ADD BAR (Horizontal Scroll) */}
        <div className="flex gap-3 overflow-x-auto mt-6 pb-2 scrollbar-hide snap-x">
          {[
            { id: 'water', icon: Droplets, label: 'Water', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            { id: 'steps', icon: Footprints, label: 'Steps', color: 'text-[#00FFA3]', bg: 'bg-[#00FFA3]/10 border-[#00FFA3]/20' },
            { id: 'food', icon: Utensils, label: 'Food', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
            { id: 'workout', icon: Dumbbell, label: 'Workout', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
            { id: 'sleep', icon: Moon, label: 'Sleep', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
            { id: 'screen', icon: Activity, label: 'Screen', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
            { id: 'activity', icon: Zap, label: 'Activity', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' }
          ].map(btn => (
            <button 
              key={btn.id} onClick={() => setModalType(btn.id as any)}
              className={`snap-start flex flex-col items-center justify-center min-w-[72px] h-[72px] rounded-2xl border ${btn.bg} transition-transform active:scale-95`}
            >
              <btn.icon size={20} className={btn.color} />
              <span className="text-[10px] font-bold mt-2 text-white/70">{btn.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* FILTER TABS */}
      <div className="px-6 py-4 flex gap-2 overflow-x-auto scrollbar-hide border-b border-white/5">
        {['all', 'nutrition', 'workout', 'recovery'].map(tab => (
          <button 
            key={tab} onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white text-black' : 'bg-white/5 text-white/50 border border-white/10'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TIMELINE FEED */}
      <main className="flex-1 px-6 py-6 space-y-4 overflow-y-auto pb-32">
        <AnimatePresence>
          {filteredFeed.map((log: any, index: number) => {
             const timeStr = new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
             
             let Icon = Activity;
             let color = "text-white/50";
             let content = "Logged activity";
             
             if (log.log_type === 'water') { Icon = Droplets; color = "text-blue-400"; content = `Drank ${safeNumber(log.data?.amount)} ml water`; }
             if (log.log_type === 'steps') { Icon = Footprints; color = "text-[#00FFA3]"; content = `Walked ${safeNumber(log.data?.amount)} steps`; }
             if (log.log_type === 'food') { Icon = Utensils; color = "text-orange-400"; content = `Ate: ${safeString(log.data?.text)}`; }
             if (log.log_type === 'screen') { Icon = Activity; color = "text-pink-400"; content = `Screen Time: ${safeNumber(log.data?.amount)} hrs`; }
             if (log.log_type === 'sleep') { 
               Icon = Moon; color = "text-indigo-400"; 
               const hrs = log.data?.sleep_hours ?? log.data?.hours ?? log.data?.amount ?? 0;
               const qual = log.data?.sleep_quality ?? log.data?.quality ?? "moderate";
               content = `Slept ${hrs} hrs (${qual})`; 
             }
             if (log.log_type === 'workout') { 
               Icon = Dumbbell; color = "text-purple-400"; 
               content = log.data?.exercise ? `${log.data.exercise} - ${safeNumber(log.data.sets)}x${safeNumber(log.data.reps)}` : `Workout complete`; 
             }
             if (log.log_type === 'activity') { 
               Icon = Zap; color = "text-yellow-400"; 
               content = `${log.data?.activity_name || log.data?.type || 'Activity'} (${safeNumber(log.data?.duration_mins || log.data?.duration)} mins)`; 
             }

             return (
               <motion.div 
                 key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                 className="flex items-center gap-4 bg-[#0A0A0A]/50 border border-white/5 p-4 rounded-2xl"
               >
                 <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/5 ${color}`}><Icon size={18} /></div>
                 <div className="flex-1">
                   <h4 className="text-sm font-bold text-white/90 capitalize flex items-center gap-2">
                     {content}
                     {log.log_type === 'food' && log.data?.meal_type && (
                       <span className="text-[8px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded uppercase tracking-widest border border-orange-500/20">
                         {log.data.meal_type}
                       </span>
                     )}
                   </h4>
                  
                   {/* 🧠 TIMELINE INTELLIGENCE v5 (Adaptive Badges & Burnout Markers) */}
                   <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1">
                     <span>{timeStr} • {log.log_type}</span>
                     {log.log_type === 'workout' && safeNumber(log.data?.duration) >= 60 && <span className="text-purple-400/80 tracking-normal capitalize">🔥 High Endurance</span>}
                     {log.log_type === 'workout' && log.data?.intensity === 'high' && <span className="text-orange-400/80 tracking-normal capitalize">⚡ CNS Load</span>}
                     {log.log_type === 'sleep' && safeNumber(log.data?.sleep_hours) > 0 && safeNumber(log.data?.sleep_hours) < 6 && <span className="text-red-400/80 tracking-normal capitalize">⚠️ Sleep Debt</span>}
                     {log.log_type === 'sleep' && safeNumber(log.data?.sleep_hours) >= 8 && <span className="text-indigo-400/80 tracking-normal capitalize">✨ Optimal Recovery</span>}
                     {log.log_type === 'water' && safeNumber(log.data?.amount) >= 1000 && <span className="text-blue-400/80 tracking-normal capitalize">💧 Mega Hydration</span>}
                   </p>
                 </div>
                 
                 {/* 🧠 LOG EDITING ENGINE */}
                 <button onClick={() => openEditModal(log)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white/80 hover:bg-white/10 transition-colors shadow-sm active:scale-95 shrink-0">
                   <Plus size={14} className="rotate-45" />
                 </button>
               </motion.div>
             )
          })}
          {filteredFeed.length === 0 && (
            <div className="text-center py-20 text-white/30 text-sm font-bold">No events logged yet.</div>
          )}
        </AnimatePresence>
      </main>

      {/* QUICK ADD MODAL (Bottom Sheet) */}
      <AnimatePresence>
        {modalType && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
            
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-white/10 rounded-t-[2rem] p-6 pb-12 z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black tracking-tight capitalize flex items-center gap-2">Add {modalType}</h2>
                <button onClick={handleCloseModal} className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-white/50"><X size={18} /></button>
              </div>

              {/* INPUT LOGIC BASED ON TYPE */}
               {(modalType === 'water' || modalType === 'steps') && (
                <div className="space-y-4">
                  {modalType === 'water' && (
                    <div className="relative p-6 rounded-[2rem] bg-blue-500/10 border border-blue-500/20 overflow-hidden text-center shadow-inner">
                      <motion.div className="absolute bottom-0 left-0 right-0 bg-blue-500/20 z-0" initial={{ height: 0 }} animate={{ height: `${waterProgress}%` }} transition={{ duration: 1 }} />
                      <div className="relative z-10 flex flex-col items-center gap-1">
                        <Droplets size={24} className="text-blue-400 mb-1" />
                        <p className="text-blue-400 text-sm font-bold uppercase tracking-widest">
                          {getHydrationMessage(feedLogs.filter(l => l.log_type === 'water').reduce((acc, l) => acc + safeNumber(l.data?.amount), 0))}
                        </p>
                      </div>
                    </div>
                  )}
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    placeholder={modalType === 'water' ? "Amount in ml" : "Number of steps"} 
                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 font-bold focus:border-[#00FFA3] focus:outline-none relative z-10" 
                    autoFocus 
                  />
               {modalType === 'water' && (
  
                   <div className="grid grid-cols-4 gap-2">
                      {[250, 500, 750, 1000].map(val => (
                        <button key={val} type="button" onClick={() => setAmount(prev => (safeNumber(prev) + val).toString())} className="py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 font-bold text-xs hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-400 transition-all shadow-sm active:scale-95">
     
                      +{val}ml
                        </button>
                      ))}
                    </div>
             
                 )}
                </div>
              )}

              {modalType === 'food' && (
                <div className="space-y-4">
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(type => (
                      <button key={type} type="button" onClick={() => setMealType(type)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shrink-0 transition-all ${mealType === type ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 shadow-md' : 'bg-white/5 text-white/50 border border-white/10'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    value={textInput} 
                    onChange={e => setTextInput(e.target.value)} 
                    placeholder="What did you eat? (e.g. 2 roti + dal)" 
                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 font-bold focus:border-orange-400 focus:outline-none" 
                    autoFocus 
                  />
                  
                  {/* 🧠 FOOD MEMORY FOUNDATION */}
                  {feedLogs.filter(l => l.log_type === 'food' && l.data?.text).length > 0 && !textInput && (
                    <div className="pt-2">
                      <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest block mb-2 px-1">Recent Meals</span>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(feedLogs.filter(l => l.log_type === 'food' && l.data?.text).map(l => l.data.text))).slice(0, 5).map((food: any) => (
                          <button key={food} type="button" onClick={() => setTextInput(food)} className="px-3 py-1.5 bg-white/5 hover:bg-orange-500/20 border border-white/5 hover:border-orange-500/30 text-white/70 hover:text-orange-400 rounded-lg text-xs font-medium transition-all active:scale-95">
                            {food}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-2 flex justify-between mt-2">
                    <span>AI Context parsing prep</span>
                    <span>Ready</span>
                  </div>
                </div>
              )}
              
             {(modalType === 'sleep' || modalType === 'screen') && (
                <div className="space-y-4">
                  <input type="number" step="0.5" value={amount} onChange={e => setAmount(e.target.value)} placeholder={modalType === 'sleep' ? "Hours (e.g. 7.5)" : "Screen Hours (e.g. 6)"} className={`w-full bg-black/50 border border-white/10 rounded-2xl p-5 text-xl font-black text-center focus:outline-none ${modalType === 'sleep' ? 'focus:border-indigo-500' : 'focus:border-pink-500'}`} autoFocus />
                  {modalType === 'sleep' && (
                    <div className="flex gap-2">
                      {['poor', 'average', 'good'].map(q => (
                        <button key={q} onClick={() => setSleepQuality(q)} className={`flex-1 py-3 rounded-xl text-xs font-bold capitalize ${sleepQuality === q ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'bg-white/5 text-white/50'}`}>{q}</button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* WORKOUT INTELLIGENCE */}
              {modalType === 'workout' && (
                <div className="space-y-4">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    {workoutSuggestions.map(w => <button key={w} onClick={() => setWorkoutData({...workoutData, exercise: w})} className="px-3 py-1.5 rounded-full bg-white/5 text-xs font-bold whitespace-nowrap hover:bg-purple-500/20 hover:text-purple-400">{w}</button>)}
                  </div>
                  <input type="text" value={workoutData.exercise} onChange={e => setWorkoutData({...workoutData, exercise: e.target.value})} placeholder="Exercise Name" className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 font-bold focus:border-purple-500 focus:outline-none" />
                  <div className="flex gap-3">
                    <input type="number" placeholder="Sets" value={workoutData.sets} onChange={e => setWorkoutData({...workoutData, sets: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-center focus:outline-none" />
                    <input type="number" placeholder="Reps" value={workoutData.reps} onChange={e => setWorkoutData({...workoutData, reps: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-center focus:outline-none" />
                    <input type="number" placeholder="Mins" value={workoutData.duration} onChange={e => setWorkoutData({...workoutData, duration: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-center focus:outline-none" />
                  </div>
                </div>
              )}

              {/* CUSTOM ACTIVITY */}
               {modalType === 'activity' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['Trekking', 'Swimming', 'Football', 'Cycling', 'Yoga', 'Walking', 'Dance'].map(act => (
                      <button key={act} type="button" onClick={() => setActivityData({...activityData, type: act})} className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all ${activityData.type === act ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-white/5 border-white/10 text-white/60 hover:text-yellow-400 hover:border-yellow-500/30'}`}>
                        {act}
                      </button>
                    ))}
                  </div>
                  <input type="text" value={activityData.type} onChange={e => setActivityData({...activityData, type: e.target.value})} placeholder="Activity Name (e.g. Trekking)" className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 font-bold focus:border-yellow-500 focus:outline-none" autoFocus />
                  <input type="number" value={activityData.duration} onChange={e => setActivityData({...activityData, duration: e.target.value})} placeholder="Duration in Minutes" className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 font-bold focus:border-yellow-500 focus:outline-none" />
                  <div className="flex gap-2">
                    {['low', 'medium', 'high'].map(int => (
                      <button key={int} onClick={() => setActivityData({...activityData, intensity: int})} className={`flex-1 py-3 rounded-xl text-xs font-bold capitalize ${activityData.intensity === int ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' : 'bg-white/5 text-white/50'}`}>{int}</button>
                    ))}
                  </div>
                </div>
              )}

              {validationWarning && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center">
                  ⚠️ {validationWarning}
                </div>
              )}
              <button 
                disabled={!isFormValid() || saving || !!successFeedback}
                onClick={executeSave} 
                className={`w-full mt-6 ${validationWarning ? 'bg-red-400' : 'bg-[#00FFA3]'} text-black font-black text-lg py-4 rounded-2xl flex justify-center items-center gap-2 disabled:opacity-50 transition-all hover:shadow-[0_0_20px_rgba(0,255,163,0.3)]`}
              >
                {saving ? <Loader2 className="animate-spin" size={22}/> : successFeedback ? <><CheckCircle2 size={20} /> {successFeedback}</> : validationWarning ? 'Confirm & Save Anyway' : editingLogId ? 'Update Log' : 'Save Log'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
