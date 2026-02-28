import api from "../../lib/Axios";
import type { Coordinates, MapDataResponse, GeoapifyResponse } from "../Institutions/Map.types";


export const getInstitutionMapData = async (
  id: string,
  signal?: AbortSignal
): Promise<MapDataResponse> => {
  const response = await api.get<MapDataResponse>(`/institutions/${id}/get-map`, {
    signal,
  });

  
  return (response.data as any).data ?? response.data;
};


export const getCoordinatesFromPostalCode = async (
  geocode: string, 
  municipality: string | null,
  street: string | null = null, 
  state: string | null = "Hidalgo",
  signal?: AbortSignal
): Promise<Coordinates | null> => {
  const apiKey = import.meta.env.VITE_GEOAPIFY_KEY;

  if (!apiKey) {
    console.error(
      "Geoapify API key no definida. Revisa .env (VITE_GEOAPIFY_KEY) y reinicia npm run dev."
    );
    return null;
  }

  
  const parts = [street, municipality, state, geocode, "Mexico"].filter(Boolean) as string[];
  const text = parts.join(", ");

  const url =
    "https://api.geoapify.com/v1/geocode/search?" +
    new URLSearchParams({
      text,
      limit: "1",
      lang: "es",
      filter: "countrycode:mx",
      apiKey,
    }).toString();

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal, 
    });

    if (!response.ok) throw new Error("Error en Geoapify");

    const data = await response.json() as GeoapifyResponse;
    if (data?.features?.length > 0) {
      const first = data.features[0];
      const lat = first?.properties?.lat;
      const lon = first?.properties?.lon;

      if (typeof lat === "number" && typeof lon === "number") {
        return { lat, lon };
      } 
    }

    return null;
  } catch (error) {
    console.error("Error en geocodificación Geoapify:", error);
    return null;
  }
};


export const getReverseGeocodingData = async (
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<{ geocode?: string; municipality?: string; state?: string } | null> => {
  const apiKey = import.meta.env.VITE_GEOAPIFY_KEY;

  if (!apiKey) return null;

  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}&lang=es`;

  try {
    const response = await fetch(url, { 
      headers: { Accept: "application/json" },
      signal 
    });

    if (!response.ok) throw new Error("Error en Geoapify Reverse Data");

    const data = await response.json() as GeoapifyResponse;

    if (data?.features?.length > 0) {
      const props = data.features[0].properties;
      // Geoapify a veces devuelve la ciudad en 'city' o el municipio en 'county'
      return {
        geocode: props.postcode,
        municipality: props.city || props.county,
        state: props.state
      };
    }
    return null;
  } catch (error) {
    console.error("Error obteniendo datos de ubicación:", error);
    return null;
  }
};


export const getAddressFromCoordinates = async (
  lat: number,
  lon: number,
  signal?: AbortSignal
): Promise<string | null> => {
  const apiKey = import.meta.env.VITE_GEOAPIFY_KEY;

  if (!apiKey) return null;

  const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${apiKey}&lang=es`;

  try {
    const response = await fetch(url, { 
      headers: { Accept: "application/json" },
      signal 
    });

    if (!response.ok) throw new Error("Error en Geoapify Reverse");

    const data = await response.json() as GeoapifyResponse;

    if (data?.features?.length > 0) {
      return data.features[0].properties.formatted;
    }
    return null;
  } catch (error) {
    console.error("Error en geocodificación inversa:", error);
    return null;
  }
};
