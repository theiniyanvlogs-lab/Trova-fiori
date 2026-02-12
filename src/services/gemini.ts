import { FlowerDetails } from "../types";

/* ✅ Grok API Key from Vercel Environment */
const API_KEY = import.meta.env.VITE_GROK_API_KEY;

/* ---------------------------------------------------
   ✅ Helper Function: Clean JSON Output
--------------------------------------------------- */
function extractJson(rawText: string) {
  const cleaned = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

/* ---------------------------------------------------
   ✅ 1. Identify Flower (Grok Vision Model)
--------------------------------------------------- */
export async function identifyFlower(
  imageBase64: string
): Promise<FlowerDetails> {
  if (!API_KEY) {
    throw new Error("Missing Grok API Key in Environment Variables");
  }

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

Identify the flower in this image and return ONLY valid JSON:

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
- Output ONLY JSON
- No markdown
- No extra explanation
                `,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("No response from Grok Vision API");
    }

    return extractJson(text);
  } catch (error) {
    console.error("❌ Grok Vision Error:", error);
    throw new Error("We couldn't identify this flower.");
  }
}

/* ---------------------------------------------------
   ✅ 2. Translate Flower Details into Tamil
--------------------------------------------------- */
export async function translateDetailsToTamil(
  details: FlowerDetails
): Promise<any> {
  if (!API_KEY) {
    throw new Error("Missing Grok API Key in Environment Variables");
  }

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
Translate the following flower details into Tamil.

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

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("No translation response from Grok API");
    }

    return extractJson(text);
  } catch (error) {
    console.error("❌ Tamil Translation Error:", error);
    throw new Error("Tamil translation failed.");
  }
}
