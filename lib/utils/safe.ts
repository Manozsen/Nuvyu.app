import { RecoveryState, FatigueRisk } from '../types/recovery';
import { EnergyStats, BurnTimelineItem, IntakeTimelineItem } from '../types/energy';

export const safeNumber = (val: any, fallback: number = 0): number => {
  if (val === null || val === undefined) return fallback;
  const num = Number(val);
  return isNaN(num) ? fallback : num;
};

export const safeString = (val: any, fallback: string = ""): string => {
  return val ? String(val) : fallback;
};

export const safeArray = <T>(val: any): T[] => {
  return Array.isArray(val) ? val : [];
};

// Intelligently maps legacy or dynamic strings strictly to our Enums
export const safeRecoveryState = (val: any): RecoveryState => {
  const v = String(val || "").toLowerCase();
  if (v.includes("optimal") || v.includes("excellent") || v.includes("good")) return "optimal";
  if (v.includes("fatigue") || v.includes("poor") || v.includes("deprived")) return "fatigued";
  if (v.includes("overtrain") || v.includes("bad")) return "overtrained";
  return "moderate"; 
};

// Intelligently maps legacy strings strictly to our Enums
export const safeFatigueRisk = (val: any): FatigueRisk => {
  const v = String(val || "").toLowerCase();
  if (v.includes("high") || v.includes("critical")) return "high";
  if (v.includes("medium") || v.includes("elevated") || v.includes("moderate")) return "medium";
  return "low"; 
};

export const safeEnergyStats = (val: any): EnergyStats => {
  if (!val) return {
    totalBurn: 0, bmrBurn: 0, activityBurn: 0, stepsBurn: 0, workoutBurn: 0,
    intakeCalories: 0, energyBalance: 0, targetCalories: 2000, deficit: 0, surplus: 0,
    intakeTimeline: [], burnTimeline: []
  };
  return {
    totalBurn: safeNumber(val.totalBurn),
    bmrBurn: safeNumber(val.bmrBurn),
    activityBurn: safeNumber(val.activityBurn),
    stepsBurn: safeNumber(val.stepsBurn),
    workoutBurn: safeNumber(val.workoutBurn),
    intakeCalories: safeNumber(val.intakeCalories),
    energyBalance: safeNumber(val.energyBalance),
    targetCalories: safeNumber(val.targetCalories, 2000),
    deficit: safeNumber(val.deficit),
    surplus: safeNumber(val.surplus),
    intakeTimeline: safeArray<IntakeTimelineItem>(val.intakeTimeline),
    burnTimeline: safeArray<BurnTimelineItem>(val.burnTimeline)
  };
};
