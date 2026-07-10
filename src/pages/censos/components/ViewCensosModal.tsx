import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  PieChart,
  Clock,
  Settings,
  Layers,
  Copy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ViewCensoModalProps } from "../Censos.types";
import { CloneCensoModal } from "./CloneCensoModal";
import { CensusProgressChart } from "./CensusProgressChart";
import { getCenso } from "../Censos.service";

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatDateTime = (dateString?: string | null) => {
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

export function ViewCensoModal({
  isOpen,
  onClose,
  Censo,
}: ViewCensoModalProps) {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [progressData, setProgressData] = useState<{
    percentage: number;
    total_expected: number;
    total_completed: number;
  } | null>(null);

  useEffect(() => {
    if (!isOpen || !Censo?.id) {
      setProgressData(null);
      return;
    }
    const controller = new AbortController();
    getCenso(Censo.id, controller.signal)
      .then((fullCenso) => {
        setProgressData({
          percentage: fullCenso.percentage ?? 0,
          total_expected: fullCenso.total_expected ?? 0,
          total_completed: fullCenso.total_completed ?? 0,
        });
      })
      .catch(() => setProgressData(null));
    return () => controller.abort();
  }, [isOpen, Censo?.id]);

  if (!isOpen || !Censo) return null;

  const createdYear = Censo.created_at
    ? new Date(Censo.created_at).getFullYear()
    : "—";

  const totalExpected = progressData?.total_expected ?? 0;
  const totalCompleted = progressData?.total_completed ?? 0;
  const porcentaje = progressData?.percentage ?? 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-[#691b31] shrink-0">
            <h2 className="text-xl font-bold text-white line-clamp-1 pr-2">
              {Censo.name}
            </h2>

            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setSettingsOpen((v) => !v)}
                  className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
                  aria-label="Configuración"
                >
                  <Settings size={20} />
                </button>

                {settingsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setSettingsOpen(false)}
                    />
                    <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-20 py-1">
                      <button
                        onClick={() => {
                          setSettingsOpen(false);
                          onClose();
                          navigate(`/censos/${Censo.id}/modulos`);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Layers size={16} className="mr-2 text-[#691b31]" />
                        Módulos
                      </button>
                      <button
                        onClick={() => {
                          setSettingsOpen(false);
                          setCloneOpen(true);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Copy size={16} className="mr-2 text-[#691b31]" />
                        Clonar censo
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={onClose}
                className="text-white hover:text-gray-300"
                aria-label="Cerrar modal"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto divide-y divide-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center gap-2 text-gray-700 mb-3">
                <PieChart size={16} className="text-[#691b31]" />
                <h3 className="text-sm font-semibold">Progreso de captura</h3>
              </div>
              <CensusProgressChart
                percentage={porcentaje}
                totalExpected={totalExpected}
                totalCompleted={totalCompleted}
              />
            </div>
            {Censo.description && (
              <div className="px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Descripción
                </h3>
                <p className="text-base text-gray-600">{Censo.description}</p>
              </div>
            )}

            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <Calendar size={16} className="text-[#691b31]" />
                  <h3 className="text-sm font-semibold">Fecha de inicio</h3>
                </div>
                <p className="text-base font-medium">
                  {formatDate(Censo.start_date)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-700 mb-1">
                  <Calendar size={16} className="text-[#691b31]" />
                  <h3 className="text-sm font-semibold">Fecha de fin</h3>
                </div>
                <p className="text-base font-medium">
                  {formatDate(Censo.end_date)}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Fecha de creación
                </h3>
                <p className="text-sm text-gray-600">
                  {formatDateTime(Censo.created_at)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">
                  Fecha de desactivación
                </h3>
                <p className="text-sm text-gray-600">
                  {formatDateTime(Censo.deleted_at)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center gap-4 p-4 bg-gray-50 border-t border-gray-100 shrink-0">
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

      <CloneCensoModal
        isOpen={cloneOpen}
        onClose={() => setCloneOpen(false)}
        targetCenso={Censo}
      />
    </>
  );
}
