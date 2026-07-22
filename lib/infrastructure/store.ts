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

export interface CanonicalDashboardState {
  identity: { goal: string; level: number; xp: number };
  recovery: { state: 'optimal' | 'moderate' | 'poor'; score: number };
  fatigue: { risk: 'low' | 'elevated' | 'high'; mentalLoad: string };
  momentum: { score: number; trend: string };
  nutrition: { caloriesIn: number; proteinHit: boolean };
  hydration: { waterIntake: number };
  movement: { steps: number; activeBurn: number };
  sleep: { hours: number };
  targets: any[]; // CanonicalTarget[]
  progress: { score: number; scoreSummary: string };
  notifications: any[];
  syncStatus: { isOffline: boolean; lastSync: number };
  aiContext: { coachMessage: string; interventionMode: string };
  healthContext: { [key: string]: any };
  lastUpdated: number;
  loadingState: 'loading' | 'ready' | 'syncing' | 'error';
  errorState: string | null;
}

const initialState: CanonicalDashboardState = {
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
