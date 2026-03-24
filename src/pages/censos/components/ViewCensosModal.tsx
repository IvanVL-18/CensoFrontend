import { X, Calendar, PieChart, Clock } from "lucide-react";
import type { ViewCensoModalProps } from "../Censos.types";

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
  if (!isOpen || !Censo) return null;

  const createdYear = Censo.created_at
    ? new Date(Censo.created_at).getFullYear()
    : "—";

  const totalPreguntas = 0;
  const porcentaje = 100;
  const isDisabled = !!Censo.deleted_at;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden rounded-lg shadow-xl ${
          isDisabled ? "bg-gray-100" : "bg-white"
        }`}
      >
        <div
          className={`flex justify-between items-center p-4 shrink-0 ${
            isDisabled ? "bg-gray-500" : "bg-[#691b31]"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-xl font-bold text-white line-clamp-1 pr-2">
              {Censo.name}
            </h2>

            {isDisabled && (
              <span className="shrink-0 rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                Desactivado
              </span>
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

        <div
          className={`overflow-y-auto divide-y ${
            isDisabled ? "divide-gray-300" : "divide-gray-200"
          }`}
        >
          <div
            className={`px-6 py-4 flex items-center gap-2 ${
              isDisabled ? "text-gray-500" : "text-gray-600"
            }`}
          >
            <Clock
              size={18}
              className={isDisabled ? "text-gray-400" : "text-[#C3A67C]"}
            />
            <span className="text-sm font-medium">Creado:</span>
            <span className="text-sm">{createdYear}</span>
          </div>

          {Censo.description && (
            <div className="px-6 py-4">
              <h3
                className={`text-sm font-semibold mb-1 ${
                  isDisabled ? "text-gray-500" : "text-gray-700"
                }`}
              >
                Descripción
              </h3>
              <p
                className={`text-base ${isDisabled ? "text-gray-500" : "text-gray-600"}`}
              >
                {Censo.description}
              </p>
            </div>
          )}

          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div
                className={`flex items-center gap-2 mb-1 ${
                  isDisabled ? "text-gray-500" : "text-gray-700"
                }`}
              >
                <Calendar
                  size={16}
                  className={isDisabled ? "text-gray-400" : "text-[#691b31]"}
                />
                <h3 className="text-sm font-semibold">Fecha de inicio</h3>
              </div>
              <p
                className={`text-base font-medium ${isDisabled ? "text-gray-500" : "text-gray-800"}`}
              >
                {formatDate(Censo.start_date)}
              </p>
            </div>

            <div>
              <div
                className={`flex items-center gap-2 mb-1 ${
                  isDisabled ? "text-gray-500" : "text-gray-700"
                }`}
              >
                <Calendar
                  size={16}
                  className={isDisabled ? "text-gray-400" : "text-[#691b31]"}
                />
                <h3 className="text-sm font-semibold">Fecha de fin</h3>
              </div>
              <p
                className={`text-base font-medium ${isDisabled ? "text-gray-500" : "text-gray-800"}`}
              >
                {formatDate(Censo.end_date)}
              </p>
            </div>
          </div>

          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3
                className={`text-sm font-semibold mb-1 ${
                  isDisabled ? "text-gray-500" : "text-gray-700"
                }`}
              >
                Fecha de creación
              </h3>
              <p
                className={`text-sm ${isDisabled ? "text-gray-500" : "text-gray-600"}`}
              >
                {formatDateTime(Censo.created_at)}
              </p>
            </div>

            <div>
              <h3
                className={`text-sm font-semibold mb-1 ${
                  isDisabled ? "text-gray-500" : "text-gray-700"
                }`}
              >
                Fecha de desactivación
              </h3>
              <p
                className={`text-sm ${isDisabled ? "text-gray-500" : "text-gray-600"}`}
              >
                {formatDateTime(Censo.deleted_at)}
              </p>
            </div>
          </div>

          <div className="px-6 py-4">
            <h3
              className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                isDisabled ? "text-gray-600" : "text-gray-800"
              }`}
            >
              <PieChart
                size={18}
                className={isDisabled ? "text-gray-400" : "text-[#691b31]"}
              />
              Progreso del censo
            </h3>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-24 h-24 shrink-0">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={isDisabled ? "#9ca3af" : "#691b31"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - porcentaje / 100)}`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`text-xl font-bold ${
                      isDisabled ? "text-gray-500" : "text-[#691b31]"
                    }`}
                  >
                    {porcentaje}%
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2 w-full">
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm ${isDisabled ? "text-gray-500" : "text-gray-600"}`}
                  >
                    Total de preguntas
                  </span>
                  <span
                    className={`text-xl font-bold ${
                      isDisabled ? "text-gray-500" : "text-gray-800"
                    }`}
                  >
                    {totalPreguntas}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      isDisabled ? "bg-gray-400" : "bg-[#691b31]"
                    }`}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>

                <p
                  className={`text-xs ${isDisabled ? "text-gray-400" : "text-gray-500"}`}
                >
                  * Total de preguntas del censo
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`flex justify-end items-center gap-4 p-4 border-t shrink-0 ${
            isDisabled
              ? "bg-gray-200 border-gray-300"
              : "bg-gray-50 border-gray-100"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`text-white font-bold py-2 px-6 rounded-lg transition ${
              isDisabled
                ? "bg-gray-500 hover:bg-gray-600"
                : "bg-[#C3A67C] hover:brightness-95"
            }`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
