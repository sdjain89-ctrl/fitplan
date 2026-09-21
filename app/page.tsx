"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dumbbell, Flame, Plus, Trash2, UtensilsCrossed, Watch } from "lucide-react";
import { useLocalStorageState, STORAGE_KEYS } from "../utils/storage";
import {
  ActivityLogEntry,
  FoodItem,
  FoodLogEntry,
  ExerciseItem,
  HealthDay,
  UserProfile,
} from "../utils/types";
import { DEFAULT_PROFILE } from "../utils/defaultProfile";
import { calcTargets } from "../utils/calorieCalc";
import { todayISO, formatDisplayDate, weekdayName } from "../utils/dateUtils";
import { useWorkoutPlan } from "../utils/useWorkoutPlan";
import { fetchHealthDay } from "../utils/health";
import RingProgress from "../components/RingProgress";
import MacroBar from "../components/MacroBar";
import StatCard from "../components/StatCard";
import FoodPicker, { AddedFood } from "../components/FoodPicker";
import ExercisePicker, { AddedActivity } from "../components/ExercisePicker";

export default function DashboardPage() {
  const [profile, , profileHydrated] = useLocalStorageState<UserProfile>(
    STORAGE_KEYS.profile,
    DEFAULT_PROFILE
  );
  const [foodLog, setFoodLog, foodHydrated] = useLocalStorageState<FoodLogEntry[]>(
    STORAGE_KEYS.foodLog,
    []
  );
  const [activityLog, setActivityLog, activityHydrated] = useLocalStorageState<ActivityLogEntry[]>(
    STORAGE_KEYS.activityLog,
    []
  );
  const [customFoods, setCustomFoods] = useLocalStorageState<FoodItem[]>(STORAGE_KEYS.customFoods, []);
  const [customExercises, setCustomExercises] = useLocalStorageState<ExerciseItem[]>(
    STORAGE_KEYS.customExercises,
    []
  );
  const { plan } = useWorkoutPlan(profile, profileHydrated);

  const [foodPickerOpen, setFoodPickerOpen] = useState(false);
  const [activityPickerOpen, setActivityPickerOpen] = useState(false);

  const [healthDay, setHealthDay] = useState<HealthDay | null>(null);
  const [healthChecked, setHealthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchHealthDay(todayISO()).then((data) => {
      if (!cancelled) {
        setHealthDay(data);
        setHealthChecked(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const hydrated = profileHydrated && foodHydrated && activityHydrated;
  if (!hydrated) return null;

  const today = todayISO();
  const targets = calcTargets(profile);
  const todaysFood = foodLog.filter((f) => f.date === today);
  const todaysActivity = activityLog.filter((a) => a.date === today);

  const consumed = todaysFood.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fat: acc.fat + f.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  const burned = todaysActivity.reduce((sum, a) => sum + a.caloriesBurned, 0);
  const remainingTarget = targets.calories + burned;

  const todaysWorkout = plan.find((d) => d.day === weekdayName(today));

  function addFood(food: AddedFood) {
    const entry: FoodLogEntry = {
      id: `food-${Date.now()}`,
      date: today,
      mealType: "snack",
      loggedAt: new Date().toISOString(),
      ...food,
    };
    setFoodLog((prev) => [...prev, entry]);
  }

  function addActivity(activity: AddedActivity) {
    const entry: ActivityLogEntry = {
      id: `activity-${Date.now()}`,
      date: today,
      loggedAt: new Date().toISOString(),
      ...activity,
    };
    setActivityLog((prev) => [...prev, entry]);
  }

  function removeFood(id: string) {
    setFoodLog((prev) => prev.filter((f) => f.id !== id));
  }

  function removeActivity(id: string) {
    setActivityLog((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-24 md:py-10">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {profile.name ? `Hey ${profile.name}` : "Today's plan"}
          </h1>
          <p className="text-sm text-slate-500">{formatDisplayDate(today)}</p>
        </div>
      </div>

      {!profile.onboarded && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Set up your profile to get personalized calorie, macro, and workout targets.{" "}
          <Link href="/profile" className="font-semibold underline">
            Set up now →
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-[auto_1fr]">
        <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <RingProgress consumed={consumed.calories} target={remainingTarget} />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <StatCard label="Target" value={targets.calories} unit="kcal" tone="slate" />
          <StatCard label="Consumed" value={Math.round(consumed.calories)} unit="kcal" icon={UtensilsCrossed} tone="sky" />
          <StatCard label="Burned" value={burned} unit="kcal" icon={Flame} tone="amber" />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-900">Macros today</h2>
        <div className="space-y-4">
          <MacroBar label="Protein" consumed={consumed.protein} target={targets.proteinG} color="emerald" />
          <MacroBar label="Carbs" consumed={consumed.carbs} target={targets.carbsG} color="sky" />
          <MacroBar label="Fat" consumed={consumed.fat} target={targets.fatG} color="amber" />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <button
          onClick={() => setFoodPickerOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 py-4 font-medium text-emerald-700 hover:bg-emerald-100"
        >
          <Plus size={18} /> Log food
        </button>
        <button
          onClick={() => setActivityPickerOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-sky-300 bg-sky-50 py-4 font-medium text-sky-700 hover:bg-sky-100"
        >
          <Plus size={18} /> Log activity
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <Dumbbell size={18} className="text-slate-500" /> Today&apos;s workout
          </h2>
          <Link href="/plan" className="text-xs font-medium text-emerald-700 hover:underline">
            View full week →
          </Link>
        </div>
        {todaysWorkout ? (
          todaysWorkout.exercises.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">{todaysWorkout.focus}</p>
              <ul className="space-y-1.5 text-sm text-slate-600">
                {todaysWorkout.exercises.map((ex) => (
                  <li key={ex.exerciseId} className="flex justify-between">
                    <span>{ex.name}</span>
                    <span className="text-slate-400">
                      {ex.sets} × {ex.reps}
                    </span>
                  </li>
                ))}
              </ul>
              {todaysWorkout.cardioMin && (
                <p className="mt-2 text-xs text-slate-500">
                  + {todaysWorkout.cardioMin} min cardio (optional, after lifting)
                </p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-slate-700">{todaysWorkout.focus}</p>
              {todaysWorkout.cardioMin ? (
                <p className="mt-1 text-sm text-slate-500">
                  {todaysWorkout.cardioMin} min light cardio (walk, bike, or swim)
                </p>
              ) : (
                <p className="mt-1 text-sm text-slate-500">Recovery day — no training planned.</p>
              )}
            </div>
          )
        ) : (
          <p className="text-sm text-slate-400">Set up your profile to generate a weekly plan.</p>
        )}
      </div>

      {healthDay && (healthDay.activeEnergyBurnedKcal != null || healthDay.steps != null || healthDay.workouts.length > 0) && (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
            <Watch size={18} className="text-slate-500" /> Synced from Apple Watch
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            {healthDay.activeEnergyBurnedKcal != null && (
              <div>
                <div className="text-lg font-bold text-slate-900">{Math.round(healthDay.activeEnergyBurnedKcal)}</div>
                <div className="text-xs text-slate-500">active kcal</div>
              </div>
            )}
            {healthDay.steps != null && (
              <div>
                <div className="text-lg font-bold text-slate-900">{healthDay.steps.toLocaleString()}</div>
                <div className="text-xs text-slate-500">steps</div>
              </div>
            )}
            {healthDay.restingHeartRate != null && (
              <div>
                <div className="text-lg font-bold text-slate-900">{healthDay.restingHeartRate}</div>
                <div className="text-xs text-slate-500">resting HR</div>
              </div>
            )}
          </div>
          {healthDay.workouts.length > 0 && (
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              {healthDay.workouts.map((w, i) => (
                <li key={i} className="flex justify-between">
                  <span>{w.type}</span>
                  <span className="text-slate-400">
                    {w.durationMin ? `${w.durationMin} min · ` : ""}
                    {w.caloriesBurned ? `${w.caloriesBurned} kcal` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-slate-400">
            Informational only — not counted toward your calorie budget above.
          </p>
        </div>
      )}
      {healthChecked && !healthDay && (
        <p className="mt-2 text-center text-xs text-slate-400">
          No Apple Watch data synced yet — see HEALTH_SETUP.md in the repo to connect it.
        </p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-slate-900">Food log</h2>
          {todaysFood.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing logged yet today.</p>
          ) : (
            <ul className="space-y-2">
              {todaysFood.map((f) => (
                <li key={f.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{f.name}</p>
                    <p className="text-xs text-slate-400">
                      {f.grams}g · {Math.round(f.calories)} kcal
                    </p>
                  </div>
                  <button onClick={() => removeFood(f.id)} className="rounded p-1 text-slate-300 hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-slate-900">Activity log</h2>
          {todaysActivity.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing logged yet today.</p>
          ) : (
            <ul className="space-y-2">
              {todaysActivity.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{a.name}</p>
                    <p className="text-xs text-slate-400">
                      {a.type === "cardio" ? `${a.durationMin} min · ` : `${a.sets?.length ?? 0} sets · `}
                      {a.caloriesBurned} kcal
                    </p>
                  </div>
                  <button onClick={() => removeActivity(a.id)} className="rounded p-1 text-slate-300 hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <FoodPicker
        open={foodPickerOpen}
        onClose={() => setFoodPickerOpen(false)}
        onAdd={addFood}
        customFoods={customFoods}
        onSaveCustomFood={(food) => setCustomFoods((prev) => [...prev, food])}
      />
      <ExercisePicker
        open={activityPickerOpen}
        onClose={() => setActivityPickerOpen(false)}
        onAdd={addActivity}
        customExercises={customExercises}
        onSaveCustomExercise={(ex) => setCustomExercises((prev) => [...prev, ex])}
        userWeightKg={profile.weightKg}
      />
    </div>
  );
}
