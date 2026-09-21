import { ExerciseItem } from "./types";

export const EXERCISE_DATABASE: ExerciseItem[] = [
  // Chest
  { id: "bench-press", name: "Barbell Bench Press", type: "strength", muscleGroup: "chest", defaultSets: 4, defaultReps: "6-10" },
  { id: "incline-db-press", name: "Incline Dumbbell Press", type: "strength", muscleGroup: "chest", defaultSets: 3, defaultReps: "8-12" },
  { id: "push-up", name: "Push-Up", type: "strength", muscleGroup: "chest", defaultSets: 3, defaultReps: "10-15" },
  { id: "cable-fly", name: "Cable Fly", type: "strength", muscleGroup: "chest", defaultSets: 3, defaultReps: "12-15" },
  { id: "dips", name: "Dips", type: "strength", muscleGroup: "chest", defaultSets: 3, defaultReps: "8-12" },

  // Back
  { id: "deadlift", name: "Barbell Deadlift", type: "strength", muscleGroup: "back", defaultSets: 3, defaultReps: "4-6" },
  { id: "pull-up", name: "Pull-Up", type: "strength", muscleGroup: "back", defaultSets: 4, defaultReps: "6-10" },
  { id: "barbell-row", name: "Barbell Row", type: "strength", muscleGroup: "back", defaultSets: 4, defaultReps: "8-10" },
  { id: "lat-pulldown", name: "Lat Pulldown", type: "strength", muscleGroup: "back", defaultSets: 3, defaultReps: "10-12" },
  { id: "seated-cable-row", name: "Seated Cable Row", type: "strength", muscleGroup: "back", defaultSets: 3, defaultReps: "10-12" },

  // Legs
  { id: "back-squat", name: "Barbell Back Squat", type: "strength", muscleGroup: "legs", defaultSets: 4, defaultReps: "6-10" },
  { id: "romanian-deadlift", name: "Romanian Deadlift", type: "strength", muscleGroup: "legs", defaultSets: 3, defaultReps: "8-12" },
  { id: "leg-press", name: "Leg Press", type: "strength", muscleGroup: "legs", defaultSets: 3, defaultReps: "10-15" },
  { id: "walking-lunge", name: "Walking Lunge", type: "strength", muscleGroup: "legs", defaultSets: 3, defaultReps: "10-12/leg" },
  { id: "leg-curl", name: "Seated Leg Curl", type: "strength", muscleGroup: "legs", defaultSets: 3, defaultReps: "10-15" },
  { id: "calf-raise", name: "Standing Calf Raise", type: "strength", muscleGroup: "legs", defaultSets: 4, defaultReps: "12-15" },

  // Shoulders
  { id: "ohp", name: "Overhead Press", type: "strength", muscleGroup: "shoulders", defaultSets: 4, defaultReps: "6-10" },
  { id: "lateral-raise", name: "Dumbbell Lateral Raise", type: "strength", muscleGroup: "shoulders", defaultSets: 3, defaultReps: "12-15" },
  { id: "rear-delt-fly", name: "Rear Delt Fly", type: "strength", muscleGroup: "shoulders", defaultSets: 3, defaultReps: "12-15" },
  { id: "face-pull", name: "Face Pull", type: "strength", muscleGroup: "shoulders", defaultSets: 3, defaultReps: "12-15" },

  // Arms
  { id: "barbell-curl", name: "Barbell Curl", type: "strength", muscleGroup: "arms", defaultSets: 3, defaultReps: "8-12" },
  { id: "hammer-curl", name: "Hammer Curl", type: "strength", muscleGroup: "arms", defaultSets: 3, defaultReps: "10-12" },
  { id: "triceps-pushdown", name: "Triceps Pushdown", type: "strength", muscleGroup: "arms", defaultSets: 3, defaultReps: "10-15" },
  { id: "skull-crusher", name: "Skull Crusher", type: "strength", muscleGroup: "arms", defaultSets: 3, defaultReps: "8-12" },

  // Core
  { id: "hanging-leg-raise", name: "Hanging Leg Raise", type: "strength", muscleGroup: "core", defaultSets: 3, defaultReps: "10-15" },
  { id: "plank", name: "Plank", type: "strength", muscleGroup: "core", defaultSets: 3, defaultReps: "45-60s" },
  { id: "cable-crunch", name: "Cable Crunch", type: "strength", muscleGroup: "core", defaultSets: 3, defaultReps: "12-15" },

  // Cardio (MET values used to estimate calories burned: kcal = MET * kg * hours)
  { id: "walking", name: "Walking (moderate)", type: "cardio", met: 3.5 },
  { id: "jogging", name: "Jogging (5 mph)", type: "cardio", met: 8.3 },
  { id: "running", name: "Running (6-7 mph)", type: "cardio", met: 10 },
  { id: "cycling", name: "Cycling (moderate)", type: "cardio", met: 7.5 },
  { id: "rowing", name: "Rowing machine", type: "cardio", met: 7 },
  { id: "swimming", name: "Swimming (moderate)", type: "cardio", met: 8 },
  { id: "jump-rope", name: "Jump Rope", type: "cardio", met: 11 },
  { id: "elliptical", name: "Elliptical", type: "cardio", met: 5.5 },
  { id: "stairmaster", name: "StairMaster", type: "cardio", met: 8 },
  { id: "hiit", name: "HIIT Circuit", type: "cardio", met: 8.5 },
  { id: "incline-walk", name: "Incline Treadmill Walk", type: "cardio", met: 6 },
  { id: "hiking", name: "Hiking", type: "cardio", met: 6 },
  { id: "basketball", name: "Basketball", type: "cardio", met: 6.5 },
  { id: "yoga", name: "Yoga", type: "cardio", met: 2.5 },
];

export function searchExercises(
  query: string,
  type?: "strength" | "cardio",
  extra: ExerciseItem[] = []
): ExerciseItem[] {
  const all = [...extra, ...EXERCISE_DATABASE];
  const filtered = type ? all.filter((e) => e.type === type) : all;
  if (!query.trim()) return filtered.slice(0, 30);
  const q = query.toLowerCase();
  return filtered.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 30);
}

export function getExerciseById(id: string, extra: ExerciseItem[] = []): ExerciseItem | undefined {
  return [...extra, ...EXERCISE_DATABASE].find((e) => e.id === id);
}

export function estimateCardioCalories(met: number, weightKg: number, minutes: number): number {
  return Math.round(met * weightKg * (minutes / 60));
}

const MUSCLE_GROUPS = ["chest", "back", "legs", "shoulders", "arms", "core"] as const;

export function exercisesForMuscleGroup(group: string): ExerciseItem[] {
  return EXERCISE_DATABASE.filter((e) => e.muscleGroup === group);
}

export { MUSCLE_GROUPS };
