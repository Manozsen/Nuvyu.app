export interface BurnTimelineItem {
  time: string;
  source: string;
  calories: number;
}

export interface IntakeTimelineItem {
  time: string;
  food: string;
  calories: number;
}

export interface EnergyStats {
  totalBurn: number;
  bmrBurn: number;
  activityBurn: number;
  stepsBurn: number;
  workoutBurn: number;
  intakeCalories: number;
  energyBalance: number;
  targetCalories: number;
  deficit: number;
  surplus: number;
  intakeTimeline: IntakeTimelineItem[];
  burnTimeline: BurnTimelineItem[];
}
