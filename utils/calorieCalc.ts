import { ActivityLevel, Goal, Targets, UserProfile } from "./types";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary (desk job, little exercise)",
  light: "Light (exercise 1-3 days/week)",
  moderate: "Moderate (exercise 3-5 days/week)",
  active: "Active (exercise 6-7 days/week)",
  very_active: "Very active (hard training or physical job)",
};

export const GOAL_LABELS: Record<Goal, string> = {
  recomp: "Body recomposition (build muscle + lose fat)",
  cut: "Fat loss priority",
  bulk: "Muscle gain priority",
  maintain: "Maintain current physique",
};

export function calcBMR(profile: Pick<UserProfile, "sex" | "weightKg" | "heightCm" | "age">): number {
  const { sex, weightKg, heightCm, age } = profile;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

export function calcTDEE(profile: UserProfile): number {
  const bmr = calcBMR(profile);
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[profile.activityLevel]);
}

/**
 * Recomp/cut/bulk offsets and protein targets follow standard evidence-based
 * ranges (protein 1.6-2.4 g/kg for resistance-trained individuals; a mild
 * deficit preserves muscle better than an aggressive one during recomposition).
 */
export function calcTargets(profile: UserProfile): Targets {
  const bmr = calcBMR(profile);
  const tdee = calcTDEE(profile);
  const kg = profile.weightKg;

  let calorieOffset = 0;
  let proteinPerKg = 1.8;
  let fatPerKg = 0.8;

  switch (profile.goal) {
    case "recomp":
      calorieOffset = -250;
      proteinPerKg = 2.0;
      fatPerKg = 0.8;
      break;
    case "cut":
      calorieOffset = -500;
      proteinPerKg = 2.2;
      fatPerKg = 0.75;
      break;
    case "bulk":
      calorieOffset = 250;
      proteinPerKg = 1.8;
      fatPerKg = 0.9;
      break;
    case "maintain":
      calorieOffset = 0;
      proteinPerKg = 1.8;
      fatPerKg = 0.9;
      break;
  }

  const calories = Math.max(1200, Math.round(tdee + calorieOffset));
  const proteinG = Math.round(kg * proteinPerKg);
  const fatG = Math.round(kg * fatPerKg);
  const proteinCals = proteinG * 4;
  const fatCals = fatG * 9;
  const carbsG = Math.max(0, Math.round((calories - proteinCals - fatCals) / 4));

  return { bmr, tdee, calories, proteinG, carbsG, fatG };
}
