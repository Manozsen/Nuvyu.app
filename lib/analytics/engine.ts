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

import { calculateEnergyBalance, getLocalDateString } from '../calories/energyEngine';
import { AnalyticsDailyData } from '../types/analytics';
import { safeSleepHours, safeRecoveryScore } from '../utils/sleep';

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

    // Efficient Parallel Fetch Strategy: Added daily_logs for accurate calorie analytics
    const [profileRes, habitsRes, sleepRes, logsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('user_habits').select('*').eq('user_id', userId).gte('date', boundaryDate).order('date', { ascending: true }),
      supabase.from('sleep_logs').select('*').eq('user_id', userId).gte('date', boundaryDate).order('date', { ascending: true }),
      supabase.from('daily_logs').select('log_type, data, created_at').eq('user_id', userId).gte('created_at', startDate.toISOString())
    ]);

    const profile = profileRes.data;
    const habits = habitsRes.data;
    const sleep = sleepRes.data;
    const allLogs = logsRes.data || [];

    const aggregated = [];
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
  const avg_sleep = validSleep.length > 0 ? validSleep.reduce((a:any, b:any) => a + b.sleep_hours, 0) / validSleep.length : 0;
  
  const validSteps = analytics.dailyData.filter((d:any) => d.steps > 0);
  const avg_steps = validSteps.length > 0 ? validSteps.reduce((a:any, b:any) => a + b.steps, 0) / validSteps.length : 0;
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
    : 0
  let cognitive_load = "optimal";
  let lifeload_score = 100;

  if (avg_sleep < 6) lifeload_score -= 30;
  if (avg_screen > 6) lifeload_score -= 20;
  if (avg_screen > 8 && avg_sleep < 5) lifeload_score -= 40; // Critical nervous system overload
  
  if (lifeload_score <= 30) {
    cognitive_load = "severe_overload";
    behavior_insights.push("nervous_system_overload", "high_screen_fatigue");
  } else if (lifeload_score <= 60) {
    cognitive_load = "high_strain";
    behavior_insights.push("elevated_cognitive_load");
  } else if (lifeload_score <= 80) {
    cognitive_load = "moderate_strain";
  }

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
  const decision_fatigue = (recentDays.length > 0 && lifeload_score < 50 && adherence_score < 50) ? "high" : "low";
  
  const lifeload_packet = {
    lifeload_score,
    lifeload_level: lifeload_score > 80 ? "optimal" : lifeload_score > 50 ? "manageable" : "overloaded",
    lifeload_confidence: analytics.dailyData.length >= 3 ? "high" : "low",
    dominant_load_driver: avg_screen > 6 ? "screen_fatigue" : avg_sleep < 6 ? "sleep_debt" : "behavioral_friction"
  };

  const cognitive_energy_packet = {
    cognitive_freshness: avg_sleep >= 7 && avg_screen < 4 ? "high" : "low",
    cognitive_fatigue: avg_sleep < 6 || avg_screen > 7 ? "elevated" : "baseline",
    mental_recovery: avg_sleep >= 7 ? "active" : "stalled",
    attention_capacity: lifeload_score > 60 ? "available" : "depleted",
    mental_load: cognitive_load
  };

  const decision_fatigue_packet = {
    fatigue_score: decision_fatigue === "high" ? 85 : 20,
    fatigue_level: decision_fatigue,
    overload_source: lifeload_packet.dominant_load_driver,
    confidence: "high"
  };

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

