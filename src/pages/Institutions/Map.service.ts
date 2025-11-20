export interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * Convierte un código postal en coordenadas (latitud, longitud) usando la API de Nominatim.
 * Si el código no es un CP de 5 dígitos, intenta buscar por el nombre del municipio.
 * @param geocode - El código postal (5 dígitos) o una clave geoestadística.
 * @param municipality - El nombre del municipio para usar como fallback.
 * @returns Una promesa que se resuelve con un objeto de coordenadas o null si no se encuentra.
 */
export const getCoordinatesFromPostalCode = async (
  geocode: string,
  municipality: string | null
): Promise<Coordinates | null> => {
  // Asumimos que los códigos postales son de México. Cambia 'MX' si es otro país.
  const countryCode = "MX";
  let url = "";

  // Si es un código de 5 dígitos, lo tratamos como Código Postal para mayor precisión.
  if (/^\d{5}$/.test(geocode)) {
    url = `https://nominatim.openstreetmap.org/search?postalcode=${geocode}&country=${countryCode}&format=json&limit=1`;
  } 
  // Si no, y tenemos un municipio, buscamos por el municipio.
  else if (municipality) {
    // Usamos 'city' para buscar por municipio, es más efectivo en Nominatim.
    url = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(municipality)}&country=${countryCode}&format=json&limit=1`;
  } 
  // Si no es un CP y no hay municipio, no podemos buscar.
  else {
    return null;
  }

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) throw new Error("La respuesta de la red no fue exitosa.");

    const data = await response.json();

    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }

    return null; // No se encontraron coordenadas
  } catch (error) {
    console.error("Error al obtener coordenadas:", error);
    return null;
  }
};