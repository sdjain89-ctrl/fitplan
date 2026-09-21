# Setting up photo AI + Apple Watch sync

The food/exercise photo scanner and the Apple Watch sync both need a small
backend, which is already built into this app as Next.js API routes
(`app/api/analyze-photo`, `app/api/health`) — nothing extra to deploy, but
you do need to provision two things in your Vercel project and configure
one Shortcut on your iPhone. This is one-time setup.

## 1. Photo AI (food & exercise photo scanning)

1. Get an Anthropic API key at **[console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)**
   (you'll need to add billing there — this is billed per photo scan to
   your own Anthropic account, separate from anything else).
2. In your Vercel project (**fitplan**) → **Settings → Environment
   Variables**, add:
   - `ANTHROPIC_API_KEY` = the key from step 1
3. Redeploy (**Deployments** tab → latest deployment → **Redeploy**, or
   just push any commit) so the new env var takes effect.

That's it — the "Photo" tab in the food and activity log will start
working. Cost is small (a few cents per scan at most), but it's real
usage-based billing, so keep an eye on it if you scan often.

## 2. Apple Watch / Health sync

Apple doesn't let any website read HealthKit data directly — it only
allows on-device apps and Shortcuts. So the flow is: **iPhone Shortcut →
pushes your Health data to this app's API → app displays it on the
dashboard.**

### 2a. Provision storage (Upstash Redis)

The app needs somewhere to store synced data between Shortcut runs.

1. In your Vercel project → **Storage** tab → **Create Database** →
   choose **Redis** (via the Upstash integration) → follow the prompts to
   connect it to the **fitplan** project.
2. This automatically adds `UPSTASH_REDIS_REST_URL` and
   `UPSTASH_REDIS_REST_TOKEN` to your project's environment variables —
   you don't need to set these by hand.

### 2b. Set the write secret

This protects the endpoint so only your Shortcut can push data (reading
is open, since it's just your own fitness numbers and the URL isn't
public knowledge).

1. In **Settings → Environment Variables**, add:
   - `HEALTH_WEBHOOK_SECRET` = `f4df58565753284b5d0b503b5341df7a705fc2d17331c487`
   (a random value generated for you — feel free to swap in your own,
   just make sure the Shortcut uses the same value.)
2. Redeploy.

### 2c. Test the endpoint before touching Shortcuts

From any terminal (replace the URL/secret if you changed them):

```bash
curl -X POST https://fitplan-virid-five.vercel.app/api/health \
  -H "Content-Type: application/json" \
  -H "x-health-secret: f4df58565753284b5d0b503b5341df7a705fc2d17331c487" \
  -d '{"date":"2026-09-21","activeEnergyBurnedKcal":420,"steps":8200,"restingHeartRate":58,"workouts":[{"type":"Outdoor Run","durationMin":32,"caloriesBurned":310,"distanceKm":5.1}]}'
```

You should get back `{"ok":true,"data":{...}}`. Then confirm the read side:

```bash
curl "https://fitplan-virid-five.vercel.app/api/health?date=2026-09-21"
```

If both work, open the app's dashboard on that date — you should see a
"Synced from Apple Watch" card.

### 2d. Build the iOS Shortcut

Open the **Shortcuts** app on your iPhone:

1. **Automation** tab → **+** → **Create Personal Automation** → **Workout**
   → **Ends** → **Any Workout** → **Next** (this fires right after you
   finish a workout on your Watch). Turn off "Ask Before Running" so it
   fires silently.
2. Add these actions in order:
   - **Find Health Samples** — Type: `Active Energy`, filter Start Date is
     Today, sort doesn't matter — set the action's "Aggregate" option (tap
     the action, there's a toggle) to sum today's total. Name this result
     with a comment or just note it as your active-energy variable.
   - **Find Health Samples** — Type: `Steps`, same today filter, aggregate
     Sum.
   - **Find Health Samples** — Type: `Resting Heart Rate`, Most Recent, no
     aggregation needed (single value).
   - **Find Workouts** — filter Start Date is Today. This returns a list;
     each item has `Workout Type`, `Duration`, `Active Energy Burned`,
     `Distance`.
   - **Repeat with Each** item in the workouts list →
     inside the repeat, use **Dictionary** to build
     `{"type": <Workout Type>, "durationMin": <Duration in minutes>,
     "caloriesBurned": <Active Energy Burned>, "distanceKm": <Distance>}`
     and **Add to Variable** (call it `workoutsList`, initialized empty
     before the repeat).
   - **Get Contents of URL**:
     - URL: `https://fitplan-virid-five.vercel.app/api/health`
     - Method: `POST`
     - Headers: `Content-Type: application/json`, `x-health-secret:
       f4df58565753284b5d0b503b5341df7a705fc2d17331c487`
     - Request Body: **JSON**, with fields:
       - `date` → Current Date, formatted `yyyy-MM-dd`
       - `activeEnergyBurnedKcal` → the active energy sum
       - `steps` → the steps sum
       - `restingHeartRate` → the resting HR value
       - `workouts` → the `workoutsList` variable
3. Save. Do one real workout (or use **Force Run** on the automation from
   the Automation tab) to test it, then check the dashboard.

Shortcuts' visual editor varies a bit by iOS version, so exact action
names/toggles may differ slightly — the shape above is the target; look
for the closest equivalent action if a name doesn't match exactly.

### Notes

- Apple Watch data shown on the dashboard is **informational only** — it
  isn't added to your calorie budget automatically, to avoid double-counting
  with anything you log manually. Compare and adjust your own log as you
  see fit.
- If you'd rather not build the Shortcut by hand, a paid app like **Health
  Auto Export** (App Store) can POST the same JSON shape to this endpoint
  on a schedule, with a friendlier UI for picking metrics.
