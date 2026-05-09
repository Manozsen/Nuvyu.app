// 🧠 HYDRATION INTELLIGENCE ENGINE
// Generates contextual nudges based on activity, time, and current intake.

export function getHydrationContext(currentWaterMl: number, stepsToday: number, hasWorkout: boolean) {
  const target = 3000;
  const progress = Math.min(100, Math.round((currentWaterMl / target) * 100));
  const hour = new Date().getHours();

  let nudge = "Stay hydrated.";
  let urgency = "low";

  if (currentWaterMl === 0 && hour > 10) {
    nudge = "Morning dehydration detected. Drink a glass of water now.";
    urgency = "high";
  } else if (hasWorkout && currentWaterMl < 1500) {
    nudge = "Post-workout recovery requires water. Hydrate!";
    urgency = "high";
  } else if (stepsToday > 5000 && currentWaterMl < 2000) {
    nudge = "High activity detected. Keep water intake up.";
    urgency = "medium";
  } else if (progress >= 100) {
    nudge = "Hydration optimal for today. Excellent.";
    urgency = "low";
  } else if (hour > 18 && currentWaterMl < 1500) {
    nudge = "Falling behind on water. Catch up before bed.";
    urgency = "medium";
  }

  return {
    progress,
    nudge,
    urgency,
    presets: [250, 500, 750, 1000] // Quick-log amounts in ml
  };
}
