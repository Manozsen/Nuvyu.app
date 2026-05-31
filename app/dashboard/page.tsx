"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Footprints, Droplets, Camera, Zap, LayoutDashboard, Settings, Bell, ChevronRight, LogOut, Loader2, Plus, Activity, Moon, Brain } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
// Using relative paths to bypass Next.js alias resolution errors
import { getRecentMemory, saveCoachMemory, detectUserPattern, calculateConsistency, extractLongTermMemory, determineBehavioralState, calculateFrictionProfile } from '../../lib/coach/memory';
import { predictAdherenceRisk, calculateRecoveryDebt, calculateResilienceScore, calculateResiliencePacket, generateForecastPacket, buildRecoveryDigitalTwin, calculateRecoveryROI, calculateEnergyAllocation } from '../../lib/recovery/engine';
import { extractBehavioralMemories, detectHabitCompounds } from '../../lib/memory/engine';
import { calculateDailyScore } from '../../lib/score/engine';
import { calculateRecoveryScore } from '../../lib/recovery/engine';
import { updateHabit } from '../../lib/habit/engine';
import { calculateEnergyBalance, getLocalDateString, calculateRecoveryState, detectFatiguePattern } from '../../lib/calories/energyEngine';
import { DashboardMetrics } from '../../lib/types/dashboard';
import { detectBurnoutRisk } from '../../lib/recovery/engine';
import { calculateAdaptiveGoals, getDynamicGreeting, determineOperatingState, determineInterventionMode, buildAutonomousPriorityStack } from '../../lib/personalization/engine';
import { calculateLifeload, calculateCognitiveEnergy, calculateDecisionFatigue, detectBehavioralLeverage, simulateBehavioralScenario } from '../../lib/analytics/engine';
import { AIContext } from '../../lib/types/ai';
import { safeSleepHours, safeSleepQuality, safeRecoveryScore } from '../../lib/utils/sleep';
import { safeNumber, safeRecoveryState, safeFatigueRisk, safeEnergyStats } from '../../lib/utils/safe';

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
    score_summary: "",
    streak_count: 0,
    best_streak: 0,
    reward_message: "",
    xp: 0,
    level: 1
  });

    // Intelligence System State
  const [coachMessage, setCoachMessage] = useState("Analyzing your progress...");
  const [coachType, setCoachType] = useState<"ai" | "rule">("rule");
  const [aiLimitHit, setAiLimitHit] = useState(false);
  
  // Retention Engine State
  const [retention, setRetention] = useState({ xp: 0, level: 1, todayXP: 0 });

    const getScoreSummary = (breakdown: any) => {
    if (!breakdown) return "";
    const parts = [];
    if (breakdown.steps_points) parts.push(`+${breakdown.steps_points} steps`);
    if (breakdown.water_points) parts.push(`+${breakdown.water_points} hydration`);
    if (breakdown.workout_bonus) parts.push(`+${breakdown.workout_bonus} activity`); // 🧠 Validated Workout Score
    if (breakdown.log_bonus) parts.push(`+${breakdown.log_bonus} consistency`);
    if (breakdown.inactivity_penalty) parts.push(`${breakdown.inactivity_penalty} fatigue`);
    return parts.length > 0 ? parts.join(", ") : "No changes yet";
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
        aiContext.burnout_trajectory = burnout_trajectory_packet;
        aiContext.goal_modulation = goal_modulation_metadata;
        aiContext.priority_stack = priority_stack;
        
        // 🧠 ABOS SAFE LOCAL DERIVATIONS (Replacing dangerous unsafe casts)
        const recentScreenHours = (pastLogs || []).filter(l => l.log_type === 'screen').slice(0, 3).map(l => l.data?.amount || 0);
        const avg_screen = recentScreenHours.length > 0 ? recentScreenHours.reduce((a, b) => Number(a) + Number(b), 0) / recentScreenHours.length : 0;
        const avg_sleep = recentSleepHours.length > 0 ? recentSleepHours.reduce((a, b) => Number(a) + Number(b), 0) / recentSleepHours.length : 0;
        const local_adherence = consistency === "high" ? 90 : consistency === "medium" ? 60 : 30;

        const safe_lifeload = calculateLifeload(avg_sleep, avg_screen);
        const safe_cognitive = calculateCognitiveEnergy(avg_sleep, avg_screen, safe_lifeload.cognitive_load);
        const safe_decision_fatigue = calculateDecisionFatigue(safe_lifeload.lifeload_score, local_adherence, safe_lifeload.lifeload_packet.dominant_load_driver);
        const safe_leverage = detectBehavioralLeverage(safe_lifeload.lifeload_score, local_adherence);
        const safe_scenario = simulateBehavioralScenario(metrics.fatigue_risk, safe_lifeload.lifeload_score);

        // Dynamic Load Contexts
        aiContext.digital_twin_packet = digital_twin_packet;
        aiContext.lifeload_packet = safe_lifeload.lifeload_packet;
        aiContext.cognitive_energy_packet = safe_cognitive;
        aiContext.decision_fatigue_packet = safe_decision_fatigue;
        aiContext.leverage_engine = safe_leverage;
        aiContext.scenario_simulator = safe_scenario;
        aiContext.capacity_packet = capacity_packet;
        aiContext.capacity_budget = capacity_budget;

        // 🧠 ABOS PHASE 10: CONTEXT
        aiContext.operating_state = operating_state_engine;
        aiContext.intervention_engine = intervention_engine;
        aiContext.autonomous_priority = autonomous_priority;
        aiContext.recovery_roi = recovery_roi;
        aiContext.energy_allocation = energy_allocation;
        aiContext.compound_engine = compound_engine;
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

    if (currentCount >= limit) {
      saveCoachMemory(supabase, userId, metrics, behavior, ruleNudge, "rule");
      return { 
        message: ruleNudge, 
        type: "rule", 
        meta: { ai_limit_hit: true } 
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
        abos_metrics: {
          lifeload_packet: safe_lifeload.lifeload_packet,
          cognitive_energy_packet: safe_cognitive,
          decision_fatigue_packet: safe_decision_fatigue
        }
      };
    }

    saveCoachMemory(supabase, userId, metrics, behavior, ruleNudge, "rule");
    return { 
      message: ruleNudge, 
      type: "rule",
      abos_metrics: {
        lifeload_packet: safe_lifeload.lifeload_packet,
        cognitive_energy_packet: safe_cognitive,
        decision_fatigue_packet: safe_decision_fatigue
      }
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

      // Timezone Safe Fetch (Fixes Timeline Sync Bug)
      const now = new Date();
      const todayDateStr = getLocalDateString(now);

      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(now.getDate() - 2);

      // Fetch broadly, filter locally to prevent UTC timeline desync
      const { data: rawLogs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', twoDaysAgo.toISOString());

      // Only process logs that match local user timezone date
      const logs = (rawLogs || []).filter(log => getLocalDateString(new Date(log.created_at)) === todayDateStr);

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

      // 2. Central Source of Truth Score Calculation
      const baseScore = profile.onboarding_score || 50;
      const { finalScore: calculatedScore, breakdown: scoreBreakdown } = calculateDailyScore(logs || [], baseScore);
      
      // FIX: Generate safe local date string to prevent UTC timezone shift from overwriting yesterday's data
      const startOfDay = new Date(); // Safely restored missing date object reference
      const localYear = startOfDay.getFullYear();
      const localMonth = String(startOfDay.getMonth() + 1).padStart(2, '0');
      const localDay = String(startOfDay.getDate()).padStart(2, '0');
      const scoreDateStr = `${localYear}-${localMonth}-${localDay}`;
// Safe Upsert Explanation (Avoids duplicate writes)
      await supabase.from('score_explanations').upsert({
        user_id: user.id,
        date: scoreDateStr,
        breakdown: scoreBreakdown,
        final_score: calculatedScore
      }, { onConflict: 'user_id, date' });
// Fetch today's explanation safely for state injection
      const { data: explData } = await supabase
        .from('score_explanations')
        .select('breakdown')
        .eq('user_id', user.id)
        .eq('date', scoreDateStr)
        .single();

      // RESTORED: Debug logs to verify calculations
      console.log("=== DASHBOARD LOAD DEBUG ===");
      console.log("Fetched Logs Count:", logsCount);
      console.log("Calculated Score:", calculatedScore);
      console.log("DB Current Score:", profile.current_score);

      // 3. Strict Profile Update Sync (with restored error handling)
      if (calculatedScore !== profile.current_score) {
        const { error: dashUpdateError } = await supabase
          .from('profiles')
          .update({ current_score: calculatedScore })
          .eq('id', user.id);
          
        if (dashUpdateError) console.error("Dashboard Score Sync Failed:", dashUpdateError);
      }

      // INTEGRATION CHECK: Connect to 3-day history for accurate context
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const { data: pastLogs } = await supabase
        .from('daily_logs')
        .select('log_type, data')
        .eq('user_id', user.id)
        .gte('created_at', threeDaysAgo.toISOString())
        .lt('created_at', startOfDay.toISOString());

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

      // EXECUTE FULL ENGINE FLOW (AI Context v2)
      const nudgeResponse = await generateCoachNudge(user.id, profile, logs || [], pastLogs || [], calculatedScore, recoveryData, safeNumber(energyStats?.energyBalance), burnoutRisk, adaptiveGoals);
      setCoachMessage(nudgeResponse.message);
      // FIX: Added 'as "ai" | "rule"' to satisfy TypeScript's strict type checking
      setCoachType(nudgeResponse.type as "ai" | "rule");
      
      if (nudgeResponse.meta?.ai_limit_hit) {
        setAiLimitHit(true);
        console.log("AI limit reached, basic coaching active"); // Metadata flag processed but UI stays untouched
      }

       // --- HABIT ENGINE: Sync streak on dashboard load ---
      const habitData = await updateHabit(supabase, user.id, {
        steps_today: totalSteps,
        water_today: totalWater,
        current_score: calculatedScore,
        adaptation_mode: adaptiveGoals?.adaptation_mode || "maintain"
      }, logsCount > 0);

      // Strictly typed & normalized state update
      setMetrics({
        score: calculatedScore,
        steps: totalSteps,
        water: totalWater,
        logsCount: logsCount,
        energy_burned: energyStats?.totalBurn || 0,
        energy_intake: energyStats?.intakeCalories || 0,
        energy_stats: energyStats,
        energy_balance: energyStats?.energyBalance || 0,
        sleep_hours: sleepHours,
        recovery_score: computedScore,
        recovery_state: recState as any,
        fatigue_risk: detectFatiguePattern(recState, sleepHours, safeNumber(energyStats?.activityBurn), safeNumber(energyStats?.energyBalance)) as any,
        score_summary: getScoreSummary(scoreBreakdown),
        streak_count: safeNumber(habitData?.streak_count),
        best_streak: safeNumber(habitData?.best_streak),
        reward_message: String(habitData?.reward_message || ""),
        xp: safeNumber(profile?.xp),
        level: safeNumber(profile?.level, 1),
        burnout_risk: burnoutRisk,
        lifeload_packet: nudgeResponse.abos_metrics?.lifeload_packet,
        cognitive_energy_packet: nudgeResponse.abos_metrics?.cognitive_energy_packet,
        decision_fatigue_packet: nudgeResponse.abos_metrics?.decision_fatigue_packet
      } as any);

            // 🧠 PART 3 & 8: CALCULATE TODAY XP (No extra DB calls, reusing existing data)
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
      } finally {
        setMounted(true);
        setIsCheckingAuth(false);
      }
    }; // <-- THIS CLOSES THE ASYNC FUNCTION (Fixes 'await' error)

    fetchDashboardData();
  }, [supabase.auth, router]);

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

  // 🧠 ADAPTIVE BEHAVIOR OS: Dynamically adjust UI targets based on recovery & adherence
  const baseTDEE = userProfile.target_calories || userProfile.tdee || 2000;
  const { risk_level: currentBurnoutRisk, burnout_trajectory_packet } = detectBurnoutRisk(metrics.recovery_score, metrics.sleep_hours, metrics.streak_count, Math.abs(Math.min(0, metrics.energy_balance)), []);
  // Legacy strict signature bypass for 6-arg orchestration
  const adaptiveGoals: any = calculateAdaptiveGoals(baseTDEE, 6000, metrics.recovery_state, currentBurnoutRisk, "stable", "stable" as any);
  const { recommended_calories: targetCalories, recommended_steps: targetSteps, recommended_water: targetWater, adaptation_mode, goal_modulation_metadata, capacity_packet, capacity_budget } = adaptiveGoals;

  // 🧠 SAFE ABOS PHASE 10: UI DERIVATION
  const safe_consistency = metrics.streak_count > 3 ? "highly_adherent" : metrics.streak_count > 0 ? "stable" : "struggling";
  const safe_adherence_risk = metrics.streak_count === 0 ? "high" : "low";
  const estimated_sleep_debt = Math.max(0, 8 - (metrics.sleep_hours || 0));
  
  const operating_state_engine = determineOperatingState(currentBurnoutRisk, safe_consistency);
  const intervention_engine = determineInterventionMode(operating_state_engine.operating_state);
  const recovery_roi = calculateRecoveryROI(estimated_sleep_debt, metrics.fatigue_risk, safe_adherence_risk);
  const energy_allocation = calculateEnergyAllocation(estimated_sleep_debt, metrics.fatigue_risk, (metrics.sleep_hours || 0) >= 7 ? "high" : "low");

  let energyColorClass = "text-[#00FFA3]";
  if (metrics.energy_intake > 0) {
    const intakeRatio = metrics.energy_intake / targetCalories;
    if (intakeRatio > 1.1) energyColorClass = "text-red-500";
    else if (intakeRatio >= 0.9) energyColorClass = "text-yellow-500";
  }

  return (
    <div className="relative min-h-screen bg-black text-white pb-28 overflow-hidden selection:bg-[#00FFA3]/30">
      
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00FFA3]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <header className="px-6 pt-10 pb-6 flex justify-between items-center z-10 relative">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-black tracking-tighter"
          >
            NUVYU<span className="text-[#00FFA3]">.AI</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-white/50 text-sm font-medium mt-1 capitalize"
          >
            {getDynamicGreeting()}, {userProfile.full_name ? userProfile.full_name.split(' ')[0] : 'Athlete'}.
          </motion.p>
        </div>
        <div className="flex gap-3 items-center">
            <motion.button 
              whileTap={{ scale: 0.9 }} 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all text-white/60 shrink-0"
            >
              {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
            </motion.button>
            
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md shrink-0">
              <Bell size={18} className="text-white/80" />
            </div>

            <Link href="/profile">
              <motion.div 
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md overflow-hidden hover:border-[#00FFA3]/50 transition-all cursor-pointer shrink-0"
              >
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userProfile.full_name || userProfile.email || 'user')}&backgroundColor=00FFA3&textColor=000000`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </Link>
        </div>
      </header>

      <main className="px-6 space-y-6 z-10 relative">
        
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] p-6 flex flex-col items-center relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
        >
          <div className="relative w-52 h-52 flex items-center justify-center mb-4">
              <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="104" cy="104" r="90" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                  <motion.circle 
                      cx="104" cy="104" r="90" stroke="#00FFA3" strokeWidth="12" fill="transparent"
                      strokeDasharray={565}
                      initial={{ strokeDashoffset: 565 }}
                      animate={{ strokeDashoffset: 565 - (565 * metrics.score) / 100 }}
                      transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                      strokeLinecap="round"
                      className="drop-shadow-[0_0_15px_rgba(0,255,163,0.5)]"
                  />
              </svg>
              <div className="text-center">
                  <motion.span 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className="text-6xl font-black tracking-tighter drop-shadow-lg"
                  >
                    {metrics.score}
                  </motion.span>
                  <p className="text-[#00FFA3] text-xs font-bold uppercase tracking-widest mt-1">Daily Score</p>
              </div>
          </div>

          <div className="w-full bg-gradient-to-r from-[#00FFA3]/10 to-transparent border-l-4 border-[#00FFA3] p-4 rounded-r-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-[#00FFA3]" fill="#00FFA3" />
              <span className="text-xs font-bold text-[#00FFA3] uppercase tracking-wider">Coach Nudge</span>
            </div>
                                    <p className="text-sm font-medium text-white/90 leading-relaxed">
              &quot;{coachMessage}&quot;
            </p>
          </div>

          {/* 🧠 RETENTION STRIP (Level, Streak, XP) */}
          <div className="w-full mt-5 flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/5 pt-4 gap-3">
            <div className="flex flex-wrap items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/70 w-full sm:w-auto">
              
              <span className="text-[#00FFA3] bg-[#00FFA3]/10 px-2 py-1 rounded-md border border-[#00FFA3]/20 whitespace-nowrap shrink-0">
                Level {retention.level}
              </span>
              
              {/* 🧠 DASHBOARD INTELLIGENCE v6 (Adaptive Recovery Indicators) */}
              {adaptation_mode === 'recovery_focus' && (
                <span className="text-red-400 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20 capitalize flex items-center gap-1 whitespace-nowrap shrink-0">
                  ⚠️ Recovery Mode
                </span>
              )}
              
              {((metrics as any).streak_count > 0) && (
                <>
                  <span className="hidden sm:block w-1 h-1 rounded-full bg-white/20 shrink-0"></span>
                  <span className="flex items-center gap-1 text-orange-400 whitespace-nowrap shrink-0">
                    <Flame size={12} /> {(metrics as any).streak_count} Day Streak
                  </span>
                </>
              )}
              
              <span className="hidden sm:block w-1 h-1 rounded-full bg-white/20 shrink-0"></span>
              <span className="whitespace-nowrap shrink-0">+{retention.todayXP} XP Today</span>
              
            </div>
            
            {/* MICRO DOPAMINE EFFECT */}
            {retention.todayXP > 0 && (
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest text-left sm:text-right shrink-0">
                Momentum building 🔥
              </span>
            )}
          </div>

        </motion.section>

        <div className="flex justify-between items-end">
           <h3 className="text-white/60 font-bold uppercase tracking-widest text-[10px] ml-2">Today's Activity</h3>
           <Link 
             href="/log"
             className="flex items-center gap-1 text-[#00FFA3] text-xs font-bold uppercase tracking-widest bg-[#00FFA3]/10 px-3 py-1.5 rounded-full border border-[#00FFA3]/30 hover:bg-[#00FFA3]/20 transition-all"
           >
             <Plus size={14} /> Add Log
           </Link>
        </div>

          <section className="grid grid-cols-2 gap-4">
          <BentoCard icon={Footprints} label="Steps" value={metrics.steps} target={`/ ${targetSteps}`} color="text-[#00FFA3]" delay={0.2} />
          
          {/* REAL BODY ENERGY INTELLIGENCE CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-5 flex flex-col justify-between shadow-xl col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <Flame size={16} className={energyColorClass} />
              <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Energy Balance Engine</span>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{metrics.energy_stats?.totalBurn || 0}</span>
                  <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">Kcal Out</span>
                </div>
                <div className="text-[#00FFA3] text-[10px] font-bold uppercase tracking-widest mt-1">
                  {metrics.energy_stats?.activityBurn || 0} active • {metrics.energy_stats?.bmrBurn || 0} bmr
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-1 justify-end">
                  <span className="text-2xl font-bold text-orange-400">{metrics.energy_stats?.intakeCalories || 0}</span>
                  <span className="text-white/40 text-[10px] font-medium uppercase tracking-widest">/ {metrics.energy_stats?.targetCalories || targetCalories} In</span>
                </div>
                <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">
                  {metrics.energy_stats?.deficit ? 'deficit' : metrics.energy_stats?.surplus ? 'surplus' : 'maintenance'}
                </div>
              </div>
            </div>
          </motion.div>
          
         <BentoCard icon={Droplets} label="Water" value={metrics.water} target={`/ ${targetWater} ml`} color="text-blue-400" delay={0.4} />
            
        {/* Recovery & Sleep Integrations */}
          <BentoCard icon={Moon} label="Sleep" value={metrics.sleep_hours || 0} target="hrs" color="text-indigo-400" delay={0.45} />
          <BentoCard icon={Activity} label="Recovery" value={`${metrics.recovery_score || 0}%`} target="score" color="text-purple-400" delay={0.5} />
        </section>

        {/* 🧠 ABOS EXECUTIVE SUMMARY */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-5 shadow-xl mt-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-[#00FFA3]" />
              <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">ABOS Operating State</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FFA3] bg-[#00FFA3]/10 px-2 py-1 rounded-md">{operating_state_engine.operating_state.replace('_', ' ')}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest block mb-1">Intervention</span>
              <span className="text-white text-xs font-bold capitalize">{intervention_engine.intervention_mode.replace('_', ' ')}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest block mb-1">Energy Focus</span>
              <span className="text-white text-xs font-bold capitalize">{energy_allocation.recommended_focus}</span>
            </div>
            <div className="col-span-2 bg-[#00FFA3]/5 rounded-xl p-3 border border-[#00FFA3]/10">
              <span className="text-[#00FFA3]/60 text-[9px] font-bold uppercase tracking-widest block mb-1">Highest Recovery ROI</span>
              <span className="text-white text-xs font-bold">{recovery_roi.roi_action}</span>
            </div>
          </div>
        </motion.section>
        
      </main>

           {/* FIXED BOTTOM NAVIGATION */}
      <div className="fixed bottom-6 left-6 right-6 flex justify-center z-40">
        <nav className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex items-center gap-12 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
          <Link href="/reports">
            <LayoutDashboard size={24} className="text-[#00FFA3]" strokeWidth={2.5} />
          </Link>
          
          <Link href="/log">
            <motion.div 
              whileTap={{ scale: 0.9 }}
              className="bg-[#00FFA3] p-4 rounded-full shadow-[0_0_30px_rgba(0,255,163,0.4)] text-black cursor-pointer -mt-8 border-4 border-black flex items-center justify-center"
            >
              <Plus size={28} strokeWidth={3} />
            </motion.div>
          </Link>
          
          <Link href="/profile">
            <Settings size={24} className="text-white/40 hover:text-white transition-colors cursor-pointer" />
          </Link>
        </nav>
      </div>

    </div>
  );
}

// RESTORED & SAFE BENTOCARD COMPONENT (UX STABILIZATION ENGINE)
const BentoCard = React.memo(function BentoCard({ icon: Icon, label, value, target, color, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-4 sm:p-5 flex flex-col justify-between h-28 sm:h-32 shadow-xl overflow-hidden"
    >
      <div className="flex items-center gap-2 truncate">
        <Icon size={16} className={`shrink-0 ${color}`} />
        <span className="text-white/50 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">{label}</span>
      </div>
      <div className="mt-2">
        <div className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">{value}</div>
        <div className="text-[10px] sm:text-xs font-medium text-white/40 mt-0.5 truncate">{target}</div>
      </div>
     </motion.div>
  );
});

