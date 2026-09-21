"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Flame, Plus, Trash2 } from "lucide-react";
import { useLocalStorageState, STORAGE_KEYS } from "../../utils/storage";
import { ActivityLogEntry, ExerciseItem, UserProfile } from "../../utils/types";
import { DEFAULT_PROFILE } from "../../utils/defaultProfile";
import { addDays, formatDisplayDate, todayISO } from "../../utils/dateUtils";
import ExercisePicker, { AddedActivity } from "../../components/ExercisePicker";

export default function ActivityPage() {
  const [profile, , profileHydrated] = useLocalStorageState<UserProfile>(
    STORAGE_KEYS.profile,
    DEFAULT_PROFILE
  );
  const [activityLog, setActivityLog, activityHydrated] = useLocalStorageState<ActivityLogEntry[]>(
    STORAGE_KEYS.activityLog,
    []
  );
  const [customExercises, setCustomExercises] = useLocalStorageState<ExerciseItem[]>(
    STORAGE_KEYS.customExercises,
    []
  );

  const [date, setDate] = useState(todayISO());
  const [pickerOpen, setPickerOpen] = useState(false);

  const hydrated = profileHydrated && activityHydrated;
  if (!hydrated) return null;

  const dayEntries = activityLog.filter((a) => a.date === date);
  const totalBurned = dayEntries.reduce((s, a) => s + a.caloriesBurned, 0);

  function addActivity(activity: AddedActivity) {
    const entry: ActivityLogEntry = {
      id: `activity-${Date.now()}`,
      date,
      loggedAt: new Date().toISOString(),
      ...activity,
    };
    setActivityLog((prev) => [...prev, entry]);
  }

  function removeActivity(id: string) {
    setActivityLog((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-24 md:py-10">
      <h1 className="text-2xl font-bold text-slate-900">Activity log</h1>

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

      <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Flame size={16} />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-700">Total burned</p>
            <p className="text-xs text-slate-400">{dayEntries.length} activities logged</p>
          </div>
        </div>
        <span className="text-xl font-bold text-slate-900">{totalBurned} kcal</span>
      </div>

      <button
        onClick={() => setPickerOpen(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-sky-300 bg-sky-50 py-4 font-medium text-sky-700 hover:bg-sky-100"
      >
        <Plus size={18} /> Log activity
      </button>

      <div className="mt-4 space-y-2">
        {dayEntries.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-400 shadow-sm">
            No activity logged for this day yet.
          </p>
        )}
        {dayEntries.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <p className="font-medium text-slate-800">{a.name}</p>
              <p className="text-xs text-slate-400">
                {a.type === "strength"
                  ? a.sets
                      ?.map((s, i) => `S${i + 1}: ${s.reps}×${s.weightKg}kg`)
                      .join("  ")
                  : `${a.durationMin} min`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-amber-700">{a.caloriesBurned} kcal</span>
              <button onClick={() => removeActivity(a.id)} className="rounded p-1 text-slate-300 hover:text-red-500">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ExercisePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onAdd={addActivity}
        customExercises={customExercises}
        onSaveCustomExercise={(ex) => setCustomExercises((prev) => [...prev, ex])}
        userWeightKg={profile.weightKg}
      />
    </div>
  );
}
