"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Footprints, Droplets, Zap, Bell, ChevronRight, Loader2, Plus, Activity, Moon, Brain } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Using relative paths to bypass Next.js alias resolution errors
import { getRecentMemory, saveCoachMemory, detectUserPattern, calculateConsistency, extractLongTermMemory, determineBehavioralState, calculateFrictionProfile } from '../../lib/coach/memory';
import { predictAdherenceRisk, calculateRecoveryDebt, calculateResilienceScore, calculateResiliencePacket, generateForecastPacket, buildRecoveryDigitalTwin, calculateRecoveryROI, calculateEnergyAllocation } from '../../lib/recovery/engine';
import { extractBehavioralMemories, detectHabitCompounds, buildBehavioralMemoryPacket } from '../../lib/memory/engine';
import { calculateDailyScore } from '../../lib/score/engine';
import { updateHabit } from '../../lib/habit/engine';
import { calculateEnergyBalance, calculateRecoveryState, detectFatiguePattern } from '../../lib/calories/energyEngine';
import { getLocalMidnightRange, getUserLocalToday } from '../../lib/time/engine';
import { DashboardMetrics } from '../../lib/types/dashboard';
import { detectBurnoutRisk } from '../../lib/recovery/engine';
import { calculateAdaptiveGoals, getDynamicGreeting, determineOperatingState, determineInterventionMode, buildAutonomousPriorityStack, generateInterventionPacket, generateCoachActionPacket, generateHabitPrescription } from '../../lib/personalization/engine';
import { calculateLifeload, calculateCognitiveEnergy, calculateDecisionFatigue, detectBehavioralLeverage, simulateBehavioralScenario, buildCoachContextPacket } from '../../lib/analytics/engine';
import { AIContext } from '../../lib/types/ai';
import { safeSleepHours, safeSleepQuality, safeRecoveryScore } from '../../lib/utils/sleep';
import { safeNumber, safeRecoveryState, safeFatigueRisk, safeEnergyStats } from '../../lib/utils/safe';

// 🧠 PHASE 13D: COMPONENT ARCHITECTURE ENFORCEMENT
import { Header } from '../../components/dashboard/Header';
import { BottomNav } from '../../components/dashboard/BottomNav';
import { AdaptiveMissionHero } from '../../components/dashboard/AdaptiveMissionHero';
import { CoachIntelligencePanel } from '../../components/dashboard/CoachIntelligencePanel';
import { AIExecutionCard, CommitmentContract, ActiveChallenge } from '../../components/dashboard/ActionCenter';
import { SystemStatusHero } from '../../components/dashboard/SystemStatus';
import { AdaptiveGoalGrid } from '../../components/dashboard/AdaptiveGoalGrid';
import { RecoveryForecastCard, WeeklyStory, BehaviorMemoryHighlights } from '../../components/dashboard/Narrative';
import { BehaviorTimeline } from '../../components/dashboard/Timeline';

export default function Dashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics>({ 
    score: 0, 
    steps: 0, 
    water: 0, 
    logsCount: 0,
    energy_burned: 0,
    energy_intake: 0,
    energy_stats: null,
    energy_balance: 0,
    sleep_hours: 0,
    recovery_score: 0,
    recovery_state: "moderate", // Fixed strict enum
    fatigue_risk: "low", // Fixed strict enum
    burnout_risk: "low", // 🧠 PHASE 13D.5: Missing State Initialization Fixed
    score_summary: "",
    streak_count: 0,
    best_streak: 0,
    reward_message: "",
    xp: 0,
    level: 1,
    today_logs: [], // 🧠 PHASE 13C.8: Missing state added
    behavioral_memory_packet: null, // 🧠 PHASE 13C.8: Missing state added
  });

    // Intelligence System State
  const [coachMessage, setCoachMessage] = useState("Analyzing your progress...");
  const [coachType, setCoachType] = useState<"ai" | "rule">("rule");
  const [aiLimitHit, setAiLimitHit] = useState(false);
  
    // Retention Engine State
  const [retention, setRetention] = useState({ xp: 0, level: 1, todayXP: 0 });

  useEffect(() => {
    console.log("========== METRICS STATE ==========");
    console.log(metrics);
    console.log("metrics.score =", metrics.score);
  }, [metrics]);

  useEffect(() => {
    console.log("========== SCORE CHANGED ==========");
    console.log(metrics.score);
  }, [metrics.score]);

    const getScoreSummary = (breakdown: any) => {
    if (!breakdown) return "";
    const parts = [];
    // V1 Legacy Support
    if (breakdown.steps_points) parts.push(`+${breakdown.steps_points} steps`);
    if (breakdown.water_points) parts.push(`+${breakdown.water_points} water`);
    if (breakdown.inactivity_penalty) parts.push(`${breakdown.inactivity_penalty} fatigue`);
    // V2 Engine Support
    if (breakdown.movement_score) parts.push(`+${Math.round(breakdown.movement_score)} motion`);
    if (breakdown.physiological_score) parts.push(`+${Math.round(breakdown.physiological_score)} body`);
    if (breakdown.nutrition_score) parts.push(`+${Math.round(breakdown.nutrition_score)} fuel`);
    if (breakdown.consistency_score) parts.push(`+${Math.round(breakdown.consistency_score)} habit`);
    if (breakdown.penalty < 0) parts.push(`${breakdown.penalty} risk`);
    return parts.length > 0 ? parts.join(" • ") : "Ready to track";
  };

      const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // --- FUTURE CHAT SYSTEM PREP ---
  const ai_chat_enabled = true;
  const chat_limit_window = 6; // hours
  const chat_usage_count = 0;

  // 1. DATA COLLECTION
  const getCoachMetrics = (userId: string, profile: any, todayLogs: any[], pastLogs: any[], currentScore: number, recoveryData: any = null, energyBalance: number = 0, burnoutRisk: string = "low", adaptiveGoals: any = null) => {
    let today_steps = 0;
    let today_water = 0;
    let lastLogTime = 0;

    todayLogs.forEach(log => {
      const val = Number(log.data?.amount) || 0;
      if (log.log_type === 'steps') today_steps += val;
      if (log.log_type === 'water') today_water += val;
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

        return {
      userId,
      today_steps,
      today_water,
      current_score: currentScore,
      avg_steps_3_days: Math.round(pastSteps / 3),
      avg_water_3_days: Math.round(pastWater / 3),
      activity_level: profile.activity_level,
      goal: profile.desired_identity || profile.goal,
      age: profile.age,
      gender: profile.gender,
      plan_type: profile.plan_type || 'free',
      daily_ai_calls_count: profile.daily_ai_calls_count || 0,
      last_reset_date: profile.last_reset_date,
      coach_tone: profile.coach_tone,
      hoursSinceLastLog: todayLogs.length === 0 ? 24 : (Date.now() - lastLogTime) / (1000 * 60 * 60),
      recovery_state: safeRecoveryState(recoveryData?.recovery_state),
      fatigue_risk: safeFatigueRisk(recoveryData?.fatigue_risk),
      sleep_average: safeNumber(recoveryData?.sleep_hours),
      energy_balance: energyBalance,
      burnout_risk: burnoutRisk,
      adaptive_mode: adaptiveGoals?.adaptation_mode || "maintain",
      workout_intensity: adaptiveGoals?.workout_intensity || "moderate",
      recommended_water: adaptiveGoals?.recommended_water || 3000,
      // Deep Personalization Fields
      primary_target: profile.primary_target || profile.goal,
      motivation_reason: profile.motivation_reason || 'health',
      target_timeline: profile.target_timeline || 'sustainable_lifestyle',
      consistency_type: profile.consistency_type || 'beginner',
      personality_style: profile.personality_style || 'calm'
    };
   };

    // 2. BEHAVIOR DETECTION
  const detectBehavior = (metrics: any) => {
    if (metrics.fatigue_risk === "high") return "fatigue_risk_high";
    if (metrics.recovery_state === "poor") return "sleep_deprived";
    if (metrics.recovery_state === "excellent") return "recovering_well";
    if (metrics.hoursSinceLastLog >= 4) return "inactive";
    if (metrics.today_water < 1000) return "low_hydration";
    if (metrics.today_steps < 3000) return "low_activity";
    if (metrics.today_steps > metrics.avg_steps_3_days) return "improving";
    return "consistent";
  };

      // 3. RULE-BASED FALLBACK
  const generateRuleNudge = (metrics: any, behavior: string, pattern: any) => {
    const isFatLoss = metrics.goal === 'Lean & Fit' || (metrics.primary_target || '').includes('fat');
    const isMuscle = metrics.goal === 'Muscular' || (metrics.primary_target || '').includes('muscle');
    const isOlder = (metrics.age || 25) >= 40;
    const target = (metrics.primary_target || '').toLowerCase();
    
    // 🧠 TIME-AWARE ENGINE
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';

    if (timeOfDay === 'morning' && behavior === 'inactive') return "Good morning! Din shuru ho chuka hai, let's get some steps in early.";
    if (timeOfDay === 'night' && behavior !== 'sleep_deprived') return "Great work today. Ab screen time kam karo aur recovery pe focus karo.";
    if (timeOfDay === 'night' && behavior === 'sleep_deprived') return "Pichli raat neend kam thi. Aaj jaldi so jao, recovery is where muscle grows.";
    if (timeOfDay === 'afternoon' && behavior === 'improving') return "Solid afternoon momentum! Evening tak streak maintain rakhna.";

    // Target-Based Behavior Priorities
    if (target.includes('six_pack') && behavior === "consistent") return "Abs kitchen mein bante hain! Nutrition aur hydration maintain karo.";
    if (target.includes('fit_in_30_days') && behavior === "inactive") return "30 days challenge on hai! Time waste nahi karna, get up and move!";
    if (target.includes('height') && behavior === "sleep_deprived") return "Height aur posture ke liye recovery crucial hai. Need better sleep tonight.";

    // Memory Pattern Logic
    if (pattern?.repeating_low_steps) return "Pichhle kuch din se steps low hain, aaj improve karo.";
    if (pattern?.hydration_issue) return "Hydration lagatar low hai, ispe focus karo.";
    if (pattern?.improving_trend) return "Kal se better ho, momentum maintain rakho.";
    if (behavior === "low_hydration") return `Hydration critical hai. Ek glass paani abhi piyo!`;
    if (behavior === "inactive") return isOlder ? `Kafi time rest ho gaya. Thoda light walk kar lo.` : `Time is ticking bhai. Get moving, no excuses!`;
    if (behavior === "low_activity") return isFatLoss ? `Calorie burn low hai aaj. Thoda step it up karo!` : `Activity drop ho rahi hai. Move a bit!`;
    if (behavior === "improving") return `Great momentum today! Aise hi push karte raho.`;
    return isMuscle ? `Solid consistency. Recovery aur protein pe focus rakhna.` : `On track! Yeh discipline maintain karna hai.`;
  };

// 🧠 LOCAL SCHEMA EXTENSION: Safely supports AI Memory Graph & Real AI Coach Runtime
interface AdaptiveAIContext extends AIContext {
  burnout_risk?: string;
  adaptive_mode?: string;
  workout_intensity_recommendation?: string;
  recommended_water?: number;
  adherence_risk?: string;
  motivation_stability?: string;
  long_term_memory?: any;
  consistency_flags?: string[];
  primary_coaching_focus?: string;
  burnout_probability?: number;
  adherence_drop_probability?: number;
  dominant_behavioral_trend?: string;
  orchestration?: Record<string, any>;
  behavioral_routines?: any;
  momentum_score?: number;
  behavioral_drift?: string;
  cognitive_load?: string;
  lifeload_score?: number;
  priority_metadata?: any;
  recovery_debt?: any;
  behavioral_state_metadata?: string;
  friction_profile?: any;
  resilience_score?: number;
  forecast_packet?: any;
  context_router?: any;
  resilience_packet?: any;
  burnout_trajectory?: any;
  goal_modulation?: any;
  priority_stack?: any[];
  digital_twin_packet?: any;
  lifeload_packet?: any;
  cognitive_energy_packet?: any;
  decision_fatigue_packet?: any;
  capacity_packet?: any;
  capacity_budget?: any;
  intervention_engine?: any;
  leverage_engine?: any;
  compound_engine?: any;
  recovery_roi?: any;
  scenario_simulator?: any;
  autonomous_priority?: any;
  energy_allocation?: any;
  operating_state?: any;
  // 🧠 PHASE 11 ACI PACKETS
  behavioral_memory_packet?: any;
  intervention_packet?: any;
  coach_action_packet?: any;
  habit_prescription_packet?: any;
  coach_context_packet?: any;
}

  // 4. AI CONTEXT BUILDER
  const buildAIContext = (metrics: ReturnType<typeof getCoachMetrics>, behavior: string, pattern: any, last_3_messages: string[], consistency: string): AdaptiveAIContext => {
    return {
      goal: metrics.goal,
      activity_level: metrics.activity_level,
      steps_today: metrics.today_steps,
      water_today: metrics.today_water,
      avg_steps: metrics.avg_steps_3_days,
      avg_water: metrics.avg_water_3_days,
      behavior_type: behavior,
      score: metrics.current_score,
      age: metrics.age,
      gender: metrics.gender,
      recent_behavior_pattern: pattern,
      last_3_messages: last_3_messages,
      consistency_level: consistency,
      sleep_average: metrics.sleep_average,
      // Advanced AI Psychological & Recovery Profiling
      target: metrics.primary_target,
      recovery_state: metrics.recovery_state,
      fatigue_risk: metrics.fatigue_risk,
      burnout_risk: metrics.burnout_risk,
      adaptive_mode: metrics.adaptive_mode,
      workout_intensity_recommendation: metrics.workout_intensity,
      recommended_water: metrics.recommended_water,
      energy_balance: metrics.energy_balance,
      motivation: metrics.motivation_reason,
      timeline: metrics.target_timeline,
      user_consistency_type: metrics.consistency_type,
      personality_style: metrics.personality_style
    };
  };
  
      // 5. AI COACH (TOKEN-AWARE CONTEXT COMPRESSION & ADAPTIVE ROUTING)
  const generateAINudge = async (context: any, tone: string, userId: string) => {
    try {
      // Safely compress payload by omitting heavy arrays and flattening deep objects for LLM efficiency
      const { long_term_memory, consistency_flags, behavioral_routines, behavioral_drift, ...compressedContext } = context;
      
      const memorySummary = long_term_memory?.memory_status === 'active' 
        ? { trend: long_term_memory.dominant_behavioral_trend, drift: behavioral_drift, importance: long_term_memory.memory_importance_score, loops: long_term_memory.habit_loops_detected } 
        : 'insufficient_history';
        
      const routinesSummary = behavioral_routines?.memory_status === 'tracking_active'
        ? { night_eating: behavioral_routines.night_eating_frequency, workout_time: behavioral_routines.preferred_workout_hour }
        : 'learning_routines';
      
      const orchestrationMeta = context.orchestration ? JSON.stringify(context.orchestration) : `Focus: ${context.primary_coaching_focus}`;
      const prompt = `System: Act as an adaptive behavioral OS. Tone: ${tone}. User: ${context.age}yo ${context.gender}, Goal: ${context.goal}. Behavior: ${context.behavior_type}.\n\nOrchestration Signals:\n${orchestrationMeta}\n\nMemory & Routines Profile:\n${JSON.stringify({ memorySummary, routinesSummary })}\n\nState Snapshot:\n${JSON.stringify(compressedContext)}\n\nGenerate a 2-line Hinglish behavioral nudge strictly honoring the orchestration urgency, mode, and friction strategy. DO NOT be generic. DO NOT mention raw metrics explicitly.`;
      
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, userId })
      });
      if (!res.ok) throw new Error("AI unavailable");
      const data = await res.json();
      return data.nudge;
    } catch (error) {
      return null; // Return null to trigger instant fallback
    }
  };

    // 6. CORE HYBRID ENGINE
    const generateCoachNudge = async (userId: string, profile: any, todayLogs: any[], pastLogs: any[], currentScore: number, recoveryData: any = null, energyBalance: number = 0, burnoutRisk: string = "low", adaptiveGoals: any = null) => {
    const metrics = getCoachMetrics(userId, profile, todayLogs, pastLogs, currentScore, recoveryData, energyBalance, burnoutRisk, adaptiveGoals);
    const behavior = detectBehavior(metrics);

    // AI Memory + Pattern Engine Execution
    const memoryData = await getRecentMemory(supabase, userId);
      const pattern = detectUserPattern(memoryData);
      const consistency = calculateConsistency(memoryData);
      const longTermMemory = extractLongTermMemory(memoryData);
      const last_3_messages = (memoryData || []).slice(0, 3).map((m: any) => m.message);

      const ruleNudge = generateRuleNudge(metrics, behavior, pattern);
      const aiContext = buildAIContext(metrics, behavior, pattern, last_3_messages, consistency);

      // 🧠 ADAPTIVE SIGNAL FUSION & ADHERENCE PREDICTION (Safe Fallbacks)
      const safeRecScore = recoveryData?.recovery_score ?? 50;
      const safeStreak = Number(profile?.streak_count) || 0;
      const { adherence_risk, consistency_flags, motivation_stability, adherence_drop_probability } = predictAdherenceRisk(safeRecScore, safeStreak, consistency);
      const behavioralRoutines = extractBehavioralMemories(pastLogs || []);

      // 🧠 ABOS SAFE LOCAL DERIVATIONS (Scope Hoisted for UI Delivery)
      const recentScreenHours = (pastLogs || []).filter(l => l.log_type === 'screen').slice(0, 3).map(l => l.data?.amount || 0);
      const avg_screen = recentScreenHours.length > 0 ? recentScreenHours.reduce((a, b) => Number(a) + Number(b), 0) / recentScreenHours.length : 0;
      const recentSleepHours_fb = (pastLogs || []).filter(l => l.log_type === 'sleep').slice(0, 3).map(l => l.data?.sleep_hours || 0);
      const avg_sleep = recentSleepHours_fb.length > 0 ? recentSleepHours_fb.reduce((a, b) => Number(a) + Number(b), 0) / recentSleepHours_fb.length : 0;
      const local_adherence = consistency === "high" ? 90 : consistency === "medium" ? 60 : 30;

      const safe_lifeload = calculateLifeload(avg_sleep, avg_screen);
      const safe_cognitive = calculateCognitiveEnergy(avg_sleep, avg_screen, safe_lifeload.cognitive_load);
      const safe_decision_fatigue = calculateDecisionFatigue(safe_lifeload.lifeload_score, local_adherence, safe_lifeload.lifeload_packet.dominant_load_driver);

      // 🧠 PHASE 2 & 6: RECOVERY DEBT & RESILIENCE
      const recentRecScores = (pastLogs || []).filter(l => l.log_type === 'sleep').slice(0, 3).map(l => l.data?.recovery_score || 50);
      const recentSleepHours = (pastLogs || []).filter(l => l.log_type === 'sleep').slice(0, 3).map(l => l.data?.sleep_hours || 0);
      const recovery_debt_packet = calculateRecoveryDebt(recentSleepHours, recentRecScores);
      const resilience_score = calculateResilienceScore(recentRecScores);

      // 🧠 PHASE 3 & 4: BEHAVIORAL STATE & FRICTION
      const behavioral_state_metadata = determineBehavioralState(memoryData || [], burnoutRisk);
      const friction_profile = calculateFrictionProfile(memoryData || [], metrics.hoursSinceLastLog);

       if (aiContext) {
        aiContext.adherence_risk = adherence_risk;
        aiContext.consistency_flags = consistency_flags;
        aiContext.motivation_stability = motivation_stability;
        aiContext.long_term_memory = longTermMemory;
        
        // 🧠 PROFESSIONAL AI ORCHESTRATION LAYER (Signal Weighting Engine)
        let primary_coaching_focus = "general_consistency";
        const hasHabitLoop = (longTermMemory?.habit_loops_detected?.length || 0) > 0;
        const memoryTrend = longTermMemory?.dominant_behavioral_trend || "stable";
        const behavioralDrift = longTermMemory?.behavioral_drift || "stable";

        // 🧠 1. MULTI-FACTOR AI PRIORITY MATRIX (Adaptive Fusion Weighting)
        let weights = { recovery: 0.0, hydration: 0.0, adherence: 0.0, deficit: 0.0, fatigue: 0.0, memory_friction: 0.0, drift: 0.0, lifeload: 0.0 };
        
        const safeDeficit = Math.min(0, metrics.energy_balance || 0);
        const safeFatigue = String(metrics.fatigue_risk || "low").toLowerCase();
        const safeCognitiveLoad = (metrics as any).cognitive_load || "optimal"; // Safely fetched from extended analytics payload
        
        weights.deficit = safeDeficit < -1000 ? Math.min(1.0, Math.abs(safeDeficit) / 2500) : 0;
        weights.recovery = metrics.burnout_risk === "high" ? 0.95 : Math.max(0, (100 - safeRecScore) / 100);
        weights.adherence = adherence_risk === "high" ? 0.90 : Math.min(1.0, (adherence_drop_probability || 0) / 100);
        weights.hydration = metrics.today_water < 2000 ? Math.min(1.0, (2000 - metrics.today_water) / 2000) : 0;
        
        // 🧠 Energy-Aware Lifeload Detection
        weights.lifeload = safeCognitiveLoad === "severe_overload" ? 0.92 : (safeCognitiveLoad === "high_strain" ? 0.70 : 0);
        
        // TypeScript/Runtime Safe Fatigue Enum Parsing
        weights.fatigue = (safeFatigue === "high_risk" || safeFatigue === "critical_warning" || safeFatigue === "high") ? 0.85 : 
                          (safeFatigue === "elevated_risk" || safeFatigue === "medium" || safeFatigue === "moderate") ? 0.5 : 0.1;
                          
        weights.memory_friction = longTermMemory?.memory_decay_risk === "high_friction" ? 0.80 : 0;
        weights.drift = behavioralDrift.includes("collapse") || behavioralDrift.includes("deterioration") ? 0.88 : 0;

        // Contextual AI Amplifiers (Cross-Signal Interactions)
        if (memoryTrend === "severe_fatigue_clustering") weights.recovery = Math.min(1.0, weights.recovery + 0.3);
        if (behavioralRoutines?.night_eating_frequency > 1) weights.fatigue = Math.min(1.0, weights.fatigue + 0.2);
        if ((adherence_drop_probability || 0) > 60 && weights.fatigue > 0.6) weights.adherence = Math.min(1.0, weights.adherence + 0.25);
        if (weights.lifeload > 0.8 && weights.fatigue > 0.6) weights.recovery = Math.min(1.0, weights.recovery + 0.35); // Critical crash protection

        // 🧠 2. Determine Dominant Priority Signal
        let highestWeight = 0;
        let dominantSignal = "general_consistency";
        Object.entries(weights).forEach(([key, val]) => {
          if (val > highestWeight) { highestWeight = val; dominantSignal = key; }
        });

        // 🧠 3. Construct Token-Aware AI Packet Metadata
        let orchestration: Record<string, any> = { mode: "general_consistency", urgency: "low", tone: "motivating", friction_strategy: "standard", behavioral_state: "stable" };

        if (todayLogs.length === 0 && !recoveryData?.sleep_hours) {
          orchestration = weights.memory_friction > 0
            ? { mode: "reactivation", urgency: "medium", tone: "warm_welcoming", friction_strategy: "ultra_low", behavioral_state: "returning_from_absence" }
            : { mode: "activation", urgency: "medium", tone: "encouraging", friction_strategy: "minimal", behavioral_state: "empty_state" };
          dominantSignal = weights.memory_friction > 0 ? "reactivation" : "activation";
        }
        else if (dominantSignal === "lifeload") orchestration = { mode: "cognitive_decompression", urgency: "critical", tone: "protective_empathy", friction_strategy: "rest_enforcement", behavioral_state: "nervous_system_overload" };
        else if (dominantSignal === "deficit") orchestration = { mode: "nutritional_priority", urgency: "critical", tone: "direct_warning", friction_strategy: "direct_action", behavioral_state: "starvation_risk" };
        else if (dominantSignal === "drift") orchestration = { mode: "drift_intervention", urgency: "high", tone: "analytical_coach", friction_strategy: "pattern_interrupt", behavioral_state: behavioralDrift };
        else if (dominantSignal === "recovery") orchestration = { mode: "recovery_priority", urgency: "high", tone: "protective", friction_strategy: "rest_enforcement", behavioral_state: "high_burnout_risk" };
        else if (dominantSignal === "adherence") orchestration = { mode: "habit_protection", urgency: "high", tone: "supportive", friction_strategy: "minimal_activation", behavioral_state: "adherence_collapse_risk" };
        else if (hasHabitLoop && highestWeight < 0.8) {
          orchestration = { mode: "pattern_interrupt", urgency: "medium", tone: "analytical_coach", friction_strategy: "targeted_action", behavioral_state: longTermMemory?.habit_loops_detected?.[0] || "pattern_interrupt" };
          dominantSignal = "behavioral_loop_intervention";
        }
        else if (dominantSignal === "hydration") orchestration = { mode: "hydration_priority", urgency: "high", tone: "urgent_reminder", friction_strategy: "immediate_action", behavioral_state: "dehydrated" };
        else if (dominantSignal === "fatigue") orchestration = { mode: "recovery_priority", urgency: "medium", tone: "cautious", friction_strategy: "low_impact", behavioral_state: "acute_fatigue" };

        // 🧠 PHASE 1: DAILY PRIORITY ENGINE
        const priority_engine = {
          primary_focus: dominantSignal,
          urgency: orchestration.urgency,
          recovery_weight: weights.recovery,
          behavior_weight: weights.adherence,
          confidence: friction_profile.friction_confidence === "high" ? 0.9 : 0.6
        };

        aiContext.primary_coaching_focus = dominantSignal; // Transitional compatibility
        aiContext.orchestration = { ...orchestration, weights }; // True AI runtime metadata & Signal Matrix
        aiContext.adherence_drop_probability = adherence_drop_probability;
        aiContext.dominant_behavioral_trend = memoryTrend;
        aiContext.behavioral_drift = behavioralDrift;
        aiContext.behavioral_routines = behavioralRoutines;
        
         // 🧠 PHASE 2 & 6: CONTEXT ROUTING & PRIORITY STACK EVOLUTION
        const priority_stack = Object.entries(weights)
          .map(([key, val]) => ({ name: key, confidence: val, urgency: val > 0.7 ? "high" : val > 0.4 ? "medium" : "low" }))
          .sort((a, b) => (b.confidence as number) - (a.confidence as number));

        const context_router = {
          top_signals: priority_stack.slice(0, 2).map(p => p.name),
          ignored_signals: priority_stack.filter(p => (p.confidence as number) < 0.3).map(p => p.name),
          signal_weights: weights,
          routing_confidence: 0.9
        };

        // 🧠 PHASE 1 & 3: FORECASTING & RESILIENCE PACKET
        const resilience_packet = calculateResiliencePacket(recentRecScores);
        const forecast_packet = generateForecastPacket(recentRecScores, adherence_risk, resilience_packet);
        const digital_twin_packet = buildRecoveryDigitalTwin(recentRecScores, recovery_debt_packet.sleep_debt_accumulation, metrics.fatigue_risk, adherence_risk);

        // 🧠 ABOS PHASE 10: CORE ENGINES (PROPER SCOPE INTEGRATION)
        const operating_state_engine = determineOperatingState(burnoutRisk, consistency);
        const intervention_engine = determineInterventionMode(operating_state_engine.operating_state);
        const autonomous_priority = buildAutonomousPriorityStack(intervention_engine.intervention_mode);
        const recovery_roi = calculateRecoveryROI(recovery_debt_packet.sleep_debt_accumulation, metrics.fatigue_risk, adherence_risk);
        const cognitiveFreshness = metrics.sleep_average >= 7 && metrics.hoursSinceLastLog < 8 ? "high" : "low";
        const energy_allocation = calculateEnergyAllocation(recovery_debt_packet.sleep_debt_accumulation, metrics.fatigue_risk, cognitiveFreshness);
        const compound_engine = detectHabitCompounds(behavioralRoutines.preferred_workout_hour || null, behavioralRoutines.night_eating_frequency || 0);

        // 🧠 PHASE 7 & 8: AI CONTEXT EVOLUTION v4
        aiContext.priority_metadata = priority_engine;
        aiContext.recovery_debt = recovery_debt_packet;
        aiContext.behavioral_state_metadata = behavioral_state_metadata;
        aiContext.friction_profile = friction_profile;
        aiContext.resilience_score = resilience_score;
        aiContext.forecast_packet = forecast_packet;
        aiContext.context_router = context_router;
        aiContext.resilience_packet = resilience_packet;
        
        // 🧠 Safely evaluate local burnout trajectory to prevent scope ReferenceError
        const { burnout_trajectory_packet } = detectBurnoutRisk(safeRecScore, safeNumber(recoveryData?.sleep_hours), safeStreak, safeDeficit, recentRecScores);
        aiContext.burnout_trajectory = burnout_trajectory_packet;
        aiContext.goal_modulation = adaptiveGoals?.goal_modulation_metadata;
        aiContext.priority_stack = priority_stack;
        // 🧠 ABOS SAFE LOCAL DERIVATIONS (Scope Hoisted Context Injection)
        const safe_leverage = detectBehavioralLeverage(safe_lifeload.lifeload_score, local_adherence);
        const safe_scenario = simulateBehavioralScenario(adherence_risk, safe_lifeload.lifeload_score);

        // Dynamic Load Contexts
        aiContext.digital_twin_packet = digital_twin_packet;
        aiContext.lifeload_packet = safe_lifeload.lifeload_packet;
        aiContext.cognitive_energy_packet = safe_cognitive;
        aiContext.decision_fatigue_packet = safe_decision_fatigue;
        aiContext.leverage_engine = safe_leverage;
        aiContext.scenario_simulator = safe_scenario;
        aiContext.capacity_packet = adaptiveGoals?.capacity_packet; // 🧠 FIX: Extract safely from parameter
        aiContext.capacity_budget = adaptiveGoals?.capacity_budget; // 🧠 FIX: Extract safely from parameter

        // 🧠 ABOS PHASE 10: CONTEXT
        aiContext.operating_state = operating_state_engine;
        aiContext.intervention_engine = intervention_engine;
        aiContext.autonomous_priority = autonomous_priority;
        aiContext.recovery_roi = recovery_roi;
        aiContext.energy_allocation = energy_allocation;
        aiContext.compound_engine = compound_engine;

       // 🧠 ABOS PHASE 11: AUTONOMOUS COACH INTELLIGENCE (ACI)
        const recentWater_fb = (pastLogs || []).filter(l => l.log_type === 'water').slice(0, 3).map(l => Number(l.data?.amount) || 0);
        const mem_packet = buildBehavioralMemoryPacket(recentRecScores, recentSleepHours_fb, recentWater_fb, consistency, safeStreak);
        const int_packet = generateInterventionPacket(safe_lifeload.lifeload_score, burnoutRisk, local_adherence);
        const action_packet = generateCoachActionPacket(operating_state_engine.operating_state, int_packet, mem_packet);
        const habit_rx_packet = generateHabitPrescription(metrics?.fatigue_risk || "low", int_packet);

        aiContext.behavioral_memory_packet = mem_packet;
        aiContext.intervention_packet = int_packet;
        aiContext.coach_action_packet = action_packet;
        aiContext.habit_prescription_packet = habit_rx_packet;
        aiContext.coach_context_packet = buildCoachContextPacket(aiContext);
      }

        // Rate Limiting System (Monetization Check)
    const limit = metrics.plan_type === 'pro' ? 100 : 20;
    const todayDate = new Date().toISOString().split('T')[0];
    
    let currentCount = metrics.daily_ai_calls_count;
    let lastReset = metrics.last_reset_date;

    if (lastReset !== todayDate) {
      currentCount = 0;
      lastReset = todayDate;
    }

     // 🧠 PHASE 12.5: UNIFIED PACKET EXPORT
    const unified_abos_metrics = {
      lifeload_packet: safe_lifeload.lifeload_packet,
      strain_packet: (safe_lifeload as any).strain_packet, // 🧠 PHASE 12.3A: Expose Missing Packet
      trend_packet: aiContext?.behavioral_memory_packet?.trend_packet, // 🧠 PHASE 13C.7: Expose Trend Packet
      behavioral_memory_packet: aiContext?.behavioral_memory_packet, // 🧠 PHASE 13C.8: Expose Parent Packet
      cognitive_energy_packet: safe_cognitive,
      decision_fatigue_packet: safe_decision_fatigue,
      forecast_packet: aiContext?.forecast_packet,
      coach_context_packet: aiContext?.coach_context_packet,
      operating_state: aiContext?.operating_state,
      intervention_engine: aiContext?.intervention_engine,
      recovery_roi: aiContext?.recovery_roi,
      energy_allocation: aiContext?.energy_allocation
    };

    if (currentCount >= limit) {
      saveCoachMemory(supabase, userId, metrics, behavior, ruleNudge, "rule");
      return { 
        message: ruleNudge, 
        type: "rule", 
        meta: { ai_limit_hit: true },
        abos_metrics: unified_abos_metrics
      };
    }

    // Execute AI Coach safely
    let aiNudge = await generateAINudge(aiContext, metrics.coach_tone || 'strict', userId);
    
    if (aiNudge) {
      // Anti-Repetition Filter
      if (last_3_messages.includes(aiNudge)) {
        aiNudge = aiNudge + " Thoda aur focus karte hain aaj!"; 
      }

      // Increment AI usage securely scoped to user
      await supabase.from('profiles').update({
        daily_ai_calls_count: currentCount + 1,
        last_reset_date: todayDate
      }).eq('id', userId);

      saveCoachMemory(supabase, userId, metrics, behavior, aiNudge, "ai");
      return { 
        message: aiNudge, 
        type: "ai",
        abos_metrics: unified_abos_metrics
      };
    }

    saveCoachMemory(supabase, userId, metrics, behavior, ruleNudge, "rule");
    return { 
      message: ruleNudge, 
      type: "rule",
      abos_metrics: unified_abos_metrics
    };
  };

    useEffect(() => {
    const fetchDashboardData = async () => {
      try {
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

      // 🧠 TIME ENGINE: Strict Local Boundaries
      const { start_utc, end_utc } = getLocalMidnightRange();
      const todayDateStr = getUserLocalToday();

            // Fetch perfectly clamped local logs
      const { data: rawLogs, error: logsError } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', start_utc)
        .lte('created_at', end_utc);

      const logs = rawLogs || [];

      console.log("========== SUPABASE DAILY LOGS ==========");
      console.log({
        logsError,
        rawLogs,
        count: rawLogs?.length ?? 0,
        start_utc,
        end_utc
      });

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

      // 1. REAL BODY ENERGY INTELLIGENCE SYSTEM
      const energyStats = calculateEnergyBalance(profile, logs || []);
      const energyBurned = energyStats?.totalBurn || 0;
      const safeEnergyIntake = energyStats?.intakeCalories || 0;

      // INTEGRATION CHECK: Connect to 3-day history for accurate context
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const { data: pastLogs } = await supabase
        .from('daily_logs')
        .select('log_type, data')
        .eq('user_id', user.id)
        .gte('created_at', threeDaysAgo.toISOString())
        .lt('created_at', start_utc); // Time Engine synced

      // Fetch Recovery Data strictly from sleep_logs (Synced to local date)
      const { data: latestSleep } = await supabase.from('sleep_logs')
        .select('*').eq('user_id', user.id)
        .order('date', { ascending: false }).limit(1).single();
      
      // Find legacy timeline sleep as safe fallback for backward compatibility
      const timelineSleep = (logs || []).find((l: any) => l.log_type === 'sleep');
      
      // STRICT SLEEP SCHEMA STANDARDIZATION
      const sleepHours = safeSleepHours(timelineSleep?.data, latestSleep);
      const sleepQuality = safeSleepQuality(timelineSleep?.data, latestSleep);
      const computedScore = safeRecoveryScore(latestSleep?.recovery_score, sleepHours);
      
      const recState = calculateRecoveryState(sleepHours, sleepQuality, 'moderate', safeNumber(energyStats?.energyBalance));

       const recoveryData = (sleepHours > 0 || latestSleep) ? {
        sleep_hours: sleepHours,
        recovery_score: computedScore,
        recovery_state: recState,
        fatigue_risk: detectFatiguePattern(recState, sleepHours, safeNumber(energyStats?.activityBurn), safeNumber(energyStats?.energyBalance))
      } : null;

      // 🧠 BURNOUT & ADAPTIVE GOAL ENGINE EXECUTION
      const recentRecScores = (pastLogs || []).filter(l => l.log_type === 'sleep').slice(0, 3).map(l => l.data?.recovery_score || 50);
      const { risk_level: burnoutRisk, recovery_momentum } = detectBurnoutRisk(computedScore, sleepHours, safeNumber(profile.streak_count), safeNumber(energyStats?.deficit), recentRecScores);

    // 2. Central Source of Truth Score Calculation (V2 Engine)
      const scoreConfig = {
        sleepHours,
        recoveryScore: computedScore,
        streakCount: profile.streak_count || 0,
        burnoutRisk,
        isV1: false
      };
      
      console.log("========== ENGINE INPUT ==========");
      console.log({ logs, scoreConfig });

      console.table(
        logs.map((log: any) => ({
          created_at: log.created_at,
          log_type: log.log_type,
          data: log.data
        }))
      );

      console.log("========== RAW SCORE INPUT ==========");
      console.log({
        sleepHours,
        computedScore,
        burnoutRisk,
        profileStreak: profile.streak_count,
        logsLength: logs.length
      });

      // 🧠 BUG FIX: Extract 'totals' to resolve Vercel "Cannot find name" TS deployment errors 
      // and prevent runtime ReferenceErrors that cause the dummy 0-data UI crash.
      const { finalScore: calculatedScore, breakdown: scoreBreakdown, totals } = calculateDailyScore(logs || [], scoreConfig);
      console.log("Engine Output", { calculatedScore, breakdown: scoreBreakdown, totals });
      
      // 🧠 BUG FIX: Re-assign existing local variables WITHOUT re-declaring them.
      // (Removing 'const' here permanently fixes the Vercel build crash)
      totalSteps = totals?.totalSteps || totalSteps;
      totalWater = totals?.totalWater || totalWater;
      logsCount = totals?.logsCount || logsCount;
      workoutLogsCount = totals?.workoutLogsCount || workoutLogsCount;

       // 🚀 FUTURE-PROOF ARCHITECTURE UPGRADE:
      // Commit FULL React State HERE before ANY complex AI/ABOS logic executes.
      console.log("Updating metrics.score", calculatedScore);
      setMetrics(prev => ({
        ...prev,
        score: calculatedScore,
        steps: totalSteps,
        water: totalWater,
        logsCount: logsCount,
        today_logs: logs, // 🧠 PHASE 13C.8: Inject missing Timeline dependency
        energy_burned: energyStats?.totalBurn || 0,
        energy_intake: energyStats?.intakeCalories || 0,
        energy_stats: energyStats,
        energy_balance: energyStats?.energyBalance || 0,
        score_summary: getScoreSummary(scoreBreakdown),
        xp: profile.xp || 0,
        streak_count: profile.streak_count || 0,
        best_streak: profile.best_streak || 0, // 🧠 FIX: Ensure Best Streak loads instantly
        level: profile.level || 1,
        sleep_hours: sleepHours,
        recovery_score: computedScore,
        recovery_state: recState as any,
        fatigue_risk: detectFatiguePattern(recState, sleepHours, safeNumber(energyStats?.activityBurn), safeNumber(energyStats?.energyBalance)) as any,
        burnout_risk: burnoutRisk
      } as any));

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

      // RESTORED: Debug logs to verify calculations
      console.log("=== SCORE ENGINE V2 DEBUG ===");
      console.log("Fetched Logs Count:", logsCount);
      console.log("Calculated Score:", calculatedScore);
      console.log("DB Current Score:", profile.current_score);

      // 3. Strict Profile Update Sync
      if (calculatedScore !== profile.current_score) {
        const { error: dashUpdateError } = await supabase
          .from('profiles')
          .update({ current_score: calculatedScore })
          .eq('id', user.id);
          
        if (dashUpdateError) console.error("Dashboard Score Sync Failed:", dashUpdateError);
      }
      
      // 🧠 Safe Behavioral Drift Extraction (Scope-safe, Runtime-safe)
      const behavioralMemory = extractBehavioralMemories(pastLogs || []);

      // 🧠 Drift Engine Placeholder (Future-ready, Type-safe)
      const behavioralDrift = "stable";
      
      const adaptiveGoals = calculateAdaptiveGoals(
      safeNumber(profile.tdee, 2000),
      6000,
      recState,
      burnoutRisk,
      "stable",
      behavioralDrift
      );

       // 🧠 SAFE EXECUTION BLOCK: Isolate AI & Habit Engines to prevent total UI failure
      let nudgeResponse: any = { message: "Keep up the discipline! Consistency builds over time.", type: "rule" };
      try {
        nudgeResponse = await generateCoachNudge(user.id, profile, logs || [], pastLogs || [], calculatedScore, recoveryData, safeNumber(energyStats?.energyBalance), burnoutRisk, adaptiveGoals);
        setCoachMessage(nudgeResponse.message);
        setCoachType(nudgeResponse.type as "ai" | "rule");
        if (nudgeResponse.meta?.ai_limit_hit) {
          setAiLimitHit(true);
          console.log("AI limit reached, basic coaching active");
        }
      } catch (e) {
        console.error("AI Engine Failed:", e);
        setCoachMessage(nudgeResponse.message); // Clean fallback, no more frozen UI
      }

      let habitData: any = null;
      try {
        habitData = await updateHabit(supabase, user.id, {
          steps_today: totalSteps,
          water_today: totalWater,
          current_score: calculatedScore,
          adaptation_mode: adaptiveGoals?.adaptation_mode || "maintain"
        }, logsCount > 0);
      } catch (e) {
        console.error("Habit Engine Failed:", e);
      }

      // 🧠 Append final background AI metrics safely
      setMetrics(prev => ({
        ...prev,
        streak_count: safeNumber(habitData?.streak_count, profile.streak_count || 0),
        best_streak: safeNumber(habitData?.best_streak, profile.best_streak || 0),
        reward_message: String(habitData?.reward_message || ""),
        lifeload_packet: nudgeResponse?.abos_metrics?.lifeload_packet,
        cognitive_energy_packet: nudgeResponse?.abos_metrics?.cognitive_energy_packet,
        decision_fatigue_packet: nudgeResponse?.abos_metrics?.decision_fatigue_packet,
      // 🧠 PHASE 12.5: ORCHESTRATION LAYER STATE INJECTION
        goal_packet: adaptiveGoals?.goal_packet,
        adaptation_mode: adaptiveGoals?.adaptation_mode,
        capacity_packet: adaptiveGoals?.capacity_packet, // 🧠 PHASE 13C.5: Restored Packet
        capacity_budget: adaptiveGoals?.capacity_budget, // 🧠 PHASE 13C.5: Restored Packet
        trend_packet: nudgeResponse?.abos_metrics?.trend_packet, // 🧠 PHASE 13C.7: Restored Packet
        behavioral_memory_packet: nudgeResponse?.abos_metrics?.behavioral_memory_packet, // 🧠 PHASE 13C.8: Restored Packet
        challenge_packet: habitData?.challenge_packet,
        commitment_packet: habitData?.commitment_packet, // 🧠 PHASE 12.5A: Inject Missing Packet
        nutrition_adherence_packet: habitData?.nutrition_adherence_packet,
        strain_packet: nudgeResponse?.abos_metrics?.strain_packet, // 🧠 PHASE 12.5A: Inject Missing Packet
        forecast_packet: nudgeResponse?.abos_metrics?.forecast_packet,
        coach_context_packet: nudgeResponse?.abos_metrics?.coach_context_packet,
        operating_state: nudgeResponse?.abos_metrics?.operating_state,
        intervention_engine: nudgeResponse?.abos_metrics?.intervention_engine,
        recovery_roi: nudgeResponse?.abos_metrics?.recovery_roi,
        energy_allocation: nudgeResponse?.abos_metrics?.energy_allocation
      } as any));

      // 🧠 PART 3 & 8: CALCULATE TODAY XP
      const todayXP = (() => {
        let xp = Math.min(logsCount, 3) * 5;
        const cappedSteps = Math.min(totalSteps, 12000);
        if (cappedSteps >= 6000) xp += 20;
        else if (cappedSteps >= 3000) xp += 10;
        if (totalWater >= 2000) xp += 15;
        else if (totalWater >= 1000) xp += 8;
        xp += workoutLogsCount * 10;
        return Math.min(xp, 50);
      })();

       // Safely bind retention metrics with fallbacks
      setRetention({
        xp: profile.xp || 0,
        level: profile.level || 1,
        todayXP
      });
      
      } catch (error) {
        console.error("Dashboard Engine Crash:", error);
        // 🧠 FALLBACK: Never leave the user stuck on "Analyzing..."
        setCoachMessage("System syncing... Keep focusing on your daily habits.");
      } finally {
        setMounted(true);
        setIsCheckingAuth(false);
      }
    }; // <-- THIS CLOSES THE ASYNC FUNCTION

    fetchDashboardData();
  }, [router]);

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

  // 🧠 ABOS PHASE 12.5: PURE CONSUMER ARCHITECTURE
  // The Dashboard UI now exclusively consumes pre-computed packets from React State.
  // NO business logic, calculations, or engine executions exist in the render path.
  const targetCalories = metrics.energy_stats?.targetCalories || userProfile.target_calories || userProfile.tdee || 2000;
  const targetSteps = (metrics as any).goal_packet?.target_steps || 6000;
  const targetWater = (metrics as any).goal_packet?.target_water || 3000;
  const adaptation_mode = (metrics as any).adaptation_mode || 'maintain';
  
  const operating_state_engine = (metrics as any).operating_state || { operating_state: 'growth' };
  const intervention_engine = (metrics as any).intervention_engine || { intervention_mode: 'momentum_push' };
  const recovery_roi = (metrics as any).recovery_roi || { roi_action: 'Consistency' };
  const energy_allocation = (metrics as any).energy_allocation || { recommended_focus: 'Physical Progression' };

    let energyColorClass = "text-[#00FFA3]";
  if (metrics.energy_intake > 0) {
    const intakeRatio = metrics.energy_intake / targetCalories;
    if (intakeRatio > 1.1) energyColorClass = "text-red-500";
    else if (intakeRatio >= 0.9) energyColorClass = "text-yellow-500";
  }

    // 🧠 PHASE 12.6 & 13D.4: PURE CONSUMER EXTRACTION (No logic, purely mapped defaults for safety)
  const gp = (metrics as any).goal_packet || { target_steps: 6000, target_water: 3000, goal_source: 'auto', challenge_difficulty: 'Moderate', override_warning: null };
  const cp = (metrics as any).commitment_packet || { non_negotiables: [], completed_items: [], commitment_integrity_score: 100, contract_completion_rate: 0, status: 'pending' };
  const chp = (metrics as any).challenge_packet || { challenge_name: 'No Active Challenge', completion_percentage: 0, missed_days: 0, success_probability: 'Moderate', status: 'pending' };
  const np = (metrics as any).nutrition_adherence_packet || { protein_target_hit: false, water_target_hit: false, sugar_avoidance_streak: 0, adherence_score: 0 };
  const sp = (metrics as any).strain_packet || { standing_hours: 0, walking_hours: 0, mental_load: 'low', dominant_driver: 'behavioral_friction', recommended_adjustment: 'Maintain normal intensity', confidence: 'low' };
  const fp = (metrics as any).forecast_packet || { transition_text: 'Stable trajectory.' };
  
  // 🧠 System Status Packets
  const tp = (metrics as any).trend_packet || { today_trend: 'stable', weekly_trend: 'stable', behavior_drift: 'stable', momentum_score: 50 };
  const cap = (metrics as any).capacity_packet || { capacity_score: 100, capacity_level: 'optimal', limiting_factor: 'none' };
  const cab = (metrics as any).capacity_budget || { available_effort_units: 10, max_friction_tolerance: 'high' };
  const dbp = (metrics as any).decision_fatigue_packet?.decision_budget || { budget_status: 'Optimal', mental_load: 'Manageable', recommendation: 'Maintain standard load', reason_chain: ['System optimal'] };

  return (
    <div className="relative min-h-screen bg-black text-white pb-28 overflow-hidden selection:bg-[#00FFA3]/30">
      
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00FFA3]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <Header userProfile={userProfile} handleLogout={handleLogout} isLoggingOut={isLoggingOut} />

        <main className="px-4 sm:px-6 z-10 relative">
        
        {/* 🧠 SECTION 2: THE UNIFIED DAILY NEXUS (HERO) */}
        <div className="flex flex-col items-center pt-2 pb-14 w-full">
           <SystemStatusHero 
             score={metrics.score} level={retention.level} xp={retention.xp} 
             streak={metrics.streak_count} momentum={tp.momentum_score} 
             trend={tp.today_trend} operatingState={operating_state_engine.operating_state} 
           />
           
           <CoachIntelligencePanel 
             coachMessage={coachMessage}
             operatingState={operating_state_engine}
             strainPacket={sp}
             forecastPacket={fp}
           />
           
           <AdaptiveMissionHero 
             goalPacket={gp} 
             recoveryRoi={recovery_roi} 
             operatingState={operating_state_engine}
           />

           {/* MASSIVE PRIMARY CTA */}
           <div className="w-full px-4 pt-8">
             <Link href="/log" className="block w-full group relative">
               <motion.div animate={{ opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-[#00FFA3] rounded-[9999px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
               <motion.button whileTap={{ scale: 0.96 }} className="relative w-full bg-[#00FFA3] text-black font-bold text-[16px] py-4 rounded-[9999px] flex items-center justify-center gap-2 shadow-[0_0_0_1px_rgba(0,255,163,0.5)_inset]">
                 Log Today <Plus size={18} strokeWidth={3} />
               </motion.button>
             </Link>
           </div>
        </div>

        {/* --- BELOW THE FOLD (PROGRESSIVE DISCLOSURE) --- */}
        <div className="space-y-8 pt-8 border-t border-white/5 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
        {/* 🧠 SECTION 4: BEHAVIORAL ACTION CENTER */}
        <div className="space-y-6 opacity-90">
           <AIExecutionCard recoveryRoi={recovery_roi} interventionEngine={intervention_engine} strainPacket={sp} />
           <CommitmentContract cp={cp} />
           <ActiveChallenge chp={chp} />
        </div>

        {/* SECTION 5: SYSTEM STATUS EXPERIENCE (Analytics UI Relocated) */}

         {/* 🧠 SECTION 6: ADAPTIVE GOAL GRID */}

        <div className="flex justify-between items-end mb-2">
           <h3 className="text-white/60 font-bold uppercase tracking-widest text-[10px] ml-2">Daily Targets</h3>
        </div>
        <AdaptiveGoalGrid 
          metrics={metrics} gp={gp} np={np} sp={sp} 
          energyColorClass={energyColorClass} targetCalories={targetCalories} 
        />

        {/* 🧠 SECTION 7 & 8: BEHAVIORAL NARRATIVE & TIMELINE */}
        <div className="space-y-6 pt-6">
          <RecoveryForecastCard fp={fp} burnoutRisk={metrics.burnout_risk} />
          <BehaviorMemoryHighlights mem={metrics.behavioral_memory_packet} tp={tp} />
          <WeeklyStory tp={tp} mem={metrics.behavioral_memory_packet} fp={fp} />
          
          <BehaviorTimeline 
            logs={metrics.today_logs} 
            sp={sp} 
            tp={tp} 
            mem={metrics.behavioral_memory_packet} 
          />
        </div>
        
        </div> {/* Close Below The Fold Wrapper */}

      </main>
      
      <BottomNav />

    </div>
  );
}

// 🧠 COMPONENTS EXTRACTED TO components/dashboard/ (Phase 13D Architecture Enforcement)



