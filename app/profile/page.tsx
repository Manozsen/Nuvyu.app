"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Save, User, Activity, Edit3, Target, Dumbbell, Clock, Weight, Ruler, Flame } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { SecuritySettings } from '../../components/settings/SecuritySettings';
import { BackupRestoreSettings } from '../../components/settings/BackupRestoreSettings';

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Future AI Hook State
  const [avgSteps, setAvgSteps] = useState(0);

  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    activityLevel: 'Moderate',
    goal: 'Fit', // Maps to desired_identity
    workoutType: 'Home'
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      // Strict data isolation
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
      setFormData({
        age: profile.age?.toString() || '',
        weight: profile.weight?.toString() || '',
        height: profile.height?.toString() || '',
        activityLevel: profile.activity_level || 'Moderate',
        goal: profile.desired_identity || 'Fit',
        workoutType: profile.workout_type || 'Home'
      });

      // FUTURE AI HOOK: Calculate avg_steps_last_3_days silently
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const { data: logs } = await supabase
        .from('daily_logs')
        .select('data')
        .eq('user_id', user.id)
        .eq('log_type', 'steps')
        .gte('created_at', threeDaysAgo.toISOString());

      if (logs && logs.length > 0) {
        let totalSteps = 0;
        logs.forEach(log => totalSteps += Number(log.data?.amount || 0));
        setAvgSteps(Math.round(totalSteps / 3));
      }

      setMounted(true);
    };

    fetchProfile();
  }, [supabase.auth, router]);

  const handleSave = async () => {
    if (!userId) return;
    setLoading(true);
    setSubmitError(null);

    try {
      const weight = parseFloat(formData.weight) || 0;
      const height = parseFloat(formData.height) || 0;
      const age = parseInt(formData.age) || 0;

      // 1. Recalculate BMR
      let calculatedBMR = 0;
      if (userProfile.gender === 'Female') {
        calculatedBMR = (10 * weight) + (6.25 * height) - (5 * age) - 161;
      } else {
        calculatedBMR = (10 * weight) + (6.25 * height) - (5 * age) + 5;
      }
      calculatedBMR = Math.round(calculatedBMR);

      // 2. Recalculate TDEE
      let activityFactor = 1.2;
      if (formData.activityLevel === 'Moderate') activityFactor = 1.55;
      else if (formData.activityLevel === 'Active') activityFactor = 1.725;
      const calculatedTDEE = Math.round(calculatedBMR * activityFactor);

      // 3. Recalculate Target Calories
      let targetCalories = calculatedTDEE;
      if (formData.goal === 'Lean & Fit') targetCalories -= 300;
      else if (formData.goal === 'Muscular') targetCalories += 300;

      // 4. Recalculate Onboarding Score Base
      let newScore = 50;
      if (formData.activityLevel === 'Active') newScore += 10;
      else if (formData.activityLevel === 'Moderate') newScore += 5;
      else if (formData.activityLevel === 'Sedentary') newScore -= 5;

      if (formData.goal === 'Lean & Fit' || formData.goal === 'Muscular') newScore += 5;
      
      newScore = Math.max(30, Math.min(70, newScore));

      const payload = {
        age: age,
        weight: weight,
        height: height,
        activity_level: formData.activityLevel,
        desired_identity: formData.goal,
        workout_type: formData.workoutType,
        bmr: calculatedBMR,
        tdee: calculatedTDEE,
        target_calories: targetCalories,
        onboarding_score: newScore,
        current_score: newScore, // Soft re-onboarding override
        updated_at: new Date().toISOString()
      };

      // Strict scoped update
      const { error } = await supabase.from('profiles').update(payload).eq('id', userId);

      if (error) throw error;

      // Refresh local state to reflect changes safely
      setUserProfile({ ...userProfile, ...payload });
      setIsEditing(false);

      // FUTURE AI HOOK LOGIC (Silent validation)
      if (avgSteps > 7000 && formData.activityLevel !== 'Active') {
        console.log("Future AI Hook: Suggest user changes to Active");
      }

    } catch (error: any) {
      console.error("Error updating profile:", error);
      setSubmitError(error.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !userProfile) {
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
          onClick={() => router.push('/dashboard')}
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl hover:bg-white/10 transition-all text-white/60 hover:text-white shadow-lg cursor-pointer"
        >
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tighter leading-none">Your <span className="text-[#00FFA3]">Identity</span></h1>
          <p className="text-white/40 text-xs font-medium mt-1">Calibrate your baseline</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full z-10 space-y-6 pb-20">
        
        {/* PROFILE SUMMARY CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-5"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#00FFA3] to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,163,0.3)]">
            <User size={30} className="text-black" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{userProfile.full_name}</h2>
            <p className="text-[#00FFA3] text-xs font-bold uppercase tracking-widest mt-0.5">Base Score: {userProfile.onboarding_score}</p>
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-white/60 hover:text-white"
          >
            {isEditing ? <ArrowLeft size={18} /> : <Edit3 size={18} />}
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isEditing ? (
            /* VIEW MODE */
            <motion.div 
              key="view" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <InfoCard icon={Activity} label="BMR" value={userProfile.bmr} unit="kcal" />
                <InfoCard icon={Flame} label="TDEE" value={userProfile.tdee} unit="kcal" />
              </div>
              <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-white/50 text-sm font-medium">Goal</span>
                  <span className="font-bold">{userProfile.desired_identity}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-white/50 text-sm font-medium">Activity Level</span>
                  <span className="font-bold">{userProfile.activity_level}</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-white/50 text-sm font-medium">Workout Type</span>
                  <span className="font-bold">{userProfile.workout_type}</span>
                </div>
              </div>

              <div className="pt-4 space-y-4">
                <SecuritySettings />
                <BackupRestoreSettings />
              </div>
            </motion.div>
          ) : (
            /* EDIT MODE */
            <motion.div 
              key="edit" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-[#00FFA3]/30 rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,255,163,0.1)] space-y-6"
            >
              <h3 className="font-bold text-[#00FFA3] mb-4">Re-Calibrate Identity</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">Age</p>
                  <input type="number" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-center font-bold focus:border-[#00FFA3] focus:outline-none transition-all" />
                </div>
                <div>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">Weight (kg)</p>
                  <input type="number" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-center font-bold focus:border-[#00FFA3] focus:outline-none transition-all" />
                </div>
                <div className="col-span-2">
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">Height (cm)</p>
                  <input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-center font-bold focus:border-[#00FFA3] focus:outline-none transition-all" />
                </div>
              </div>

              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">Activity Level</p>
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                  {['Sedentary', 'Moderate', 'Active'].map((lvl) => (
                    <button key={lvl} onClick={() => setFormData({...formData, activityLevel: lvl})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.activityLevel === lvl ? 'bg-[#00FFA3]/20 text-[#00FFA3]' : 'text-white/40'}`}>{lvl}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">Primary Goal</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Lean & Fit', 'Muscular', 'Consistent', 'Stay Healthy'].map((g) => (
                    <button key={g} onClick={() => setFormData({...formData, goal: g})} className={`py-3 text-xs font-bold rounded-xl border transition-all ${formData.goal === g ? 'bg-[#00FFA3]/10 border-[#00FFA3] text-white' : 'bg-black/40 border-white/10 text-white/40'}`}>{g}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-2">Workout Location</p>
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                  {['Home', 'Gym', 'Both'].map((type) => (
                    <button key={type} onClick={() => setFormData({...formData, workoutType: type})} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.workoutType === type ? 'bg-[#00FFA3]/20 text-[#00FFA3]' : 'text-white/40'}`}>{type}</button>
                  ))}
                </div>
              </div>

              {submitError && <p className="text-red-400 text-xs font-bold text-center">{submitError}</p>}

              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleSave} 
                disabled={loading} 
                className="w-full bg-[#00FFA3] text-black font-black py-4 rounded-xl flex justify-center items-center gap-2 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" size={20}/> : <><Save size={18} /> Update Profile & Reset Score</>}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, unit }: any) {
  return (
    <div className="bg-[#0A0A0A]/90 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-5 shadow-xl flex flex-col justify-between">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-[#00FFA3]" />
        <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-white/40 text-[10px] font-medium">{unit}</span>
      </div>
    </div>
  );
}
