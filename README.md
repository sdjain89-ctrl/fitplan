# FitPlan

A personal nutrition and training tracker for building muscle while losing fat (body
recomposition). Tracks food and activity, plans daily meals and workouts, and shows a clear
calorie/macro target for every day. Core logging is stored locally in your browser (no
account needed); photo scanning and Apple Watch sync use a small backend (see
[HEALTH_SETUP.md](./HEALTH_SETUP.md)) that's optional to set up.

## Features

- **Profile & targets** — enter your stats and goal; BMR/TDEE (Mifflin-St Jeor) and daily
  calorie + protein/carb/fat targets are calculated automatically, tuned for muscle gain + fat
  loss by default.
- **Food tracking** — log meals against a ~130-item built-in food database, live-search a much
  larger online database (Open Food Facts) for anything not in the local list, snap a **photo**
  of a meal for an AI calorie/macro estimate, or add fully custom foods. Entries are grouped by
  breakfast/lunch/dinner/snack.
- **Activity tracking** — log strength workouts (sets, reps, weight) or cardio (duration, with
  calorie burn estimated from MET values and your body weight), snap a **photo** of a
  smartwatch/machine display for an AI-read estimate, or add custom activities.
- **Apple Watch sync** — an iOS Shortcut can push your daily steps, active calories, resting
  heart rate, and workouts to the dashboard for reference (see
  [HEALTH_SETUP.md](./HEALTH_SETUP.md)).
- **Daily dashboard** — one glance at calories remaining, macro progress, today's planned
  workout, today's logged food/activity, and synced Apple Watch data.
- **Weekly plan** — an auto-generated training split (3-6 days/week: full body, upper/lower, or
  push/pull/legs) and a sample meal template built to hit your targets.
- **Installable iOS app** — a Progressive Web App: add it to your iPhone home screen for a
  full-screen, native-feeling app icon, with offline-capable caching so it still loads without
  signal. See **Installing on iPhone** below.

## Installing on iPhone

FitPlan is a Progressive Web App (PWA) rather than an App Store app — no Apple Developer
account or app review needed, and it updates itself every time you deploy.

1. Open the live URL in **Safari** on your iPhone (must be Safari, not Chrome, for this step).
2. Tap the **Share** icon (square with an arrow) in the toolbar.
3. Scroll down and tap **Add to Home Screen**.
4. Tap **Add**.

You'll get a home screen icon that launches full-screen (no Safari address bar), with its own
app switcher entry. The app will also prompt you with this same instruction the first time you
visit in Safari, until you dismiss it.

## Stack

- Next.js 14 (App Router), deployed on Vercel
- React 18 + TypeScript
- Tailwind CSS 3
- lucide-react icons
- Browser `localStorage` for core logging (client-only)
- Next.js API routes + Anthropic API (photo analysis) + Upstash Redis (Apple Watch sync) for
  the optional backend features — see [HEALTH_SETUP.md](./HEALTH_SETUP.md)

## Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, then set up your profile under **Profile** to get personalized
targets and a weekly plan. Photo scanning and Apple Watch sync require the env vars in
[.env.example](./.env.example) — see [HEALTH_SETUP.md](./HEALTH_SETUP.md) for full setup.

## Structure

- `app/page.tsx` — dashboard: today's calorie/macro progress, today's workout, quick logging,
  synced Apple Watch data
- `app/food/page.tsx` — food log by date, grouped by meal
- `app/activity/page.tsx` — activity log by date
- `app/plan/page.tsx` — weekly workout split + sample meal plan
- `app/profile/page.tsx` — stats, goal, and computed targets
- `app/api/analyze-photo/route.ts` — Claude vision call for food/exercise photo scanning
- `app/api/health/route.ts` — Apple Watch/Health data ingestion (POST, secret-protected) and
  read (GET), backed by Redis
- `components/` — `FoodPicker`, `ExercisePicker`, `Navbar`, and dashboard UI pieces
- `utils/calorieCalc.ts` — BMR/TDEE and macro target calculations
- `utils/foodDatabase.ts` / `utils/exerciseDatabase.ts` — built-in food & exercise data
- `utils/openFoodFacts.ts` — live online food search
- `utils/photoAnalysis.ts` — client helpers for the photo-scan API
- `utils/workoutPlanner.ts` / `utils/mealPlanner.ts` — weekly plan generation
- `utils/storage.ts` — `localStorage`-backed state hook
- `utils/redis.ts` / `utils/health.ts` — Apple Watch sync storage + client fetch helper
- `app/manifest.ts` — PWA manifest (name, icons, standalone display)
- `app/icon.png` / `app/apple-icon.png` — favicon and iOS home-screen icon (Next.js file
  convention, auto-linked in `<head>`)
- `public/sw.js` / `components/ServiceWorkerRegister.tsx` — offline app-shell caching
- `components/InstallPrompt.tsx` — "Add to Home Screen" hint shown to iOS Safari visitors
