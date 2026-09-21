import { HealthDay } from "./types";

export async function fetchHealthDay(date: string): Promise<HealthDay | null> {
  try {
    const res = await fetch(`/api/health?date=${date}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as HealthDay | null;
  } catch {
    return null;
  }
}
