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
}
