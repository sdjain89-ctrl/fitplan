import { NextResponse } from "next/server";
import { getRedis } from "../../../utils/redis";
import { HealthDay, HealthWorkout } from "../../../utils/types";

export const runtime = "nodejs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function dedupeWorkouts(workouts: HealthWorkout[]): HealthWorkout[] {
  const seen = new Set<string>();
  const result: HealthWorkout[] = [];
  for (const w of workouts) {
    const key = `${w.type}|${w.durationMin ?? ""}|${w.caloriesBurned ?? ""}|${w.distanceKm ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(w);
  }
  return result;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date || !DATE_RE.test(date)) {
    return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Redis is not configured on the server (UPSTASH_REDIS_REST_URL / TOKEN missing)." },
      { status: 500 }
    );
  }

  const data = await redis.get<HealthDay>(`health:${date}`);
  return NextResponse.json(data ?? null);
}

export async function POST(req: Request) {
  const secret = req.headers.get("x-health-secret");
  if (!process.env.HEALTH_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "HEALTH_WEBHOOK_SECRET is not configured on the server." },
      { status: 500 }
    );
  }
  if (secret !== process.env.HEALTH_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json(
      { error: "Redis is not configured on the server (UPSTASH_REDIS_REST_URL / TOKEN missing)." },
      { status: 500 }
    );
  }

  let body: Partial<HealthDay>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.date || !DATE_RE.test(body.date)) {
    return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
  }

  const existing = (await redis.get<HealthDay>(`health:${body.date}`)) ?? {
    date: body.date,
    workouts: [],
    updatedAt: new Date().toISOString(),
  };

  const merged: HealthDay = {
    date: body.date,
    activeEnergyBurnedKcal: body.activeEnergyBurnedKcal ?? existing.activeEnergyBurnedKcal,
    steps: body.steps ?? existing.steps,
    restingHeartRate: body.restingHeartRate ?? existing.restingHeartRate,
    workouts: dedupeWorkouts([...(existing.workouts ?? []), ...(body.workouts ?? [])]),
    updatedAt: new Date().toISOString(),
  };

  await redis.set(`health:${body.date}`, merged);
  return NextResponse.json({ ok: true, data: merged });
}
