// 🧠 WORKOUT & MANUAL ACTIVITY INTELLIGENCE
// Predicts sets/reps/duration for fast logging

export function suggestWorkoutConfig(exerciseQuery: string) {
  const q = exerciseQuery.toLowerCase().trim();
  
  if (q.includes('pushup') || q.includes('pullup') || q.includes('squat')) {
    return { type: 'reps', sets: 3, reps: 15, duration_mins: 10, intensity: 'medium' };
  }
  if (q.includes('run') || q.includes('jog') || q.includes('walk') || q.includes('treadmill')) {
    return { type: 'cardio', sets: 1, reps: 0, duration_mins: 30, intensity: 'medium' };
  }
  if (q.includes('plank')) {
    return { type: 'duration', sets: 3, reps: 0, duration_mins: 5, intensity: 'high' };
  }
  if (q.includes('trek') || q.includes('hike')) {
    return { type: 'outdoor', sets: 1, reps: 0, duration_mins: 120, intensity: 'high' };
  }
  if (q.includes('swim') || q.includes('cycle') || q.includes('football') || q.includes('cricket')) {
    return { type: 'sports', sets: 1, reps: 0, duration_mins: 60, intensity: 'high' };
  }
  if (q.includes('yoga') || q.includes('stretch')) {
    return { type: 'recovery', sets: 1, reps: 0, duration_mins: 20, intensity: 'low' };
  }

  // Default Fallback
  return { type: 'custom', sets: 3, reps: 10, duration_mins: 30, intensity: 'medium' };
}
