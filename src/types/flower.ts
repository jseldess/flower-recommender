export interface FlowerData {
  id: string;
  name: string;
  scientificName: string;
  climate: string[];
  sunExposure: string;
  wateringNeeds: string;
  soilType: string;
  bloomingSeason: string[];
  hardiness: string;
  description: string;
  imageUrl?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  climate: string;
  hardiness: string;
} 