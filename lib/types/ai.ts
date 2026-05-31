import { RecoveryState, FatigueRisk } from './recovery';

export interface AIContext {
  goal: string;
  activity_level: string;
  steps_today: number;
  water_today: number;
  avg_steps: number;
  avg_water: number;
  behavior_type: string;
  score: number;
  age: number;
  gender: string;
  recent_behavior_pattern: any;
  last_3_messages: string[];
  consistency_level: string;
  sleep_average: number;
  target: string;
  recovery_state: RecoveryState;
  fatigue_risk: FatigueRisk;
  energy_balance: number;
  motivation: string;
  timeline: string;
  user_consistency_type: string;
  personality_style: string;

  // 🧠 ABOS STRICT RUNTIME METADATA PACKETS
  operating_state?: { operating_state: string; operating_confidence: number; state_reason: string; };
  intervention_engine?: { intervention_mode: string; intervention_confidence: number; intervention_reason: string; intervention_priority: string; };
  autonomous_priority?: { priority_1: string; priority_2: string; priority_3: string; priority_4: string; priority_reasoning: string; };
  recovery_roi?: { roi_action: string; roi_score: number; expected_recovery_gain: string; expected_adherence_gain: string; };
  energy_allocation?: { energy_distribution: { physical: number; cognitive: number; emotional: number }; energy_load: string; recommended_focus: string; };
  compound_engine?: { compound_chain: string; keystone_behavior: string; compound_strength: string; compound_risk: string; };
  leverage_engine?: { leverage_behavior: string; leverage_confidence: number; leverage_reason: string; secondary_leverage: string; };
  scenario_simulator?: { scenario_projection: string; burnout_projection: string; recovery_projection: string; adherence_projection: string; stability_projection: string; };
  lifeload_packet?: { lifeload_score: number; lifeload_level: string; lifeload_confidence: string; dominant_load_driver: string; };
  cognitive_energy_packet?: { cognitive_freshness: string; cognitive_fatigue: string; mental_recovery: string; attention_capacity: string; mental_load: string; };
  decision_fatigue_packet?: { fatigue_score: number; fatigue_level: string; overload_source: string; confidence: string; };
  digital_twin_packet?: { physical_recovery: string; behavioral_recovery: string; mental_recovery: string; recovery_confidence: number; recovery_divergence: boolean; recovery_consistency: boolean; recovery_trajectory: string; };
  capacity_budget?: { available_effort_units: number; max_friction_tolerance: string; };
  forecast_packet?: { adherence_risk_3d: string; recovery_decline_risk_3d: string; hydration_decline_risk_3d: string; burnout_escalation_risk_3d: string; inactivity_risk_3d: string; };
}

