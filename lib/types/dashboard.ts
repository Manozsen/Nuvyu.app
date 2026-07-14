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
  burnout_risk: string; // 🧠 PHASE 13D.5: Missing Top-Level Type Fixed
  score_summary: string;
  streak_count: number;
  best_streak: number;
  reward_message: string;
  xp: number;
  level: number;

 // 🧠 ABOS DYNAMIC LOAD EXPOSURE
  lifeload_packet?: { lifeload_score: number; lifeload_level: string; lifeload_confidence: string; dominant_load_driver: string; };
  cognitive_energy_packet?: { cognitive_freshness: string; cognitive_fatigue: string; mental_recovery: string; attention_capacity: string; mental_load: string; };
  decision_fatigue_packet?: { 
    fatigue_score: number; 
    fatigue_level: string; 
    overload_source: string; 
    confidence: string; 
    decision_budget?: {
      budget_status: string;
      mental_load: string;
      recommendation: string;
      reason_chain?: string[];
    };
  };

  // 🧠 PHASE 12 BEHAVIORAL EXPOSURE
  goal_packet?: GoalPacket;
  commitment_packet?: CommitmentPacket;
  challenge_packet?: ChallengePacket;
  nutrition_adherence_packet?: NutritionAdherencePacket;

  // 🧠 PHASE 13 — NARRATIVE & ABOS SYSTEM EXPOSURE
  today_logs?: DailyLog[];
  behavioral_memory_packet?: BehavioralMemoryPacket | null;
  trend_packet?: TrendPacket;
  adaptation_mode?: string;
  capacity_packet?: { capacity_score: number; capacity_level: string; limiting_factor: string; };
  capacity_budget?: { available_effort_units: number; max_friction_tolerance: string; };
  strain_packet?: { standing_hours: number; walking_hours: number; mental_load: string; dominant_driver: string; recommended_adjustment: string; confidence: string; daily_strain_score: number; };
  forecast_packet?: { transition_text: string; };
  coach_context_packet?: { serialized_state: string; priority_directive: string; llm_routing_flag: boolean; };
  operating_state?: { operating_state: string; };
  intervention_engine?: { intervention_mode: string; };
  recovery_roi?: { roi_action: string; };
  energy_allocation?: { recommended_focus: string; };
}

export interface DailyLog {
  id?: string | number;
  log_type: string;
  data?: Record<string, unknown>;
  created_at: string;
}

export interface TrendPacket {
  today_trend: string;
  weekly_trend: string;
  behavior_drift: string;
  momentum_score: number;
  momentum_direction?: string;
  consistency_score?: number;
  habit_velocity?: string;
  trajectory?: string;
  confidence?: string;
  reason_chain?: string[];
}

export interface BehavioralMemoryPacket {
  adherence_drift: string;
  hydration_behavior: string;
  sleep_behavior: string;
  memory_confidence: number;
  trend_packet?: TrendPacket;
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


