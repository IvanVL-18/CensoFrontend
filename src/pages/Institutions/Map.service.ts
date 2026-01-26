import axios from "axios"; 
import type {
  Coordinates,
  MapDataResponse
} from "./Map.interfaces";

export const getInstitutionMapData = async (id: string): Promise<MapDataResponse | null> => {
  try {
    // Asegúrate de que la URL coincida con tu api.php (ejemplo: /api/institutions/...)
    const response = await axios.get(`/api/institutions/${id}/get-map`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log("Respuesta Real de la API:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error en la petición al back:", error.response?.data || error.message);
    return null;
  }
};
export const getCoordinatesFromPostalCode = async (
  geocode: string,
  municipality: string | null
): Promise<Coordinates | null> => {
  const countryCode = "mx"; // En minúsculas es estándar
  let query = "";

  if (/^\d{5}$/.test(geocode)) {
    query = `postalcode=${geocode}`;
  } else if (municipality) {
    query = `city=${encodeURIComponent(municipality)}`;
  } else {
    return null;
  }

  const url = `https://nominatim.openstreetmap.org/search?${query}&countrycodes=${countryCode}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        
        "User-Agent": "MiAppInstituciones/1.0" 
      },
    });

    if (!response.ok) throw new Error("Error en la petición a Nominatim");

    const data = await response.json();

    if (data && data.length > 0) {
      return { 
        lat: parseFloat(data[0].lat), 
        lon: parseFloat(data[0].lon) 
      };
    }

    return null;
  } catch (error) {
    console.error("Error en geocodificación:", error);
    return null;
  }
};