"use client";

import { useEffect, useState } from "react";

function readValue<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useLocalStorageState<T>(
  key: string,
  fallback: T
): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readValue(key, fallback));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable; ignore
    }
  }, [key, value, hydrated]);

  return [value, setValue, hydrated];
}

export const STORAGE_KEYS = {
  profile: "hp_profile",
  foodLog: "hp_food_log",
  activityLog: "hp_activity_log",
  customFoods: "hp_custom_foods",
  customExercises: "hp_custom_exercises",
  workoutPlan: "hp_workout_plan",
} as const;
