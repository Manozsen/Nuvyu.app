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
}
