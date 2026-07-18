import { CanonicalTarget } from '../target/engine';

// 🧠 EVENT DRIVEN ARCHITECTURE
export type SystemEvent = 'LogCompleted' | 'HealthConnectSynced' | 'StateUpdated' | 'AIContextGenerated';

export class EventBus {
  private static listeners: Record<string, Function[]> = {};

  static subscribe(event: SystemEvent, callback: Function) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return { unsubscribe: () => { this.listeners[event] = this.listeners[event].filter(cb => cb !== callback); }};
  }

  static publish(event: SystemEvent, payload: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(payload));
    }
  }
}

// 🧠 SYNC SERVICE ABSTRACTION
// Isolates Supabase, Android Room DB, and Health Connect from the UI.
export class SyncService {
  static async initializeOrchestration(userId: string) {
    // Conceptual: Fetches offline queue -> Syncs to Cloud -> Pulls updates -> Emits Event
    EventBus.publish('StateUpdated', { timestamp: Date.now() });
  }

  static async logAction(userId: string, actionType: string, value: number) {
    // Conceptual: Writes to DB -> Invokes Engines -> Emits Event
    EventBus.publish('LogCompleted', { actionType, value });
    EventBus.publish('StateUpdated', { timestamp: Date.now() }); // Triggers UI re-render
  }
}
