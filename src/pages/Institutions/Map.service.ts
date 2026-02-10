import axios from "axios";
import type { Coordinates, MapDataResponse } from "./Map.interfaces";

// Map.service.ts

export const getInstitutionMapData = async (
  id: string
): Promise<MapDataResponse | null> => {
  try {
    // Puedes usar tu env si quieres, pero dejo tu URL tal cual la tenías
    const response = await axios.get(
      `http://localhost:8000/api/institutions/${id}/get-map`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error en la petición:", error.response?.data || error.message);
    return null;
  }
};

export const getCoordinatesFromPostalCode = async (
  geocode: string, // CP
  municipality: string | null,
  street: string | null = null, // calle si existe
  state: string | null = "Hidalgo" // opcional, ayuda a precisión
): Promise<Coordinates | null> => {
  const apiKey = import.meta.env.VITE_GEOAPIFY_KEY;

  if (!apiKey) {
    console.error(
      "Geoapify API key no definida. Revisa .env (VITE_GEOAPIFY_KEY) y reinicia npm run dev."
    );
    return null;
  }

  // Entre más completo, mejor: calle, municipio, estado, CP, México
  const parts = [street, municipality, state, geocode, "Mexico"].filter(
    Boolean
  ) as string[];

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
      headers: {
        Accept: "application/json",
      },
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
