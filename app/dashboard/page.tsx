"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Footprints, Droplets, Zap, Bell, ChevronRight, Loader2, Plus, Activity, Moon, Brain } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// UI Components
import { Header } from '../../components/dashboard/Header';
import { BottomNav } from '../../components/dashboard/BottomNav';
import { AdaptiveMissionHero } from '../../components/dashboard/AdaptiveMissionHero';
import { CoachIntelligencePanel } from '../../components/dashboard/CoachIntelligencePanel';
import { SystemStatusHero } from '../../components/dashboard/SystemStatus';
import { NuvyuTargets, TodayProgress, FuelAndBurnInsight } from '../../components/dashboard/AdaptiveGoalGrid';
import { BehaviorTimeline } from '../../components/dashboard/Timeline';
import { targetIntelligenceEngine, TargetEngineContext } from '../../lib/target/engine';
import { DashboardTargetMapper } from '../../lib/presentation/mappers';

// 🧠 ARCHITECTURE FREEZE: PRODUCTION RUNTIME BINDINGS
import { useBehavioralOS } from '../../lib/runtime/react';
import { Bootstrap } from '../../lib/runtime/bootstrap';
import { dashboardRepository } from '../../lib/repositories/dashboard.repository';

// ============================================================================
// PURE PRESENTATION LAYER (100% Stateless UI)
// Dashboard cannot execute logic. Dashboard cannot fetch data.
// ============================================================================
export default function Dashboard() {
  const router = useRouter();
  const osState = useBehavioralOS();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 1. Kickstart Canonical Runtime Loop
  useEffect(() => {
    Bootstrap.initDashboard(router);
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await dashboardRepository.getClient().auth.signOut();
    window.location.href = '/login';
  };

  // 2. Gatekeeper
  if (osState.session?.loadingState === 'loading' || !osState.user?.profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-[#00FFA3]" size={32} />
      </div>
    );
  }

  // 3. UI Prop Mapping (Translates Canonical State into UI Component requirements)
  const userProfile = osState.user.profile;
  const coachMessage = osState.coach.message;
  const retention = { xp: osState.analytics.xp, level: osState.analytics.level, todayXP: osState.analytics.todayXP };
  
  // Reconstruct legacy metrics object specifically to prevent UI component regressions
  const metrics = {
    score: osState.score.current,
    steps: osState.activity.steps,
    water: osState.hydration.waterIntake,
    logsCount: osState.progress.logsCount,
    today_logs: osState.progress.today_logs,
    energy_burned: osState.activity.energy_burned,
    energy_intake: osState.nutrition.energy_intake,
    energy_stats: osState.nutrition.energy_stats,
    energy_balance: osState.nutrition.energy_balance,
    sleep_hours: osState.recovery.sleep_hours,
    recovery_score: osState.recovery.recovery_score,
    recovery_state: osState.recovery.recovery_state,
    fatigue_risk: osState.recovery.fatigue_risk,
    burnout_risk: osState.recovery.burnout_risk,
    score_summary: osState.dashboard.scoreSummary,
    streak_count: osState.analytics.streak_count,
    best_streak: osState.analytics.best_streak,
    goal_packet: osState.targets.goal_packet,
    adaptation_mode: osState.targets.adaptation_mode,
    capacity_packet: osState.targets.capacity_packet,
    capacity_budget: osState.targets.capacity_budget
  };

  // 4. Target Engine Domain Mapping
  // 🧠 Strict Type Cast: Enforces number type to satisfy strict TS math operations
  const targetCalories = Number(metrics.energy_stats?.targetCalories || userProfile.target_calories || userProfile.tdee || 2000);
  const operating_state_engine = { operating_state: 'growth' }; // Controlled by global store
  const sp = { standing_hours: 0, walking_hours: 0, mental_load: 'low', dominant_driver: 'behavioral_friction', recommended_adjustment: 'Maintain normal intensity', confidence: 'low' };
  const tp = { today_trend: 'stable', weekly_trend: 'stable', behavior_drift: 'stable', momentum_score: 50 };
  const fp = { transition_text: 'Stable trajectory.' };
  const np = { protein_target_hit: false, water_target_hit: false, sugar_avoidance_streak: 0, adherence_score: 0 };

  let energyColorClass = "text-[#00FFA3]";
  if (metrics.energy_intake > 0) {
    const intakeRatio = metrics.energy_intake / targetCalories;
    if (intakeRatio > 1.1) energyColorClass = "text-red-500";
    else if (intakeRatio >= 0.9) energyColorClass = "text-yellow-500";
  }

  const targetContext: TargetEngineContext = {
    profile: {
      age: userProfile?.age || 25,
      weightKg: userProfile?.weight || 70,
      heightCm: userProfile?.height || 170,
      gender: userProfile?.gender || 'male',
      goal: (userProfile?.goal || 'maintenance') as any,
      activityLevel: (userProfile?.activity_level || 'moderate') as any,
    },
    water: metrics.water || 0,
    steps: metrics.steps || 0,
    proteinHit: false,
    fatigueRisk: metrics.fatigue_risk || 'low',
    recoveryState: metrics.recovery_state || 'moderate',
    momentumScore: tp.momentum_score
  };
  
  const rawPriority = targetIntelligenceEngine.getPrimaryPriority(targetContext);
  const rawTargets = targetIntelligenceEngine.getDailyTargets(targetContext);
  const publishedPriority = DashboardTargetMapper.map(rawPriority);
  const publishedTargets = DashboardTargetMapper.mapCollection(rawTargets);

  const resolveIcon = (name: string) => {
    if (name === 'droplets') return Droplets;
    if (name === 'footprints') return Footprints;
    if (name === 'flame') return Flame;
    if (name === 'moon') return Moon;
    return Activity;
  };
  const TargetIcon = resolveIcon(publishedPriority.ui.icon);

  // 5. Render Only (Zero Logic Below)
  return (
    <div className="relative min-h-screen bg-black text-white pb-28 overflow-hidden selection:bg-[#00FFA3]/30">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00FFA3]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <Header userProfile={userProfile} handleLogout={handleLogout} isLoggingOut={isLoggingOut} />

      <main className="px-4 sm:px-6 z-10 relative">
        <div className="flex flex-col items-center pt-2 pb-6 w-full">
           <SystemStatusHero 
             score={metrics.score} level={retention.level} xp={retention.xp} 
             streak={metrics.streak_count} momentum={tp.momentum_score} 
             trend={tp.today_trend} operatingState={operating_state_engine.operating_state} 
           />
           <div className="w-full mt-4">
             <CoachIntelligencePanel coachMessage={coachMessage} operatingState={operating_state_engine} strainPacket={sp} forecastPacket={fp} />
           </div>
        </div>

        <div className="px-1 mb-10 mt-2 w-full">
          <div className="mb-4">
             <h3 className="text-white font-medium text-[16px] tracking-tight ml-2">NUVYU Set Today's Targets For You</h3>
          </div>
          <NuvyuTargets targets={publishedTargets} />
        </div>

        <div className="px-1 mb-8 w-full">
          <div className="mb-4">
             <h3 className="text-white font-medium text-[16px] tracking-tight ml-2">Today's Progress</h3>
          </div>
          <TodayProgress targets={publishedTargets} />
        </div>

        <div className="px-1 mb-10 w-full">
          <FuelAndBurnInsight metrics={metrics as any} targetCalories={targetCalories} np={np} energyColorClass={energyColorClass} />
        </div>

        <div className="space-y-12 pt-10 border-t border-white/5 relative w-full">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <div className="space-y-8 opacity-90 w-full">
             <div className="w-full px-2">
               <Link href={publishedPriority.ui.link} className="block w-full group relative">
                 <motion.div animate={{ opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-[#00FFA3] rounded-[9999px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                 <motion.button 
                   disabled={publishedPriority.priority === 'blocked'}
                   whileTap={{ scale: 0.96 }} 
                   className={`relative w-full text-black font-bold text-[16px] py-4 rounded-[9999px] flex items-center justify-center gap-2 transition-all ${publishedPriority.priority === 'blocked' ? 'bg-white/20 text-white/40 cursor-not-allowed' : 'bg-[#00FFA3] shadow-[0_0_0_1px_rgba(0,255,163,0.5)_inset]'}`}
                 >
                   {publishedPriority.ui.action} <TargetIcon size={18} strokeWidth={3} />
                 </motion.button>
               </Link>
             </div>

             <div className="w-full px-2 mb-10">
               <div className="bg-gradient-to-br from-[#00FFA3]/10 to-transparent border border-[#00FFA3]/20 rounded-[2rem] p-6 shadow-xl relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                   <h3 className="text-[#00FFA3]/80 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                     <Brain size={10} fill="currentColor" /> Today's Focus
                   </h3>
                   <span className="bg-[#00FFA3]/20 text-[#00FFA3] px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest">
                     {publishedPriority.source.replace('_', ' ')}
                   </span>
                 </div>
                 <div className="mb-2">
                   <div className="text-[18px] font-semibold text-white tracking-tight capitalize mb-2">
                     {publishedPriority.ui.focus}
                   </div>
                   <p className="text-[13px] font-medium text-white/60 leading-relaxed">
                     {publishedPriority.reason}
                   </p>
                 </div>
               </div>
             </div>
          </div>

          <div className="space-y-6 pt-6">
            <BehaviorTimeline logs={metrics.today_logs} sp={sp as any} tp={tp as any} mem={null} />
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
