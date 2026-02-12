import api from "../../lib/Axios";
import type {
  Coordinates,
  MapDataResponse
} from "./Map.types";

// Map.service.ts
export const getInstitutionMapData = async (
  id: string,
  signal?: AbortSignal,
  ): Promise<MapDataResponse> => {
    const response = await api.get<MapDataResponse>(`/institutions/${id}/get-map`, {
    signal,
  });
  return (response.data as any).data ?? response.data;
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

  
  if (municipality) params.append("city", municipality);
  if (geocode) params.append("postalcode", geocode);
    if (street) params.append("street", street);


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

/* export const getCoordinatesFromPostalCode = async (
  geocode: string | null, // Código postal
  municipality: string | null,
  street: string | null = null,
  placeName: string | null = null // <-- Nuevo parámetro para el nombre del lugar
): Promise<{ lat: number; lon: number } | null> => {
  
  const countryCode = "mx";
  
  // Parámetros base
  const params = new URLSearchParams({
    format: "json",
    countrycodes: countryCode,
    limit: "1",
    addressdetails: "1"
  });

  // LÓGICA DE DECISIÓN
  if (placeName) {
    // ESTRATEGIA 1: Búsqueda por Nombre de Lugar (POI)
    // Combinamos el lugar + municipio para dar contexto y evitar homónimos
    const searchQuery = `${placeName}, ${municipality || ''}`; 
    params.append("q", searchQuery);
    
    // NOTA: Cuando usas 'q', a veces es mejor NO enviar 'postalcode' estricto 
    // porque si el polígono del CP en el mapa está mal definido, no encontrará el lugar.
    // Pero si quieres filtrar mucho, podrías dejarlo. Yo recomiendo no usarlo con 'q'.
    
  } else {
    // ESTRATEGIA 2: Búsqueda Estructurada (Tu lógica original para direcciones)
    if (street) params.append("street", street);
    if (municipality) params.append("city", municipality);
    if (geocode) params.append("postalcode", geocode);
  }

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json",
        // Es muy importante mantener un User-Agent válido en Nominatim
        "User-Agent": "MiAppInstituciones/1.0 (ivan@example.com)" 
      },
    });

    if (!response.ok) throw new Error(`Error en Nominatim: ${response.statusText}`);

    const data = await response.json();

    if (data && data.length > 0) {
      // Nominatim devuelve strings, asegúrate de castear a float
      return { 
        lat: parseFloat(data[0].lat), 
        lon: parseFloat(data[0].lon) 
      };
    }
    
    console.warn("No se encontraron resultados para:", placeName || street);
    return null;

  } catch (error) {
    console.error("Error en geocodificación:", error);
    return null;
  }
}; */