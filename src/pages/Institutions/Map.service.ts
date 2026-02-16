import api from "../../lib/Axios";
import type { Coordinates, MapDataResponse } from "./Map.types";


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
  state: string | null = "Hidalgo" 
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
    });

    if (!response.ok) throw new Error("Error en Geoapify");

    const data = await response.json();

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

