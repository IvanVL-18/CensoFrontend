import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { getCensoModules, updateCensoModules } from "../Censos.service";
// Importamos el tipo de respuesta tal como lo define la API (puede tener discrepancias)
import type { ModuleForCensoShowResponse, Index, Module, IndexForCenso } from "../Censos.types";

// Formato interno normalizado que realmente usaremos en el componente
interface NormalizedIndex {
  id: string;          // ID encriptado (siempre string)
  original_id: number; // ID plano numérico
  name: string;
}

interface NormalizedModule {
  id: string;          // ID encriptado
  original_id: number; // ID plano numérico
  name: string;
}

// Estado interno
type AssignmentsMap = Record<string, string>; // clave = module.id (encriptado), valor = index.original_id (plano)
type ChecksMap = Record<string, boolean>;

const CensoModulesView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [modules, setModules] = useState<NormalizedModule[]>([]);
  const [indexes, setIndexes] = useState<NormalizedIndex[]>([]);
  const [assignments, setAssignments] = useState<AssignmentsMap>({});
  const [checkedModules, setCheckedModules] = useState<ChecksMap>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const storageKey = `censo_modules_${id}`;

  // Mapas de conversión (sobre los datos ya normalizados)
  const encryptedToPlainIndex = useMemo(() => {
    const map: Record<string, string> = {};
    indexes.forEach(idx => {
      map[idx.id] = String(idx.original_id);
    });
    return map;
  }, [indexes]);

  const plainToEncryptedIndex = useMemo(() => {
    const map: Record<string, string> = {};
    indexes.forEach(idx => {
      map[String(idx.original_id)] = idx.id;
    });
    return map;
  }, [indexes]);

  // Normaliza la respuesta de la API a nuestro formato interno
  const normalizeData = (data: ModuleForCensoShowResponse) => {
    // Índices: filtramos solo los numéricos y convertimos
    const rawIndexes = data.indexes ?? [];
    const numericIndexes = rawIndexes
      .filter(i => /^\d+$/.test(i.name))
      .map(i => ({
        id: String(i.id),
        original_id: Number((i as any).original_id ?? i.id), // Si no viene original_id, usamos i.id (conversión a número)
        name: i.name,
      }));

    // Módulos: igual, nos aseguramos de tener original_id numérico
    const rawModules = data.modules ?? [];
    const normalizedModules = rawModules.map(m => ({
      id: String(m.id),
      original_id: Number((m as any).original_id ?? m.id),
      name: m.name,
    }));

    return { indexes: numericIndexes, modules: normalizedModules };
  };

  // Inicializa el estado a partir de las asignaciones del backend (indexForCensos)
  const initializeFromBackend = (
    data: ModuleForCensoShowResponse,
    numericIndexes: NormalizedIndex[],
    normalizedModules: NormalizedModule[]
  ) => {
    const initialAssignments: AssignmentsMap = {};
    const initialChecks: ChecksMap = {};

    // Por defecto, ningún módulo chequeado
    normalizedModules.forEach(m => {
      initialChecks[m.id] = false;
    });

    // Procesar asignaciones existentes
    (data.indexForCensos ?? []).forEach((row: IndexForCenso) => {
      const modulePlainId = String(row.reference_id);
      // Buscar el módulo por su original_id
      const module = normalizedModules.find(m => String(m.original_id) === modulePlainId);
      if (module) {
        const indexPlainId = String(row.index_id);
        // Verificar que el índice aún exista en la lista actual
        if (numericIndexes.some(idx => String(idx.original_id) === indexPlainId)) {
          initialAssignments[module.id] = indexPlainId;
          initialChecks[module.id] = true;
        }
      }
    });

    setAssignments(initialAssignments);
    setCheckedModules(initialChecks);
  };

  // Carga inicial
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getCensoModules(id);

        // Normalizar
        const { indexes: numericIndexes, modules: normalizedModules } = normalizeData(data);

        setIndexes(numericIndexes);
        setModules(normalizedModules);

        // Intentar restaurar desde localStorage
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved) as {
              assignments: AssignmentsMap;
              checkedModules: ChecksMap;
            };

            // Validar que los módulos e índices guardados aún existen
            const validAssignments: AssignmentsMap = {};
            const validChecks: ChecksMap = {};

            Object.entries(parsed.assignments || {}).forEach(([modEncId, plainIndexId]) => {
              const moduleExists = normalizedModules.some(m => m.id === modEncId);
              const indexExists = numericIndexes.some(
                idx => String(idx.original_id) === plainIndexId
              );
              if (moduleExists && indexExists) {
                validAssignments[modEncId] = plainIndexId;
                if (parsed.checkedModules?.[modEncId]) {
                  validChecks[modEncId] = true;
                }
              }
            });

            setAssignments(validAssignments);
            setCheckedModules(validChecks);
          } catch (e) {
            // Si hay error al parsear, empezamos de cero
            initializeFromBackend(data, numericIndexes, normalizedModules);
          }
        } else {
          // Primera vez: desde backend
          initializeFromBackend(data, numericIndexes, normalizedModules);
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || "Error al cargar los módulos");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, storageKey]);

  // Persistir en localStorage
  useEffect(() => {
    if (!id || loading) return;
    localStorage.setItem(
      storageKey,
      JSON.stringify({ assignments, checkedModules })
    );
  }, [assignments, checkedModules, id, loading, storageKey]);

  const toggleModule = (moduleId: string, checked: boolean) => {
    setCheckedModules(prev => ({ ...prev, [moduleId]: checked }));
    if (!checked) {
      setAssignments(prev => {
        const { [moduleId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleIndexChange = (moduleId: string, encryptedIndexId: string) => {
    const plainIndexId = encryptedToPlainIndex[encryptedIndexId];
    if (!plainIndexId) return;
    setAssignments(prev => ({ ...prev, [moduleId]: plainIndexId }));
    setCheckedModules(prev => ({ ...prev, [moduleId]: true }));
  };

  const handleSave = async () => {
    if (!id) return;

    const items = modules
      .filter(m => checkedModules[m.id])
      .map(m => {
        const plainIndexId = assignments[m.id];
        if (!plainIndexId) return null;
        return {
          module_id: String(m.original_id), // el backend espera el ID plano como string
          index_id: plainIndexId,
        };
      })
      .filter((item): item is { module_id: string; index_id: string } => item !== null);

    if (items.length === 0) {
      setError("Debes seleccionar al menos un módulo con índice.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await updateCensoModules(id, { items });
      setSuccess("Módulos guardados correctamente");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#691b31]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-[#691b31] mb-6"
        >
          <ArrowLeft size={18} />
          Volver
        </button>

        {error && (
          <div className="mb-4 bg-red-100 text-red-700 border border-red-300 p-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-100 text-green-700 border border-green-300 p-3 rounded">
            {success}
          </div>
        )}

        <div className="bg-white rounded-xl shadow border border-gray-200">
          <div className="bg-[#691b31] text-white px-6 py-4 rounded-t-xl">
            <h2 className="font-semibold text-lg">
              Asignación de módulos al censo
            </h2>
          </div>

          <div className="p-6 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs uppercase text-gray-500 border-b">
                  <th className="py-3 px-4">Activo</th>
                  <th className="py-3 px-4">Módulo</th>
                  <th className="py-3 px-4">Índice</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody>
                {modules.map(module => {
                  const moduleId = module.id;
                  const checked = checkedModules[moduleId] || false;
                  const plainIndexId = assignments[moduleId] || "";
                  const selectedEncryptedIndex = plainToEncryptedIndex[plainIndexId] || "";

                  return (
                    <tr key={moduleId} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => toggleModule(moduleId, e.target.checked)}
                          className="h-4 w-4 text-[#691b31]"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {module.name}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={selectedEncryptedIndex}
                          disabled={!checked}
                          onChange={e => handleIndexChange(moduleId, e.target.value)}
                          className="border rounded px-3 py-1 text-sm w-32"
                        >
                          <option value="">Seleccionar</option>
                          {indexes.map(idx => (
                            <option key={idx.id} value={idx.id}>
                              {idx.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {checked && plainIndexId ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            Asignado
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            Sin asignar
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {modules.length === 0 && (
              <p className="text-center text-gray-500 py-10">
                No hay módulos disponibles
              </p>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-[#691b31] hover:bg-[#8a2a45] text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                ) : (
                  <Save size={18} />
                )}
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CensoModulesView;