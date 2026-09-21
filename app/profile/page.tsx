"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { useLocalStorageState, STORAGE_KEYS } from "../../utils/storage";
import { UserProfile, ActivityLevel, Goal } from "../../utils/types";
import { DEFAULT_PROFILE } from "../../utils/defaultProfile";
import { ACTIVITY_LABELS, GOAL_LABELS, calcTargets } from "../../utils/calorieCalc";

export default function ProfilePage() {
  const [profile, setProfile, hydrated] = useLocalStorageState<UserProfile>(
    STORAGE_KEYS.profile,
    DEFAULT_PROFILE
  );
  const [draft, setDraft] = useState<UserProfile | null>(null);
  const [saved, setSaved] = useState(false);

  const current = draft ?? profile;

  if (!hydrated) return null;

  function update<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setDraft({ ...current, [key]: value });
    setSaved(false);
  }

  function handleSave() {
    setProfile({ ...current, onboarded: true });
    setDraft(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const targets = calcTargets(current);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 pb-24 md:py-10">
      <h1 className="text-2xl font-bold text-slate-900">Your profile</h1>
      <p className="mt-1 text-sm text-slate-500">
        Your stats drive your daily calorie & macro targets and workout plan. Update anytime as your
        weight changes.
      </p>

      <div className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            value={current.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            placeholder="Your name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Sex</label>
            <select
              value={current.sex}
              onChange={(e) => update("sex", e.target.value as UserProfile["sex"])}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Age</label>
            <input
              type="number"
              value={current.age}
              onChange={(e) => update("age", Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Height (cm)</label>
            <input
              type="number"
              value={current.heightCm}
              onChange={(e) => update("heightCm", Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Weight (kg)</label>
            <input
              type="number"
              value={current.weightKg}
              onChange={(e) => update("weightKg", Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Activity level</label>
          <select
            value={current.activityLevel}
            onChange={(e) => update("activityLevel", e.target.value as ActivityLevel)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Goal</label>
          <select
            value={current.goal}
            onChange={(e) => update("goal", e.target.value as Goal)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            {Object.entries(GOAL_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {current.goal === "recomp" && (
            <p className="mt-1 text-xs text-slate-500">
              Recommended for building muscle while losing fat: a mild calorie deficit with high protein,
              paired with resistance training.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Workout days per week: {current.workoutDaysPerWeek}
          </label>
          <input
            type="range"
            min={3}
            max={6}
            value={current.workoutDaysPerWeek}
            onChange={(e) => update("workoutDaysPerWeek", Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>3</span>
            <span>4</span>
            <span>5</span>
            <span>6</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Save size={16} /> {saved ? "Saved!" : "Save profile"}
        </button>
      </div>

      <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <h2 className="font-semibold text-emerald-900">Your calculated targets</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <TargetStat label="BMR" value={targets.bmr} unit="kcal" />
          <TargetStat label="TDEE" value={targets.tdee} unit="kcal" />
          <TargetStat label="Daily goal" value={targets.calories} unit="kcal" highlight />
          <TargetStat label="Protein" value={targets.proteinG} unit="g" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <TargetStat label="Carbs" value={targets.carbsG} unit="g" />
          <TargetStat label="Fat" value={targets.fatG} unit="g" />
        </div>
        <p className="mt-3 text-xs text-emerald-800">
          Based on the Mifflin-St Jeor formula. These update automatically whenever you change your stats
          or goal above.
        </p>
      </div>
    </div>
  );
}

function TargetStat({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: number;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg p-3 text-center ${highlight ? "bg-emerald-600 text-white" : "bg-white"}`}>
      <div className={`text-lg font-bold ${highlight ? "text-white" : "text-slate-900"}`}>{value}</div>
      <div className={`text-xs ${highlight ? "text-emerald-100" : "text-slate-500"}`}>
        {label} ({unit})
      </div>
    </div>
  );
}
