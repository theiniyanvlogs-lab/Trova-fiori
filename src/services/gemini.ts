import { FlowerDetails } from "../types";

export async function identifyFlower(imageData: string): Promise<FlowerDetails> {
  // Temporary demo response until Grok API is connected
  return {
    commonName: "Poppy Anemone",
    scientificName: "Anemone coronaria",
    description: "A vibrant spring flower known for its striking petals.",
    sun: "Full sun to partial shade",
    soilNeeds: "Moist, well-drained soil",
    bloomsIn: "Spring",
    naturalHabitat: "Mediterranean region",
    flowerType: "Perennial",
    funFact: "Symbol of anticipation and protection",
    origin: "Europe",
    tamil: {
      commonName: "பாப்பி அனிமோனி",
      description: "வண்ணமயமான வசந்த மலர்",
      sun: "முழு சூரியன் அல்லது பகுதி நிழல்",
      soilNeeds: "நன்கு வடிகாலான மண்",
      bloomsIn: "வசந்த காலம்",
    },
  };
}
