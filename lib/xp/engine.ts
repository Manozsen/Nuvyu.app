export function calculateXP(totalSteps: number, totalWater: number, logsCount: number, workoutLogsCount: number, sleepLogsCount: number = 0): number {
  let xp = 0;
  
  // Rule: log entry → +5 XP (max 3 logs counted)
  xp += Math.min(logsCount, 3) * 5;
  
  // Rule: steps ≥ 3000 → +10 XP | steps ≥ 6000 → +20 XP (Anti-abuse max: 12000)
  const cappedSteps = Math.min(totalSteps, 12000);
  if (cappedSteps >= 6000) xp += 20;
  else if (cappedSteps >= 3000) xp += 10;
  
  // Rule: water ≥ 1000 → +8 XP | water ≥ 2000 → +15 XP
  if (totalWater >= 2000) xp += 15;
  else if (totalWater >= 1000) xp += 8;
  
  // Rule: workout log → +10 XP
  xp += workoutLogsCount * 10;
  
  // Anti-Abuse: maxXPPerDay = 50
  return Math.min(xp, 50);
}

export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 100) + 1;
}

export function didLevelUp(oldLevel: number, newLevel: number): boolean {
  return newLevel > oldLevel;
}
