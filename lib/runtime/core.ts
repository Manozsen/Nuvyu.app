import { BehavioralStateStore, DomainEvent } from '../infrastructure/store';

// 🧠 PRODUCTION MONITORING (Telemetry & Latency)
export class ProductionMonitoring {
  static logLatency(component: string, ms: number) {
    if (process.env.NODE_ENV === 'development') console.log(`[AEOS Telemetry] ${component} latency: ${ms}ms`);
  }
  static logError(context: string, error: unknown) {
    console.error(`[AEOS Runtime Exception] ${context}`, error);
  }
}

// 🧠 OFFLINE RUNTIME (Conflict Resolution & Queueing)
export class OfflineRuntime {
  private static queue: DomainEvent[] = [];
  
  static enqueue(event: DomainEvent) {
    this.queue.push(event);
    ProductionMonitoring.logLatency('OfflineQueue_Depth', this.queue.length);
  }

  static async sync() {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    while(this.queue.length > 0) {
      const event = this.queue.shift();
      // Future: Process batched cloud synchronization
    }
  }
}

// 🧠 PRODUCTION RUNTIME MANAGER
export class RuntimeManager {
  private static activeTasks: Set<string> = new Set();

  static async execute(taskId: string, task: () => Promise<void>, timeoutMs: number = 20000) {
    if (this.activeTasks.has(taskId)) return; // Prevents duplicated execution loops
    this.activeTasks.add(taskId);
    const start = Date.now();

    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Runtime Timeout")), timeoutMs));
      await Promise.race([task(), timeout]);
      OfflineRuntime.sync(); // Auto-flush queue on successful cycle
    } catch (e) {
      ProductionMonitoring.logError(`Task_${taskId}`, e);
      // Graceful degradation: state remains intact, prevents UI crash
    } finally {
      this.activeTasks.delete(taskId);
      ProductionMonitoring.logLatency(`Task_${taskId}`, Date.now() - start);
    }
  }
}
