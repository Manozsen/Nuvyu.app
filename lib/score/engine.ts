export function calculateDailyScore(logs: any[], onboardingScore: number = 50) {
  try {
    let totalSteps = 0;
    let totalWater = 0;
    let workoutLogsCount = 0;
    let lastLogTime = 0;
    const logsCount = logs.length;

    // Single pass to aggregate required metrics (No duplicate loops in system)
    logs.forEach(log => {
      const val = Number(log.data?.amount) || 0;
      if (log.log_type === 'steps') totalSteps += val;
      if (log.log_type === 'water') totalWater += val;
      if (log.log_type === 'workout') workoutLogsCount += 1;
      
      const logTime = new Date(log.created_at).getTime();
      if (logTime > lastLogTime) lastLogTime = logTime;
    });

    // 1. Behavior Variables
    const effectiveSteps = Math.min(totalSteps, 12000);
    let steps_points = 0;
    let water_points = 0;
    let log_bonus = 0;
    let workout_bonus = 0;
    let inactivity_penalty = 0;

    // 2. Score Rules
    if (effectiveSteps >= 6000) steps_points = 20;
    else if (effectiveSteps >= 3000) steps_points = 10;

    if (totalWater >= 2000) water_points = 15;
    else if (totalWater >= 1000) water_points = 8;

        // Fix 1: Anti-spam Log Bonus (Count UNIQUE log types only)
    const uniqueLogTypes = new Set(logs.map(log => log.log_type));
    if (uniqueLogTypes.size >= 2) log_bonus = 5;
    
    // Fix 2: Anti-spam Workout Bonus (Capped at 10 max)
    if (workoutLogsCount > 0) workout_bonus = Math.min(workoutLogsCount * 5, 10);

    // 3. Penalty Engine (Fix 3: Fair Timing)
    const currentHour = new Date().getHours();
    
    // Do not punish users too early in the day
    if (currentHour < 14) {
      inactivity_penalty = 0;
    } else if (logsCount === 0) {
      // Time-aware penalty: Less aggressive timing for 0 logs
      if (currentHour >= 18) inactivity_penalty = -10;
      else if (currentHour >= 14) inactivity_penalty = -5;
    } else {
      // Existing decay penalty applies, but only activates after 2 PM
      const hoursSinceLast = (Date.now() - lastLogTime) / (1000 * 60 * 60);
      if (hoursSinceLast >= 6) inactivity_penalty = -10;
      else if (hoursSinceLast >= 4) inactivity_penalty = -5;
    }

    // 4. Final Calculation & Clamp
    let finalScore = onboardingScore + steps_points + water_points + log_bonus + workout_bonus + inactivity_penalty;
    finalScore = Math.max(0, Math.min(100, Math.floor(finalScore)));

    // Development Debug Safety
    if (process.env.NODE_ENV === 'development') {
      console.log("=== SCORE ENGINE DEBUG ===", {
        baseScore: onboardingScore, steps_points, water_points, log_bonus, workout_bonus, inactivity_penalty, finalScore
      });
    }

    return { 
      finalScore, 
      breakdown: { steps_points, water_points, log_bonus, workout_bonus, inactivity_penalty },
      // Return aggregated totals to prevent needing another loop in the dashboard/log pages
      totals: { totalSteps, totalWater, workoutLogsCount, logsCount, lastLogTime }
    };

  } catch (error) {
    console.error("Score Engine Error:", error);
    // Fail Safe: Return Base Score
    return { 
      finalScore: onboardingScore, 
      breakdown: { steps_points: 0, water_points: 0, log_bonus: 0, workout_bonus: 0, inactivity_penalty: 0 },
      totals: { totalSteps: 0, totalWater: 0, workoutLogsCount: 0, logsCount: 0, lastLogTime: 0 }
    };
  }
}

// FUTURE PREP: SLEEP & RECOVERY (Lightweight Architecture)
export function calculateRecoveryScore(sleepHours: number, sleepQuality: string) {
  let recoveryScore = 50; // Base
  if (sleepHours >= 7) recoveryScore += 30;
  else if (sleepHours >= 5) recoveryScore += 10;
  
  if (sleepQuality === 'Excellent') recoveryScore += 20;
  if (sleepQuality === 'Poor') recoveryScore -= 10;
  
  return Math.max(0, Math.min(100, recoveryScore));
}
