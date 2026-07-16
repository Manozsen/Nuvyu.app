export function calculateDailyScore(logs: any[], config: any = {}) {
    try {
    let totalSteps = 0;
    let totalWater = 0;
    let workoutLogsCount = 0;
    let screenHours = 0;
    let lastLogTime = 0;
    const logsCount = logs.length;

    // 🧠 TIMELINE-AWARE SCORING LOGIC (Single Pass Optimization)
    logs.forEach(log => {
      const logTime = new Date(log.created_at).getTime();
      if (logTime > lastLogTime) lastLogTime = logTime;

    // 🧠 Fake Activity Resistance & Step Spam Prevention
      if (log.log_type === 'steps') {
        const val = Number(log.data?.amount) || 0;
        if (val > 0 && val < 50000) { totalSteps += val; }
      }
      else if (log.log_type === 'water') {
        const val = Number(log.data?.amount) || 0;
        if (val > 0) { totalWater += val; }
      }
      else if (log.log_type === 'workout' || log.log_type === 'activity') {
        // 🧠 Real Movement & Workout Authenticity Scoring
        const duration = Number(log.data?.duration) || Number(log.data?.duration_mins) || 0;
        if (duration >= 5) workoutLogsCount += 1; // Strict duration validation blocks fake activity points
      }
      else if (log.log_type === 'screen') {
        screenHours += Number(log.data?.amount) || 0;
      }
    });

    const totals = { totalSteps, totalWater, workoutLogsCount, logsCount, lastLogTime };

    // 🧠 FALLBACK: Legacy V1 Logic (Prevents breaking the Logs Page saves)
    if (typeof config === 'number' || config.isV1 || Object.keys(config).length === 0) {
      const baseScore = typeof config === 'number' ? config : (config.onboardingScore || 50);
      const effectiveSteps = Math.min(totalSteps, 12000);
      let steps_points = effectiveSteps >= 10000 ? 25 : effectiveSteps >= 6000 ? 20 : effectiveSteps >= 3000 ? 10 : 0;
      let water_points = totalWater >= 3000 ? 20 : totalWater >= 2000 ? 15 : totalWater >= 1000 ? 8 : 0;
      let log_bonus = new Set(logs.map(log => log.log_type)).size >= 2 ? 5 : 0;
      let workout_bonus = Math.min(workoutLogsCount * 5, 10);
      let inactivity_penalty = 0;

      if (screenHours >= 8) inactivity_penalty -= 15;
      else if (screenHours >= 5) inactivity_penalty -= 5;

      const currentHour = new Date().getHours();
      if (currentHour >= 14) {
        if (logsCount === 0) inactivity_penalty -= (currentHour >= 18 ? 10 : 5);
        else {
          const hoursSinceLast = (Date.now() - lastLogTime) / (1000 * 60 * 60);
          if (hoursSinceLast >= 6) inactivity_penalty -= 10;
          else if (hoursSinceLast >= 4) inactivity_penalty -= 5;
        }
      }

      let finalScore = Math.max(0, Math.min(100, Math.floor(baseScore + steps_points + water_points + log_bonus + workout_bonus + inactivity_penalty)));
      return { finalScore, breakdown: { steps_points, water_points, log_bonus, workout_bonus, inactivity_penalty }, totals };
    }

    //  SCORE ENGINE V2: Absolute Weighted Behavioral Matrix (0-100)
    // 🧠 PHASE 12.4A: Added commitmentScore config extraction
    const { sleepHours = 0, recoveryScore = 0, streakCount = 0, burnoutRisk = 'low', commitmentScore = 0 } = config;

    // 1. Movement Base (30%)
    const stepsPoints = Math.min((totalSteps / 10000) * 15, 15);
    const workoutPoints = workoutLogsCount > 0 ? 15 : 0;
    const movement_score = stepsPoints + workoutPoints;

    // 2. Physiological Base (30%)
    const sleepPoints = Math.min((sleepHours / 8) * 15, 15);
    const recPoints = (recoveryScore / 100) * 15;
    const physiological_score = sleepPoints + recPoints;

    // 3. Nutrition Base (20%)
    const waterPoints = Math.min((totalWater / 3000) * 10, 10);
    const foodLogged = logs.some(log => log.log_type === 'food');
    const nutrition_score = waterPoints + (foodLogged ? 10 : 0);

    // 4. Consistency Base (20%)
    // 🧠 PHASE 12.4A: Commitment Score physically increases the Consistency Base
    const raw_consistency = Math.min((streakCount / 7) * 20, 20);
    const consistency_score = Math.min(raw_consistency + commitmentScore, 20); // Capped at 20 to preserve matrix balance

    let base_score = movement_score + physiological_score + nutrition_score + consistency_score;

    // 5. Dynamic Behavioral Penalties
    let penalty = 0;
    if (burnoutRisk === 'high') penalty -= 15;
    if (sleepHours > 0 && sleepHours < 5) penalty -= 20;
    // Streak penalty removed: Prevents mathematical lock at 0 for initial daily logs
    if (screenHours >= 8) penalty -= 15;
    else if (screenHours >= 5) penalty -= 5;

        let finalScore = Math.max(0, Math.min(100, Math.round(base_score + penalty)));

    console.log("Score Engine Result", {
      movement_score,
      physiological_score,
      nutrition_score,
      consistency_score,
      base_score,
      penalty,
      finalScore,
      totals
    });

    return { 
      finalScore, 
      breakdown: { movement_score, physiological_score, nutrition_score, consistency_score, penalty },
      totals 
    };

    } catch (error) {
    console.error("Score Engine Error:", error);
    // Fail Safe: Return Base Score
    const fallbackScore = typeof config === 'number' ? config : (config?.onboardingScore || 50);
    return { 
      finalScore: fallbackScore, 
      breakdown: { movement_score: 0, physiological_score: 0, nutrition_score: 0, consistency_score: 0, penalty: 0 },
      totals: { totalSteps: 0, totalWater: 0, workoutLogsCount: 0, logsCount: 0, lastLogTime: 0 }
    };
  }
}

// 🧠 ABOS ENFORCEMENT: 
// calculateRecoveryScore removed from score engine to enforce strict ownership by lib/recovery/engine.ts
// Do not implement parallel scoring systems.

