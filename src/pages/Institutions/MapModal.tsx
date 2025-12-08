import { useState, useEffect } from "react";
import { X, LoaderCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { getCoordinatesFromPostalCode, type Coordinates } from "./Map.service";

// --- Arreglo para el ícono de Leaflet ---
// Webpack y otros bundlers a veces no cargan bien los íconos por defecto.
// Este es un arreglo común para que el marcador se vea correctamente.
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;
// --- Fin del arreglo ---

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  geocode: string | null;
  municipality: string | null;
  institutionName: string | null;
}

export function MapModal({ isOpen, onClose, geocode, municipality, institutionName }: MapModalProps) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && geocode) {
      setLoading(true);
      setError(null);
      setCoordinates(null);

      getCoordinatesFromPostalCode(geocode, municipality)
        .then((coords) => {
          if (coords) {
            setCoordinates(coords);
          } else {
            setError(`No se encontraron coordenadas para "${geocode}" o el municipio "${municipality}".`);
          }
        })
        .catch(() => {
          setError("Hubo un error al buscar la ubicación.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, geocode, municipality]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-3/4 flex flex-col">
        <div className="flex justify-between items-center p-4 bg-red-900 text-white">
          <h2 className="text-xl font-bold">Ubicación de {institutionName}</h2>
          <button onClick={onClose} className="hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
              <LoaderCircle className="animate-spin text-red-900" size={48} />
              <p className="ml-4 text-lg">Buscando ubicación...</p>
            </div>
          )}
          {error && !loading && (
            <div className="h-full flex items-center justify-center text-red-600 font-semibold p-4">
              {error}
            </div>
          )}
          {coordinates && !loading && (
            <MapContainer center={[coordinates.lat, coordinates.lon]} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[coordinates.lat, coordinates.lon]}>
                <Popup>{institutionName || "Ubicación"}</Popup>
              </Marker>
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}
