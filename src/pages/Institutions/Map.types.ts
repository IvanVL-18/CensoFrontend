export interface Coordinates {
  lat: number;
  lon: number;
}

export interface MapDataResponse {
  geocode: string;
  municipality: string;
  lat: number | null;
  lon: number | null;
  street?: string;
  suburb?: string;
}
