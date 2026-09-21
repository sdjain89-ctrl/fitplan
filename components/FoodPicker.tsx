"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search, X } from "lucide-react";
import { FoodItem } from "../utils/types";
import { searchFoods } from "../utils/foodDatabase";
import { searchOpenFoodFacts } from "../utils/openFoodFacts";

export interface AddedFood {
  foodId?: string;
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function FoodPicker({
  open,
  onClose,
  onAdd,
  customFoods,
  onSaveCustomFood,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (food: AddedFood) => void;
  customFoods: FoodItem[];
  onSaveCustomFood: (food: FoodItem) => void;
}) {
  const [tab, setTab] = useState<"search" | "custom">("search");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState(100);

  const [customName, setCustomName] = useState("");
  const [customCalories, setCustomCalories] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs, setCustomCarbs] = useState("");
  const [customFat, setCustomFat] = useState("");
  const [customGrams, setCustomGrams] = useState(100);

  const results = useMemo(() => searchFoods(query, customFoods), [query, customFoods]);
  const [onlineResults, setOnlineResults] = useState<FoodItem[]>([]);
  const [onlineLoading, setOnlineLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setOnlineResults([]);
      setOnlineLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setOnlineLoading(true);
      const found = await searchOpenFoodFacts(trimmed, controller.signal);
      setOnlineResults(found);
      setOnlineLoading(false);
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  if (!open) return null;

  function reset() {
    setQuery("");
    setSelected(null);
    setGrams(100);
    setOnlineResults([]);
    setOnlineLoading(false);
    setCustomName("");
    setCustomCalories("");
    setCustomProtein("");
    setCustomCarbs("");
    setCustomFat("");
    setCustomGrams(100);
    setTab("search");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleAddSelected() {
    if (!selected) return;
    const factor = grams / 100;
    onAdd({
      foodId: selected.id,
      name: selected.name,
      grams,
      calories: Math.round(selected.caloriesPer100 * factor),
      protein: Math.round(selected.proteinPer100 * factor * 10) / 10,
      carbs: Math.round(selected.carbsPer100 * factor * 10) / 10,
      fat: Math.round(selected.fatPer100 * factor * 10) / 10,
    });
    handleClose();
  }

  function handleAddCustom() {
    const cals = parseFloat(customCalories) || 0;
    const protein = parseFloat(customProtein) || 0;
    const carbs = parseFloat(customCarbs) || 0;
    const fat = parseFloat(customFat) || 0;
    if (!customName.trim() || cals <= 0) return;

    const foodItem: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      category: "other",
      caloriesPer100: cals,
      proteinPer100: protein,
      carbsPer100: carbs,
      fatPer100: fat,
      defaultServingG: customGrams,
      servingLabel: `${customGrams}g`,
    };
    onSaveCustomFood(foodItem);

    const factor = customGrams / 100;
    onAdd({
      foodId: foodItem.id,
      name: foodItem.name,
      grams: customGrams,
      calories: Math.round(cals * factor),
      protein: Math.round(protein * factor * 10) / 10,
      carbs: Math.round(carbs * factor * 10) / 10,
      fat: Math.round(fat * factor * 10) / 10,
    });
    handleClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Add food</h2>
          <button onClick={handleClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 flex gap-1 rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setTab("search")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
              tab === "search" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setTab("custom")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
              tab === "custom" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
            }`}
          >
            Custom entry
          </button>
        </div>

        {tab === "search" && !selected && (
          <>
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search foods (e.g. chicken, rice, yogurt)"
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {results.map((food) => (
                <button
                  key={food.id}
                  onClick={() => {
                    setSelected(food);
                    setGrams(food.defaultServingG);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-800">{food.name}</span>
                  <span className="text-xs text-slate-500">{Math.round(food.caloriesPer100)} kcal/100g</span>
                </button>
              ))}
              {results.length === 0 && query.trim().length > 0 && (
                <p className="px-3 py-4 text-center text-sm text-slate-400">No matches in the local list.</p>
              )}
              {results.length === 0 && query.trim().length === 0 && (
                <p className="px-3 py-4 text-center text-sm text-slate-400">Start typing to search foods.</p>
              )}

              {(onlineLoading || onlineResults.length > 0) && (
                <div className="pt-2">
                  <div className="mb-1 flex items-center gap-1.5 px-3 text-xs font-medium text-slate-400">
                    {onlineLoading && <Loader2 size={12} className="animate-spin" />}
                    Online database
                  </div>
                  {onlineResults.map((food) => (
                    <button
                      key={food.id}
                      onClick={() => {
                        setSelected(food);
                        setGrams(food.defaultServingG);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-800">{food.name}</span>
                      <span className="text-xs text-slate-500">{Math.round(food.caloriesPer100)} kcal/100g</span>
                    </button>
                  ))}
                </div>
              )}

              {results.length === 0 &&
                !onlineLoading &&
                onlineResults.length === 0 &&
                query.trim().length >= 3 && (
                  <p className="px-3 py-2 text-center text-sm text-slate-400">
                    No online matches either. Try custom entry.
                  </p>
                )}
            </div>
          </>
        )}

        {tab === "search" && selected && (
          <div>
            <button
              onClick={() => setSelected(null)}
              className="mb-3 text-xs font-medium text-emerald-700 hover:underline"
            >
              ← back to search
            </button>
            <p className="mb-3 font-medium text-slate-900">{selected.name}</p>
            <label className="mb-1 block text-xs font-medium text-slate-500">Amount (grams)</label>
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value))}
              className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <div className="mb-4 grid grid-cols-4 gap-2 text-center text-xs">
              <div className="rounded-lg bg-slate-50 py-2">
                <div className="font-semibold text-slate-900">
                  {Math.round((selected.caloriesPer100 * grams) / 100)}
                </div>
                <div className="text-slate-500">kcal</div>
              </div>
              <div className="rounded-lg bg-slate-50 py-2">
                <div className="font-semibold text-slate-900">
                  {Math.round((selected.proteinPer100 * grams) / 100)}g
                </div>
                <div className="text-slate-500">protein</div>
              </div>
              <div className="rounded-lg bg-slate-50 py-2">
                <div className="font-semibold text-slate-900">
                  {Math.round((selected.carbsPer100 * grams) / 100)}g
                </div>
                <div className="text-slate-500">carbs</div>
              </div>
              <div className="rounded-lg bg-slate-50 py-2">
                <div className="font-semibold text-slate-900">
                  {Math.round((selected.fatPer100 * grams) / 100)}g
                </div>
                <div className="text-slate-500">fat</div>
              </div>
            </div>
            <button
              onClick={handleAddSelected}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Plus size={16} /> Add to log
            </button>
          </div>
        )}

        {tab === "custom" && (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Food name</label>
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                placeholder="e.g. Homemade protein shake"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Calories /100g</label>
                <input
                  type="number"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Protein /100g</label>
                <input
                  type="number"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Carbs /100g</label>
                <input
                  type="number"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Fat /100g</label>
                <input
                  type="number"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Amount logged now (grams)</label>
              <input
                type="number"
                value={customGrams}
                onChange={(e) => setCustomGrams(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddCustom}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Plus size={16} /> Save & add to log
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
