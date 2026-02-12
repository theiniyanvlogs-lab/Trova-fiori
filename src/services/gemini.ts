import { FlowerDetails } from "../types";

const API_KEY = import.meta.env.VITE_GROK_API_KEY;

/* ---------------------------------------------------
   ✅ Identify Flower (Vision Model)
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
Identify the flower in this image.
Return ONLY JSON:

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

            /* ❌ Grok does NOT accept base64 */
            {
              type: "text",
              text: "⚠️ Grok Vision requires a public image URL, not base64.",
            },
          ],
        },
      ],
    }),
  });

  /* ✅ Show real API error */
  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Grok API Error:", errorText);
    throw new Error("Grok Vision API failed: " + errorText);
  }

  const data = await response.json();
  console.log("✅ Grok Response:", data);

  const text = data?.choices?.[0]?.message?.content;

  if (!text) throw new Error("Empty response from Grok");

  return JSON.parse(text);
}
