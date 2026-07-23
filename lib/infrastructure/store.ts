// 🧠 CANONICAL BEHAVIOR STATE STORE
// Centralized, observable state engine. Replaces scattered React component state.

export type CommandType = 'LOG_ACTION' | 'SYNC_TELEMETRY' | 'OVERRIDE_TARGET' | 'START_EXECUTION' | 'PAUSE_EXECUTION';
export type EventType = 
  | 'ActionLogged' 
  | 'TelemetrySynced' 
  | 'TargetOverridden' 
  | 'StateUpdated'
  | 'ExecutionStarted'
  | 'ExecutionPaused'
  | 'ExecutionCompleted'
  | 'ExecutionFailed'
  | 'WorkflowExpired'
  | 'ReflectionCompleted'
  | 'MemoryUpdated'
  | 'NotificationQueued';

export interface DomainCommand {
  type: CommandType;
  payload: any;
  timestamp: number;
}

export interface DomainEvent {
  type: EventType;
  payload: any;
  timestamp: number;
}

// 🧠 ARCHITECTURE FREEZE: CANONICAL BEHAVIORAL STATE
// The Single Source of Truth for the entire Operating System.
export interface BehavioralState {
  session: { loadingState: 'loading' | 'ready' | 'syncing' | 'error' };
  sync: { isOffline: boolean; lastSync: number };
  runtime: { activeTasks: string[]; lastError: string | null };
  user: { profile: any | null };
  dashboard: { scoreSummary: string };
  score: { current: number };
  coach: { message: string; type: string; strategy: any; executionPlan: any[] };
  targets: { goal_packet: any; capacity_packet: any; capacity_budget: any; adaptation_mode: string };
  progress: { logsCount: number; today_logs: any[] };
  activity: { steps: number; energy_burned: number };
  nutrition: { energy_intake: number; energy_balance: number; energy_stats: any; proteinHit: boolean };
  hydration: { waterIntake: number };
  workout: { workoutLogsCount: number };
  recovery: { sleep_hours: number; recovery_score: number; recovery_state: string; fatigue_risk: string; burnout_risk: string };
  analytics: { xp: number; level: number; todayXP: number; streak_count: number; best_streak: number };
}

const initialState: BehavioralState = {
  session: { loadingState: 'loading' },
  sync: { isOffline: false, lastSync: 0 },
  runtime: { activeTasks: [], lastError: null },
  user: { profile: null },
  dashboard: { scoreSummary: 'Initializing OS...' },
  score: { current: 0 },
  coach: { message: '', type: 'rule', strategy: null, executionPlan: [] },
  targets: { goal_packet: null, capacity_packet: null, capacity_budget: null, adaptation_mode: 'maintain' },
  progress: { logsCount: 0, today_logs: [] },
  activity: { steps: 0, energy_burned: 0 },
  nutrition: { energy_intake: 0, energy_balance: 0, energy_stats: null, proteinHit: false },
  hydration: { waterIntake: 0 },
  workout: { workoutLogsCount: 0 },
  recovery: { sleep_hours: 0, recovery_score: 0, recovery_state: 'moderate', fatigue_risk: 'low', burnout_risk: 'low' },
  analytics: { xp: 0, level: 1, todayXP: 0, streak_count: 0, best_streak: 0 }
};
  identity: { goal: 'maintenance', level: 1, xp: 0 },
  recovery: { state: 'moderate', score: 50 },
  fatigue: { risk: 'low', mentalLoad: 'optimal' },
  momentum: { score: 50, trend: 'stable' },
  nutrition: { caloriesIn: 0, proteinHit: false },
  hydration: { waterIntake: 0 },
  movement: { steps: 0, activeBurn: 0 },
  sleep: { hours: 0 },
  targets: [],
  progress: { score: 0, scoreSummary: '' },
  notifications: [],
  syncStatus: { isOffline: false, lastSync: 0 },
  aiContext: { coachMessage: '', interventionMode: 'stable' },
  healthContext: {},
  lastUpdated: 0,
  loadingState: 'loading',
  errorState: null
};

// 🧠 EVENT VALIDATION PIPELINE
class EventValidator {
  static validate(event: DomainEvent): boolean {
    if (!event || !event.type || !event.timestamp) return false;
    // Reject malformed or future-dated malicious payloads
    if (event.timestamp > Date.now() + 60000) return false;
    // (Future implementation: Deduplication via event ID checking)
    return true;
  }
}

export class BehavioralStateStore {
  private static state: CanonicalDashboardState = initialState;
  private static listeners: Set<Function> = new Set();

  static getState() { return this.state; }

  static dispatch(event: DomainEvent) {
    if (!EventValidator.validate(event)) {
      console.warn(`[EventBus] Rejected invalid event: ${event.type}`);
      return;
    }

    // 🧠 REDUCER: Mutates canonical state based on verified events only
    if (event.type === 'StateUpdated') {
      this.state = { ...this.state, ...event.payload, lastUpdated: Date.now(), loadingState: 'ready' };
    }
    if (event.type === 'TelemetrySynced') {
      this.state.syncStatus = { ...this.state.syncStatus, lastSync: event.timestamp };
    }
    
    this.listeners.forEach(listener => listener(this.state));
  }

  static subscribe(listener: Function) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
