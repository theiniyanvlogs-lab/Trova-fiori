
export interface FlowerDetails {
  commonName: string;
  scientificName: string;
  description: string;
  sun: string;
  soilNeeds: string;
  bloomsIn: string;
  naturalHabitat: string;
  flowerType: string;
  funFact: string;
  origin: string;
  tamil?: {
    commonName: string;
    description: string;
    sun: string;
    soilNeeds: string;
    bloomsIn: string;
    naturalHabitat: string;
    flowerType: string;
    funFact: string;
  };
}

export interface IdentificationRecord {
  id: string;
  timestamp: number;
  imageData: string;
  details: FlowerDetails;
}

export enum AppState {
  HOME = 'HOME',
  CAMERA = 'CAMERA',
  RESULT = 'RESULT',
  HISTORY = 'HISTORY'
}
