// 🧠 REAL-TIME PROGRESSIVE BMR ENGINE
// Distributes BMR accurately across the day based on local time.

export function calculateProgressiveBMR(bmr: number) {
  const safeBMR = bmr || 1500;
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // Calculate exactly how much of the day has passed
  const totalMinutesInDay = 1440;
  const minutesPassed = (hours * 60) + minutes;
  const dayProgress = minutesPassed / totalMinutesInDay;

  const currentBurn = Math.round(safeBMR * dayProgress);
  const remainingBurn = safeBMR - currentBurn;
  const hourlyBurn = Math.round(safeBMR / 24);

  return {
    hourlyBurn,
    currentBurn,
    remainingBurn,
    dayProgress
  };
}
