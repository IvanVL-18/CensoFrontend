import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useAllModules } from "../../Modules/hooks/useAllModules";
import { getIndices } from "../Censos.service";
import type { Module } from "../../Modules/Modules.types";
import type { Index } from "../Censos.types";

type UnitWithIndex = Module & { index_id?: string | number | null };

const CensoUnitsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { Modules, loading } = useAllModules();
  const unitsWithIndex = Modules as UnitWithIndex[];

  const [indices, setIndices] = useState<Index[]>([]);
  const [loadingIndices, setLoadingIndices] = useState(false);
  // Guardamos el ID del índice como string (o null) para evitar problemas de conversión
  const [selectedIndices, setSelectedIndices] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const fetchIndices = async () => {
      setLoadingIndices(true);
      try {
        const data = await getIndices();
        // Filtrar solo índices cuyo nombre sea un número entero
        const numericIndices = data.filter(idx => /^\d+$/.test(idx.name));
        setIndices(numericIndices);
      } catch (error) {
        console.error("Error al cargar índices:", error);
      } finally {
        setLoadingIndices(false);
      }
    };
    fetchIndices();
  }, []);

  // Inicializar selectedIndices con los valores actuales (convertidos a string)
  useEffect(() => {
    const initial: Record<string, string | null> = {};
    unitsWithIndex.forEach((unit) => {
      const unitId = String(unit.id);
      if (unit.index_id !== undefined && unit.index_id !== null) {
        // Aseguramos que sea string
        initial[unitId] = String(unit.index_id);
      } else {
        initial[unitId] = null;
      }
    });
    setSelectedIndices(initial);
  }, [unitsWithIndex]);

  const handleIndexChange = (unitId: string, indexId: string | null) => {
    setSelectedIndices((prev) => ({ ...prev, [unitId]: indexId }));
    // Aquí iría la mutación para guardar en index_for_censos
    // Ejemplo: updateUnitIndex(unitId, indexId, censoId)
  };

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
            {loading || loadingIndices ? (
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
                          Nombre de la unidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Índice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {unitsWithIndex.map((unit) => {
                        const unitId = String(unit.id);
                        const currentValue = selectedIndices[unitId] ?? "";
                        return (
                          <tr key={unitId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {unit.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <select
                                value={currentValue}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  handleIndexChange(unitId, val === "" ? null : val);
                                }}
                                className="border rounded px-2 py-1 text-sm"
                              >
                                <option value="">Sin índice</option>
                                {indices.map((idx) => (
                                  <option key={idx.id} value={String(idx.id)}>
                                    {idx.name}
                                  </option>
                                ))}
                              </select>
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                
                
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