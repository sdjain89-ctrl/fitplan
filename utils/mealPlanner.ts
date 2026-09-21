import { getFoodById } from "./foodDatabase";
import { MealSuggestion, MealType, Targets } from "./types";

interface MealTemplate {
  mealType: MealType;
  label: string;
  pct: number;
  foodIds: string[];
}

const TEMPLATES: MealTemplate[] = [
  { mealType: "breakfast", label: "Breakfast", pct: 0.25, foodIds: ["oats", "egg", "blueberries"] },
  { mealType: "lunch", label: "Lunch", pct: 0.35, foodIds: ["chicken-breast", "brown-rice", "broccoli", "olive-oil"] },
  { mealType: "dinner", label: "Dinner", pct: 0.3, foodIds: ["salmon", "sweet-potato", "spinach"] },
  { mealType: "snack", label: "Snack", pct: 0.1, foodIds: ["greek-yogurt", "almonds", "banana"] },
];

/**
 * Scales each meal template's default servings so the combo's calories land
 * near that meal's share of the daily target. This is planning guidance, not
 * a precise prescription -- actual logged food is what counts toward targets.
 */
export function generateMealPlan(targets: Targets): MealSuggestion[] {
  return TEMPLATES.map((tpl) => {
    const mealCalorieTarget = Math.round(targets.calories * tpl.pct);
    const foods = tpl.foodIds
      .map((id) => getFoodById(id))
      .filter((f): f is NonNullable<typeof f> => Boolean(f));
    const baselineCalories = foods.reduce(
      (sum, f) => sum + f.caloriesPer100 * (f.defaultServingG / 100),
      0
    );
    const scale = baselineCalories > 0 ? mealCalorieTarget / baselineCalories : 1;
    const items = foods.map((f) => ({
      foodId: f.id,
      name: f.name,
      grams: Math.max(10, Math.round((f.defaultServingG * scale) / 5) * 5),
    }));
    return { mealType: tpl.mealType, targetCalories: mealCalorieTarget, items };
  });
}

export function mealLabel(mealType: MealType): string {
  return TEMPLATES.find((t) => t.mealType === mealType)?.label ?? mealType;
}

export function computeMealTotals(meal: MealSuggestion) {
  return meal.items.reduce(
    (acc, item) => {
      const food = getFoodById(item.foodId);
      if (!food) return acc;
      const factor = item.grams / 100;
      return {
        calories: acc.calories + food.caloriesPer100 * factor,
        protein: acc.protein + food.proteinPer100 * factor,
        carbs: acc.carbs + food.carbsPer100 * factor,
        fat: acc.fat + food.fatPer100 * factor,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}
