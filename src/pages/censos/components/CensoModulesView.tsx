import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, PlusCircle } from "lucide-react";
import { getCensoModules, updateCensoModules } from "../Censos.service";
import type { Module, Index, IndexForCenso, ModuleForCensoShowResponse } from "../Censos.types";

const CensoModulesView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [modules, setModules] = useState<Module[]>([]);
  const [indices, setIndices] = useState<Index[]>([]);
  const [assignments, setAssignments] = useState<IndexForCenso[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Record<string, string | null>>({});
  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  // Mapas para conversión entre IDs originales y encriptados
  const encryptedToOriginal = useMemo(() => {
    return modules.reduce((map, mod) => {
      map[mod.id] = mod.original_id;
      return map;
    }, {} as Record<string, number>);
  }, [modules]);

  const originalIndexToEncrypted = useMemo(() => {
    return indices.reduce((map, idx) => {
      map[idx.original_id] = idx.id;
      return map;
    }, {} as Record<number, string>);
  }, [indices]);

  const originalModuleToEncrypted = useMemo(() => {
    return modules.reduce((map, mod) => {
      map[mod.original_id] = mod.id;
      return map;
    }, {} as Record<number, string>);
  }, [modules]);

  // IDs originales de módulos que ya tienen asignación
  const assignedModuleIds = useMemo(() => {
    return new Set(assignments.map((a) => a.reference_id));
  }, [assignments]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data: ModuleForCensoShowResponse = await getCensoModules(id);
      const numericIndices = data.indexes.filter((idx) => /^\d+$/.test(idx.name));
      setIndices(numericIndices);
      setModules(data.modules || []);
      setAssignments(data.indexForCensos || []);

      // Inicializar selectedIndices: el índice asignado (encriptado) o null
      const initialSelected = data.modules.reduce((acc, mod) => {
        const assignment = data.indexForCensos?.find((a) => a.reference_id === mod.original_id);
        if (assignment) {
          const encryptedIndexId = numericIndices.find((idx) => idx.original_id === assignment.index_id)?.id;
          acc[mod.id] = encryptedIndexId || null;
        } else {
          acc[mod.id] = null;
        }
        return acc;
      }, {} as Record<string, string | null>);
      setSelectedIndices(initialSelected);

      // Inicializar selectedModules: true para asignados (marcados y deshabilitados), false para no asignados
      const initialSelectedModules = data.modules.reduce((acc, mod) => {
        const isAssigned = data.indexForCensos?.some((a) => a.reference_id === mod.original_id);
        acc[mod.id] = !!isAssigned;
        return acc;
      }, {} as Record<string, boolean>);
      setSelectedModules(initialSelectedModules);
    } catch (err: any) {
      setError(err.response?.data?.message || "No se pudieron cargar los índices asignados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleIndexChange = (moduleId: string, indexId: string | null) => {
    setSelectedIndices((prev) => ({ ...prev, [moduleId]: indexId }));
    setSuccessMessage(null);
    setError(null);
    setValidationErrors({});
  };

  const handleCheckboxChange = (moduleId: string, checked: boolean) => {
    setSelectedModules((prev) => ({ ...prev, [moduleId]: checked }));
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedModules((prev) => {
      const newSelected = { ...prev };
      modules.forEach((mod) => {
        if (!assignedModuleIds.has(mod.original_id)) {
          newSelected[mod.id] = checked;
        }
      });
      return newSelected;
    });
  };

  const handleAddSections = (moduleId: string) => {
    // Funcionalidad futura
  };

  const hasChanges = () => {
    for (const moduleId in selectedIndices) {
      const assignment = assignments.find((a) => a.reference_id === encryptedToOriginal[moduleId]);
      const currentIndexId = assignment ? originalIndexToEncrypted[assignment.index_id] : null;
      if (selectedIndices[moduleId] !== currentIndexId) return true;
    }
    return false;
  };

  const handleSave = async () => {
    if (saving || !id) return;

    // Ítems existentes (módulos ya asignados)
    const existingItems = assignments
      .map((assignment) => ({
        module_id: originalModuleToEncrypted[assignment.reference_id],
        index_id: originalIndexToEncrypted[assignment.index_id],
      }))
      .filter((item) => item.module_id && item.index_id);

    // Nuevos ítems (módulos marcados y con índice seleccionado, no asignados previamente)
    const newItems = Object.entries(selectedIndices)
      .filter(([moduleId, indexId]) => {
        if (!indexId) return false;
        if (!selectedModules[moduleId]) return false;
        const originalId = encryptedToOriginal[moduleId];
        return !assignedModuleIds.has(originalId);
      })
      .map(([moduleId, indexId]) => ({
        module_id: moduleId,
        index_id: indexId,
      }));

    const items = [...existingItems, ...newItems];

    // Validar duplicados (por seguridad)
    const moduleIds = items.map((item) => item.module_id);
    if (moduleIds.some((id, idx) => moduleIds.indexOf(id) !== idx)) {
      setError("Error interno: No se puede enviar al mismo módulo múltiples veces.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});

    try {
      await updateCensoModules(id, { items });
      setSuccessMessage("Cambios guardados correctamente.");
      await loadData();
    } catch (err: any) {
      if (err.response?.data?.errors) setValidationErrors(err.response.data.errors);
      setError(err.response?.data?.message || "Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const unassignedModules = modules.filter((mod) => !assignedModuleIds.has(mod.original_id));
  const allUnassignedSelected =
    unassignedModules.length > 0 && unassignedModules.every((mod) => selectedModules[mod.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#691b31]" />
      </div>
    );
  }

  if (error || !modules) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-600 mb-3">{error || "No se pudo cargar la información"}</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#691b31] text-white px-5 py-1.5 rounded-lg hover:bg-opacity-90 text-sm"
        >
          Regresar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-[#691b31] transition-colors text-sm"
          >
            <ArrowLeft size={18} className="mr-1" />
            <span className="font-medium">Volver al censo</span>
          </button>
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
                  <strong>{field}:</strong> {messages.join(", ")}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-[#691b31] to-[#8a2a45] px-6 py-4">
            <h2 className="text-xl font-bold text-white">Lista de módulos disponibles</h2>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={allUnassignedSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-[#691b31] focus:ring-[#691b31]"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre del módulo
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
                    const moduleId = module.id;
                    const currentValue = selectedIndices[moduleId] ?? "";
                    const isChecked = selectedModules[moduleId] ?? false;
                    const isAssigned = assignedModuleIds.has(module.original_id);
                    const assignment = assignments.find((a) => a.reference_id === module.original_id);
                    const existingIndexName = assignment?.index?.name;

                    return (
                      <tr key={moduleId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleCheckboxChange(moduleId, e.target.checked)}
                            disabled={isAssigned}
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
                              handleIndexChange(moduleId, val === "" ? null : val);
                            }}
                            className="border rounded px-2 py-1 text-sm w-full max-w-xs"
                            disabled={saving || isAssigned}
                          >
                            <option value="">Sin índice</option>
                            {indices.map((idx) => (
                              <option key={idx.id} value={idx.id}>
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
                            onClick={() => handleAddSections(moduleId)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                            title="Agregar secciones a este módulo"
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
              <p className="text-center text-gray-500 py-8">No hay módulos disponibles.</p>
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
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
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

export default CensoModulesView;