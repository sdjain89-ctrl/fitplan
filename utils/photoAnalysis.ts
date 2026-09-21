export interface PhotoFoodItem {
  name: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface PhotoFoodResult {
  items: PhotoFoodItem[];
  notes?: string;
}

export interface PhotoExerciseResult {
  name: string;
  type: "cardio" | "strength";
  durationMin: number | null;
  caloriesBurned: number | null;
  notes?: string;
}

interface AnalyzeError {
  error: string;
}

export async function analyzeFoodPhoto(imageDataUrl: string): Promise<PhotoFoodResult> {
  const res = await fetch("/api/analyze-photo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context: "food", imageDataUrl }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as AnalyzeError).error ?? "Analysis failed");
  return data as PhotoFoodResult;
}

export async function analyzeExercisePhoto(imageDataUrl: string): Promise<PhotoExerciseResult> {
  const res = await fetch("/api/analyze-photo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context: "exercise", imageDataUrl }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as AnalyzeError).error ?? "Analysis failed");
  return data as PhotoExerciseResult;
}
