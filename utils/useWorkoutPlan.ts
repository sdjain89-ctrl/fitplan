"use client";

import { useEffect } from "react";
import { useLocalStorageState, STORAGE_KEYS } from "./storage";
import { UserProfile, WorkoutPlanDay } from "./types";
import { generateWorkoutPlan } from "./workoutPlanner";

interface StoredPlan {
  plan: WorkoutPlanDay[];
  daysPerWeek: number;
  goal: string;
}

const EMPTY: StoredPlan = { plan: [], daysPerWeek: 0, goal: "" };

export function useWorkoutPlan(profile: UserProfile, hydrated: boolean) {
  const [stored, setStored, planHydrated] = useLocalStorageState<StoredPlan>(
    STORAGE_KEYS.workoutPlan,
    EMPTY
  );

  const outOfSync =
    stored.daysPerWeek !== profile.workoutDaysPerWeek || stored.goal !== profile.goal;

  useEffect(() => {
    if (!hydrated || !planHydrated) return;
    if (outOfSync || stored.plan.length === 0) {
      setStored({
        plan: generateWorkoutPlan(profile.workoutDaysPerWeek, profile.goal),
        daysPerWeek: profile.workoutDaysPerWeek,
        goal: profile.goal,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, planHydrated, profile.workoutDaysPerWeek, profile.goal]);

  function regenerate() {
    setStored({
      plan: generateWorkoutPlan(profile.workoutDaysPerWeek, profile.goal),
      daysPerWeek: profile.workoutDaysPerWeek,
      goal: profile.goal,
    });
  }

  return { plan: stored.plan, regenerate };
}
