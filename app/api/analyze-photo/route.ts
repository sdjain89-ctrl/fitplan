import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const FOOD_PROMPT = `You are a nutrition estimation assistant. Look at this photo of food and identify each distinct food item visible. For each item, estimate its portion size in grams and its calories, protein, carbs, and fat for that portion (not per 100g -- for the actual amount shown).

Respond with ONLY valid JSON, no markdown fences, no commentary, matching exactly this shape:
{"items":[{"name":string,"grams":number,"calories":number,"protein":number,"carbs":number,"fat":number}],"notes":string}

"notes" should briefly flag any real uncertainty (e.g. "couldn't tell if the rice was white or brown"). Always provide your best numeric estimate even if uncertain -- never omit numbers.`;

const EXERCISE_PROMPT = `You are a fitness log assistant. This photo shows either a smartwatch/fitness tracker display, gym equipment console, or a workout summary screen. Extract what is visible: the exercise/activity name, whether it's cardio or strength, duration in minutes, and calories burned.

Respond with ONLY valid JSON, no markdown fences, no commentary, matching exactly this shape:
{"name":string,"type":"cardio"|"strength","durationMin":number|null,"caloriesBurned":number|null,"notes":string}

Use null for any field you genuinely cannot determine from the image. "notes" should briefly explain anything uncertain.`;

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Model response was not valid JSON");
  }
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server. Add it in your Vercel project's environment variables." },
      { status: 500 }
    );
  }

  let body: { context?: string; imageDataUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { context, imageDataUrl } = body;
  if (context !== "food" && context !== "exercise") {
    return NextResponse.json({ error: "context must be 'food' or 'exercise'" }, { status: 400 });
  }
  if (!imageDataUrl || !imageDataUrl.startsWith("data:image/")) {
    return NextResponse.json({ error: "imageDataUrl must be a data: URL" }, { status: 400 });
  }

  const match = imageDataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) {
    return NextResponse.json({ error: "Malformed image data URL" }, { status: 400 });
  }
  const [, mediaType, base64Data] = match;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
                data: base64Data,
              },
            },
            { type: "text", text: context === "food" ? FOOD_PROMPT : EXERCISE_PROMPT },
          ],
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "Model returned no text" }, { status: 502 });
    }

    const parsed = extractJson(textBlock.text);
    return NextResponse.json(parsed);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error calling the model";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
