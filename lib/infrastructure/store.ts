// 🧠 CANONICAL BEHAVIOR STATE STORE
// Centralized, observable state engine. Replaces scattered React component state.

export type CommandType = 'LOG_ACTION' | 'SYNC_TELEMETRY' | 'OVERRIDE_TARGET';
export type EventType = 'ActionLogged' | 'TelemetrySynced' | 'TargetOverridden' | 'StateUpdated';

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

export interface BehavioralState {
  isReady: boolean;
  isOffline: boolean;
  lastSync: number;
  recoveryState: 'optimal' | 'moderate' | 'poor';
  fatigueRisk: 'low' | 'elevated' | 'high';
  momentumScore: number;
}

const initialState: BehavioralState = {
  isReady: false,
  isOffline: false,
  lastSync: 0,
  recoveryState: 'moderate',
  fatigueRisk: 'low',
  momentumScore: 50
};

export class BehavioralStateStore {
  private static state: BehavioralState = initialState;
  private static listeners: Set<Function> = new Set();

  static getState() { return this.state; }

  static dispatch(event: DomainEvent) {
    // 🧠 REDUCER: Mutates canonical state based on verified events only
    if (event.type === 'StateUpdated') {
      this.state = { ...this.state, ...event.payload, isReady: true };
    }
    if (event.type === 'TelemetrySynced') {
      this.state.lastSync = event.timestamp;
    }
    this.listeners.forEach(listener => listener(this.state));
  }

  static subscribe(listener: Function) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
