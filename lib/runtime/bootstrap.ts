import { RuntimeManager } from './runtimeManager';
import { DashboardPipeline } from './dashboardPipeline';

// 🧠 ARCHITECTURE FREEZE: SYSTEM BOOTSTRAPPER
export class Bootstrap {
  static initDashboard(router: any) {
    // Triggers the headless execution pipeline decoupled from React
    RuntimeManager.execute('dashboard_pipeline', () => DashboardPipeline.run(router));
  }
}
