export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type Goal = "recomp" | "cut" | "bulk" | "maintain";

export interface UserProfile {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  workoutDaysPerWeek: number;
  onboarded: boolean;
}

export interface Targets {
  bmr: number;
  tdee: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export type FoodCategory =
  | "protein"
  | "carb"
  | "fat"
  | "vegetable"
  | "fruit"
  | "dairy"
  | "other";

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  caloriesPer100: number;
  proteinPer100: number;
  carbsPer100: number;
  fatPer100: number;
  defaultServingG: number;
  servingLabel: string;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodLogEntry {
  id: string;
  date: string;
  foodId?: string;
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType;
  loggedAt: string;
}

export type ExerciseType = "strength" | "cardio";

export interface ExerciseItem {
  id: string;
  name: string;
  type: ExerciseType;
  muscleGroup?: string;
  met?: number;
  defaultSets?: number;
  defaultReps?: string;
}

export interface StrengthSet {
  reps: number;
  weightKg: number;
}

export interface ActivityLogEntry {
  id: string;
  date: string;
  exerciseId?: string;
  name: string;
  type: ExerciseType;
  durationMin?: number;
  sets?: StrengthSet[];
  caloriesBurned: number;
  loggedAt: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
}

export interface WorkoutPlanDay {
  day: string;
  focus: string;
  exercises: WorkoutExercise[];
  cardioMin?: number;
}

export interface MealSuggestion {
  mealType: MealType;
  targetCalories: number;
  items: { foodId: string; name: string; grams: number }[];
}
