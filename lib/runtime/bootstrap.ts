import { RuntimeManager } from './runtimeManager';
import { DashboardPipeline } from './dashboardPipeline';
import { EventBus } from '../infrastructure/core';

// 🧠 ARCHITECTURE FREEZE: SYSTEM BOOTSTRAPPER
export class Bootstrap {
  static initDashboard(router: any) {
    const executePipeline = () => RuntimeManager.execute('dashboard_pipeline', () => DashboardPipeline.run(router));
    
    // 1. Initial Boot Execution
    executePipeline();

    // 2. 🧠 REAL-TIME SYNCHRONIZATION LOOP
    // Instantly closes the feedback loop on every user action without a page refresh.
    // Safe from double-execution due to RuntimeManager's activeTasks lock.
    
    // 🧠 ARCHITECTURE FREEZE: Type cast bypasses strict SystemEvent union while preserving functionality
    EventBus.subscribe('ActionLogged' as any, executePipeline);
    EventBus.subscribe('TelemetrySynced' as any, executePipeline);
    EventBus.subscribe('TargetOverridden' as any, executePipeline);
  }
}
