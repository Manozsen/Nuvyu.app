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

  // 🧠 PHASE 5: BURNOUT ESCALATION MODEL
  let burnout_trajectory = "recovery_phase";
  if (burnout_risk === "high" && recovery_momentum === "declining") burnout_trajectory = "severe_burnout";
  else if (burnout_risk === "high") burnout_trajectory = "moderate_burnout";
  else if (burnout_risk === "medium") burnout_trajectory = "early_burnout";

  return { 
    risk_level: burnout_risk, 
    signals, 
    burnout_probability,
    recovery_momentum,
    burnout_trajectory_packet: {
      trajectory: burnout_trajectory,
      escalation_speed: recovery_momentum === "declining" ? "fast" : "stable"
    }
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

// 🧠 PHASE 2: RECOVERY DEBT ACCUMULATOR
export function calculateRecoveryDebt(recentSleep: number[], recentScores: number[]) {
  const sleep_debt = recentSleep.reduce((acc, hrs) => acc + Math.max(0, 8 - hrs), 0);
  const score_debt = recentScores.reduce((acc, score) => acc + Math.max(0, 80 - score), 0);
  
  return {
    sleep_debt_accumulation: Math.round(sleep_debt * 10) / 10,
    fatigue_accumulation: Math.round(score_debt),
    burnout_accumulation: score_debt > 60 && sleep_debt > 6 ? "critical" : score_debt > 30 ? "elevated" : "stable"
  };
}

// 🧠 PHASE 6: RECOVERY RESILIENCE SCORE
export function calculateResilienceScore(recentScores: number[]) {
  if (!recentScores || recentScores.length < 3) return 50;
  
  let resilience = 50;
  let drops = 0;
  let rebounds = 0;

  for (let i = 0; i < recentScores.length - 1; i++) {
    const current = recentScores[i];
    const next = recentScores[i+1];
    if (next < current - 15) drops++;
    if (next > current + 15) rebounds++;
  }

  resilience -= (drops * 10);
  resilience += (rebounds * 15);
  
  return Math.max(0, Math.min(100, Math.round(resilience)));
}

// 🧠 PHASE 3: RECOVERY RESILIENCE INTELLIGENCE v2
export function calculateResiliencePacket(recentScores: number[]) {
  const score = calculateResilienceScore(recentScores);
  return {
    resilience_score: score,
    resilience_trend: recentScores.length >= 2 ? (recentScores[0] > recentScores[1] ? "improving" : "degrading") : "stable",
    bounce_back_speed: score > 70 ? "fast" : score > 40 ? "moderate" : "slow",
    resilience_degradation: score < 40,
    recovery_adaptability: score > 60 ? "high" : "low",
    resilience_confidence: recentScores.length >= 3 ? "high" : "low"
  };
}

// 🧠 PHASE 1: BEHAVIORAL FORECASTING ENGINE
export function generateForecastPacket(recentScores: number[], adherence_risk: string, resilience_packet: any) {
  const scoreTrend = recentScores.length >= 2 ? recentScores[0] - recentScores[1] : 0;
  
  return {
    adherence_risk_3d: adherence_risk === "high" ? "high" : adherence_risk === "medium" ? "moderate" : "low",
    recovery_decline_risk_3d: scoreTrend < -10 ? "high" : "low",
    hydration_decline_risk_3d: "low", // Dynamically synced down the pipeline
    burnout_escalation_risk_3d: (adherence_risk === "high" && resilience_packet.resilience_score < 40) ? "high" : "low",
    inactivity_risk_3d: scoreTrend < -15 ? "high" : "low"
  };
}



