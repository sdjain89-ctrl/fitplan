import { FoodItem } from "./types";

// Macros are per 100g (raw/edible portion) from standard nutrition references.
export const FOOD_DATABASE: FoodItem[] = [
  // Protein
  { id: "chicken-breast", name: "Chicken breast, cooked", category: "protein", caloriesPer100: 165, proteinPer100: 31, carbsPer100: 0, fatPer100: 3.6, defaultServingG: 150, servingLabel: "1 breast (150g)" },
  { id: "chicken-thigh", name: "Chicken thigh, cooked", category: "protein", caloriesPer100: 209, proteinPer100: 26, carbsPer100: 0, fatPer100: 10.9, defaultServingG: 120, servingLabel: "1 thigh (120g)" },
  { id: "lean-beef", name: "Beef, 95% lean, cooked", category: "protein", caloriesPer100: 176, proteinPer100: 26, carbsPer100: 0, fatPer100: 8, defaultServingG: 150, servingLabel: "150g" },
  { id: "salmon", name: "Salmon, cooked", category: "protein", caloriesPer100: 208, proteinPer100: 22, carbsPer100: 0, fatPer100: 13, defaultServingG: 150, servingLabel: "1 fillet (150g)" },
  { id: "tuna-canned", name: "Tuna, canned in water", category: "protein", caloriesPer100: 116, proteinPer100: 26, carbsPer100: 0, fatPer100: 0.8, defaultServingG: 140, servingLabel: "1 can (140g)" },
  { id: "shrimp", name: "Shrimp, cooked", category: "protein", caloriesPer100: 99, proteinPer100: 24, carbsPer100: 0.2, fatPer100: 0.3, defaultServingG: 120, servingLabel: "120g" },
  { id: "egg", name: "Egg, whole", category: "protein", caloriesPer100: 155, proteinPer100: 13, carbsPer100: 1.1, fatPer100: 11, defaultServingG: 50, servingLabel: "1 egg (50g)" },
  { id: "egg-white", name: "Egg white", category: "protein", caloriesPer100: 52, proteinPer100: 11, carbsPer100: 0.7, fatPer100: 0.2, defaultServingG: 33, servingLabel: "1 egg white (33g)" },
  { id: "whey-protein", name: "Whey protein powder", category: "protein", caloriesPer100: 380, proteinPer100: 80, carbsPer100: 8, fatPer100: 6, defaultServingG: 30, servingLabel: "1 scoop (30g)" },
  { id: "tofu", name: "Tofu, firm", category: "protein", caloriesPer100: 144, proteinPer100: 15, carbsPer100: 3, fatPer100: 8.7, defaultServingG: 150, servingLabel: "150g" },
  { id: "tempeh", name: "Tempeh", category: "protein", caloriesPer100: 192, proteinPer100: 20, carbsPer100: 7.6, fatPer100: 11, defaultServingG: 100, servingLabel: "100g" },
  { id: "pork-loin", name: "Pork loin, cooked", category: "protein", caloriesPer100: 210, proteinPer100: 27, carbsPer100: 0, fatPer100: 11, defaultServingG: 150, servingLabel: "150g" },
  { id: "turkey-breast", name: "Turkey breast, cooked", category: "protein", caloriesPer100: 135, proteinPer100: 30, carbsPer100: 0, fatPer100: 1, defaultServingG: 150, servingLabel: "150g" },

  // Carbs
  { id: "white-rice", name: "White rice, cooked", category: "carb", caloriesPer100: 130, proteinPer100: 2.7, carbsPer100: 28, fatPer100: 0.3, defaultServingG: 200, servingLabel: "1 cup (200g)" },
  { id: "brown-rice", name: "Brown rice, cooked", category: "carb", caloriesPer100: 123, proteinPer100: 2.6, carbsPer100: 26, fatPer100: 1, defaultServingG: 200, servingLabel: "1 cup (200g)" },
  { id: "oats", name: "Oats, dry", category: "carb", caloriesPer100: 389, proteinPer100: 17, carbsPer100: 66, fatPer100: 7, defaultServingG: 50, servingLabel: "1/2 cup (50g)" },
  { id: "sweet-potato", name: "Sweet potato, baked", category: "carb", caloriesPer100: 90, proteinPer100: 2, carbsPer100: 21, fatPer100: 0.1, defaultServingG: 200, servingLabel: "1 medium (200g)" },
  { id: "potato", name: "Potato, baked", category: "carb", caloriesPer100: 93, proteinPer100: 2.5, carbsPer100: 21, fatPer100: 0.1, defaultServingG: 200, servingLabel: "1 medium (200g)" },
  { id: "quinoa", name: "Quinoa, cooked", category: "carb", caloriesPer100: 120, proteinPer100: 4.4, carbsPer100: 21, fatPer100: 1.9, defaultServingG: 185, servingLabel: "1 cup (185g)" },
  { id: "whole-wheat-bread", name: "Whole wheat bread", category: "carb", caloriesPer100: 247, proteinPer100: 13, carbsPer100: 41, fatPer100: 3.4, defaultServingG: 30, servingLabel: "1 slice (30g)" },
  { id: "pasta", name: "Pasta, cooked", category: "carb", caloriesPer100: 131, proteinPer100: 5, carbsPer100: 25, fatPer100: 1.1, defaultServingG: 200, servingLabel: "1 cup (200g)" },
  { id: "tortilla", name: "Flour tortilla", category: "carb", caloriesPer100: 306, proteinPer100: 8, carbsPer100: 50, fatPer100: 7.5, defaultServingG: 50, servingLabel: "1 large (50g)" },

  // Fats
  { id: "olive-oil", name: "Olive oil", category: "fat", caloriesPer100: 884, proteinPer100: 0, carbsPer100: 0, fatPer100: 100, defaultServingG: 14, servingLabel: "1 tbsp (14g)" },
  { id: "almonds", name: "Almonds", category: "fat", caloriesPer100: 579, proteinPer100: 21, carbsPer100: 22, fatPer100: 50, defaultServingG: 30, servingLabel: "1 handful (30g)" },
  { id: "peanut-butter", name: "Peanut butter", category: "fat", caloriesPer100: 588, proteinPer100: 25, carbsPer100: 20, fatPer100: 50, defaultServingG: 32, servingLabel: "2 tbsp (32g)" },
  { id: "avocado", name: "Avocado", category: "fat", caloriesPer100: 160, proteinPer100: 2, carbsPer100: 8.5, fatPer100: 15, defaultServingG: 100, servingLabel: "1/2 avocado (100g)" },
  { id: "walnuts", name: "Walnuts", category: "fat", caloriesPer100: 654, proteinPer100: 15, carbsPer100: 14, fatPer100: 65, defaultServingG: 30, servingLabel: "1 handful (30g)" },
  { id: "chia-seeds", name: "Chia seeds", category: "fat", caloriesPer100: 486, proteinPer100: 17, carbsPer100: 42, fatPer100: 31, defaultServingG: 15, servingLabel: "1 tbsp (15g)" },

  // Dairy
  { id: "greek-yogurt", name: "Greek yogurt, plain nonfat", category: "dairy", caloriesPer100: 59, proteinPer100: 10, carbsPer100: 3.6, fatPer100: 0.4, defaultServingG: 170, servingLabel: "1 cup (170g)" },
  { id: "cottage-cheese", name: "Cottage cheese, low-fat", category: "dairy", caloriesPer100: 72, proteinPer100: 12, carbsPer100: 4, fatPer100: 1, defaultServingG: 150, servingLabel: "3/4 cup (150g)" },
  { id: "milk", name: "Milk, 2%", category: "dairy", caloriesPer100: 50, proteinPer100: 3.3, carbsPer100: 4.8, fatPer100: 2, defaultServingG: 240, servingLabel: "1 cup (240g)" },
  { id: "cheddar", name: "Cheddar cheese", category: "dairy", caloriesPer100: 403, proteinPer100: 25, carbsPer100: 1.3, fatPer100: 33, defaultServingG: 30, servingLabel: "1 slice (30g)" },

  // Vegetables
  { id: "broccoli", name: "Broccoli, steamed", category: "vegetable", caloriesPer100: 35, proteinPer100: 2.4, carbsPer100: 7, fatPer100: 0.4, defaultServingG: 150, servingLabel: "1.5 cups (150g)" },
  { id: "spinach", name: "Spinach, raw", category: "vegetable", caloriesPer100: 23, proteinPer100: 2.9, carbsPer100: 3.6, fatPer100: 0.4, defaultServingG: 100, servingLabel: "2 cups (100g)" },
  { id: "mixed-veg", name: "Mixed vegetables", category: "vegetable", caloriesPer100: 42, proteinPer100: 2.4, carbsPer100: 8, fatPer100: 0.3, defaultServingG: 150, servingLabel: "1.5 cups (150g)" },
  { id: "green-beans", name: "Green beans", category: "vegetable", caloriesPer100: 31, proteinPer100: 1.8, carbsPer100: 7, fatPer100: 0.2, defaultServingG: 150, servingLabel: "150g" },
  { id: "salad-greens", name: "Mixed salad greens", category: "vegetable", caloriesPer100: 17, proteinPer100: 1.4, carbsPer100: 3, fatPer100: 0.2, defaultServingG: 85, servingLabel: "2 cups (85g)" },

  // Fruits
  { id: "banana", name: "Banana", category: "fruit", caloriesPer100: 89, proteinPer100: 1.1, carbsPer100: 23, fatPer100: 0.3, defaultServingG: 120, servingLabel: "1 medium (120g)" },
  { id: "apple", name: "Apple", category: "fruit", caloriesPer100: 52, proteinPer100: 0.3, carbsPer100: 14, fatPer100: 0.2, defaultServingG: 180, servingLabel: "1 medium (180g)" },
  { id: "blueberries", name: "Blueberries", category: "fruit", caloriesPer100: 57, proteinPer100: 0.7, carbsPer100: 14, fatPer100: 0.3, defaultServingG: 100, servingLabel: "1 cup (100g)" },
  { id: "orange", name: "Orange", category: "fruit", caloriesPer100: 47, proteinPer100: 0.9, carbsPer100: 12, fatPer100: 0.1, defaultServingG: 130, servingLabel: "1 medium (130g)" },
];

export function searchFoods(query: string, extra: FoodItem[] = []): FoodItem[] {
  const all = [...extra, ...FOOD_DATABASE];
  if (!query.trim()) return all.slice(0, 20);
  const q = query.toLowerCase();
  return all.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 30);
}

export function getFoodById(id: string, extra: FoodItem[] = []): FoodItem | undefined {
  return [...extra, ...FOOD_DATABASE].find((f) => f.id === id);
}
