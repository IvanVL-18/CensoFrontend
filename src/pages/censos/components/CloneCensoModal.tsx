import { useEffect, useState } from "react";
import { X, Copy, Search, Check } from "lucide-react";
import { getCensos, cloneCenso } from "../Censos.service";
import type { Censo } from "../Censos.types";

interface CloneCensoModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCenso: Censo | null;
  onSuccess?: () => void;
}

export function CloneCensoModal({
  isOpen,
  onClose,
  targetCenso,
  onSuccess,
}: CloneCensoModalProps) {
  const [censos, setCensos] = useState<Censo[]>([]);
  const [loading, setLoading] = useState(false);
  const [cloning, setCloning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
      setSearchQuery("");
      setError(null);
      return;
    }

    const controller = new AbortController();

    const fetchCensos = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCensos(
          "active",
          "",
          1,
          "id",
          "asc",
          controller.signal,
        );
        const filtered = (data.data ?? []).filter(
          (c) => c.id !== targetCenso?.id,
        );
        setCensos(filtered);
      } catch (err: unknown) {
        const e = err as {
          name?: string;
          response?: { data?: { message?: string } };
        };
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        setError("No se pudo cargar la lista de censos.");
      } finally {
        setLoading(false);
      }
    };

    void fetchCensos();
    return () => controller.abort();
  }, [isOpen, targetCenso?.id]);

  const filteredCensos = censos.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleClone = async () => {
    if (!selectedId || !targetCenso) return;

    try {
      setCloning(true);
      setError(null);
      await cloneCenso(selectedId, targetCenso.id);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? "No se pudo clonar el censo.");
    } finally {
      setCloning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-[#691b31] shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Copy size={20} />
            Clonar censo
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 shrink-0">
          <p className="text-xs text-amber-700 font-medium">Censo destino:</p>
          <p className="text-sm font-semibold text-amber-900 line-clamp-1">
            {targetCenso?.name}
          </p>
          <p className="text-xs text-amber-600 mt-0.5">
            La estructura del censo que selecciones se copiará a este censo. El
            contenido existente será reemplazado.
          </p>
        </div>

        <div className="px-5 py-3 border-b border-gray-100 shrink-0">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar censo origen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-4 text-sm outline-none transition focus:border-[#691b31]"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-3">
          {loading && (
            <p className="text-center text-sm text-gray-400 py-6">
              Cargando censos...
            </p>
          )}

          {!loading && filteredCensos.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-6">
              {searchQuery
                ? "No se encontraron censos con ese nombre."
                : "No hay otros censos disponibles."}
            </p>
          )}

          {!loading &&
            filteredCensos.map((censo) => (
              <div
                key={censo.id}
                onClick={() => setSelectedId(censo.id)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer mb-2 transition-all ${
                  selectedId === censo.id
                    ? "border-[#691b31] bg-[#691b31]/5"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 line-clamp-1">
                    {censo.name}
                  </p>
                  {censo.year && (
                    <p className="text-xs text-gray-500">{censo.year}</p>
                  )}
                </div>
                {selectedId === censo.id && (
                  <div className="ml-3 shrink-0 w-5 h-5 rounded-full bg-[#691b31] flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </div>
            ))}
        </div>

        {error && (
          <div className="px-5 py-2 bg-red-50 border-t border-red-100 shrink-0">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end items-center gap-3 p-4 bg-gray-50 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleClone()}
            disabled={!selectedId || cloning}
            className="inline-flex items-center gap-2 rounded-lg bg-[#691b31] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Copy size={16} />
            {cloning ? "Clonando..." : "Clonar"}
          </button>
        </div>
      </div>
    </div>
  );
}
