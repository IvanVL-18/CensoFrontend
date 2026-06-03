import { X } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../../lib/Axios";

interface SectionDetail {
  id: string;
  name: string;
  instructions: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface ViewSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string | null;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "Fecha inválida";
  }
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  const safeValue = value?.trim() ? value : "N/A";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500">{label}</label>
      <p className="text-lg font-semibold text-gray-900 break-words">
        {safeValue}
      </p>
    </div>
  );
}

export function ViewSectionModal({
  isOpen,
  onClose,
  sectionId,
}: ViewSectionModalProps) {
  const [section, setSection] = useState<SectionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !sectionId) return;

    const controller = new AbortController();

    const fetchSection = async () => {
      try {
        setLoading(true);
        setError(null);
        setSection(null);

        const response = await api.get<{ data: SectionDetail }>(
          `/sections/${encodeURIComponent(sectionId)}`,
          { signal: controller.signal },
        );

        setSection(
          response.data.data ?? (response.data as unknown as SectionDetail),
        );
      } catch (err: unknown) {
        const e = err as {
          name?: string;
          response?: { data?: { message?: string } };
        };
        if (e?.name === "CanceledError" || e?.name === "AbortError") return;
        setError(e?.response?.data?.message ?? "No se pudo cargar la sección.");
      } finally {
        setLoading(false);
      }
    };

    void fetchSection();

    return () => controller.abort();
  }, [isOpen, sectionId]);

  if (!isOpen) return null;

  return (
    <>
      {/* Fondo difuminado */}
      <div
        className="fixed inset-0 z-40 bg-blue bg-opacity-30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Contenedor del modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000ab] p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
          {/* Cabecera */}
          <div className="flex justify-between items-center p-4 bg-[var(--pantone-7421)]">
            <h2 className="text-xl font-bold text-white">
              Detalle de la Sección
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>
          </div>

          {/* Cuerpo scrolleable */}
          <div className="overflow-y-auto p-6">
            {loading && (
              <p className="text-center text-sm text-gray-400 py-6">
                Cargando información...
              </p>
            )}

            {error && !loading && (
              <p className="text-center text-sm text-red-600 py-6">{error}</p>
            )}

            {section && !loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <DetailRow
                    label="Nombre de la Sección:"
                    value={section.name}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500">
                    Instrucciones:
                  </label>
                  <div className="max-h-32 overflow-y-auto mt-1 border border-gray-200 rounded-lg p-2">
                    <p className="text-lg text-gray-900 font-semibold break-words">
                      {section.instructions?.trim()
                        ? section.instructions
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <DetailRow
                  label="Fecha de creación:"
                  value={formatDate(section.created_at)}
                />
                <DetailRow
                  label="Fecha de desactivación:"
                  value={formatDate(section.deleted_at)}
                />
              </div>
            )}
          </div>

          {/* Pie */}
          <div className="flex justify-end items-center gap-4 p-4 bg-gray-50">
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
    </>
  );
}
