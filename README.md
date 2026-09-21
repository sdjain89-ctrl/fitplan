# FitPlan

A personal nutrition and training tracker for building muscle while losing fat (body
recomposition). Tracks food and activity, plans daily meals and workouts, and shows a clear
calorie/macro target for every day — all stored locally in your browser, no account needed.

## Features

- **Profile & targets** — enter your stats and goal; BMR/TDEE (Mifflin-St Jeor) and daily
  calorie + protein/carb/fat targets are calculated automatically, tuned for muscle gain + fat
  loss by default.
- **Food tracking** — log meals against a built-in food database (searchable, with macros per
  100g) or add custom foods; entries are grouped by breakfast/lunch/dinner/snack.
- **Activity tracking** — log strength workouts (sets, reps, weight) or cardio (duration, with
  calorie burn estimated from MET values and your body weight), or add custom activities.
- **Daily dashboard** — one glance at calories remaining, macro progress, today's planned
  workout, and today's logged food/activity.
- **Weekly plan** — an auto-generated training split (3-6 days/week: full body, upper/lower, or
  push/pull/legs) and a sample meal template built to hit your targets.

## Stack

- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS 3
- lucide-react icons
- Browser `localStorage` for persistence (client-only, no backend)

## Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, then set up your profile under **Profile** to get personalized
targets and a weekly plan.

## Structure

- `app/page.tsx` — dashboard: today's calorie/macro progress, today's workout, quick logging
- `app/food/page.tsx` — food log by date, grouped by meal
- `app/activity/page.tsx` — activity log by date
- `app/plan/page.tsx` — weekly workout split + sample meal plan
- `app/profile/page.tsx` — stats, goal, and computed targets
- `components/` — `FoodPicker`, `ExercisePicker`, `Navbar`, and dashboard UI pieces
- `utils/calorieCalc.ts` — BMR/TDEE and macro target calculations
- `utils/foodDatabase.ts` / `utils/exerciseDatabase.ts` — built-in food & exercise data
- `utils/workoutPlanner.ts` / `utils/mealPlanner.ts` — weekly plan generation
- `utils/storage.ts` — `localStorage`-backed state hook
