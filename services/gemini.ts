
import { GoogleGenAI, Type } from "@google/genai";
import { FlowerDetails } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const identifyFlower = async (base64Image: string): Promise<FlowerDetails> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Identify this flower. Provide the following details in a structured JSON format:
  - commonName: The most widely used name.
  - scientificName: The Latin botanical name.
  - description: A clear 2-sentence description for the "Basic Information" section.
  - sun: Sunlight requirements (e.g., "Full sun to part shade").
  - soilNeeds: Soil requirements (e.g., "Moist, well-drained").
  - bloomsIn: Flowering season (e.g., "Summer").
  - naturalHabitat: Specific Country or Region where it grows naturally.
  - flowerType: Is it primarily a wildflower or a garden flower?
  - funFact: An interesting trivia about this flower.
  - origin: A brief history or geographical origin.
  
  If the image does not contain a flower, please return placeholder values indicating that a flower wasn't detected.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          commonName: { type: Type.STRING },
          scientificName: { type: Type.STRING },
          description: { type: Type.STRING },
          sun: { type: Type.STRING },
          soilNeeds: { type: Type.STRING },
          bloomsIn: { type: Type.STRING },
          naturalHabitat: { type: Type.STRING },
          flowerType: { type: Type.STRING },
          funFact: { type: Type.STRING },
          origin: { type: Type.STRING },
        },
        required: ["commonName", "scientificName", "description", "sun", "soilNeeds", "bloomsIn", "naturalHabitat", "flowerType", "funFact", "origin"],
      },
    },
  });

  try {
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as FlowerDetails;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Could not understand the flower details.");
  }
};

export const translateDetailsToTamil = async (details: FlowerDetails): Promise<NonNullable<FlowerDetails['tamil']>> => {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Translate the following flower information into Tamil. Ensure the translation is natural and accurate for a gardening context. Return only the JSON:
  Common Name: ${details.commonName}
  Description: ${details.description}
  Sun: ${details.sun}
  Soil Needs: ${details.soilNeeds}
  Blooms In: ${details.bloomsIn}
  Natural Habitat: ${details.naturalHabitat}
  Flower Type: ${details.flowerType}
  Fun Fact: ${details.funFact}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          commonName: { type: Type.STRING },
          description: { type: Type.STRING },
          sun: { type: Type.STRING },
          soilNeeds: { type: Type.STRING },
          bloomsIn: { type: Type.STRING },
          naturalHabitat: { type: Type.STRING },
          flowerType: { type: Type.STRING },
          funFact: { type: Type.STRING },
        },
        required: ["commonName", "description", "sun", "soilNeeds", "bloomsIn", "naturalHabitat", "flowerType", "funFact"],
      },
    },
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Failed to parse Tamil translation:", error);
    throw new Error("Translation failed.");
  }
};
