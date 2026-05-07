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
