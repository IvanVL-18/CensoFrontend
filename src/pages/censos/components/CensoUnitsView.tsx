import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { useAllModules } from "../../Modules/hooks/useAllModules";
import { getCensoModules, updateCensoModules } from "../Censos.service";
import type { Module } from "../../Modules/Modules.types";
import type { Index } from "../Censos.types";

type UnitWithIndex = Module & { index_id?: string | number | null };

const CensoUnitsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { Modules, loading: loadingModules } = useAllModules();
  const unitsWithIndex = Modules as UnitWithIndex[];

  // Estados para índices, asignaciones existentes y selección
  const [indices, setIndices] = useState<Index[]>([]);
  const [existingAssignments, setExistingAssignments] = useState<Record<string, string | null>>({});
  const [selectedIndices, setSelectedIndices] = useState<Record<string, string | null>>({});
  const [selectedUnits, setSelectedUnits] = useState<Record<string, boolean>>({}); // true = checked

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cargar índices y asignaciones existentes
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCensoModules(id);
        // Filtrar índices numéricos (ya vienen así del backend, pero por si acaso)
        const numericIndices = data.indexs.filter(idx => /^\d+$/.test(idx.name));
        setIndices(numericIndices);

        // Mapear asignaciones existentes
        const assignments: Record<string, string | null> = {};
        if (data.indexForCensos) {
          data.indexForCensos.forEach((item) => {
            assignments[String(item.reference_id)] = String(item.index_id);
          });
        }
        setExistingAssignments(assignments);
        setSelectedIndices(assignments);
      } catch (err: any) {
        console.error("Error al cargar datos del censo:", err);
        setError(err.response?.data?.message || "No se pudieron cargar los índices asignados.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Inicializar selección de unidades (todas seleccionadas por defecto)
  useEffect(() => {
    if (!loadingModules && unitsWithIndex.length > 0 && !loading) {
      const initialSelected: Record<string, boolean> = {};
      unitsWithIndex.forEach((unit) => {
        initialSelected[String(unit.id)] = true; // todas seleccionadas
      });
      setSelectedUnits(initialSelected);

      // Asegurar que todas las unidades tengan entrada en selectedIndices
      setSelectedIndices((prev) => {
        const updated = { ...prev };
        unitsWithIndex.forEach((unit) => {
          const unitId = String(unit.id);
          if (!(unitId in updated)) {
            updated[unitId] = null;
          }
        });
        return updated;
      });
    }
  }, [unitsWithIndex, loading, loadingModules]);

  const handleIndexChange = (unitId: string, indexId: string | null) => {
    setSelectedIndices((prev) => ({ ...prev, [unitId]: indexId }));
    setSuccessMessage(null);
    setError(null);
  };

  const handleCheckboxChange = (unitId: string, checked: boolean) => {
    setSelectedUnits((prev) => ({ ...prev, [unitId]: checked }));
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelected: Record<string, boolean> = {};
    unitsWithIndex.forEach((unit) => {
      newSelected[String(unit.id)] = checked;
    });
    setSelectedUnits(newSelected);
  };

  const hasChanges = () => {
    for (const unitId in selectedIndices) {
      if (selectedIndices[unitId] !== existingAssignments[unitId]) {
        return true;
      }
    }
    for (const unitId in existingAssignments) {
      if (!(unitId in selectedIndices) || selectedIndices[unitId] !== existingAssignments[unitId]) {
        return true;
      }
    }
    return false;
  };

  const handleSave = async () => {
    if (!id) return;

    // Construir array de items solo con unidades seleccionadas y que tengan índice elegido
    const items = Object.entries(selectedIndices)
      .filter(([unitId, indexId]) => 
        selectedUnits[unitId] && indexId !== null && indexId !== ""
      )
      .map(([unitId, indexId]) => ({
        module_id: parseInt(unitId, 10),
        index_id: parseInt(indexId as string, 10),
      }));

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await updateCensoModules(id, { items });
      setSuccessMessage("Cambios guardados correctamente.");
      setExistingAssignments(selectedIndices);
    } catch (err: any) {
      console.error("Error al guardar:", err);
      setError(err.response?.data?.message || "Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const allSelected = unitsWithIndex.length > 0 && 
    unitsWithIndex.every((unit) => selectedUnits[String(unit.id)]);

  const isLoading = loading || loadingModules;

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

        {/* Mensajes de error/éxito */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Tarjeta principal */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#691b31] to-[#8a2a45] px-6 py-4">
            <h2 className="text-xl font-bold text-white">Lista de unidades disponibles</h2>
          </div>

          <div className="p-6">
            {isLoading ? (
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
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="rounded border-gray-300 text-[#691b31] focus:ring-[#691b31]"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre de la unidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Índice
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {unitsWithIndex.map((unit) => {
                        const unitId = String(unit.id);
                        const currentValue = selectedIndices[unitId] ?? "";
                        const isChecked = selectedUnits[unitId] ?? false;
                        return (
                          <tr key={unitId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => handleCheckboxChange(unitId, e.target.checked)}
                                className="rounded border-gray-300 text-[#691b31] focus:ring-[#691b31]"
                              />
                            </td>
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
                                className="border rounded px-2 py-1 text-sm w-full max-w-xs"
                                disabled={saving}
                              >
                                <option value="">Sin índice</option>
                                {indices.map((idx) => (
                                  <option key={idx.id} value={String(idx.id)}>
                                    {idx.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {unitsWithIndex.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No hay unidades disponibles.
                  </p>
                )}
              </>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Link
                to={`/censos/${id}`}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cerrar
              </Link>
              <button
                onClick={handleSave}
                disabled={!hasChanges() || saving || isLoading}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-colors ${
                  !hasChanges() || saving || isLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#691b31] text-white hover:bg-[#8a2a45]"
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Guardar cambios</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CensoUnitsView;