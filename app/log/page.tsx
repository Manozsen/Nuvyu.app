"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Droplets, Flame, Activity, Moon, Dumbbell, Scale, Plus, Check, Loader2, Utensils, Search, Filter } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { getLocalDateString } from '../lib/calories/energyEngine';
import { searchDesiFoods } from '../lib/intelligence/foodEngine';
import { getHydrationContext } from '../lib/intelligence/hydrationEngine';
import { suggestWorkoutConfig } from '../lib/intelligence/activityEngine';

export default function LogIntelligencePage() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🧠 PHASE 1: STRUCTURAL STATE
  const [activeTab, setActiveTab] = useState('All');
  const [modalType, setModalType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDopamine, setShowDopamine] = useState(false);

  // Modal Input States
  const [foodQuery, setFoodQuery] = useState("");
  const [foodSuggestions, setFoodSuggestions] = useState<any[]>([]);
  const [workoutQuery, setWorkoutQuery] = useState("");
  const [workoutConfig, setWorkoutConfig] = useState<any>(null);
  const [genericAmount, setGenericAmount] = useState("");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const todayStr = getLocalDateString(new Date());

  useEffect(() => {
    const fetchContext = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString())
        .order('created_at', { ascending: false });

      setLogs(data || []);
      setIsLoading(false);
    };
    fetchContext();
  }, [supabase, router]);

  // 🧠 PHASE 2: FOOD SEARCH TRIGGER
  useEffect(() => {
    if (modalType === 'food' && foodQuery.length > 1) {
      setFoodSuggestions(searchDesiFoods(foodQuery));
    } else {
      setFoodSuggestions([]);
    }
  }, [foodQuery, modalType]);

  // 🧠 PHASE 4: WORKOUT SUGGEST TRIGGER
  useEffect(() => {
    if ((modalType === 'workout' || modalType === 'activity') && workoutQuery.length > 2) {
      setWorkoutConfig(suggestWorkoutConfig(workoutQuery));
    }
  }, [workoutQuery, modalType]);

  const handleQuickSave = async (type: string, dataObj: any) => {
    if (!userId) return;
    setIsSubmitting(true);
    
    const { data: newLog, error } = await supabase.from('daily_logs').insert({
      user_id: userId,
      log_type: type,
      data: dataObj
    }).select().single();

    if (!error && newLog) {
      setLogs(prev => [newLog, ...prev]);
      setShowDopamine(true);
      setTimeout(() => setShowDopamine(false), 2000);
      setModalType(null);
      setFoodQuery("");
      setWorkoutQuery("");
      setGenericAmount("");
    }
    setIsSubmitting(false);
  };

  // Derived Hydration Context
  const totalWater = logs.filter(l => l.log_type === 'water').reduce((acc, l) => acc + (Number(l.data?.amount) || 0), 0);
  const totalSteps = logs.filter(l => l.log_type === 'steps').reduce((acc, l) => acc + (Number(l.data?.amount) || 0), 0);
  const hasWorkout = logs.some(l => l.log_type === 'workout');
  const hydrationCtx = getHydrationContext(totalWater, totalSteps, hasWorkout);

  const filteredLogs = logs.filter(log => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Nutrition' && (log.log_type === 'food' || log.log_type === 'water')) return true;
    if (activeTab === 'Workout' && log.log_type === 'workout') return true;
    if (activeTab === 'Activity' && log.log_type === 'steps') return true;
    if (activeTab === 'Recovery' && log.log_type === 'sleep') return true;
    return false;
  });

  return (
    <div className="min-h-screen bg-black text-white pb-28">
      {/* 🧠 SECTION 1: TOP HEADER */}
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-black/80 backdrop-blur-xl z-30 border-b border-white/5">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-all">
            <ArrowLeft size={18} />
          </button>
          <div className="text-right">
            <h1 className="text-xl font-black uppercase tracking-widest text-white/90">Today's Log</h1>
            <p className="text-[#00FFA3] text-xs font-bold tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
      </header>

      {/* 🧠 SECTION 2: QUICK ADD BAR (Horizontal Scroll) */}
      <div className="px-6 py-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-4 min-w-max pb-2">
          {[
            { id: 'water', icon: Droplets, label: 'Water', color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { id: 'food', icon: Utensils, label: 'Meal', color: 'text-orange-400', bg: 'bg-orange-400/10' },
            { id: 'workout', icon: Dumbbell, label: 'Workout', color: 'text-purple-400', bg: 'bg-purple-400/10' },
            { id: 'steps', icon: Footprints, label: 'Steps', color: 'text-[#00FFA3]', bg: 'bg-[#00FFA3]/10' },
            { id: 'sleep', icon: Moon, label: 'Sleep', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
            { id: 'weight', icon: Scale, label: 'Weight', color: 'text-pink-400', bg: 'bg-pink-400/10' },
          ].map(btn => (
            <motion.button 
              key={btn.id} whileTap={{ scale: 0.9 }} onClick={() => setModalType(btn.id)}
              className="flex flex-col items-center justify-center gap-2 w-20 h-24 rounded-2xl border border-white/10 bg-[#0A0A0A] hover:bg-white/5 transition-all shadow-lg shrink-0"
            >
              <div className={`w-10 h-10 rounded-full ${btn.bg} flex items-center justify-center`}>
                <btn.icon size={18} className={btn.color} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{btn.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 🧠 SECTION 4: INTELLIGENT FILTER TABS */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-white/10 pb-4">
          {['All', 'Nutrition', 'Workout', 'Activity', 'Recovery'].map(tab => (
            <button 
              key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shrink-0 transition-all ${activeTab === tab ? 'bg-[#00FFA3] text-black shadow-[0_0_15px_rgba(0,255,163,0.3)]' : 'bg-white/5 text-white/40 border border-white/10'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 🧠 SECTION 3: TIMELINE FEED */}
      <main className="px-6 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#00FFA3]" /></div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 border border-white/5 rounded-3xl bg-[#0A0A0A]">
            <Activity className="mx-auto text-white/20 mb-3" size={32} />
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">No entries yet</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0A0A0A] border border-white/10 p-4 rounded-[1.5rem] flex items-center gap-4 shadow-lg">
               {log.log_type === 'water' && <Droplets className="text-blue-400" size={24}/>}
               {log.log_type === 'food' && <Utensils className="text-orange-400" size={24}/>}
               {log.log_type === 'workout' && <Dumbbell className="text-purple-400" size={24}/>}
               {log.log_type === 'steps' && <Footprints className="text-[#00FFA3]" size={24}/>}
               {log.log_type === 'sleep' && <Moon className="text-indigo-400" size={24}/>}
               
               <div className="flex-1">
                 <p className="text-white/80 font-bold text-sm capitalize">{log.log_type === 'food' ? log.data.text : log.log_type}</p>
                 <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
                   {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </p>
               </div>
               <div className="text-right">
                 <p className="font-black text-lg text-[#00FFA3]">
                   {log.log_type === 'food' ? `${log.data.calories || 0} kcal` : log.data.amount || log.data.duration || log.data.sleep_hours || ''}
                   {log.log_type === 'water' ? ' ml' : ''}
                 </p>
               </div>
            </motion.div>
          ))
        )}
      </main>

      {/* 🧠 PHASE 3 & 4: INTELLIGENT MODALS */}
      <AnimatePresence>
        {modalType && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-end justify-center">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: "spring", damping: 25 }} className="bg-[#111] w-full max-w-md rounded-t-[2rem] border-t border-white/10 p-6 pb-12">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white/90 font-black text-xl uppercase tracking-widest">Log {modalType}</h3>
                <button onClick={() => setModalType(null)} className="text-white/40 hover:text-white">✕</button>
              </div>

              {/* WATER INTELLIGENCE */}
              {modalType === 'water' && (
                <div className="space-y-6">
                  <div className="text-center p-6 rounded-[2rem] bg-blue-500/10 border border-blue-500/20 relative overflow-hidden">
                    <motion.div className="absolute bottom-0 left-0 right-0 bg-blue-500/20 z-0" initial={{ height: 0 }} animate={{ height: `${hydrationCtx.progress}%` }} transition={{ duration: 1 }}/>
                    <div className="relative z-10">
                      <p className="text-blue-400 text-3xl font-black">{totalWater} <span className="text-sm">/ 3000ml</span></p>
                      <p className="text-blue-400/60 text-[10px] font-bold uppercase tracking-widest mt-2">{hydrationCtx.nudge}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {hydrationCtx.presets.map(amount => (
                      <button key={amount} onClick={() => handleQuickSave('water', { amount })} disabled={isSubmitting} className="py-4 rounded-xl bg-[#0A0A0A] border border-white/10 text-white/80 font-bold hover:bg-blue-500/20 hover:border-blue-500/50 transition-all">
                        +{amount} ml
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* FOOD INTELLIGENCE */}
              {modalType === 'food' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    <input 
                      type="text" placeholder="Search Desi food (e.g. Roti, Chicken)..." autoFocus
                      value={foodQuery} onChange={(e) => setFoodQuery(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-orange-400 outline-none"
                    />
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                    {foodSuggestions.map(food => (
                      <button 
                        key={food.id} onClick={() => handleQuickSave('food', { text: food.name, calories: food.calories, protein: food.protein, carbs: food.carbs, fats: food.fats })}
                        className="w-full text-left p-4 rounded-xl bg-[#0A0A0A] border border-white/5 hover:border-orange-400/50 transition-all flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-white/90">{food.name}</p>
                          <p className="text-white/40 text-[10px] uppercase tracking-widest">{food.serving_size} • P: {food.protein}g</p>
                        </div>
                        <span className="text-orange-400 font-bold">{food.calories} kcal</span>
                      </button>
                    ))}
                    {foodQuery.length > 2 && foodSuggestions.length === 0 && (
                      <button onClick={() => handleQuickSave('food', { text: foodQuery, calories: 350 })} className="w-full p-4 rounded-xl bg-orange-500/20 text-orange-400 font-bold">
                        Add "{foodQuery}" manually (+350 kcal est.)
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* WORKOUT INTELLIGENCE */}
              {(modalType === 'workout' || modalType === 'steps' || modalType === 'sleep' || modalType === 'weight') && (
                 <div className="space-y-4">
                   <input 
                      type={modalType === 'workout' ? 'text' : 'number'} 
                      placeholder={modalType === 'workout' ? "Exercise name..." : "Enter amount..."} autoFocus
                      value={modalType === 'workout' ? workoutQuery : genericAmount} 
                      onChange={(e) => modalType === 'workout' ? setWorkoutQuery(e.target.value) : setGenericAmount(e.target.value)}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-[#00FFA3] outline-none text-xl font-bold"
                   />
                   
                   {modalType === 'workout' && workoutConfig && (
                     <div className="flex gap-2 text-[10px] uppercase tracking-widest font-bold text-purple-400 bg-purple-500/10 p-3 rounded-xl border border-purple-500/20">
                       <span>{workoutConfig.sets} Sets</span> • <span>{workoutConfig.reps > 0 ? `${workoutConfig.reps} Reps` : `${workoutConfig.duration_mins} Mins`}</span> • <span>{workoutConfig.intensity} Intensity</span>
                     </div>
                   )}

                   <button 
                     onClick={() => handleQuickSave(modalType, modalType === 'workout' ? { exercise: workoutQuery, ...workoutConfig } : { amount: genericAmount })} 
                     disabled={isSubmitting || (!workoutQuery && !genericAmount)}
                     className="w-full bg-[#00FFA3] text-black font-black py-4 rounded-xl flex justify-center items-center gap-2 hover:shadow-[0_0_20px_rgba(0,255,163,0.3)] disabled:opacity-50"
                   >
                     {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "Save Entry"}
                   </button>
                 </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧠 PHASE 6: RETENTION DOPAMINE FEEDBACK */}
      <AnimatePresence>
        {showDopamine && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 50 }} exit={{ opacity: 0, y: -50 }} className="fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-[#00FFA3] text-black px-6 py-3 rounded-full font-black flex items-center gap-2 shadow-[0_0_30px_rgba(0,255,163,0.6)]">
            <Check size={18} strokeWidth={3} /> Logged Successfully! +XP
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
