import { BehavioralStateStore } from '../infrastructure/store';

// 🧠 OS INTEGRATION LAYER (Android/Wearables)
// Enforces Dependency Inversion for all hardware and proprietary software APIs.

export interface IHealthDataAdapter {
  authenticate(): Promise<boolean>;
  syncTelemetry(): Promise<void>;
}

export interface IHardwareSensorAdapter {
  startListening(): void;
  stopListening(): void;
}

export interface IOSWorkerAdapter {
  scheduleBackgroundSync(intervalMinutes: number): void;
  startForegroundService(title: string, body: string): void;
  cancelAllWorkers(): void;
}

export interface INotificationAdapter {
  schedule(id: string, title: string, body: string, triggerAt: number): void;
  cancel(id: string): void;
}

export interface IPermissionManager {
  requestAllRequired(): Promise<boolean>;
  checkBatteryOptimization(): Promise<boolean>;
}

// Concrete Implementations (Injected at Runtime)
export class HealthConnectAdapter implements IHealthDataAdapter {
  async authenticate() { return true; }
  async syncTelemetry() {
    BehavioralStateStore.dispatch({ type: 'TelemetrySynced', payload: { source: 'HealthConnect' }, timestamp: Date.now() });
  }
}

export class LegacyGoogleFitAdapter implements IHealthDataAdapter {
  async authenticate() { return true; }
  async syncTelemetry() { /* Fallback for older Android versions */ }
}

export class WearOSAdapter implements IHealthDataAdapter {
  async authenticate() { return true; }
  async syncTelemetry() { /* Direct watch syncing */ }
}

export class ActivityRecognitionAdapter implements IHardwareSensorAdapter {
  startListening() {}
  stopListening() {}
}

export class AndroidWorkerManager implements IOSWorkerAdapter {
  scheduleBackgroundSync(interval: number) {}
  startForegroundService(title: string, body: string) {}
  cancelAllWorkers() {}
}
