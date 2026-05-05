"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Droplets, Footprints, Utensils, Dumbbell, CheckCircle2, AlertCircle, AlertTriangle, Camera, Sparkles } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function LogActivity() {
  const router = useRouter();
  const [logType, setLogType] = useState<'water' | 'steps' | 'food' | 'workout'>('water');
  
  const [amount, setAmount] = useState('');
  const [textInput, setTextInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);

  // FUTURE PREP (Logic Only)
  const steps_auto_tracking = false;
  const device_sync_ready = true;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
      } else {
        setUserId(user.id);
        setIsAuthChecking(false);
      }
    };
    checkUser();
  }, [supabase.auth, router]);

  const isFormValid = () => {
    if (logType === 'water' || logType === 'steps') {
      return amount !== '' && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
    }
    return textInput.trim().length > 2;
  };

  const handleInitialSave = async () => {
    if (!isFormValid()) return;
    setLoading(true);
    setSubmitError(null);
    
    if (logType === 'steps' && parseFloat(amount) > 30000) {
      setSubmitError("Entry rejected: Step count exceeds realistic limits.");
      setLoading(false);
      return;
    }

    if (userId) {
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('daily_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', fiveMinsAgo);

      if (count && count >= 3) {
        setSubmitError("Too many logs submitted rapidly. Please wait a moment.");
        setLoading(false);
        return;
      }
    }

    if (logType === 'water' && parseFloat(amount) > 700) {
      setShowConfirm(true);
      setLoading(false);
      return;
    }
    if (logType === 'steps' && parseFloat(amount) > 10000) {
      setShowConfirm(true);
      setLoading(false);
      return;
    }
    
    executeSave();
  };

  const executeSave = async () => {
    if (!userId) return; 
    setLoading(true);
    setShowConfirm(false);
    setSubmitError(null);

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError || !profile) throw profileError || new Error("Profile not found");

      const payloadData = (logType === 'water' || logType === 'steps') 
        ? { amount: parseFloat(amount) } 
        : { text: textInput.trim() };

      const { error: insertError } = await supabase.from('daily_logs').insert({
        user_id: userId,
        log_type: logType,
        data: payloadData
      });

      if (insertError) throw insertError;

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0); 

      const { data: logs } = await supabase
        .from('daily_logs')
        .select('log_type, data, created_at')
        .eq('user_id', userId)
        .gte('created_at', startOfDay.toISOString());

      if (logs && logs.length > 0) {
        let totalSteps = 0;
        let totalWater = 0;
        let workoutLogsCount = 0;
        let lastLogTime = 0;

        logs.forEach(log => {
          const val = Number(log.data?.amount) || 0;
          if (log.log_type === 'steps') totalSteps += val;
          if (log.log_type === 'water') totalWater += val;
          if (log.log_type === 'workout') workoutLogsCount += 1;
          
          const logTime = new Date(log.created_at).getTime();
          if (logTime > lastLogTime) lastLogTime = logTime;
        });

        const effectiveSteps = Math.min(totalSteps, 12000);
        let newScore = profile.onboarding_score || 50; 
        
        let steps_points = 0;
        let water_points = 0;
        let log_bonus = 0;
        let inactivity_penalty = 0;
        
        if (effectiveSteps >= 6000) steps_points = 20;
        else if (effectiveSteps >= 3000) steps_points = 10;
        newScore += steps_points;

        if (totalWater >= 2000) water_points = 15;
        else if (totalWater >= 1000) water_points = 8;
        newScore += water_points;

        if (logs.length >= 2) log_bonus += 5;
        if (workoutLogsCount > 0) log_bonus += (workoutLogsCount * 5);
        newScore += log_bonus;

        const hoursSinceLast = (Date.now() - lastLogTime) / (1000 * 60 * 60);
        if (hoursSinceLast >= 6) inactivity_penalty = -10;
        else if (hoursSinceLast >= 4) inactivity_penalty = -5;
        newScore += inactivity_penalty;

        newScore = Math.max(0, Math.min(100, Math.floor(newScore)));

        const scoreBreakdown = { steps_points, water_points, log_bonus, inactivity_penalty };
        
        const year = startOfDay.getFullYear();
        const month = String(startOfDay.getMonth() + 1).padStart(2, '0');
        const day = String(startOfDay.getDate()).padStart(2, '0');
        const todayDateStr = `${year}-${month}-${day}`;

        await supabase.from('score_explanations').upsert({
          user_id: userId,
          date: todayDateStr,
          breakdown: scoreBreakdown,
          final_score: newScore
        }, { onConflict: 'user_id, date' });

        const { error: updateError } = await supabase
          .from('profiles')
          .update({ current_score: newScore })
          .eq('id', userId);
          
        if (updateError) console.error("Score Update Failed:", updateError);

      } else {
        const fallbackScore = profile.onboarding_score || 50;
        await supabase.from('profiles').update({ current_score: fallbackScore }).eq('id', userId);
      }
      
      let pointsAdded = 0;
      const amountNum = parseFloat(amount) || 0;
      if (logType === 'water') {
        if (amountNum >= 2000) pointsAdded = 15;
        else if (amountNum >= 1000) pointsAdded = 8;
      } else if (logType === 'steps') {
        if (amountNum >= 6000) pointsAdded = 20;
        else if (amountNum >= 3000) pointsAdded = 10;
      } else if (logType === 'workout') {
        pointsAdded = 5;
      }
      
      setSuccessFeedback(pointsAdded > 0 ? `+${pointsAdded} ${logType} score added!` : "Log saved successfully!");
      
      setTimeout(() => {
        router.refresh(); 
        router.push('/dashboard');
      }, 1200);
      
    } catch (error: any) {
      console.error("Error saving log:", error);
      setSubmitError(error.message || "Failed to save log.");
      setLoading(false);
    }
  };

  const goBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00FFA3]" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col px-6 relative overflow-hidden selection:bg-[#00FFA3]/30">
      
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#00FFA3]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <header className="pt-10 pb-6 flex items-center gap-4 z-50 relative pointer-events-auto">
        <button 
          onClick={goBack}
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl hover:bg-white/10 transition-all text-white/60 hover:text-white shadow-lg cursor-pointer"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tighter leading-none">Add <span className="text-[#00FFA3]">Log</span></h1>
          <p className="text-white/40 text-xs font-medium mt-1">Train your AI Coach</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full z-10 -mt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.98 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative"
        >
          <div className="grid grid-cols-2 gap-2 mb-8 bg-black/50 p-1.5 rounded-2xl border border-white/5 shadow-inner">
            <button 
              onClick={() => { setLogType('water'); setAmount(''); setTextInput(''); setSubmitError(null); }}
              className={`py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all text-sm ${
                logType === 'water' ? 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-blue-500/30' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <Droplets size={16} /> Water
            </button>
            <button 
              onClick={() => { setLogType('steps'); setAmount(''); setTextInput(''); setSubmitError(null); }}
              className={`py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all text-sm ${
                logType === 'steps' ? 'bg-[#00FFA3]/20 text-[#00FFA3] shadow-[0_0_15px_rgba(0,255,163,0.2)] border border-[#00FFA3]/30' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <Footprints size={16} /> Steps
            </button>
            <button 
              onClick={() => { setLogType('food'); setAmount(''); setTextInput(''); setSubmitError(null); }}
              className={`py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all text-sm ${
                logType === 'food' ? 'bg-orange-500/20 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)] border border-orange-500/30' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <Utensils size={16} /> Food
            </button>
            <button 
              onClick={() => { setLogType('workout'); setAmount(''); setTextInput(''); setSubmitError(null); }}
              className={`py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all text-sm ${
                logType === 'workout' ? 'bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] border border-purple-500/30' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <Dumbbell size={16} /> Workout
            </button>
          </div>

          <div className="space-y-6 mb-8">
            
            <AnimatePresence mode="wait">
              {(logType === 'water' || logType === 'steps') && (
                <motion.div key="numeric-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  
                  {logType === 'water' && (
                    <div className="mb-6">
                      <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-3">Quick Add</p>
                      <div className="flex gap-3">
                        {[ { label: '+250ml', val: '250' }, { label: '+500ml', val: '500' }, { label: '+1L', val: '1000' } ].map((btn) => (
                          <motion.button 
                            whileTap={{ scale: 0.95 }}
                            key={btn.val}
                            onClick={() => setAmount(btn.val)}
                            className="flex-1 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white/80 font-bold hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-400 transition-all text-sm shadow-sm"
                          >
                            {btn.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-3">
                      {logType === 'water' ? 'Manual Amount (ml)' : 'Manual Amount (Steps)'}
                    </p>
                    <div className="relative group">
                      <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        placeholder={logType === 'water' ? 'e.g. 300' : 'e.g. 2500'} 
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-2xl font-black text-center text-white placeholder:text-sm placeholder:font-medium placeholder:text-white/20 focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3] focus:outline-none transition-all shadow-inner" 
                        autoFocus
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-white/20 text-sm font-bold tracking-widest">
                        {logType === 'water' ? 'ML' : 'STEPS'}
                      </span>
                    </div>
                    {/* SMART HINTS BINDING */}
                    {logType === 'water' && parseFloat(amount) > 0 && parseFloat(amount) < 1000 && (
                      <p className="text-orange-400/80 text-xs font-bold mt-3 text-center">Target ke liye aur paani zaroori hai</p>
                    )}
                    {logType === 'steps' && parseFloat(amount) > 0 && parseFloat(amount) < 3000 && (
                      <p className="text-orange-400/80 text-xs font-bold mt-3 text-center">Bonus ke liye thoda aur walk karo</p>
                    )}
                  </div>
                </motion.div>
              )}

              {(logType === 'food' || logType === 'workout') && (
                <motion.div key="text-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center justify-between">
                    <span>{logType === 'food' ? 'Describe Meal' : 'Describe Workout'}</span>
                    <span className="text-[#00FFA3]/60 flex items-center gap-1"><Sparkles size={12}/> AI Ready</span>
                  </p>
                  <div className="relative">
                    <textarea 
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      placeholder={logType === 'food' ? "e.g., 2 scrambled eggs with toast and a black coffee..." : "e.g., 20 mins HIIT and 50 pushups..."}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-base font-medium text-white placeholder:text-white/20 focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3] focus:outline-none transition-all shadow-inner resize-none h-36"
                      autoFocus
                    />
                    
                    {logType === 'food' && (
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="absolute bottom-4 right-4 bg-[#00FFA3]/10 text-[#00FFA3] p-3 rounded-xl border border-[#00FFA3]/30 hover:bg-[#00FFA3]/20 transition-all flex items-center gap-2 backdrop-blur-md"
                        title="Vision AI Coming Soon"
                      >
                        <Camera size={20} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {submitError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
                className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 shadow-lg"
              >
                <AlertCircle size={20} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 text-sm font-bold">Failed to save log</p>
                  <p className="text-red-400/70 text-xs mt-1">{submitError}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button 
            whileTap={!isFormValid() || loading ? {} : { scale: 0.98 }}
            onClick={handleInitialSave} 
            disabled={!isFormValid() || loading || !!successFeedback} 
            className="w-full bg-[#00FFA3] text-black font-black text-lg py-5 rounded-2xl flex justify-center items-center gap-3 disabled:opacity-30 disabled:grayscale transition-all hover:shadow-[0_0_25px_rgba(0,255,163,0.4)]"
          >
            {loading ? <Loader2 className="animate-spin" size={24}/> : successFeedback ? <><CheckCircle2 size={22} strokeWidth={3} /> {successFeedback}</> : <><CheckCircle2 size={22} strokeWidth={3} /> Save Progress</>}
          </motion.button>
        </motion.div>
      </main>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative"
            >
              <div className="w-14 h-14 bg-orange-500/20 rounded-full flex items-center justify-center mb-4 mx-auto border border-orange-500/30">
                <AlertTriangle size={28} className="text-orange-400" />
              </div>
              <h3 className="text-2xl font-black tracking-tighter text-center mb-2">Are you sure?</h3>
              <p className="text-center text-white/50 text-sm mb-8 leading-relaxed">
                You entered <strong className="text-white">{amount} {logType === 'water' ? 'ml' : 'steps'}</strong> at once. This is a very large amount for a single entry.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirm(false)} 
                  className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-white/70 font-bold hover:bg-white/10 transition-all text-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={executeSave} 
                  className="flex-1 py-4 rounded-xl bg-orange-500 text-black font-black hover:bg-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all text-sm"
                >
                  Confirm & Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
