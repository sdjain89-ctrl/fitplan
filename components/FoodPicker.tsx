"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Loader2, Plus, Search, Trash2, X } from "lucide-react";
import { FoodItem } from "../utils/types";
import { searchFoods } from "../utils/foodDatabase";
import { searchOpenFoodFacts } from "../utils/openFoodFacts";
import { compressImageToDataUrl } from "../utils/imageCompress";
import { analyzeFoodPhoto, PhotoFoodItem } from "../utils/photoAnalysis";

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
  const [tab, setTab] = useState<"search" | "photo" | "custom">("search");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState(100);

  const [customName, setCustomName] = useState("");
  const [customCalories, setCustomCalories] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs, setCustomCarbs] = useState("");
  const [customFat, setCustomFat] = useState("");
  const [customGrams, setCustomGrams] = useState(100);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoAnalyzing, setPhotoAnalyzing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoItems, setPhotoItems] = useState<PhotoFoodItem[] | null>(null);
  const [photoNotes, setPhotoNotes] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setPhotoPreview(null);
    setPhotoAnalyzing(false);
    setPhotoError(null);
    setPhotoItems(null);
    setPhotoNotes(undefined);
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

  async function handlePhotoSelected(file: File) {
    setPhotoError(null);
    setPhotoItems(null);
    setPhotoNotes(undefined);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setPhotoPreview(dataUrl);
      setPhotoAnalyzing(true);
      const result = await analyzeFoodPhoto(dataUrl);
      setPhotoItems(result.items);
      setPhotoNotes(result.notes);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Couldn't analyze that photo");
    } finally {
      setPhotoAnalyzing(false);
    }
  }

  function updatePhotoItem(index: number, field: keyof PhotoFoodItem, value: string) {
    setPhotoItems((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const item = { ...next[index] };
      if (field === "name") {
        item.name = value;
      } else {
        (item[field] as number) = Number(value) || 0;
      }
      next[index] = item;
      return next;
    });
  }

  function removePhotoItem(index: number) {
    setPhotoItems((prev) => (prev ? prev.filter((_, i) => i !== index) : prev));
  }

  function handleAddPhotoItems() {
    if (!photoItems || photoItems.length === 0) return;
    for (const item of photoItems) {
      onAdd({
        name: item.name,
        grams: item.grams,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
      });
    }
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
            onClick={() => setTab("photo")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
              tab === "photo" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
            }`}
          >
            Photo
          </button>
          <button
            onClick={() => setTab("custom")}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
              tab === "custom" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
            }`}
          >
            Custom
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

        {tab === "photo" && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoSelected(file);
                e.target.value = "";
              }}
            />

            {!photoPreview && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-10 text-slate-500 hover:border-emerald-400 hover:text-emerald-700"
              >
                <Camera size={28} />
                <span className="text-sm font-medium">Take or upload a photo</span>
                <span className="text-xs text-slate-400">AI estimates calories & macros for you to review</span>
              </button>
            )}

            {photoPreview && (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="Food photo" className="mb-3 max-h-48 w-full rounded-xl object-cover" />

                {photoAnalyzing && (
                  <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
                    <Loader2 size={16} className="animate-spin" /> Analyzing photo...
                  </div>
                )}

                {photoError && (
                  <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{photoError}</p>
                )}

                {!photoAnalyzing && photoItems && photoItems.length > 0 && (
                  <div className="space-y-3">
                    {photoNotes && <p className="text-xs italic text-slate-400">{photoNotes}</p>}
                    {photoItems.map((item, i) => (
                      <div key={i} className="rounded-lg border border-slate-200 p-3">
                        <div className="mb-2 flex items-center gap-2">
                          <input
                            value={item.name}
                            onChange={(e) => updatePhotoItem(i, "name", e.target.value)}
                            className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-sm font-medium focus:border-emerald-500 focus:outline-none"
                          />
                          <button onClick={() => removePhotoItem(i)} className="rounded p-1 text-slate-300 hover:text-red-500">
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5 text-center text-[11px]">
                          {(["grams", "calories", "protein", "carbs", "fat"] as const).map((field) => (
                            <div key={field}>
                              <input
                                type="number"
                                value={item[field]}
                                onChange={(e) => updatePhotoItem(i, field, e.target.value)}
                                className="w-full rounded-md border border-slate-200 px-1 py-1 text-center text-xs focus:border-emerald-500 focus:outline-none"
                              />
                              <div className="mt-0.5 text-slate-400">{field === "grams" ? "g" : field}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={handleAddPhotoItems}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      <Plus size={16} /> Add {photoItems.length > 1 ? "all" : ""} to log
                    </button>
                  </div>
                )}

                {!photoAnalyzing && (
                  <button
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhotoItems(null);
                      setPhotoError(null);
                    }}
                    className="mt-3 w-full text-center text-xs font-medium text-slate-500 hover:underline"
                  >
                    Retake / choose a different photo
                  </button>
                )}
              </div>
            )}
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
