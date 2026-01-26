import axios from "axios"; 
import type {
  Coordinates,
  MapDataResponse
} from "./Map.interfaces";

// Map.service.ts
export const getInstitutionMapData = async (id: string): Promise<MapDataResponse | null> => {
  try {
    // Cambia el puerto por el que use tu backend (ej. 8000)
    const response = await axios.get(`http://localhost:8000/api/institutions/${id}/get-map`, {
      headers: {
        'Accept': 'application/json',
      }
    });

    return response.data;
  } catch (error: any) {
    console.error("Error en la petición:", error.response?.data || error.message);
    return null;
  }
};


export const getCoordinatesFromPostalCode = async (
  geocode: string,
  municipality: string | null,
  street: string | null = null // <-- Añadimos calle si existe en tu DB
): Promise<Coordinates | null> => {
  const countryCode = "mx";
  
  const params = new URLSearchParams({
    format: "json",
    countrycodes: countryCode,
    limit: "1",
    addressdetails: "1" 
  });

  
  if (street) params.append("street", street);
  if (municipality) params.append("city", municipality);
  if (geocode) params.append("postalcode", geocode);

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "MiAppInstituciones/1.0 (ivan@example.com)" 
      },
    });

    if (!response.ok) throw new Error("Error en Nominatim");

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