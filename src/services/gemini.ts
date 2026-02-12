// src/services/gemini.ts

import { FlowerDetails } from "../types";

/* ✅ Grok API Key */
const API_KEY = import.meta.env.VITE_GROK_API_KEY;

/* ✅ Helper: Extract Clean JSON */
function extractJson(rawText: string) {
  const cleaned = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

/* ---------------------------------------------------
   ✅ 1. Identify Flower (Vision Model)
--------------------------------------------------- */
export async function identifyFlower(imageUrl: string): Promise<FlowerDetails> {
  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },

      body: JSON.stringify({
        model: "grok-vision-beta",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
You are a flower identification expert.

Identify this flower and return ONLY valid JSON:

{
  "commonName": "",
  "scientificName": "",
  "description": "",
  "sun": "",
  "soilNeeds": "",
  "bloomsIn": "",
  "naturalHabitat": "",
  "flowerType": "",
  "funFact": ""
}

STRICT RULES:
- ONLY JSON output
- No markdown
- No extra text
                `,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl, // ✅ Public Cloudinary URL
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    console.log("✅ Grok Vision Response:", data);

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("❌ No response from Grok Vision API");
    }

    return extractJson(text);
  } catch (error) {
    console.error("❌ Identify Flower Error:", error);
    throw new Error("No response from Grok AI.");
  }
}

/* ---------------------------------------------------
   ✅ 2. Translate Details to Tamil (Text Model)
--------------------------------------------------- */
export async function translateDetailsToTamil(details: FlowerDetails) {
  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },

      body: JSON.stringify({
        model: "grok-beta",
        messages: [
          {
            role: "user",
            content: `
Translate the flower details below into Tamil.

Return ONLY valid JSON:

{
  "commonName": "",
  "description": "",
  "sun": "",
  "soilNeeds": "",
  "bloomsIn": "",
  "naturalHabitat": "",
  "flowerType": "",
  "funFact": ""
}

STRICT RULES:
- ONLY JSON output
- No markdown
- No extra text

Flower Data:
${JSON.stringify(details)}
            `,
          },
        ],
      }),
    });

    const data = await response.json();

    console.log("✅ Tamil Translate Response:", data);

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("❌ No translation response from Grok API");
    }

    return extractJson(text);
  } catch (error) {
    console.error("❌ Tamil Translate Error:", error);
    throw new Error("Tamil translation failed.");
  }
}
