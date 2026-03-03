import { useEffect, useMemo, useState} from "react";
import { X, LoaderCircle, Crosshair } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import type { Institution } from "../institutions.types";
import type { Coordinates } from "../Map.types";
import { getInstitutionMapData, getCoordinatesFromPostalCode } from "../Map.service";


import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({ 
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  institution: Institution | null;

  
  editable?: boolean;
  pendingCoords?: { lat: number; lon: number } | null;
  onPickLocation?: (coords: { lat: number; lon: number }) => void;
};

function RecenterButton({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lon], 16);
  }, [lat, lon, map]);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        map.setView([lat, lon], 16);
      }}
      className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-md shadow-md hover:bg-gray-100 text-[#691b31] border border-gray-300 flex items-center justify-center"
      title="Centrar en ubicación"
    >
      <Crosshair size={20} />
    </button>
  );
}

export function MapModal({
  isOpen,
  onClose,
  institution,
  editable = false,
  pendingCoords = null,
  onPickLocation,
}: Props) {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [street, setStreet] = useState<string | null>(null);
  const [suburb, setSuburb] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const seedCoords = useMemo(() => {
    if (pendingCoords) return pendingCoords;

    const lat = (institution as any)?.lat;
    const lon = (institution as any)?.lon;

    if (lat != null && lon != null && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lon))) {
      return { lat: Number(lat), lon: Number(lon) };
    }

    return null;
  }, [pendingCoords, institution]);

  useEffect(() => {
    if (!isOpen || !institution) return;

    setError(null);


    if (seedCoords) {
      setCoordinates({ lat: seedCoords.lat, lon: seedCoords.lon });
      return;
    }

    const run = async () => {
      setLoading(true);
      try {
       
        const safeId = encodeURIComponent(String(institution.id));
        const data: any = await getInstitutionMapData(safeId);

        
        const dbLat = data?.lat;
        const dbLon = data?.lon;

        setStreet(data?.street ?? null);
        setSuburb(data?.suburb ?? null);

        if (dbLat != null && dbLon != null) {
          setCoordinates({ lat: Number(dbLat), lon: Number(dbLon) });
          return;
        }

        
        const geo = await getCoordinatesFromPostalCode(
          institution.geocode,
          institution.municipality ?? null,
          null,
          "Hidalgo",
        );

        if (geo) {
          setCoordinates(geo);
          return;
        }

        setCoordinates(null);
        setError("No se encontró la ubicación exacta para esta institución.");
      } catch (e: any) {
        setCoordinates(null);
        setError(e?.message ?? "Error al cargar la ubicación.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [isOpen, institution, seedCoords]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000ab] z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-3/4 flex flex-col overflow-hidden">
      
        <div className="flex justify-between items-center p-4 bg-red-900 text-white">
          <h2 className="text-xl font-bold truncate">
            Mapa: {institution?.name}
          </h2>

          <button onClick={onClose} className="hover:bg-red-800 p-1 rounded" aria-label="Cerrar">
            <X size={24} />
          </button>
        </div>

       
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
              <RecenterButton lat={coordinates.lat} lon={coordinates.lon} />

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

            
              <Marker
                position={[coordinates.lat, coordinates.lon]}
                draggable={false}
                eventHandlers={{
                  dragend: (e) => {
                    if (!editable || !onPickLocation) return;
                    const m = e.target as L.Marker;
                    const pos = m.getLatLng();
                    const next = { lat: pos.lat, lon: pos.lng };
                    setCoordinates(next);
                    onPickLocation(next);
                  },
                }}
              >
                <Popup>
                  <div>
                    <div className="font-bold">{institution?.name}</div>
                    <div className="text-xs text-gray-600">
                      {street || suburb ? [street, suburb].filter(Boolean).join(", ") : "Ubicación guardada"}
                    </div>
                    <div className="text-xs text-gray-600">
                      {coordinates.lat.toFixed(6)}, {coordinates.lon.toFixed(6)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}
