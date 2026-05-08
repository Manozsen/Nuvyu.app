// STRICT ENUMS: Prevents random strings ("poor", "bad", "unknown")
export type RecoveryState = "optimal" | "moderate" | "fatigued" | "overtrained";
export type FatigueRisk = "low" | "medium" | "high";

export interface RecoveryData {
  sleep_hours: number;
  sleep_quality?: string;
  recovery_score: number;
  recovery_state: RecoveryState;
  fatigue_risk: FatigueRisk;
}
