import { coachBrain } from '../intelligence/brain';
import { ProductionMonitoring } from './core';

// 🧠 AI RUNTIME (Timeout, Retry, Fallback)
export class AIRuntime {
  static async executeSafely(snapshot: any, tone: string, maxRetries = 2) {
    let attempt = 0;
    while (attempt <= maxRetries) {
      const start = Date.now();
      try {
        const promise = coachBrain.executePipeline(snapshot, tone);
        const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("AI Execution Timeout")), 8000));
        const result = await Promise.race([promise, timeout]);
        
        ProductionMonitoring.logLatency('AIRuntime_Execution', Date.now() - start);
        return result;
      } catch (e) {
        attempt++;
        ProductionMonitoring.logError(`AIRuntime_Attempt_${attempt}`, e);
        if (attempt > maxRetries) {
          // Guaranteed fallback response
          return { message: "Focus on maintaining your physical baseline today.", type: "rule", executionPlan: [] };
        }
      }
    }
  }
}
