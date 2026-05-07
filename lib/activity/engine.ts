// 🧠 ACTIVITY & CALORIE INTELLIGENCE ENGINE
// Scalable architecture for future wearable sync and auto-detection

export function estimateActivityCalories(activityType: string, durationMins: number, intensity: string, weightKg: number = 70) {
  // MET (Metabolic Equivalent of Task) baseline estimations
  const metValues: Record<string, number> = {
    walking: 3.5, 
    running: 9.8, 
    cycling: 7.5, 
    swimming: 8.0, 
    weightlifting: 6.0, 
    yoga: 3.0, 
    hiking: 6.0, 
    badminton: 5.5,
    football: 7.0,
    climbing: 8.0,
    default: 5.0
  };

  const safeActivity = activityType.toLowerCase().trim();
  let baseMet = metValues[safeActivity] || metValues.default;
  
  // Intensity Multipliers
  if (intensity === 'high') baseMet *= 1.3;
  if (intensity === 'low') baseMet *= 0.8;

  // Calories = MET * weight (kg) * time (hrs)
  const hours = durationMins / 60;
  return Math.round(baseMet * weightKg * hours);
}

// FUTURE ARCHITECTURE PLACEHOLDERS
export function parseWorkoutString(workoutText: string) {
  // Prep for future NLP/Gemini workout parsing
  return {
    raw: workoutText,
    detected_exercises: []
  };
}

// 🧠 CENTRALIZED DYNAMIC CALORIE ENGINE
export function calculateDynamicBurn(profile: any, logs: any[]) {
  const bmr = profile?.bmr || 1500;
  let stepsBurn = 0;
  let workoutBurn = 0;
  let activityBurn = 0;

  logs.forEach(log => {
    if (log.log_type === 'steps') {
      stepsBurn += (Number(log.data?.amount) || 0) * 0.04;
    } else if (log.log_type === 'workout') {
      const duration = Number(log.data?.duration) || 30; // default 30 mins
      workoutBurn += duration * 5; // approx 5 kcal/min
    } else if (log.log_type === 'activity') {
      activityBurn += Number(log.data?.estimated_calories) || 0;
    }
  });

  // Passive burn (Thermic effect of food / NEAT estimation) -> roughly 10% of BMR
  const passiveBurn = bmr * 0.1;

  const totalBurn = bmr + stepsBurn + workoutBurn + activityBurn + passiveBurn;
  return Math.round(totalBurn);
}

// 🧠 AI + HYBRID WORKOUT SUGGESTION ENGINE
export function generateWorkoutSuggestions(profile: any) {
  const target = (profile?.primary_target || profile?.goal || '').toLowerCase();

  if (target.includes('six_pack') || target.includes('abs')) {
    return ["Crunches", "Plank", "Mountain Climbers", "Leg Raises", "Russian Twists"];
  }
  if (target.includes('fat_loss') || target.includes('lean')) {
    return ["HIIT Sprint", "Jump Rope", "Burpees", "Cycling", "Jumping Jacks"];
  }
  if (target.includes('muscle') || target.includes('gain') || target.includes('athletic')) {
    return ["Push-ups", "Pull-ups", "Squats", "Deadlifts", "Bench Press"];
  }
  if (target.includes('height') || target.includes('posture')) {
    return ["Cobra Stretch", "Hanging", "Pelvic Shift", "Cat Cow", "Downward Dog"];
  }
  if (target.includes('stamina') || target.includes('30_days')) {
    return ["Running", "Rowing", "Burpees", "Jump Rope", "Box Jumps"];
  }

   // Personality adjustments targeting
  if (pStyle.includes('calm') || pStyle.includes('analytical')) {
    suggestions.push("Yoga", "Mobility Drills");
  } else if (pStyle.includes('aggressive') || pStyle.includes('competitive')) {
    suggestions.push("Heavy Deadlifts", "Sprint Intervals");
  }

  // Deduplicate and return top 6 optimal suggestions
  return Array.from(new Set(suggestions)).slice(0, 6);
}

  // Fallback structural suggestions
  return ["Push-ups", "Running", "Squats", "Plank", "Stretching"]; 
}
