import { FlowerDetails } from "../types";

/* ✅ Grok API Key from Vercel Environment */
const API_KEY = import.meta.env.VITE_GROK_API_KEY;

/* ---------------------------------------------------
   ✅ Helper Function: Extract Clean JSON
--------------------------------------------------- */
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
- No explanation
- No markdown
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

    console.log("✅ Grok Vision Full Response:", data);

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("❌ No response text from Grok Vision API");
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
