import { useState, useEffect, useRef } from "react";
import { X, LoaderCircle } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Servicios
import {
  getCoordinatesFromPostalCode,
  getInstitutionMapData,
} from "./Map.service";
import { updateInstitutionCoordinates } from "./Institutions.service";

import type { Coordinates } from "./Map.interfaces";

// Iconos Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutionId: string | null;
  institutionName: string | null;
  editable?: boolean;
}

export function MapModal({
  isOpen,
  onClose,
  institutionId,
  institutionName,
  editable = false,
}: MapModalProps) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setError(null);

    if (isOpen && institutionId) {
      const fetchLocation = async () => {
        setLoading(true);
        setError(null);

        try {
          const mapData = await getInstitutionMapData(institutionId);

          if (!mapData || typeof mapData === "string") {
            throw new Error("Datos de ubicación no válidos.");
          }

          if (mapData.lat !== null && mapData.lon !== null) {
            setCoordinates({ lat: mapData.lat, lon: mapData.lon });
            return;
          }

          const coords = await getCoordinatesFromPostalCode(
            mapData.geocode,
            mapData.municipality,
            mapData.street || null,
          );

          if (coords) {
            setCoordinates(coords);
          } else {
            setError("No se encontró la ubicación exacta.");
          }
        } catch (err: any) {
          setError(err.message || "Error al obtener la ubicación.");
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
          <h2 className="text-xl font-bold truncate">
            Ubicación de {institutionName}
          </h2>
          <button
            onClick={onClose}
            className="hover:bg-red-800 p-1 rounded transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-grow relative bg-gray-100">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20">
              <LoaderCircle
                className="animate-spin text-red-900 mb-2"
                size={48}
              />
              <p className="text-gray-700 font-medium">
                Buscando en el mapa...
              </p>
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
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* 🔦 Zona iluminada */}
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
                institutionName={institutionName}
                draggable={editable}
                onChange={async (newCoords) => {
                  setCoordinates(newCoords);
                  console.log("Nueva ubicación:", newCoords);

                  if (editable && institutionId) {
                    try {
                      await updateInstitutionCoordinates(institutionId, {
                        lat: newCoords.lat,
                        lon: newCoords.lon,
                      });
                      console.log("Coordenadas guardadas en BD");
                    } catch (err) {
                      console.error("Error guardando coordenadas:", err);
                    }
                  }
                }}
              />
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function DraggableMarker({
  coordinates,
  institutionName,
  draggable,
  onChange,
}: {
  coordinates: Coordinates;
  institutionName: string | null;
  draggable: boolean;
  onChange: (coords: Coordinates) => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);

  return (
    <Marker
      draggable={draggable}
      position={[coordinates.lat, coordinates.lon]}
      ref={(ref) => {
        markerRef.current = ref;
      }}
      eventHandlers={{
        dragend: () => {
          const marker = markerRef.current;
          if (!marker) return;

          const pos = marker.getLatLng();
          const newCoords: Coordinates = { lat: pos.lat, lon: pos.lng };

          onChange(newCoords);
        },
      }}
    >
      <Popup>
        <div>
          <div className="font-bold">{institutionName}</div>
          <div className="text-xs text-gray-600">
            Arrastra el pin para ajustar la ubicación.
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
