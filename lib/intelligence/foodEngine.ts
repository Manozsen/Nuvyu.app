// 🧠 FOOD INTELLIGENCE FOUNDATION v1
// Prepares for AI parsing, currently uses smart heuristics for Desi/Bengali foods

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fats: number; // in grams
  serving_size: string;
}

const DESI_FOOD_DATABASE: FoodItem[] = [
  { id: '1', name: 'Roti / Chapati', calories: 104, protein: 3, carbs: 22, fats: 0.5, serving_size: '1 medium' },
  { id: '2', name: 'Dal (Yellow/Moong)', calories: 212, protein: 14, carbs: 36, fats: 1.5, serving_size: '1 bowl (150g)' },
  { id: '3', name: 'White Rice', calories: 205, protein: 4, carbs: 45, fats: 0.4, serving_size: '1 bowl (150g)' },
  { id: '4', name: 'Chicken Curry', calories: 240, protein: 22, carbs: 8, fats: 12, serving_size: '1 bowl (150g)' },
  { id: '5', name: 'Fish Curry (Bengali Style)', calories: 280, protein: 20, carbs: 10, fats: 16, serving_size: '1 piece with gravy' },
  { id: '6', name: 'Paneer Masala', calories: 320, protein: 14, carbs: 12, fats: 24, serving_size: '1 bowl (150g)' },
  { id: '7', name: 'Biryani (Chicken)', calories: 450, protein: 24, carbs: 55, fats: 14, serving_size: '1 plate' },
  { id: '8', name: 'Khichdi', calories: 230, protein: 9, carbs: 40, fats: 4, serving_size: '1 bowl (150g)' },
  { id: '9', name: 'Egg Curry (2 Eggs)', calories: 260, protein: 14, carbs: 8, fats: 18, serving_size: '2 eggs with gravy' },
  { id: '10', name: 'Poha', calories: 250, protein: 5, carbs: 45, fats: 6, serving_size: '1 plate (150g)' },
  { id: '11', name: 'Idli', calories: 40, protein: 1.5, carbs: 8, fats: 0.1, serving_size: '1 piece' },
  { id: '12', name: 'Dosa (Plain)', calories: 120, protein: 3, carbs: 20, fats: 2.5, serving_size: '1 medium' },
  { id: '13', name: 'Oats with Milk', calories: 320, protein: 12, carbs: 50, fats: 6, serving_size: '1 bowl' },
  { id: '14', name: 'Boiled Egg', calories: 78, protein: 6, carbs: 0.6, fats: 5, serving_size: '1 large' },
];

export function searchDesiFoods(query: string): FoodItem[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  return DESI_FOOD_DATABASE.filter(food => food.name.toLowerCase().includes(q));
}

// Future AI-Ready Parser Interface
export function parseFoodStringFast(query: string) {
  const match = searchDesiFoods(query);
  if (match.length > 0) return match[0];
  
  // Fallback heuristic for unknown foods
  return {
    id: 'custom',
    name: query,
    calories: 350, // Default safe heuristic
    protein: 10,
    carbs: 40,
    fats: 10,
    serving_size: '1 serving'
  };
}
