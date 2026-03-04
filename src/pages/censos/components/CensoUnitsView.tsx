import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, PlusCircle } from "lucide-react";
import { getCensoModules, updateCensoModules } from "../Censos.service";
import type { Module, Index, IndexForCenso } from "../Censos.types";

const CensoUnitsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [modules, setModules] = useState<Module[]>([]);
  const [indices, setIndices] = useState<Index[]>([]);
  const [existingAssignments, setExistingAssignments] = useState<Record<string, string | null>>({});
  const [selectedIndices, setSelectedIndices] = useState<Record<string, string | null>>({});
  const [selectedUnits, setSelectedUnits] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const indexMap = useMemo(() => {
    const map: Record<string, string> = {};
    indices.forEach(idx => map[String(idx.id)] = idx.name);
    return map;
  }, [indices]);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getCensoModules(id);
        const numericIndices = data.indexs.filter(idx => /^\d+$/.test(idx.name));
        setIndices(numericIndices);
        setModules(data.modules || []);

        const assignments: Record<string, string | null> = {};
        if (data.indexForCensos) {
          data.indexForCensos.forEach((item: IndexForCenso) => {
            assignments[String(item.reference_id)] = item.index_id ? String(item.index_id) : null;
          });
        }
        setExistingAssignments(assignments);
        setSelectedIndices(assignments);

        const initialSelected: Record<string, boolean> = {};
        data.modules?.forEach((mod: Module) => initialSelected[String(mod.id)] = true);
        setSelectedUnits(initialSelected);
      } catch (err: any) {
        setError(err.response?.data?.message || "No se pudieron cargar los índices asignados.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleIndexChange = (unitId: string, indexId: string | null) => {
    setSelectedIndices(prev => ({ ...prev, [unitId]: indexId }));
    setSuccessMessage(null);
    setError(null);
    setValidationErrors({});
  };

  const handleCheckboxChange = (unitId: string, checked: boolean) => {
    setSelectedUnits(prev => ({ ...prev, [unitId]: checked }));
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelected: Record<string, boolean> = {};
    modules.forEach(mod => newSelected[String(mod.id)] = checked);
    setSelectedUnits(newSelected);
  };

  const handleAddSections = (unitId: string) => {
    alert(`Funcionalidad para agregar secciones a la unidad ${unitId} (próximamente)`);
  };

  const hasChanges = () => {
    for (const unitId in selectedIndices) {
      if (selectedIndices[unitId] !== existingAssignments[unitId]) return true;
    }
    for (const unitId in existingAssignments) {
      if (!(unitId in selectedIndices) || selectedIndices[unitId] !== existingAssignments[unitId]) return true;
    }
    return false;
  };

  const handleSave = async () => {
    if (saving || !id) return;

    const items = Object.entries(selectedIndices)
      .filter(([unitId, indexId]) => selectedUnits[unitId] && indexId !== null && indexId !== "")
      .map(([unitId, indexId]) => ({
        module_id: unitId,
        index_id: indexId as string,
      }));

    const moduleIds = items.map(item => item.module_id);
    if (moduleIds.some((id, idx) => moduleIds.indexOf(id) !== idx)) {
      setError("Error interno: No se puede enviar la misma unidad múltiples veces.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});

    try {
      await updateCensoModules(id, { items });
      setSuccessMessage("Cambios guardados correctamente.");
      setExistingAssignments(selectedIndices);
    } catch (err: any) {
      if (err.response?.data?.errors) setValidationErrors(err.response.data.errors);
      setError(err.response?.data?.message || "Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const allSelected = modules.length > 0 && modules.every(mod => selectedUnits[String(mod.id)]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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
        {Object.keys(validationErrors).length > 0 && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <h3 className="font-bold mb-1">Errores de validación:</h3>
            <ul className="list-disc pl-5">
              {Object.entries(validationErrors).map(([field, messages]) => (
                <li key={field}>
                  <strong>{field}:</strong> {messages.join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}

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
                          Índice a asignar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Asignación actual
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {modules.map((module) => {
                        const unitId = String(module.id);
                        const currentValue = selectedIndices[unitId] ?? "";
                        const isChecked = selectedUnits[unitId] ?? false;
                        const existingIndexId = existingAssignments[unitId];
                        const existingIndexName = existingIndexId ? indexMap[existingIndexId] : null;

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
                              {module.name}
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {existingIndexName ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {existingIndexName}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                  Sin asignar
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <button
                                onClick={() => handleAddSections(unitId)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                title="Agregar secciones a esta unidad"
                              >
                                <PlusCircle size={16} />
                                <span className="hidden sm:inline">Secciones</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {modules.length === 0 && (
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
                disabled={!hasChanges() || saving || loading}
                className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-colors ${
                  !hasChanges() || saving || loading
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