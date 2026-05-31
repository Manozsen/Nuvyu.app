import { EnergyStats } from './energy';
import { RecoveryState, FatigueRisk } from './recovery';

export interface DashboardMetrics {
  score: number;
  steps: number;
  water: number;
  logsCount: number;
  energy_burned: number;
  energy_intake: number;
  energy_stats: EnergyStats | null;
  energy_balance: number;
  sleep_hours: number;
  recovery_score: number;
  recovery_state: RecoveryState;
  fatigue_risk: FatigueRisk;
  score_summary: string;
  streak_count: number;
  best_streak: number;
  reward_message: string;
  xp: number;
  level: number;

  // 🧠 ABOS DYNAMIC LOAD EXPOSURE
  lifeload_packet?: { lifeload_score: number; lifeload_level: string; lifeload_confidence: string; dominant_load_driver: string; };
  cognitive_energy_packet?: { cognitive_freshness: string; cognitive_fatigue: string; mental_recovery: string; attention_capacity: string; mental_load: string; };
  decision_fatigue_packet?: { fatigue_score: number; fatigue_level: string; overload_source: string; confidence: string; };
}

