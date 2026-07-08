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

  // 🧠 PHASE 12 BEHAVIORAL EXPOSURE
  goal_packet?: GoalPacket;
  commitment_packet?: CommitmentPacket;
  challenge_packet?: ChallengePacket;
  nutrition_adherence_packet?: NutritionAdherencePacket;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🚀 PHASE 12.1 — FOUNDATION LAYER TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface GoalPacket {
  target_steps: number;
  target_water: number; // in ml
  target_sleep: number; // in hours
  target_protein: number; // in grams
  challenge_difficulty: 'Low' | 'Moderate' | 'High' | 'Extreme';
  goal_source: 'manual' | 'auto';
}

export interface CommitmentPacket {
  non_negotiables: string[];
  commitment_score: number;
  commitment_integrity_score: number;
  contract_completion_rate: number;
  status: 'active' | 'completed' | 'failed' | 'pending';
}

export interface ChallengePacket {
  challenge_id: string;
  challenge_name: string;
  challenge_type: string;
  start_date: string;
  end_date: string;
  completion_percentage: number;
  missed_days: number;
  success_probability: 'High' | 'Moderate' | 'Low';
  status: 'active' | 'completed' | 'failed' | 'pending';
}

export interface NutritionAdherencePacket {
  protein_target_hit: boolean;
  water_target_hit: boolean;
  sugar_avoidance_streak: number;
  adherence_score: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ RUNTIME-SAFE DEFAULTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const DEFAULT_GOAL_PACKET: GoalPacket = {
  target_steps: 6000,
  target_water: 3000,
  target_sleep: 7.5,
  target_protein: 50,
  challenge_difficulty: 'Moderate',
  goal_source: 'auto'
};

export const DEFAULT_COMMITMENT_PACKET: CommitmentPacket = {
  non_negotiables: [],
  commitment_score: 0,
  commitment_integrity_score: 100,
  contract_completion_rate: 0,
  status: 'pending'
};

export const DEFAULT_CHALLENGE_PACKET: ChallengePacket = {
  challenge_id: 'none',
  challenge_name: 'No Active Challenge',
  challenge_type: 'none',
  start_date: '',
  end_date: '',
  completion_percentage: 0,
  missed_days: 0,
  success_probability: 'Moderate',
  status: 'pending'
};

export const DEFAULT_NUTRITION_ADHERENCE_PACKET: NutritionAdherencePacket = {
  protein_target_hit: false,
  water_target_hit: false,
  sugar_avoidance_streak: 0,
  adherence_score: 0
};


