import { calculateEnergyBalance } from '../calories/energyEngine';
import { AnalyticsDailyData } from '../types/analytics';
import { safeSleepHours, safeRecoveryScore } from '../utils/sleep';
import { getLocalMidnightRange } from '../time/engine';

// 🧠 ABOS PHASE 10 & 12.3A: LIFELOAD V2 (Occupational Fatigue Modifier)
export function calculateLifeload(
  avg_sleep: number, 
  avg_screen: number, 
  occupational_strain?: { 
    standing_hours?: number; 
    walking_hours?: number; 
    manual_labor_level?: 'low' | 'moderate' | 'high' | 'extreme'; 
    mental_workload_level?: 'low' | 'moderate' | 'high' | 'extreme'; 
    commute_hours?: number;
  }
) {
  let lifeload_score = 100;
  let daily_strain_score = 0;
  let load_driver = "behavioral_friction";

  // 🧠 1. Calculate Core Sleep & Screen Debt
  let baseline_penalty = 0;
  if (avg_sleep < 6) baseline_penalty += 30;
  if (avg_screen > 6) baseline_penalty += 20;
  if (avg_screen > 8 && avg_sleep < 5) baseline_penalty += 20; // Critical nervous system overload compounding

  lifeload_score -= baseline_penalty;

  // 🧠 2. Calculate Occupational Strain (Phase 12.3)
  if (occupational_strain) {
    daily_strain_score += (occupational_strain.standing_hours || 0) * 5;
    daily_strain_score += (occupational_strain.walking_hours || 0) * 8;
    daily_strain_score += (occupational_strain.commute_hours || 0) * 4;
    
    if (occupational_strain.manual_labor_level === 'extreme') daily_strain_score += 25;
    else if (occupational_strain.manual_labor_level === 'high') daily_strain_score += 15;
    else if (occupational_strain.manual_labor_level === 'moderate') daily_strain_score += 5;

    if (occupational_strain.mental_workload_level === 'extreme') daily_strain_score += 20;
    else if (occupational_strain.mental_workload_level === 'high') daily_strain_score += 10;

    // Cap occupational penalty deduction
    const max_occupational_penalty = 45;
    const applied_occupational_penalty = Math.min(daily_strain_score, max_occupational_penalty);
    
    lifeload_score -= applied_occupational_penalty;
  }

  // 🧠 3. Determine Dominant Load Driver
  if (daily_strain_score > 25 && daily_strain_score > baseline_penalty) {
    load_driver = "occupational_fatigue";
  } else if (avg_screen > 6 && avg_screen * 3 > (8 - avg_sleep) * 5) {
    load_driver = "screen_fatigue";
  } else if (avg_sleep < 6) {
    load_driver = "sleep_debt";
  }

  // Enforce absolute bounds
  lifeload_score = Math.max(0, Math.min(100, lifeload_score));

  let cognitive_load = "optimal";
  if (lifeload_score <= 30) cognitive_load = "severe_overload";
  else if (lifeload_score <= 60) cognitive_load = "high_strain";
  else if (lifeload_score <= 80) cognitive_load = "moderate_strain";

  // 🧠 PHASE 12.3A: EXACT STRAIN PACKET EXPORT
  const strain_packet = {
    standing_hours: occupational_strain?.standing_hours || 0,
    walking_hours: occupational_strain?.walking_hours || 0,
    manual_load: occupational_strain?.manual_labor_level || 'low',
    mental_load: occupational_strain?.mental_workload_level || 'low',
    commute_load: occupational_strain?.commute_hours || 0,
    daily_strain_score,
    dominant_driver: load_driver,
    recommended_adjustment: daily_strain_score > 30 ? "Reduce intensity 20%" : daily_strain_score > 15 ? "Prioritize active recovery" : "Maintain normal intensity",
    confidence: occupational_strain ? "high" : "low"
  };

  return {
    lifeload_score,
    cognitive_load,
    lifeload_packet: {
      lifeload_score,
      lifeload_level: lifeload_score > 80 ? "optimal" : lifeload_score > 50 ? "manageable" : "overloaded",
      lifeload_confidence: occupational_strain ? "high" : "moderate", // Confidence scales with data density
      dominant_load_driver: load_driver,
      daily_strain_score // Exported for dashboard rings/reports if needed
    },
    strain_packet
  };
}

export function calculateCognitiveEnergy(avg_sleep: number, avg_screen: number, cognitive_load: string) {
  return {
    cognitive_freshness: avg_sleep >= 7 && avg_screen < 4 ? "high" : "low",
    cognitive_fatigue: avg_sleep < 6 || avg_screen > 7 ? "elevated" : "baseline",
    mental_recovery: avg_sleep >= 7 ? "active" : "stalled",
    attention_capacity: cognitive_load === "severe_overload" ? "depleted" : "available",
    mental_load: cognitive_load
  };
}

export function calculateDecisionFatigue(lifeload_score: number, adherence_score: number, dominant_load_driver: string) {
  const decision_fatigue = (lifeload_score < 50 && adherence_score < 50) ? "high" : "low";
  return {
    fatigue_score: decision_fatigue === "high" ? 85 : 20,
    fatigue_level: decision_fatigue,
    overload_source: dominant_load_driver,
    confidence: "high"
  };
}

  // 🧠 PHASE 10D: BEHAVIORAL LEVERAGE ENGINE
export function detectBehavioralLeverage(
  lifeload_score: number,
  adherence_score: number
) {
  let leverage_behavior = "Sleep Consistency";

  if (lifeload_score > 70) {
    leverage_behavior = "Screen Time Reduction";
  } else if (adherence_score < 50) {
    leverage_behavior = "Morning Hydration";
  }

  return {
    leverage_behavior,
    leverage_confidence: 0.85,
    leverage_reason: "Directly impacts limiting factor",
    secondary_leverage: "Active Recovery"
  };
}

// 🧠 PHASE 10E: BEHAVIORAL SCENARIO SIMULATOR
export function simulateBehavioralScenario(streak_risk: string, lifeload_score: number) {
  const trajectory = streak_risk === "high" ? "declining" : "improving";
  return {
    scenario_projection: trajectory,
    burnout_projection: lifeload_score > 80 ? "escalating" : "stable",
    recovery_projection: trajectory === "declining" ? "deteriorating" : "optimizing",
    adherence_projection: trajectory,
    stability_projection: trajectory === "improving" ? "high" : "fragile"
  };
}

// 🧠 PART 8: AUTO ACTIVITY DETECTION PREP
// Prepare scalable structure for future wearable/device integration
export function calculateDynamicCalories(profile: any, totalSteps: number, workoutLogsCount: number, detectedBurn: number = 0) {
  const bmr = profile?.bmr || 1500;
  const base_tdee = profile?.tdee || bmr * 1.2;
  
  const steps_burn = totalSteps * 0.04;
  const workout_burn = workoutLogsCount * 250; // Estimation until full workout intensity logs exist
  const dynamic_burn = bmr + steps_burn + workout_burn + detectedBurn;

  let goal_adjusted_target = base_tdee;
  const goal = profile?.goal || profile?.desired_identity || '';
  
  if (goal.toLowerCase().includes('lean') || goal.toLowerCase().includes('fat loss')) {
    goal_adjusted_target = base_tdee * 0.85;
  } else if (goal.toLowerCase().includes('muscle') || goal.toLowerCase().includes('gain')) {
    goal_adjusted_target = base_tdee * 1.1;
  }

  return {
    bmr,
    base_tdee,
    dynamic_burn: Math.round(dynamic_burn),
    goal_adjusted_target: Math.round(goal_adjusted_target)
  };
}

export function calculateTrend(data: number[]) {
  const validData = data.filter(d => d > 0);
  if (!validData || validData.length < 2) return 'stable';
  
  const half = Math.floor(validData.length / 2);
  const firstHalf = validData.slice(0, half).reduce((a, b) => a + b, 0) / half;
  const secondHalf = validData.slice(half).reduce((a, b) => a + b, 0) / (validData.length - half);
  
  if (secondHalf > firstHalf * 1.05) return 'improving';
  if (secondHalf < firstHalf * 0.95) return 'declining';
  return 'stable';
}

const getLocalDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// 🛠️ LOCAL SAFE UTILITIES (Prevents NaN/Undefined crashes during analytics parsing)
const safeNumber = (value: any, fallback = 0): number => { 
  const num = Number(value); 
  return Number.isFinite(num) ? num : fallback; 
};
const safeArray = (value: any) => { 
  return Array.isArray(value) ? value : []; 
};
const safeString = (value: any, fallback = ''): string => { 
  return typeof value === 'string' ? value : fallback; 
};

export async function getAnalytics(supabase: any, userId: string, days: number) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const boundaryDate = getLocalDateStr(startDate);

    // 🧠 TIME ENGINE: Clamp past boundaries strictly to local midnight to prevent drifting graph windows
    const { start_utc: past_start_utc } = getLocalMidnightRange(startDate);

    // Efficient Parallel Fetch Strategy: Added daily_logs for accurate calorie analytics
    const [profileRes, habitsRes, sleepRes, logsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('user_habits').select('*').eq('user_id', userId).gte('date', boundaryDate).order('date', { ascending: true }),
      supabase.from('sleep_logs').select('*').eq('user_id', userId).gte('date', boundaryDate).order('date', { ascending: true }),
      supabase.from('daily_logs').select('log_type, data, created_at').eq('user_id', userId).gte('created_at', past_start_utc)
    ]);

    const profile = profileRes.data;
    const habits = habitsRes.data;
    const sleep = sleepRes.data;
    const allLogs = logsRes.data || [];

    // 🧠 BUG FIX: Apply strict TypeScript Array signature to clear Vercel 'implicit any[]' errors
    const aggregated: AnalyticsDailyData[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateStr(d);

     // CRITICAL FIX: Safe sync mapping parsing sleep stats reliably across timezones
      const h = habits?.find((x: any) => x.date === dateStr || (x.created_at && x.created_at.startsWith(dateStr))) || {};
      const s = sleep?.find((x: any) => x.date === dateStr || (x.created_at && x.created_at.startsWith(dateStr))) || {};
      
      // Filter logs for this specific date (local time matching)
      const dayLogs = allLogs.filter((l: any) => {
         const logDate = new Date(l.created_at);
         return getLocalDateStr(logDate) === dateStr;
      });

      // 🧠 Strictly Typed Energy Mapping
      const energyData = calculateEnergyBalance(profile, dayLogs);

      // 🛠️ STRICT SLEEP SCHEMA STANDARDIZATION
      const dailySleepLog = dayLogs.find((l: any) => l.log_type === 'sleep');
      const finalSleepHours = safeSleepHours(dailySleepLog?.data, s);
      const finalRecoveryScore = safeRecoveryScore(s?.recovery_score, finalSleepHours);

      const dayData: AnalyticsDailyData = {
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: dateStr,
        score: safeNumber(h?.score),
        steps: safeNumber(h?.steps),
        water: safeNumber(h?.water),
        sleep_hours: finalSleepHours,
        recovery_score: finalRecoveryScore,
        streak: safeNumber(h?.streak_count),
        calorie_burn: safeNumber(energyData?.totalBurn),
        calorie_target: safeNumber(energyData?.targetCalories),
        calorie_intake: safeNumber(energyData?.intakeCalories),
        meal_timeline: safeArray(energyData?.intakeTimeline),
        activity_breakdown: safeArray(energyData?.burnTimeline).map((b: any) => ({ name: b.source, burn: b.calories })),
        bmr_burn: safeNumber(energyData?.bmrBurn),
        energy_status: (energyData?.deficit && energyData.deficit > 0) ? 'deficit' : (energyData?.surplus && energyData.surplus > 0) ? 'surplus' : 'maintenance'
      };

      aggregated.push(dayData);
    } // <-- CRITICAL FIX: Properly closes the for (let i = days - 1...) loop

    const stats = {
      stepsTrend: calculateTrend(aggregated.map(a => a.steps)),
      waterTrend: calculateTrend(aggregated.map(a => a.water)),
      sleepTrend: calculateTrend(aggregated.map(a => a.sleep_hours)),
      recoveryTrend: calculateTrend(aggregated.map(a => a.recovery_score)),
      calorieBurnTrend: calculateTrend(aggregated.map(a => a.calorie_burn))
    };

    return {
      dailyData: aggregated,
      stats,
      profileBase: {
        tdee: profile?.tdee || 2000,
        bmr: profile?.bmr || 1500
      }
    };
  } catch (error) {
    // 🧠 PART 10: FAIL SAFE
    console.error('Analytics Error:', error);
    return { dailyData: [], stats: {}, profileBase: {} };
  }
}

// 🧠 PART 7: AI-READY ANALYTICS CONTEXT & BEHAVIORAL PATTERN ENGINE
  export function buildAIAnalyticsContext(analytics: any) {
  if (!analytics || !analytics.dailyData) return {};
  
  const validSleep = analytics.dailyData.filter((d:any) => d.sleep_hours > 0);
  // 🧠 BUG FIX: Explicitly type the accumulator ('a') as number to prevent TS strict build failure
  const avg_sleep = validSleep.length > 0 ? validSleep.reduce((a: number, b: any) => a + b.sleep_hours, 0) / validSleep.length : 0;
  
  const validSteps = analytics.dailyData.filter((d:any) => d.steps > 0);
  // 🧠 BUG FIX: Explicitly type the accumulator ('a') as number to prevent TS strict build failure
  const avg_steps = validSteps.length > 0 ? validSteps.reduce((a: number, b: any) => a + b.steps, 0) / validSteps.length : 0;
  const recentDays = analytics.dailyData.slice(-3);

  const recentWater =
    recentDays.reduce(
      (acc: number, d: any) => acc + (d.water || 0),
      0
    ) / (recentDays.length || 1);

  // 🧠 SMART ADHERENCE ENGINE: Safely calculate long-term habit consistency
  const totalDays = analytics.dailyData.length || 1;
  const daysHitWater = analytics.dailyData.filter((d:any) => d.water >= 2000).length;
  const daysHitSteps = analytics.dailyData.filter((d:any) => d.steps >= 6000).length;
  const adherence_score = Math.round(((daysHitWater + daysHitSteps) / (totalDays * 2)) * 100) || 0;
  
    let consistency_profile = "stable";
  if (adherence_score >= 80) consistency_profile = "highly_adherent";
  else if (adherence_score <= 40) consistency_profile = "struggling";

  // Safely declare array before usage
  const behavior_insights: string[] = [];
  behavior_insights.push(`adherence_${consistency_profile}`);
  
  // 🧠 ADHERENCE PREDICTION ENGINE INTEGRATION
  let adherence_risk = "low";
  let motivation_stability = "stable";
  let routine_stability = "stable";
  
    if (consistency_profile === "struggling") {
    adherence_risk = "high";
    motivation_stability = "declining";
    routine_stability = "unstable";
    behavior_insights.push("routine_inconsistency", "fatigue_driven_dropoff");
  } else if (adherence_score < 60) {
    adherence_risk = "medium";
  }
  
  // 🧠 MULTI-DAY BEHAVIORAL REASONING
  if (recentDays.length === 3) {
    const day1 = recentDays[0].score;
    const day2 = recentDays[1].score;
    const day3 = recentDays[2].score;
    if (day1 > day2 && day2 > day3) behavior_insights.push("multi_day_recovery_collapse");
    else if (day1 < day2 && day2 < day3) behavior_insights.push("multi_day_recovery_rebound");
  }
  
    if (avg_sleep > 0 && avg_sleep < 6) {
    behavior_insights.push("chronic_sleep_debt");
  }

  if (avg_steps > 0 && avg_steps < 4000) {
    behavior_insights.push("low_movement_pattern");
  }

  if (recentWater > 0 && recentWater < 1500) {
    behavior_insights.push("hydration_inconsistency");
  }

// 🧠 ENERGY-AWARE LIFELOAD INTELLIGENCE
const validScreen = analytics.dailyData.filter(
  (d: any) => Number(d.screen || 0) > 0
);

const avg_screen =
  validScreen.length > 0
    ? validScreen.reduce(
        (a: number, b: any) => a + Number(b.screen || 0),
        0
      ) / validScreen.length
    : 0;

  // 🧠 ABOS PHASE 10: Extracted Pure Function Execution
  const { lifeload_score, cognitive_load, lifeload_packet } = calculateLifeload(avg_sleep, avg_screen);
  
  if (lifeload_score <= 30) behavior_insights.push("nervous_system_overload", "high_screen_fatigue");
  else if (lifeload_score <= 60) behavior_insights.push("elevated_cognitive_load");

  let streak_risk = "low";

  if (
    analytics.stats?.scoreTrend === 'declining' ||
    (
      recentDays.length > 0 &&
      recentDays[recentDays.length - 1]?.score < 40
    )
  ) {
    streak_risk = "high";
    behavior_insights.push("streak_drop_risk");
  }

  // 🧠 PHASE 2, 3, & 4: ADVANCED LOAD INTELLIGENCE
  const cognitive_energy_packet = calculateCognitiveEnergy(avg_sleep, avg_screen, cognitive_load);
  const decision_fatigue_packet = calculateDecisionFatigue(lifeload_score, adherence_score, lifeload_packet.dominant_load_driver);

  // 🧠 ABOS PHASE 10: ANALYTICS INTEGRATION
  const leverage_engine = detectBehavioralLeverage(lifeload_score, adherence_score);
  const scenario_simulator = simulateBehavioralScenario(streak_risk, lifeload_score);

  // 🧠 BYPASS EXCESS PROPERTY CHECK: Safely package all AI intelligence
  const aiContext = {
    avg_sleep: Math.round(avg_sleep * 10) / 10,
    avg_steps: Math.round(avg_steps),
    avg_screen: Math.round(avg_screen * 10) / 10,
    recent_water_avg: Math.round(recentWater),
    streak_risk,
    cognitive_load,
    lifeload_score,
    lifeload_packet,
    cognitive_energy_packet,
    decision_fatigue_packet,
    leverage_engine,
    scenario_simulator,
    behavior_insights,
    adherence_score,
    consistency_profile,
    adherence_risk,
    motivation_stability,
    routine_stability,
    hydration_trend: analytics.stats?.waterTrend || 'stable',
    recovery_trend: analytics.stats?.recoveryTrend || 'stable',
    burn_trend: analytics.stats?.calorieBurnTrend || 'stable',
    activity_consistency: analytics.stats?.stepsTrend || 'stable',
    consistency_score: analytics.stats?.scoreTrend || 'stable'
  };

  return aiContext;
}

// 🧠 PHASE 11 MODULE 6: LLM READY CONTEXT BUILDER
export function buildCoachContextPacket(aiContext: any) {
  if (!aiContext) return { serialized_state: "{}", priority_directive: "None", llm_routing_flag: false };

  const priority = aiContext.coach_action_packet?.todays_priority || "Consistency";
  const directive = aiContext.intervention_packet?.primary_intervention || "Maintain current trajectory";

  // Create a minimal serialized payload to save LLM tokens while preserving strict ABOS context
  const minimalPayload = {
    state: aiContext.operating_state?.operating_state,
    lifeload: aiContext.lifeload_packet?.lifeload_level,
    fatigue: aiContext.decision_fatigue_packet?.fatigue_level,
    drift: aiContext.behavioral_memory_packet?.adherence_drift,
    habit_rx: aiContext.habit_prescription_packet?.micro_habit
  };

  return {
    serialized_state: JSON.stringify(minimalPayload),
    priority_directive: `FOCUS: ${priority}. DIRECTIVE: ${directive}`,
    llm_routing_flag: true
  };
}
