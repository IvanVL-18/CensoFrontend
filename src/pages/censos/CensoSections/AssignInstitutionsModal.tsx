import { useEffect, useState, useCallback } from "react";
import { X, Search, Loader2, Landmark } from "lucide-react";
import {
  getAssignmentForCensus,
  storeAssignmentForCensus,
  updateAssignmentForCensus,
} from "./CensoSections.service";
import type {
  AssignmentInstitution,
  AssignmentItem,
} from "./CensoSections.types";

interface Props {
  isOpen: boolean;
  censusSectionId: string | null;
  sectionName: string;
  onClose: () => void;
}

export function AssignInstitutionsModal({
  isOpen,
  censusSectionId,
  sectionName,
  onClose,
}: Props) {
  const [institutions, setInstitutions] = useState<AssignmentInstitution[]>([]);
  const [existingAssignments, setExistingAssignments] = useState<AssignmentItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [originallyAssigned, setOriginallyAssigned] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Carga datos al abrir
  useEffect(() => {
    if (!isOpen || !censusSectionId) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setSearch("");

    getAssignmentForCensus(censusSectionId, controller.signal)
      .then((res) => {
        // Las instituciones ya asignadas pueden no venir en res.institutions.
        // Las reconstruimos desde res.assignments y las fusionamos al inicio de la lista.
        const assignedIds = new Set(res.assignments.map((a) => a.institution_id));
        const assignedAsInstitutions: AssignmentInstitution[] = res.assignments.map((a) => ({
          id: a.institution_id,
          name: a.name,
        }));
        const unassignedNotDuplicated = res.institutions.filter((i) => !assignedIds.has(i.id));
        // Asignadas primero, luego las disponibles
        setInstitutions([...assignedAsInstitutions, ...unassignedNotDuplicated]);
        setExistingAssignments(res.assignments);
        setSelected(new Set(assignedIds));
        setOriginallyAssigned(new Set(assignedIds));
      })
      .catch((err) => {
        if (err.name === "CanceledError" || err.name === "AbortError") return;
        setError(err.message || "Error al cargar los datos.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [isOpen, censusSectionId]);

  // Limpiar al cerrar
  const handleClose = useCallback(() => {
    setInstitutions([]);
    setExistingAssignments([]);
    setSelected(new Set());
    setOriginallyAssigned(new Set());
    setSearch("");
    setError(null);
    setSuccessMsg(null);
    onClose();
  }, [onClose]);

  const toggleInstitution = useCallback((institutionId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(institutionId)) {
        next.delete(institutionId);
      } else {
        next.add(institutionId);
      }
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!censusSectionId) return;

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const items = Array.from(selected).map((id) => ({ institution_id: id }));

    try {
      let res: { message: string };

      if (existingAssignments.length > 0) {
        res = await updateAssignmentForCensus(censusSectionId, { items });
      } else {
        res = await storeAssignmentForCensus({
          census_section_id: censusSectionId,
          items,
        });
      }

      setSuccessMsg(res.message || "Instituciones guardadas correctamente.");
      // Actualizar el estado interno para que el siguiente save use PATCH
      setExistingAssignments(
        Array.from(selected).map((id) => ({
          id,
          institution_id: id,
          name:
            institutions.find((i) => i.id === id)?.name ?? "",
        }))
      );
    } catch (err: any) {
      setError(err.message || "Error al guardar las asignaciones.");
    } finally {
      setSaving(false);
    }
  }, [censusSectionId, selected, existingAssignments, institutions]);

  const filtered = institutions.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 bg-[var(--pantone-7421)] text-white shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Landmark size={18} className="shrink-0" />
            <div className="min-w-0">
              <h2 className="text-base font-bold leading-tight">
                Asignar Instituciones
              </h2>
              <p className="text-xs text-white/70 truncate">{sectionName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={saving}
            aria-label="Cerrar"
            className="hover:bg-white/20 p-1.5 rounded-lg transition-colors shrink-0 ml-3 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 overflow-hidden p-5 gap-4">

          {/* Búsqueda */}
          {!loading && !error && (
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar institución..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/30"
              />
            </div>
          )}

          {/* Contenido principal */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-14 text-gray-400">
                <Loader2 size={22} className="animate-spin" />
                <span className="text-sm">Cargando instituciones...</span>
              </div>
            ) : error ? (
              <div className="py-14 text-center text-sm text-red-500 px-4">
                {error}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-14 text-center text-sm text-gray-400">
                {search
                  ? "No hay instituciones que coincidan con la búsqueda."
                  : "No hay instituciones disponibles."}
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filtered.map((inst) => {
                  const isChecked = selected.has(inst.id);
                  const wasAssigned = originallyAssigned.has(inst.id);
                  return (
                    <li key={inst.id}>
                      <label className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${wasAssigned ? "bg-[var(--pantone-7421)]/5 hover:bg-[var(--pantone-7421)]/10" : "hover:bg-gray-50"}`}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleInstitution(inst.id)}
                          className="h-4 w-4 rounded border-gray-300 text-[var(--pantone-7421)] focus:ring-[var(--pantone-7421)]/30"
                        />
                        <span className="text-sm text-gray-800 select-none flex-1">
                          {inst.name}
                        </span>
                        {wasAssigned && (
                          <span className="text-xs font-medium text-[var(--pantone-7421)] bg-[var(--pantone-7421)]/10 px-2 py-0.5 rounded-full shrink-0">
                            Asignada
                          </span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Contador de seleccionadas */}
          {!loading && !error && (
            <p className="text-xs text-gray-500 text-right">
              {selected.size} institución(es) seleccionada(s)
            </p>
          )}

          {/* Mensajes de éxito / error del guardado */}
          {successMsg && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              {successMsg}
            </p>
          )}
          {!loading && error && saving === false && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 px-5 py-4 bg-gray-50 border-t border-gray-200 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold bg-[#C3A67C] text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading || !!error}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-[var(--pantone-7421)] text-white rounded-lg hover:brightness-90 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
