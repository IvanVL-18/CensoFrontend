import { useEffect, useMemo, useState } from "react";
import { X, Crosshair, Check } from "lucide-react";

import type { Institution } from "../institutions.types";
import { getInstitutionMapData, getCoordinatesFromPostalCode } from "../Map.service";

type Props = {
  isOpen: boolean;
  onClose: () => void;

  institution: Institution | null;

  
  editable?: boolean;

 
  onPickLocation?: (coords: { lat: number; lon: number }) => void;

  
  pendingCoords?: { lat: number; lon: number } | null;
};

export default function MapModal({
  isOpen,
  onClose,
  institution,
  editable = false,
  onPickLocation,
  pendingCoords,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);

  // Para mostrar una dirección aproximada (opcional)
  const [street, setStreet] = useState<string | null>(null);
  const [suburb, setSuburb] = useState<string | null>(null);

  // Base coords: si hay pendingCoords, son prioridad
  const effectiveCoords = useMemo(() => {
    if (pendingCoords) return pendingCoords;
    if (lat != null && lon != null) return { lat, lon };
    return null;
  }, [pendingCoords, lat, lon]);

  useEffect(() => {
    if (!isOpen || !institution) return;

    setError(null);
    setLoading(true);

    // 1) Intentar traer data desde backend (institutions/{id}/get-map)
    getInstitutionMapData(institution.id)
      .then((data) => {
        // data puede venir como {lat, lon} o null según tu service
        if (data) {
          setLat(data.lat ?? null);
          setLon(data.lon ?? null);
          setStreet(data.street ?? null);
          setSuburb(data.suburb ?? null);
        } else {
          setLat(null);
          setLon(null);
          setStreet(null);
          setSuburb(null);
        }
      })
      .catch((err: any) => {
        setError(err?.message ?? "Error al cargar mapa.");
      })
      .finally(() => setLoading(false));
  }, [isOpen, institution]);

  const handleAutoLocate = async () => {
    if (!institution) return;

    setError(null);
    setLoading(true);

    try {
      const coords = await getCoordinatesFromPostalCode(
        institution.geocode,
        institution.municipality,
        null,
        "Hidalgo",
      );

      if (!coords) {
        setError("No se pudo obtener una ubicación con ese código postal.");
        return;
      }

      setLat(coords.lat);
      setLon(coords.lon);

      if (editable && onPickLocation) {
        onPickLocation(coords); 
      }
    } catch (e: any) {
      setError(e?.message ?? "Error al geocodificar.");
    } finally {
      setLoading(false);
    }
  };

  const handlePick = (newLat: number, newLon: number) => {
    if (!editable || !onPickLocation) return;
    onPickLocation({ lat: newLat, lon: newLon });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-[#000000ab] z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <div className="text-white">
              <h2 className="text-xl font-bold">
                Mapa de Institución
              </h2>
              {institution?.name && (
                <p className="text-sm opacity-90">{institution.name}</p>
              )}
            </div>

            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
              aria-label="Cerrar"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-4">
            {error && (
              <div className="mb-3 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-2 items-center mb-3">
              <button
                type="button"
                onClick={handleAutoLocate}
                disabled={loading || !institution}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#691b31] text-[#691b31] hover:bg-gray-50 disabled:opacity-50"
              >
                <Crosshair size={16} />
                Auto-ubicar por CP
              </button>

              {editable && effectiveCoords && (
                <div className="inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                  <Check size={16} />
                  Seleccionado: {effectiveCoords.lat.toFixed(6)}, {effectiveCoords.lon.toFixed(6)}
                </div>
              )}
            </div>

            {/* INFO */}
            <div className="text-sm text-gray-700 mb-3">
              <div>
                <b>Municipio:</b> {institution?.municipality ?? "—"}
              </div>
              <div>
                <b>Geocódigo:</b> {institution?.geocode ?? "—"}
              </div>
              {(street || suburb) && (
                <div className="mt-1">
                  <b>Referencia:</b>{" "}
                  {[street, suburb].filter(Boolean).join(", ")}
                </div>
              )}
            </div>

           
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-100 p-3 text-sm text-gray-700">
                {loading ? "Cargando..." : "Vista previa de mapa (placeholder)"}
              </div>

              <div
                className="h-[380px] bg-white flex items-center justify-center text-gray-500 select-none"
                onClick={() => {
                 
                  if (!effectiveCoords) return;
                  handlePick(effectiveCoords.lat + 0.0005, effectiveCoords.lon + 0.0005);
                }}
              >
                {effectiveCoords ? (
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">
                      Coordenadas actuales
                    </div>
                    <div>
                      {effectiveCoords.lat}, {effectiveCoords.lon}
                    </div>
                    {editable && (
                      <div className="text-xs mt-2 text-gray-500">
                        (Click aquí para simular seleccionar otra ubicación)
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">
                      Sin coordenadas aún
                    </div>
                    <div className="text-xs mt-2">
                      Usa “Auto-ubicar por CP” o asigna coordenadas.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
