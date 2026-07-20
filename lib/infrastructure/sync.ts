import { DomainCommand, DomainEvent, BehavioralStateStore } from './store';

// 🧠 OFFLINE-FIRST SYNC ENGINE
export class SyncScheduler {
  private static offlineQueue: DomainCommand[] = [];

  static pushCommand(command: DomainCommand) {
    if (!this.isOnline()) {
      this.offlineQueue.push(command);
      // Optimistic Event Dispatch
      BehavioralStateStore.dispatch({ type: 'ActionLogged', payload: command.payload, timestamp: Date.now() });
      return;
    }
    this.processCommand(command);
  }

  private static isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
  }

  private static processCommand(command: DomainCommand) {
    // Cloud sync logic executes here. Upon success:
    BehavioralStateStore.dispatch({ type: 'StateUpdated', payload: { lastSync: Date.now() }, timestamp: Date.now() });
  }

  static flushQueue() {
    if (this.isOnline() && this.offlineQueue.length > 0) {
      const queue = [...this.offlineQueue];
      this.offlineQueue = [];
      queue.forEach(cmd => this.processCommand(cmd));
    }
  }
}
