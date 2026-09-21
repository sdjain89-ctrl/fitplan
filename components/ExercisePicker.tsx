"use client";

import { useMemo, useRef, useState } from "react";
import { Camera, Loader2, Minus, Plus, Search, X } from "lucide-react";
import { ExerciseItem, ExerciseType, StrengthSet } from "../utils/types";
import { estimateCardioCalories, searchExercises } from "../utils/exerciseDatabase";
import { compressImageToDataUrl } from "../utils/imageCompress";
import { analyzeExercisePhoto } from "../utils/photoAnalysis";

export interface AddedActivity {
  exerciseId?: string;
  name: string;
  type: ExerciseType;
  durationMin?: number;
  sets?: StrengthSet[];
  caloriesBurned: number;
}

export default function ExercisePicker({
  open,
  onClose,
  onAdd,
  customExercises,
  onSaveCustomExercise,
  userWeightKg,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (activity: AddedActivity) => void;
  customExercises: ExerciseItem[];
  onSaveCustomExercise: (exercise: ExerciseItem) => void;
  userWeightKg: number;
}) {
  const [tab, setTab] = useState<"search" | "photo" | "custom">("search");
  const [typeFilter, setTypeFilter] = useState<ExerciseType>("strength");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ExerciseItem | null>(null);
  const [sets, setSets] = useState<StrengthSet[]>([{ reps: 10, weightKg: 20 }]);
  const [durationMin, setDurationMin] = useState(20);

  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState<ExerciseType>("strength");
  const [customCalories, setCustomCalories] = useState("");
  const [customDuration, setCustomDuration] = useState(30);

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoAnalyzing, setPhotoAnalyzing] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [photoType, setPhotoType] = useState<ExerciseType>("cardio");
  const [photoDuration, setPhotoDuration] = useState("");
  const [photoCalories, setPhotoCalories] = useState("");
  const [photoNotes, setPhotoNotes] = useState<string | undefined>(undefined);
  const [photoResultReady, setPhotoResultReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(
    () => searchExercises(query, typeFilter, customExercises),
    [query, typeFilter, customExercises]
  );

  if (!open) return null;

  function reset() {
    setQuery("");
    setSelected(null);
    setSets([{ reps: 10, weightKg: 20 }]);
    setDurationMin(20);
    setCustomName("");
    setCustomCalories("");
    setCustomDuration(30);
    setPhotoPreview(null);
    setPhotoAnalyzing(false);
    setPhotoError(null);
    setPhotoName("");
    setPhotoType("cardio");
    setPhotoDuration("");
    setPhotoCalories("");
    setPhotoNotes(undefined);
    setPhotoResultReady(false);
    setTab("search");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function selectExercise(ex: ExerciseItem) {
    setSelected(ex);
    if (ex.type === "strength") {
      const count = ex.defaultSets ?? 3;
      setSets(Array.from({ length: count }, () => ({ reps: 10, weightKg: 20 })));
    } else {
      setDurationMin(20);
    }
  }

  function handleAddStrength() {
    if (!selected) return;
    const estMinutes = Math.max(5, sets.length * 3);
    const caloriesBurned = estimateCardioCalories(5, userWeightKg, estMinutes);
    onAdd({
      exerciseId: selected.id,
      name: selected.name,
      type: "strength",
      sets,
      caloriesBurned,
    });
    handleClose();
  }

  function handleAddCardio() {
    if (!selected || !selected.met) return;
    const caloriesBurned = estimateCardioCalories(selected.met, userWeightKg, durationMin);
    onAdd({
      exerciseId: selected.id,
      name: selected.name,
      type: "cardio",
      durationMin,
      caloriesBurned,
    });
    handleClose();
  }

  function handleAddCustom() {
    if (!customName.trim()) return;
    const cals = parseFloat(customCalories) || 0;
    const exerciseItem: ExerciseItem = {
      id: `custom-ex-${Date.now()}`,
      name: customName.trim(),
      type: customType,
    };
    onSaveCustomExercise(exerciseItem);
    onAdd({
      exerciseId: exerciseItem.id,
      name: exerciseItem.name,
      type: customType,
      durationMin: customDuration,
      caloriesBurned: cals,
    });
    handleClose();
  }

  async function handlePhotoSelected(file: File) {
    setPhotoError(null);
    setPhotoResultReady(false);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setPhotoPreview(dataUrl);
      setPhotoAnalyzing(true);
      const result = await analyzeExercisePhoto(dataUrl);
      setPhotoName(result.name ?? "");
      setPhotoType(result.type ?? "cardio");
      setPhotoDuration(result.durationMin != null ? String(result.durationMin) : "");
      setPhotoCalories(result.caloriesBurned != null ? String(result.caloriesBurned) : "");
      setPhotoNotes(result.notes);
      setPhotoResultReady(true);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Couldn't analyze that photo");
    } finally {
      setPhotoAnalyzing(false);
    }
  }

  function handleAddPhoto() {
    if (!photoName.trim()) return;
    onAdd({
      name: photoName.trim(),
      type: photoType,
      durationMin: photoDuration ? Number(photoDuration) : undefined,
      caloriesBurned: Number(photoCalories) || 0,
    });
    handleClose();
  }

  function updateSet(index: number, field: keyof StrengthSet, value: number) {
    setSets((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Log activity</h2>
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
            <div className="mb-3 flex gap-1 rounded-lg bg-slate-100 p-1">
              <button
                onClick={() => setTypeFilter("strength")}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
                  typeFilter === "strength" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                }`}
              >
                Strength
              </button>
              <button
                onClick={() => setTypeFilter("cardio")}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
                  typeFilter === "cardio" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                }`}
              >
                Cardio
              </button>
            </div>
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search exercises"
                className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="max-h-64 space-y-1 overflow-y-auto">
              {results.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => selectExercise(ex)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-800">{ex.name}</span>
                  <span className="text-xs capitalize text-slate-500">{ex.muscleGroup ?? ex.type}</span>
                </button>
              ))}
              {results.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-slate-400">No matches. Try custom entry.</p>
              )}
            </div>
          </>
        )}

        {tab === "search" && selected && selected.type === "strength" && (
          <div>
            <button onClick={() => setSelected(null)} className="mb-3 text-xs font-medium text-emerald-700 hover:underline">
              ← back to search
            </button>
            <p className="mb-3 font-medium text-slate-900">{selected.name}</p>
            <div className="mb-2 grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs font-medium text-slate-500">
              <span>Set</span>
              <span>Reps</span>
              <span>Weight (kg)</span>
              <span></span>
            </div>
            <div className="space-y-2">
              {sets.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2">
                  <span className="text-sm text-slate-500">{i + 1}</span>
                  <input
                    type="number"
                    value={s.reps}
                    onChange={(e) => updateSet(i, "reps", Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    value={s.weightKg}
                    onChange={(e) => updateSet(i, "weightKg", Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    onClick={() => setSets((prev) => prev.filter((_, idx) => idx !== i))}
                    className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
                  >
                    <Minus size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSets((prev) => [...prev, { reps: 10, weightKg: prev[prev.length - 1]?.weightKg ?? 20 }])}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
            >
              <Plus size={14} /> Add set
            </button>
            <button
              onClick={handleAddStrength}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Plus size={16} /> Add to log
            </button>
          </div>
        )}

        {tab === "search" && selected && selected.type === "cardio" && (
          <div>
            <button onClick={() => setSelected(null)} className="mb-3 text-xs font-medium text-emerald-700 hover:underline">
              ← back to search
            </button>
            <p className="mb-3 font-medium text-slate-900">{selected.name}</p>
            <label className="mb-1 block text-xs font-medium text-slate-500">Duration (minutes)</label>
            <input
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value))}
              className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
            <div className="mb-4 rounded-lg bg-slate-50 py-3 text-center">
              <div className="text-lg font-semibold text-slate-900">
                {estimateCardioCalories(selected.met ?? 5, userWeightKg, durationMin)} kcal
              </div>
              <div className="text-xs text-slate-500">estimated burn</div>
            </div>
            <button
              onClick={handleAddCardio}
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
                <span className="text-sm font-medium">Photo a watch/machine display</span>
                <span className="text-xs text-slate-400">AI reads duration & calories for you to review</span>
              </button>
            )}

            {photoPreview && (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="Workout display" className="mb-3 max-h-48 w-full rounded-xl object-cover" />

                {photoAnalyzing && (
                  <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
                    <Loader2 size={16} className="animate-spin" /> Analyzing photo...
                  </div>
                )}

                {photoError && (
                  <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{photoError}</p>
                )}

                {!photoAnalyzing && photoResultReady && (
                  <div className="space-y-3">
                    {photoNotes && <p className="text-xs italic text-slate-400">{photoNotes}</p>}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-500">Activity name</label>
                      <input
                        value={photoName}
                        onChange={(e) => setPhotoName(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                      <button
                        onClick={() => setPhotoType("strength")}
                        className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
                          photoType === "strength" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                        }`}
                      >
                        Strength
                      </button>
                      <button
                        onClick={() => setPhotoType("cardio")}
                        className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
                          photoType === "cardio" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                        }`}
                      >
                        Cardio
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">Duration (min)</label>
                        <input
                          type="number"
                          value={photoDuration}
                          onChange={(e) => setPhotoDuration(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">Calories burned</label>
                        <input
                          type="number"
                          value={photoCalories}
                          onChange={(e) => setPhotoCalories(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddPhoto}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      <Plus size={16} /> Add to log
                    </button>
                  </div>
                )}

                {!photoAnalyzing && (
                  <button
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhotoResultReady(false);
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
              <label className="mb-1 block text-xs font-medium text-slate-500">Activity name</label>
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                placeholder="e.g. Rock climbing"
              />
            </div>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              <button
                onClick={() => setCustomType("strength")}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
                  customType === "strength" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                }`}
              >
                Strength
              </button>
              <button
                onClick={() => setCustomType("cardio")}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium ${
                  customType === "cardio" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"
                }`}
              >
                Cardio
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Duration (min)</label>
                <input
                  type="number"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Calories burned</label>
                <input
                  type="number"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
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
