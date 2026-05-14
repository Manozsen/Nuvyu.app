export function calculateRecoveryScore(sleepHours: number, sleepQuality: string) {
  let score = 50; // Base score

  // Hours logic
  if (sleepHours >= 8) score += 30;
  else if (sleepHours >= 6) score += 15;
  else score -= 20;

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

// 🧠 PREDICTIVE RECOVERY SYSTEM
export function detectBurnoutRisk(recovery_score: number, sleepHours: number, consecutiveDaysActive: number, energyDeficit: number) {
  let burnout_risk = "low";
  const signals = [];

  if (sleepHours > 0 && sleepHours < 6) signals.push("sleep_debt");
  if (recovery_score < 50) signals.push("low_recovery");
  if (consecutiveDaysActive > 5 && recovery_score < 60) signals.push("overtraining_risk");
  if (energyDeficit > 1000) signals.push("severe_calorie_deficit");

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

  return { 
    adherence_risk, 
    consistency_flags,
    motivation_stability: adherence_risk === "high" ? "declining" : "stable"
  };
}


