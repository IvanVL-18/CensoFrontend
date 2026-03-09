import { Eye, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import type { Censo, Meta } from "../CUser.types";

export interface CensosCardsProps {
  censos: Censo[];
  meta: Meta | null;
  loading: boolean;
  error: string | null;
  // Acciones eliminadas (solo visual)
}

export function CensosCards({
  censos,
  loading,
  error,
}: CensosCardsProps) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {censos.map((censo) => {
        const yearDisplay = censo.year || (censo.created_at ? new Date(censo.created_at).getFullYear() : '');
        const startDate = formatDate(censo.start_date);
        const createdYear = censo.created_at ? new Date(censo.created_at).getFullYear() : '—';

        return (
          <div
            key={censo.id}
            className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
          >
            {/* Cabecera roja */}
            <div className="p-4 bg-red-900">
              <h3 className="text-lg font-semibold text-white line-clamp-2">
                {censo.name} {yearDisplay ? ` ${yearDisplay}` : ''}
              </h3>
            </div>

            <div className="p-5 flex flex-col flex-1 space-y-4">
              {/* Creado */}
              <div className="text-sm text-gray-600">
                <span className="font-medium">Creado</span> {createdYear}
              </div>

              {/* Fecha de inicio */}
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={16} className="mr-2 text-red-600" />
                <span className="font-medium">Inicio:</span>
                <span className="ml-1 font-mono text-gray-800">{startDate}</span>
              </div>

              {/* Preguntas, Respuestas, Porcentaje */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-100 p-2 rounded">
                  <div className="text-xs font-semibold text-gray-700">Preguntas</div>
                  <div className="text-lg font-bold text-red-700">
                    {censo.preguntas ?? '—'}
                  </div>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <div className="text-xs font-semibold text-gray-700">Respuestas</div>
                  <div className="text-lg font-bold text-red-700">
                    {censo.respuestas ?? '—'}
                  </div>
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <div className="text-xs font-semibold text-gray-700">Porcentaje</div>
                  <div className="text-lg font-bold text-red-700">
                    {censo.porcentaje ?? '—'}%
                  </div>
                </div>
              </div>

              {/* Botón Ver Censo */}
              <Link
                to={`/censos/${censo.id}`}
                className="mt-auto w-full bg-[#a8844f] hover:bg-[#8b6a3f] text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
              >
                Ver Censo
                <Eye size={18} className="ml-2" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}