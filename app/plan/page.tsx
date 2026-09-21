"use client";

import { RefreshCw } from "lucide-react";
import { useLocalStorageState, STORAGE_KEYS } from "../../utils/storage";
import { UserProfile } from "../../utils/types";
import { DEFAULT_PROFILE } from "../../utils/defaultProfile";
import { calcTargets } from "../../utils/calorieCalc";
import { generateMealPlan, mealLabel, computeMealTotals } from "../../utils/mealPlanner";
import { useWorkoutPlan } from "../../utils/useWorkoutPlan";
import { todayISO, weekdayName } from "../../utils/dateUtils";

export default function PlanPage() {
  const [profile, , profileHydrated] = useLocalStorageState<UserProfile>(
    STORAGE_KEYS.profile,
    DEFAULT_PROFILE
  );
  const { plan, regenerate } = useWorkoutPlan(profile, profileHydrated);

  if (!profileHydrated) return null;

  const targets = calcTargets(profile);
  const meals = generateMealPlan(targets);
  const todayName = weekdayName(todayISO());

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-24 md:py-10">
      <h1 className="text-2xl font-bold text-slate-900">Weekly plan</h1>
      <p className="mt-1 text-sm text-slate-500">
        A structured training split and a sample meal template built around your daily targets. Adjust
        portions freely — what matters is hitting your calorie & protein targets in the food log.
      </p>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Training split</h2>
          <button
            onClick={regenerate}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={13} /> Regenerate
          </button>
        </div>
        <div className="space-y-2">
          {plan.map((day) => (
            <div
              key={day.day}
              className={`rounded-xl border p-4 shadow-sm ${
                day.day === todayName ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">
                  {day.day}
                  {day.day === todayName && (
                    <span className="ml-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-medium text-white">
                      TODAY
                    </span>
                  )}
                </span>
                <span className="text-xs font-medium text-slate-500">{day.focus}</span>
              </div>
              {day.exercises.length > 0 && (
                <ul className="mt-2 grid gap-1 text-xs text-slate-600 sm:grid-cols-2">
                  {day.exercises.map((ex) => (
                    <li key={ex.exerciseId} className="flex justify-between">
                      <span>{ex.name}</span>
                      <span className="text-slate-400">
                        {ex.sets}×{ex.reps}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {day.cardioMin && (
                <p className="mt-2 text-xs text-slate-500">+ {day.cardioMin} min cardio</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-1 font-semibold text-slate-900">Sample meal plan</h2>
        <p className="mb-3 text-xs text-slate-500">
          Target: {targets.calories} kcal · {targets.proteinG}g protein · {targets.carbsG}g carbs ·{" "}
          {targets.fatG}g fat
        </p>
        <div className="space-y-3">
          {meals.map((meal) => {
            const totals = computeMealTotals(meal);
            return (
              <div key={meal.mealType} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-baseline justify-between">
                  <h3 className="font-semibold text-slate-900">{mealLabel(meal.mealType)}</h3>
                  <span className="text-xs text-slate-400">~{Math.round(totals.calories)} kcal</span>
                </div>
                <ul className="space-y-1 text-sm text-slate-600">
                  {meal.items.map((item) => (
                    <li key={item.foodId} className="flex justify-between">
                      <span>{item.name}</span>
                      <span className="text-slate-400">{item.grams}g</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-slate-400">
                  P{Math.round(totals.protein)}g · C{Math.round(totals.carbs)}g · F{Math.round(totals.fat)}g
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
