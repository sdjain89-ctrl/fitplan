import { FoodItem } from "./types";

interface OffProduct {
  code: string;
  product_name?: string;
  brands?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
  };
}

interface OffResponse {
  products?: OffProduct[];
}

/**
 * Open Food Facts is a free, CORS-enabled, keyless food database (mostly
 * packaged/branded products worldwide). Used as an online fallback so the
 * app isn't capped at the curated local list. Fails silently -- if the
 * network is unavailable, callers just get an empty array.
 */
export async function searchOpenFoodFacts(query: string, signal?: AbortSignal): Promise<FoodItem[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.searchParams.set("search_terms", trimmed);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", "15");
  url.searchParams.set(
    "fields",
    "code,product_name,brands,nutriments"
  );

  try {
    const res = await fetch(url.toString(), { signal });
    if (!res.ok) return [];
    const data: OffResponse = await res.json();
    if (!data.products) return [];

    const seen = new Set<string>();
    const items: FoodItem[] = [];
    for (const p of data.products) {
      const calories = p.nutriments?.["energy-kcal_100g"];
      const name = p.product_name?.trim();
      if (!name || calories === undefined || calories <= 0) continue;
      const label = p.brands ? `${name} (${p.brands.split(",")[0]})` : name;
      if (seen.has(label)) continue;
      seen.add(label);
      items.push({
        id: `off-${p.code}`,
        name: label,
        category: "other",
        caloriesPer100: Math.round(calories),
        proteinPer100: Math.round((p.nutriments?.proteins_100g ?? 0) * 10) / 10,
        carbsPer100: Math.round((p.nutriments?.carbohydrates_100g ?? 0) * 10) / 10,
        fatPer100: Math.round((p.nutriments?.fat_100g ?? 0) * 10) / 10,
        defaultServingG: 100,
        servingLabel: "100g",
      });
      if (items.length >= 12) break;
    }
    return items;
  } catch {
    // Offline, blocked, or aborted -- online results are a bonus, not required.
    return [];
  }
}
