import { FlowerDetails } from "../types";

/* ✅ Grok API Key from Vercel Environment */
const API_KEY = import.meta.env.VITE_GROK_API_KEY;

/* ---------------------------------------------------
   ✅ Helper: Clean + Extract JSON Safely
--------------------------------------------------- */
function extractJson(rawText: string) {
  try {
    const cleaned = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ JSON Parse Failed:", rawText);
    throw new Error("Invalid JSON returned by Grok AI.");
  }
}

/* ---------------------------------------------------
   ✅ Helper: Ensure Proper Base64 Image Format
--------------------------------------------------- */
function formatBase64Image(imageBase64: string) {
  if (imageBase64.startsWith("data:image")) {
    return imageBase64;
  }
  return `data:image/jpeg;base64,${imageBase64}`;
}

/* ---------------------------------------------------
   ✅ 1. Identify Flower (Vision Model)
--------------------------------------------------- */
export async function identifyFlower(
  imageBase64: string
): Promise<FlowerDetails> {
  try {
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },

      body: JSON.stringify({
        model: "grok-vision-beta",

        /* ✅ Force JSON Output */
        response_format: { type: "json_object" },

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
- Return ONLY JSON
- No markdown
- No explanation
                `,
              },
              {
                type: "image_url",
                image_url: {
                  url: formatBase64Image(imageBase64),
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    console.log("✅ Grok Vision Full Response:", data);

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("❌ No response from Grok Vision API");
    }

    return extractJson(text);
  } catch (error) {
    console.error("❌ Grok Vision Error:", error);
    throw new Error("No response from Grok AI.");
  }
}

/* ---------------------------------------------------
   ✅ 2. Translate Flower Details into Tamil
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

        /* ✅ Force JSON Output */
        response_format: { type: "json_object" },

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

    console.log("✅ Grok Tamil Translate Response:", data);

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
