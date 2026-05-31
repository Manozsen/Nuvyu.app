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
