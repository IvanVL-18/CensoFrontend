// src/pages/censos/components/CensoUnitsView.tsx
import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useAllUnits } from "../../Units/hooks/useAllUnits";    // <-- ruta corregida
import type { Unit } from "../../Units/units.types";           // <-- ruta corregida

const CensoUnitsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { units, loading } = useAllUnits();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabecera con navegación */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-[#691b31] transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            <span className="font-medium">Volver al censo</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Unidades del censo</h1>
          <div className="w-20"></div>
        </div>

        {/* Tarjeta principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#691b31] to-[#8a2a45] px-6 py-4">
            <h2 className="text-xl font-bold text-white">Lista de unidades disponibles</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#691b31]"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre de la unidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {units.map((unit: Unit) => (
                        <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {unit.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {unit.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <button
                              disabled
                              className="inline-flex items-center gap-1 px-3 py-1 bg-[#691b31] text-white text-sm rounded-lg opacity-50 cursor-not-allowed"
                            >
                              <Plus size={16} />
                              Agregar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {units.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No hay unidades disponibles.
                  </p>
                )}
              </>
            )}

            <div className="mt-6 flex justify-end">
              <Link
                to={`/censos/${id}`}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cerrar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CensoUnitsView;