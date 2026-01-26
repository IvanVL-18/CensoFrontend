export interface Coordinates {
  lat: number;
  lon: number;
}

// Map.interfaces.ts

export interface MapDataResponse {
  geocode: string;      // Tu Código Postal
  municipality: string; // Tu Municipio
  street?: string;      // <-- AGREGA ESTO: El nombre de la calle
  suburb?: string;      // Opcional: El nombre de la colonia
}

export interface Coordinates {
  lat: number;
  lon: number;
}