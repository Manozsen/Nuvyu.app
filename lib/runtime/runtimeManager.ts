import { ProductionMonitoring, OfflineRuntime } from './core';

// 🧠 ARCHITECTURE FREEZE: CANONICAL RUNTIME MANAGER
// The only authorized execution pipeline in the system.
export class RuntimeManager {
  private static activeTasks: Set<string> = new Set();

  static async execute(taskId: string, task: () => Promise<void>, timeoutMs: number = 20000) {
    if (this.activeTasks.has(taskId)) return;
    this.activeTasks.add(taskId);
    const start = Date.now();

    try {
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Runtime Timeout")), timeoutMs));
      await Promise.race([task(), timeout]);
      OfflineRuntime.sync(); 
    } catch (e) {
      ProductionMonitoring.logError(`Task_${taskId}`, e);
    } finally {
      this.activeTasks.delete(taskId);
      ProductionMonitoring.logLatency(`Task_${taskId}`, Date.now() - start);
    }
  }
}
