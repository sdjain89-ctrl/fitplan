"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useLocalStorageState, STORAGE_KEYS } from "../../utils/storage";
import { FoodItem, FoodLogEntry, MealType, UserProfile } from "../../utils/types";
import { DEFAULT_PROFILE } from "../../utils/defaultProfile";
import { calcTargets } from "../../utils/calorieCalc";
import { addDays, formatDisplayDate, todayISO } from "../../utils/dateUtils";
import { mealLabel } from "../../utils/mealPlanner";
import MacroBar from "../../components/MacroBar";
import FoodPicker, { AddedFood } from "../../components/FoodPicker";

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export default function FoodPage() {
  const [profile, , profileHydrated] = useLocalStorageState<UserProfile>(
    STORAGE_KEYS.profile,
    DEFAULT_PROFILE
  );
  const [foodLog, setFoodLog, foodHydrated] = useLocalStorageState<FoodLogEntry[]>(
    STORAGE_KEYS.foodLog,
    []
  );
  const [customFoods, setCustomFoods] = useLocalStorageState<FoodItem[]>(STORAGE_KEYS.customFoods, []);

  const [date, setDate] = useState(todayISO());
  const [pickerMeal, setPickerMeal] = useState<MealType | null>(null);

  const hydrated = profileHydrated && foodHydrated;
  if (!hydrated) return null;

  const targets = calcTargets(profile);
  const dayEntries = foodLog.filter((f) => f.date === date);

  const totals = dayEntries.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories,
      protein: acc.protein + f.protein,
      carbs: acc.carbs + f.carbs,
      fat: acc.fat + f.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  function addFood(food: AddedFood) {
    if (!pickerMeal) return;
    const entry: FoodLogEntry = {
      id: `food-${Date.now()}`,
      date,
      mealType: pickerMeal,
      loggedAt: new Date().toISOString(),
      ...food,
    };
    setFoodLog((prev) => [...prev, entry]);
  }

  function removeFood(id: string) {
    setFoodLog((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-24 md:py-10">
      <h1 className="text-2xl font-bold text-slate-900">Food log</h1>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <button onClick={() => setDate((d) => addDays(d, -1))} className="rounded-full p-2 hover:bg-slate-100">
          <ChevronLeft size={18} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium text-slate-800">{formatDisplayDate(date)}</span>
          {date !== todayISO() && (
            <button onClick={() => setDate(todayISO())} className="text-xs text-emerald-700 hover:underline">
              Jump to today
            </button>
          )}
        </div>
        <button onClick={() => setDate((d) => addDays(d, 1))} className="rounded-full p-2 hover:bg-slate-100">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-baseline justify-between">
          <span className="text-sm font-medium text-slate-700">Calories</span>
          <span className="text-sm text-slate-500">
            <span className="font-semibold text-slate-900">{Math.round(totals.calories)}</span> / {targets.calories} kcal
          </span>
        </div>
        <div className="space-y-3">
          <MacroBar label="Protein" consumed={totals.protein} target={targets.proteinG} color="emerald" />
          <MacroBar label="Carbs" consumed={totals.carbs} target={targets.carbsG} color="sky" />
          <MacroBar label="Fat" consumed={totals.fat} target={targets.fatG} color="amber" />
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {MEAL_ORDER.map((meal) => {
          const entries = dayEntries.filter((f) => f.mealType === meal);
          const mealCalories = entries.reduce((s, f) => s + f.calories, 0);
          return (
            <div key={meal} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{mealLabel(meal)}</h3>
                <span className="text-xs text-slate-400">{Math.round(mealCalories)} kcal</span>
              </div>
              {entries.length > 0 && (
                <ul className="mb-2 space-y-1.5">
                  {entries.map((f) => (
                    <li key={f.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-slate-800">{f.name}</p>
                        <p className="text-xs text-slate-400">
                          {f.grams}g · P{Math.round(f.protein)} C{Math.round(f.carbs)} F{Math.round(f.fat)}
                        </p>
                      </div>
                      <button onClick={() => removeFood(f.id)} className="rounded p-1 text-slate-300 hover:text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                onClick={() => setPickerMeal(meal)}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-500 hover:border-emerald-400 hover:text-emerald-700"
              >
                <Plus size={14} /> Add to {mealLabel(meal).toLowerCase()}
              </button>
            </div>
          );
        })}
      </div>

      <FoodPicker
        open={pickerMeal !== null}
        onClose={() => setPickerMeal(null)}
        onAdd={addFood}
        customFoods={customFoods}
        onSaveCustomFood={(food) => setCustomFoods((prev) => [...prev, food])}
      />
    </div>
  );
}
