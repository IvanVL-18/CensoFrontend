// components/censos/CensosCards.tsx
import {
  Eye,
  Edit,
  Trash2,
  CircleArrowUp,
  Ban,
  MoreVertical,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom"; // 👈 Importamos Link
import type { Censo, Meta } from "../Censos.types";

export interface CensosCardsProps {
  censos: Censo[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  // Eliminamos onView porque ya no se necesita
  onEdit: (censo: Censo) => void;
  onBan: (censo: Censo) => void;
  onRestore: (censo: Censo) => void;
  onDelete: (censo: Censo) => void;
}

export function CensosCards({
  censos,
  loading,
  error,
  onEdit,
  onBan,
  onRestore,
  onDelete,
}: CensosCardsProps) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600 font-semibold bg-red-50 rounded-lg border border-red-200">
        {error}
      </div>
    );
  }

  if (censos.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
        No se encontraron censos.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {censos.map((censo) => {
        const isActive = !censo.deleted_at;
        const statusText = isActive ? "Activo" : "Inactivo";

        // Calcular año de forma segura
        let yearDisplay: number | string = censo.year || "";
        if (!yearDisplay && censo.created_at) {
          const date = new Date(censo.created_at);
          yearDisplay = isNaN(date.getTime()) ? "—" : date.getFullYear();
        } else if (!yearDisplay) {
          yearDisplay = "—";
        }

        // Fechas con formato legible
        const formatDate = (dateStr?: string | null) => {
          if (!dateStr) return "—";
          try {
            return new Date(dateStr).toLocaleDateString("es-MX", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });
          } catch {
            return "—";
          }
        };

        const startDate = formatDate(censo.start_date);
        const endDate = formatDate(censo.end_date);

        return (
          <div
            key={censo.id}
            className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col hover:border-red-700 group overflow-hidden"
          >
            {/* Cabecera roja estilo institucional */}
            <div className="flex justify-between items-center p-4 bg-red-900">
              <h3 className="text-lg font-semibold text-white line-clamp-2 pr-2">
                {censo.name}
              </h3>
              <div className="relative">
                <button
                  onClick={() =>
                    setMenuOpenId(menuOpenId === censo.id ? null : censo.id)
                  }
                  className="p-1.5 rounded-full hover:bg-red-500 transition-colors text-white focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Opciones"
                >
                  <MoreVertical size={18} />
                </button>
                {menuOpenId === censo.id && (
                  <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10 py-1">
                    {!censo.deleted_at ? (
                      <>
                        <button
                          onClick={() => {
                            onEdit(censo);
                            setMenuOpenId(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Edit size={16} className="mr-2" /> Editar
                        </button>
                        <button
                          onClick={() => {
                            onBan(censo);
                            setMenuOpenId(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                        >
                          <Ban size={16} className="mr-2" /> Desactivar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            onRestore(censo);
                            setMenuOpenId(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-gray-100 transition-colors"
                        >
                          <CircleArrowUp size={16} className="mr-2" /> Restaurar
                        </button>
                        <button
                          onClick={() => {
                            onDelete(censo);
                            setMenuOpenId(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                        >
                          <Trash2 size={16} className="mr-2" /> Eliminar
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Contenido del card */}
            <div className="p-5 flex flex-col flex-1">
              {/* Estado + año con badge más elegante */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
                    isActive
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-gray-100 text-gray-800 border border-gray-200"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-1.5 ${
                      isActive ? "bg-green-500 animate-pulse" : "bg-gray-500"
                    }`}
                  />
                  {statusText} {yearDisplay !== "—" ? `· ${yearDisplay}` : ""}
                </span>
              </div>

              {/* Fechas con iconos y mejor espaciado */}
              <div className="space-y-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-red-600" />
                  <span className="font-medium">Inicio:</span>
                  <span className="ml-1 font-mono text-gray-800">
                    {startDate}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-amber-600" />
                  <span className="font-medium">Fin:</span>
                  <span className="ml-1 font-mono text-gray-800">
                    {endDate}
                  </span>
                </div>
              </div>

              {/* Botón principal como Link a la página de detalle */}
              <Link
                to={`/censos/${censo.id}`}
                className="mt-auto w-full bg-linear-to-r from-amber-600 to-yellow-700 hover:from-amber-700 hover:to-yellow-800 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
              >
                Ver detalles
                <Eye size={18} className="ml-2" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
