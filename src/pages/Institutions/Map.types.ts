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



export interface GeoapifyProperties {
  lat: number;
  lon: number;
  formatted: string;
  address_line1?: string;
  address_line2?: string;
  postcode?: string;
  city?: string;
  county?: string;
  state?: string;
}

export interface GeoapifyResponse {
  features: { properties: GeoapifyProperties }[];
}
