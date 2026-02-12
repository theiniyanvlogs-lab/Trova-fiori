import { FlowerDetails } from "../types";

/* ✅ Grok API Key from Vercel Environment */
const API_KEY = import.meta.env.VITE_GROK_API_KEY;

/* ---------------------------------------------------
   ✅ 1. Identify Flower (Vision Model)
--------------------------------------------------- */
export async function identifyFlower(
  imageBase64: string
): Promise<FlowerDetails> {
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
Identify this flower and return details ONLY in valid JSON format:

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

  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("No response from Grok Vision API");
  }

  return JSON.parse(text);
}

/* ---------------------------------------------------
   ✅ 2. Translate Details to Tamil (Text Model)
--------------------------------------------------- */
export async function translateDetailsToTamil(details: FlowerDetails) {
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
Return ONLY valid JSON in this format:

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

Flower Data:
${JSON.stringify(details)}
          `,
        },
      ],
    }),
  });

  const data = await response.json();

  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("No translation response from Grok API");
  }

  return JSON.parse(text);
}
