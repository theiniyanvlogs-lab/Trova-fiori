import { FlowerDetails } from "../types";

const API_KEY = import.meta.env.VITE_GROK_API_KEY;

export async function identifyFlower(imageBase64: string): Promise<FlowerDetails> {
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
Identify this flower and return details in JSON format:
{
  commonName,
  scientificName,
  description,
  sun,
  soilNeeds,
  bloomsIn,
  naturalHabitat,
  flowerType,
  funFact
}
`
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ]
    })
  });

  const data = await response.json();

  const text = data.choices?.[0]?.message?.content;

  return JSON.parse(text);
}
