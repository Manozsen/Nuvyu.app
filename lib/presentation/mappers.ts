import { CanonicalTarget } from '../target/engine';

export interface DashboardUITarget extends CanonicalTarget {
  ui: {
    action: string;
    focus: string;
    link: string;
    icon: string;
    color: string;
  };
}

export class DashboardTargetMapper {
  static map(target: CanonicalTarget): DashboardUITarget {
    const uiMap: Record<string, any> = {
      hydration: { action: 'Log Water', focus: 'Stay Hydrated', link: '/log', icon: 'droplets', color: 'text-blue-400' },
      movement: { action: 'Complete Walk', focus: 'Movement Priority', link: '/log', icon: 'footprints', color: 'text-[#00FFA3]' },
      nutrition: { action: 'Log Protein', focus: 'Recovery Fuel', link: '/log', icon: 'flame', color: 'text-orange-400' },
      sleep: { action: 'Prioritize Sleep', focus: 'Deep Rest', link: '/log', icon: 'moon', color: 'text-indigo-400' },
      recovery: { action: 'Rest Required', focus: 'Nervous System Protection', link: '/log', icon: 'activity', color: 'text-orange-400' },
      system: { action: 'System Active', focus: 'Awaiting Telemetry', link: '/log', icon: 'activity', color: 'text-white' }
    };

    return {
      ...target,
      ui: uiMap[target.category] || uiMap['system']
    };
  }

  static mapCollection(targets: CanonicalTarget[]): DashboardUITarget[] {
    return targets.map(this.map);
  }
}
