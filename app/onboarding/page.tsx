"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2, Target, Zap, Activity, User, Ruler, Weight as WeightIcon, Clock } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

const HOOK_TEXTS = [
  "Tum change hona chahte ho… ya bas soch rahe ho?",
  "Ek aur din waste karna hai, ya aaj se shuru karein?",
  "Fit hona tumhara sapna hai, NUVYU use sach karega.",
  "Bahut excuses ho gaye. Ab result ka time hai."
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hookText, setHookText] = useState("");
  const [startingScore, setStartingScore] = useState(0);
  const [finalScore, setFinalScore] = useState(40);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    problem: '',
    customProblem: '',
    identity: '',
    coachTone: '',
    name: '',
    age: '',
    weight: '',
    height: '',
    gender: '',
    activityLevel: 'Moderate'
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    setHookText(HOOK_TEXTS[Math.floor(Math.random() * HOOK_TEXTS.length)]);
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        window.location.href = '/login';
      } else {
        setUserId(user.id);
      }
    };
    getUser();
  }, [supabase.auth]);

  useEffect(() => {
    if (step === 5) {
      let current = 0;
      const target = Math.floor(Math.random() * (55 - 35 + 1)) + 35;
      setFinalScore(target);
      const interval = setInterval(() => {
        current += 1;
        setStartingScore(current);
        if (current >= target) clearInterval(interval);
      }, 40);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => {
    setSubmitError(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!userId) return;
    setLoading(true);
    setSubmitError(null);

    try {
      // Parse values
      const weight = parseFloat(formData.weight) || 0;
      const height = parseFloat(formData.height) || 0;
      const age = parseInt(formData.age) || 0;

      // BMR Calculation logic
      let calculatedBMR = 0;
      if (formData.gender === 'Female') {
        calculatedBMR = (10 * weight) + (6.25 * height) - (5 * age) - 161;
      } else {
        // Defaults to male formula if "Prefer not to say" or "Male"
        calculatedBMR = (10 * weight) + (6.25 * height) - (5 * age) + 5;
      }
      
      // TDEE Calculation Logic
      let activityFactor = 1.2; // Sedentary
      if (formData.activityLevel === 'Moderate') activityFactor = 1.55;
      else if (formData.activityLevel === 'Active') activityFactor = 1.725;
      
      const calculatedTDEE = Math.round(calculatedBMR * activityFactor);
      calculatedBMR = Math.round(calculatedBMR);

      const payload = {
        id: userId,
        full_name: formData.name || 'Athlete',
        age: age,
        weight: weight,
        height: height,
        gender: formData.gender,
        primary_problem: formData.problem === 'Other' ? (formData.customProblem || 'Not specified') : formData.problem,
        desired_identity: formData.identity || 'Fit',
        coach_tone: formData.coachTone || 'Strict',
        activity_level: formData.activityLevel || 'Moderate',
        current_score: finalScore,
        bmr: calculatedBMR,
        tdee: calculatedTDEE,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase.from('profiles').upsert(payload);

      if (error) {
        console.error("Supabase Error Object:", error);
        throw error;
      }
      
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error("Error saving profile:", error);
      setSubmitError(error.message || "Database connection error. Try again.");
      setLoading(false);
    }
  };

  const isStepValid = () => {
    if (step === 1) return formData.problem && (formData.problem !== 'Other' || formData.customProblem.trim().length > 0);
    if (step === 2) return formData.identity;
    if (step === 3) return formData.coachTone;
    if (step === 4) return formData.name && formData.age && formData.weight && formData.height && formData.gender; 
    return true;
  };

  const slideVariants = {
    initial: { opacity: 0, x: 30, scale: 0.98 },
    animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -30, scale: 0.98, transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col justify-center px-6 relative overflow-hidden selection:bg-mint/30 font-sans">
      
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#00FFA3]/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md mx-auto z-10">
        
        {step > 0 && step < 5 && (
          <div className="mb-12">
            <div className="flex justify-between text-xs font-bold text-white/40 mb-3 tracking-widest uppercase">
              <span>Step {step}</span>
              <span>4</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#00FFA3] shadow-[0_0_10px_rgba(0,255,163,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: step >= i ? "100%" : "0%" }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {step === 0 && (
            <motion.div 
              key="step0" variants={slideVariants} initial="initial" animate="animate" exit="exit"
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="mb-12">
                <h1 className="text-2xl font-black tracking-widest text-[#00FFA3] mb-2 opacity-80">NUVYU.AI</h1>
                <div className="w-12 h-1 bg-[#00FFA3] mx-auto rounded-full shadow-[0_0_15px_rgba(0,255,163,0.6)]" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[1.1] mb-12 drop-shadow-2xl">
                {hookText}
              </h2>
              <button 
                onClick={handleNext} 
                className="w-full bg-[#00FFA3] text-black font-black text-lg py-5 rounded-2xl flex justify-center items-center gap-3 hover:shadow-[0_0_30px_rgba(0,255,163,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Transformation <ArrowRight size={22} strokeWidth={3} />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
              <div>
                <h2 className="text-3xl font-black tracking-tighter mb-3">Sabse bada problem kya hai?</h2>
                <p className="text-white/50 text-sm font-medium">Let's fix the root cause first.</p>
              </div>
              <div className="space-y-3">
                {['Late night cravings', 'Time nahi milta', 'Aalas (Laziness)', 'Other'].map((problem) => (
                  <button
                    key={problem}
                    onClick={() => setFormData({ ...formData, problem, customProblem: '' })}
                    className={`w-full p-5 rounded-[1.25rem] border text-left font-medium transition-all flex items-center justify-between ${
                      formData.problem === problem 
                        ? 'bg-[#00FFA3]/10 border-[#00FFA3] text-white shadow-[0_0_20px_rgba(0,255,163,0.15)] ring-1 ring-[#00FFA3]/50' 
                        : 'bg-white/[0.03] border-white/5 text-white/60 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    {problem}
                    {formData.problem === problem && <div className="w-2 h-2 rounded-full bg-[#00FFA3] shadow-[0_0_8px_#00FFA3]" />}
                  </button>
                ))}
              </div>
              
              {formData.problem === 'Other' && (
                <motion.input 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  type="text" value={formData.customProblem} onChange={(e) => setFormData({...formData, customProblem: e.target.value})}
                  placeholder="Type your main struggle..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3] transition-all backdrop-blur-md"
                  autoFocus
                />
              )}

              <div className="flex gap-4 pt-4">
                <button onClick={handleBack} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-white/60 hover:bg-white/[0.08] hover:text-white transition-all">
                  <ArrowLeft size={22} />
                </button>
                <button 
                  onClick={handleNext} disabled={!isStepValid()}
                  className="flex-1 bg-[#00FFA3] text-black font-bold py-5 rounded-2xl flex justify-center items-center gap-2 disabled:opacity-20 disabled:grayscale transition-all"
                >
                  Continue <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
              <div>
                <h2 className="text-3xl font-black tracking-tighter mb-3">Tum kya banna chahte ho?</h2>
                <p className="text-white/50 text-sm font-medium">Define your future identity.</p>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'Lean & Fit', desc: 'Athletic, shredded, high stamina' },
                  { id: 'Muscular', desc: 'Big, strong, heavy lifter' },
                  { id: 'Consistent', desc: 'Build an unbreakable routine' },
                  { id: 'Stay Healthy', desc: 'Disease-free, active lifestyle' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFormData({ ...formData, identity: item.id })}
                    className={`w-full p-5 rounded-[1.25rem] border text-left transition-all ${
                      formData.identity === item.id 
                        ? 'bg-[#00FFA3]/10 border-[#00FFA3] shadow-[0_0_20px_rgba(0,255,163,0.15)] ring-1 ring-[#00FFA3]/50' 
                        : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className={`font-bold text-lg mb-1 ${formData.identity === item.id ? 'text-white' : 'text-white/80'}`}>{item.id}</div>
                    <div className={`text-sm ${formData.identity === item.id ? 'text-[#00FFA3]/80' : 'text-white/40'}`}>{item.desc}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={handleBack} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-white/60 hover:bg-white/[0.08] hover:text-white transition-all">
                  <ArrowLeft size={22} />
                </button>
                <button 
                  onClick={handleNext} disabled={!isStepValid()}
                  className="flex-1 bg-[#00FFA3] text-black font-bold py-5 rounded-2xl flex justify-center items-center gap-2 disabled:opacity-20 disabled:grayscale transition-all"
                >
                  Continue <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
              <div>
                <h2 className="text-3xl font-black tracking-tighter mb-3">Kaise coach chahiye?</h2>
                <p className="text-white/50 text-sm font-medium">Your AI adapts to your preferred communication style.</p>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'Strict & Direct', desc: 'No BS. Desi Hinglish style. Pushes you hard.' },
                  { id: 'Calm & Logical', desc: 'Science-based, analytical, and supportive.' },
                  { id: 'Disciplined', desc: 'Military routine, structured, zero excuses.' }
                ].map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setFormData({ ...formData, coachTone: tone.id })}
                    className={`w-full p-5 rounded-[1.25rem] border text-left transition-all ${
                      formData.coachTone === tone.id 
                        ? 'bg-[#00FFA3]/10 border-[#00FFA3] shadow-[0_0_20px_rgba(0,255,163,0.15)] ring-1 ring-[#00FFA3]/50' 
                        : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className={`font-bold text-lg mb-1 ${formData.coachTone === tone.id ? 'text-white' : 'text-white/80'}`}>{tone.id}</div>
                    <div className={`text-sm ${formData.coachTone === tone.id ? 'text-[#00FFA3]/80' : 'text-white/40'}`}>{tone.desc}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={handleBack} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-white/60 hover:bg-white/[0.08] hover:text-white transition-all">
                  <ArrowLeft size={22} />
                </button>
                <button 
                  onClick={handleNext} disabled={!isStepValid()}
                  className="flex-1 bg-[#00FFA3] text-black font-bold py-5 rounded-2xl flex justify-center items-center gap-2 disabled:opacity-20 disabled:grayscale transition-all"
                >
                  Continue <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" variants={slideVariants} initial="initial" animate="animate" exit="exit" className="space-y-8">
              <div>
                <h2 className="text-3xl font-black tracking-tighter mb-3">Final Details</h2>
                <p className="text-white/50 text-sm font-medium">To calibrate your baseline metrics.</p>
              </div>
              
              <div className="space-y-4">
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#00FFA3] transition-colors" size={20} />
                  <input 
                    type="text" placeholder="What should we call you?"
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FFA3] focus:ring-1 focus:ring-[#00FFA3] transition-all"
                  />
                </div>

                <div>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3 mt-1">Gender</p>
                  <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/10">
                    {['Male', 'Female', 'Prefer not to say'].map((genderOption) => (
                      <button
                        key={genderOption}
                        onClick={() => setFormData({...formData, gender: genderOption})}
                        className={`flex-1 py-3 text-[11px] sm:text-sm font-medium rounded-xl transition-all ${
                          formData.gender === genderOption ? 'bg-white/10 text-white shadow-md' : 'text-white/40 hover:text-white/80'
                        }`}
                      >
                        {genderOption}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#00FFA3] transition-colors" size={18} />
                    <input 
                      type="number" placeholder="Age (e.g., 21)"
                      value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FFA3] transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <WeightIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#00FFA3] transition-colors" size={18} />
                    <input 
                      type="number" placeholder="Weight (kg) (e.g., 74)"
                      value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FFA3] transition-all"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <Ruler className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#00FFA3] transition-colors" size={20} />
                  <input 
                    type="number" placeholder="Height (cm) (e.g., 175)"
                    value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#00FFA3] transition-all"
                  />
                </div>

                <div>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3 mt-2">Current Activity Level</p>
                  <div className="flex bg-white/[0.03] p-1 rounded-2xl border border-white/10">
                    {['Sedentary', 'Moderate', 'Active'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setFormData({...formData, activityLevel: level})}
                        className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all ${
                          formData.activityLevel === level ? 'bg-white/10 text-white shadow-md' : 'text-white/40 hover:text-white/80'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={handleBack} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 text-white/60 hover:bg-white/[0.08] hover:text-white transition-all">
                  <ArrowLeft size={22} />
                </button>
                <button 
                  onClick={handleNext} disabled={!isStepValid()}
                  className="flex-1 bg-[#00FFA3] text-black font-bold py-5 rounded-2xl flex justify-center items-center gap-2 disabled:opacity-20 disabled:grayscale transition-all"
                >
                  Generate Profile <Zap size={20} className="fill-black" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div 
              key="step5" variants={slideVariants} initial="initial" animate="animate"
              className="flex flex-col items-center justify-center min-h-[70vh] text-center"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                className="relative w-48 h-48 flex items-center justify-center mb-8"
              >
                <div className="absolute inset-0 rounded-full border border-[#00FFA3]/30 animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border border-[#00FFA3]/10 border-t-[#00FFA3] animate-[spin_2s_linear_infinite]" />
                <div className="absolute inset-0 bg-[#00FFA3]/5 rounded-full blur-xl" />
                
                <div className="relative flex flex-col items-center">
                  <span className="text-6xl font-black tracking-tighter text-white drop-shadow-[0_0_20px_rgba(0,255,163,0.5)]">
                    {startingScore}
                  </span>
                  <span className="text-[#00FFA3] text-[10px] font-bold uppercase tracking-widest mt-1">Starting Score</span>
                </div>
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.5 }} className="w-full">
                <p className="text-xl font-medium text-white/90 mb-2">
                  "Bhai, ab game start. Home workouts mein consistency rakhna hai."
                </p>
                <p className="text-white/40 text-sm mb-10">
                  Your personalized AI Coach is ready.
                </p>

                {submitError && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium text-center shadow-lg">
                    ⚠️ Error: {submitError} <br/> 
                    <span className="text-xs text-red-400/70 mt-1 block">Ensure columns are added in Supabase.</span>
                  </motion.div>
                )}
                
                <button 
                  onClick={handleSubmit} disabled={loading}
                  className="w-full bg-[#00FFA3] text-black font-black text-lg py-5 rounded-2xl flex justify-center items-center gap-3 hover:shadow-[0_0_30px_rgba(0,255,163,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : "Enter Dashboard"}
                </button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
