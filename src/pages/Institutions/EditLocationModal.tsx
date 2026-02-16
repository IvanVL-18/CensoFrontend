import { useEffect, useMemo, useState, useRef } from "react";
import { X, LoaderCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import  { getCoordinatesFromPostalCode } from "../Institutions/Map.service";
import type { Coordinates } from "../Institutions/Map.types";
import type { Institution } from "../Institutions/institutions.types";


// iconos leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  isOpen: boolean;
  onClose: () => void;

  
  institution: Institution | null;

 
  currentCoords: { lat: number; lon: number } | null;

 
  pendingCoords: { lat: number; lon: number } | null;

 
  onPick: (coords: { lat: number; lon: number }) => void;
}

export function EditLocationModal({
  isOpen,
  onClose,
  institution,
  currentCoords,
  pendingCoords,
  onPick,
}: Props) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const seedCoords = useMemo(() => {
    if (pendingCoords) return pendingCoords;
    if (currentCoords) return currentCoords;
    return null;
  }, [pendingCoords, currentCoords]);

  useEffect(() => {
    if (!isOpen || !institution) return;

   
    if (seedCoords) {
      setCoordinates({ lat: seedCoords.lat, lon: seedCoords.lon });
      setError(null);
      return;
    }

    
    const fetch = async () => {
      setLoading(true);
      setError(null);

      try {
        const coords = await getCoordinatesFromPostalCode(
          institution.geocode,
          institution.municipality,
          null
        );

        if (coords) {
          setCoordinates(coords);
        } else {
          setError("No se encontró la ubicación exacta.");
        }
      } catch (e: any) {
        setError(e?.message ?? "Error al buscar ubicación.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [isOpen, institution, seedCoords]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000ab] z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-3/4 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-red-900 text-white">
          <h2 className="text-xl font-bold truncate">
            Editar ubicación: {institution?.name}
          </h2>
          <button onClick={onClose} className="hover:bg-red-800 p-1 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow relative bg-gray-100">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
              <LoaderCircle className="animate-spin text-red-900 mb-2" size={48} />
              <p className="text-gray-700 font-medium">Cargando mapa...</p>
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
              zoom={16}
              scrollWheelZoom
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              
              <Circle
                center={[coordinates.lat, coordinates.lon]}
                radius={250}
                pathOptions={{
                  color: "#FFD700",
                  fillColor: "#FFF3B0",
                  fillOpacity: 0.35,
                }}
              />

              
              <DraggableMarker
                coordinates={coordinates}
                institutionName={institution?.name ?? null}
                onChange={(newCoords) => {
                  setCoordinates(newCoords);
                  onPick(newCoords); 
                }}
              />
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}

/** pin arrastrable */
function DraggableMarker({
  coordinates,
  institutionName,
  onChange,
}: {
  coordinates: Coordinates;
  institutionName: string | null;
  onChange: (coords: Coordinates) => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);

  return (
    <Marker
      draggable
      position={[coordinates.lat, coordinates.lon]}
      ref={(ref) => {
        markerRef.current = ref;
      }}
      eventHandlers={{
        dragend: () => {
          const marker = markerRef.current;
          if (!marker) return;

          const pos = marker.getLatLng();
          onChange({ lat: pos.lat, lon: pos.lng });
        },
      }}
    >
      <Popup>
        <div>
          <div className="font-bold">{institutionName}</div>
          <div className="text-xs text-gray-600">
            Mueve el pin. Se guardará hasta que piques “Guardar” en el formulario.
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
