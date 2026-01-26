import { useState, useEffect } from "react";
import { X, LoaderCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getCoordinatesFromPostalCode, getInstitutionMapData } from "./Map.service";
import type { Coordinates } from "./Map.interfaces";
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionId: string | null; // Cambiamos props por el ID
  institutionName: string | null;
}

export function MapModal({ isOpen, onClose, institutionId, institutionName }: MapModalProps) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (isOpen && institutionId) {
    const fetchLocation = async () => {
      setLoading(true);
      setError(null);
      console.log("1. Iniciando búsqueda para ID:", institutionId);

      try {
        // LLAMADA AL BACKEND (LARAVEL)
        const mapData = await getInstitutionMapData(institutionId);
        console.log("2. Respuesta de Laravel:", mapData);

        if (!mapData || (!mapData.geocode && !mapData.municipality)) {
           console.error("Error: Datos insuficientes en mapData", mapData);
           throw new Error("La institución no tiene geocode ni municipio en la BD.");
        }

        // LLAMADA A LA API EXTERNA (NOMINATIM)
        console.log("3. Consultando Nominatim con:", mapData.geocode, mapData.municipality);
        const coords = await getCoordinatesFromPostalCode(mapData.geocode, mapData.municipality);
        console.log("4. Coordenadas obtenidas:", coords);

        if (coords) {
          setCoordinates(coords);
        } else {
          setError("No se encontraron coordenadas en OpenStreetMap.");
        }
      } catch (err: any) {
        console.error("Error en el flujo del mapa:", err);
        setError(err.message || "Error al cargar el mapa.");
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }
}, [isOpen, institutionId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-3/4 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-red-900 text-white">
          <h2 className="text-xl font-bold truncate">Ubicación de {institutionName}</h2>
          <button onClick={onClose} className="hover:bg-red-800 p-1 rounded transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Contenido del Mapa */}
        <div className="flex-grow relative bg-gray-100">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
              <LoaderCircle className="animate-spin text-red-900 mb-2" size={48} />
              <p className="text-gray-700 font-medium">Obteniendo datos de ubicación...</p>
            </div>
          )}
          
          {error && !loading && (
            <div className="h-full flex items-center justify-center text-red-700 font-semibold p-8 text-center">
              <p>{error}</p>
            </div>
          )}

          {coordinates && !loading && (
            <MapContainer 
              center={[coordinates.lat, coordinates.lon]} 
              zoom={15} 
              scrollWheelZoom={true} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[coordinates.lat, coordinates.lon]}>
                <Popup>
                  <span className="font-bold">{institutionName}</span>
                </Popup>
              </Marker>
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}