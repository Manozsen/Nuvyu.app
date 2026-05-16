export function calculateRecoveryScore(sleepHours: number, sleepQuality: string, screenHours: number = 0) {
  let score = 50; // Base score

  // Hours logic
  if (sleepHours >= 8) score += 30;
  else if (sleepHours >= 6) score += 15;
  else score -= 20;

  // 🧠 SCREEN RECOVERY INTELLIGENCE (Fatigue Penalty)
  if (screenHours >= 8) score -= 25;
  else if (screenHours >= 5) score -= 10;

  // Quality logic
  const quality = sleepQuality.toLowerCase();
  if (quality === 'good' || quality === 'excellent') score += 20;
  else if (quality === 'poor') score -= 20;
  else score += 5; // Average

  const recovery_score = Math.max(0, Math.min(100, score));

  // State derivation
  let recovery_state = "moderate";
  if (recovery_score >= 80) recovery_state = "excellent";
  else if (recovery_score >= 60) recovery_state = "good";
  else if (recovery_score < 40) recovery_state = "poor";

  // Fatigue risk
  let fatigue_risk = "low";
  if (recovery_score < 40 || sleepHours < 5) fatigue_risk = "high";
  else if (recovery_score < 60) fatigue_risk = "moderate";

    return {
    recovery_score,
    recovery_state,
    fatigue_risk
  };
}

// 🧠 PREDICTIVE RECOVERY SYSTEM v2
export function detectBurnoutRisk(recovery_score: number, sleepHours: number, consecutiveDaysActive: number, energyDeficit: number, recentRecoveryScores: number[] = []) {
  let burnout_risk = "low";
  const signals = [];

  if (sleepHours > 0 && sleepHours < 6) signals.push("sleep_debt");
  if (recovery_score < 50) signals.push("low_recovery");
  if (consecutiveDaysActive > 5 && recovery_score < 60) signals.push("overtraining_risk");
  if (energyDeficit > 1000) signals.push("severe_calorie_deficit");
  if (signals.length >= 2) burnout_risk = "high";
  else if (signals.length === 1) burnout_risk = "medium";

  // 🧠 PREDICTIVE RECOVERY INTELLIGENCE
  const burnout_probability = Math.min(100, signals.length * 30 + (recovery_score < 40 ? 25 : 0));
  
  // Calculate Recovery Momentum (Positive/Negative Trajectory)
  let recovery_momentum = "stable";
  if (recentRecoveryScores.length >= 2) {
    if (recentRecoveryScores[0] < recentRecoveryScores[1]) recovery_momentum = "declining";
    if (recentRecoveryScores[0] > recentRecoveryScores[1] + 10) recovery_momentum = "improving";
  }

  return { 
    risk_level: burnout_risk, 
    signals, 
    burnout_probability,
    recovery_momentum 
  };
}

// 🧠 ADHERENCE PREDICTION ENGINE
export function predictAdherenceRisk(recoveryScore: number, streakCount: number, recentConsistency: string) {
  let adherence_risk = "low";
  const consistency_flags = [];

  const safeConsistency = String(recentConsistency).toLowerCase();
  if (safeConsistency === "struggling" || safeConsistency === "needs_improvement") consistency_flags.push("routine_inconsistency");
  if (recoveryScore < 50) consistency_flags.push("fatigue_driven_dropoff");
  if (streakCount === 0) consistency_flags.push("streak_collapse_risk");

   if (consistency_flags.length >= 2) adherence_risk = "high";
  else if (consistency_flags.length === 1) adherence_risk = "medium";

  // 🧠 PREDICTIVE RECOVERY INTELLIGENCE: Adherence Drop Risk
  let adherence_drop_probability = 10;
  if (adherence_risk === "high") adherence_drop_probability = 85;
  else if (adherence_risk === "medium") adherence_drop_probability = 45;

  return { 
    adherence_risk, 
    consistency_flags,
    motivation_stability: adherence_risk === "high" ? "declining" : "stable",
    adherence_drop_probability
  };
}



