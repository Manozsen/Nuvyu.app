// 🧠 LONG-TERM MEMORY ENGINE
// Prepares architecture to detect recurring behavioral habits and preferred routines.

export function extractBehavioralMemories(logs: any[]) {
  const preferred_workout_times: number[] = [];
  let missed_breakfasts = 0;
  let night_eating_events = 0;

  logs.forEach((log) => {
    const logDate = new Date(log.created_at);
    const hour = logDate.getHours();

    // Workout time clustering
    if (log.log_type === 'workout') {
      preferred_workout_times.push(hour);
    }

    // Unhealthy/Shifted nutrition timing detection
    if (log.log_type === 'food') {
      if (hour >= 22 || hour <= 3) night_eating_events++;
    }
  });

  // Calculate most common workout window
  const workout_cluster = preferred_workout_times.length > 0 
    ? Math.round(preferred_workout_times.reduce((a, b) => a + b, 0) / preferred_workout_times.length) 
    : null;

  return {
    preferred_workout_hour: workout_cluster,
    night_eating_frequency: night_eating_events,
    missed_breakfast_frequency: missed_breakfasts,
    memory_status: "tracking_active"
  };
}

// 🧠 PHASE 10C: HABIT COMPOUND ENGINE
export function detectHabitCompounds(preferred_workout_hour: number | null, night_eating_frequency: number) {
  let compound_chain = "baseline -> adherence";
  let keystone_behavior = "morning_hydration";
  
  if (night_eating_frequency > 1) {
    compound_chain = "late_eating -> poor_sleep -> skipped_workout";
    keystone_behavior = "evening_cutoff";
  } else if (preferred_workout_hour && preferred_workout_hour < 10) {
    compound_chain = "early_workout -> high_energy -> consistent_nutrition";
    keystone_behavior = "morning_workout";
  }

    return {
    compound_chain,
    keystone_behavior,
    compound_strength: night_eating_frequency > 1 ? "high_negative" : "high_positive",
    compound_risk: night_eating_frequency > 1 ? "high" : "low"
  };
}

import { calculateTrend } from '../analytics/engine';

// 🧠 PHASE 11 MODULE 1 & 13C.7: BEHAVIORAL MEMORY GRAPH
export function buildBehavioralMemoryPacket(recent_scores: number[], recent_sleep: number[], recent_water: number[], consistency_profile: string = "stable", current_streak: number = 0) {
  const avg_sleep = recent_sleep.length > 0 ? recent_sleep.reduce((a, b) => a + b, 0) / recent_sleep.length : 0;
  const avg_water = recent_water.length > 0 ? recent_water.reduce((a, b) => a + b, 0) / recent_water.length : 0;
  const score_trend = recent_scores.length >= 2 ? recent_scores[0] - recent_scores[1] : 0;

  // 🧠 CONSOLIDATED TREND INTELLIGENCE
  const weekly_trend = calculateTrend(recent_scores);
  const today_trend = score_trend > 0 ? "improving" : score_trend < 0 ? "declining" : "stable";
  
  let behavior_drift = "stable";
  if (score_trend < -15) behavior_drift = "multi_system_collapse";
  else if (score_trend < -5) behavior_drift = "deterioration";
  else if (score_trend < 0) behavior_drift = "minor_lapse";

  const consistency_score = consistency_profile === 'high' ? 90 : consistency_profile === 'medium' ? 60 : 30;
  const momentum_score = Math.min(100, Math.round((current_streak * 5) + (consistency_score * 0.5)));
  const momentum_direction = weekly_trend === 'improving' ? 'accelerating' : weekly_trend === 'declining' ? 'decelerating' : 'stagnant';
  const trajectory = behavior_drift === 'multi_system_collapse' ? 'At Risk' : behavior_drift === 'deterioration' ? 'Declining' : 'Optimal Growth';

  const trend_packet = {
    today_trend,
    weekly_trend,
    behavior_drift,
    momentum_score,
    momentum_direction,
    consistency_score,
    habit_velocity: momentum_direction === 'accelerating' ? 'high' : momentum_direction === 'decelerating' ? 'low' : 'moderate',
    trajectory,
    confidence: recent_scores.length >= 3 ? "high" : "low",
    reason_chain: [
      `Consistency Base: ${consistency_profile}`,
      `Recent Trajectory: ${weekly_trend}`,
      `Calculated Inertia: ${momentum_score}`
    ]
  };

  return {
    adherence_drift: score_trend < -15 ? "sharp_decline" : score_trend < -5 ? "gradual_decline" : score_trend > 10 ? "improving" : "stable",
    hydration_behavior: avg_water < 1500 ? "chronically_dehydrated" : avg_water > 2500 ? "optimal" : "inconsistent",
    sleep_behavior: avg_sleep < 6 ? "sleep_deprived" : avg_sleep > 7.5 ? "well_rested" : "baseline",
    memory_confidence: (recent_scores.length + recent_sleep.length) >= 4 ? 0.9 : 0.4,
    trend_packet // 🧠 SINGLE SOURCE OF TRUTH EXPORT
  };
}


