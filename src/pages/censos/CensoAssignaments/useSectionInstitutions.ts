import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getSectionInstitutions,
  storeSectionInstitutions,
  updateSectionInstitutions,
} from "./SectionInstitutions.service";
import type {
  SectionInfo,
  InstitutionItem,
  AssignmentItem,
} from "./SectionInstitutions.types";

// Estado de cada institución en el mapa local
interface InstitutionState {
  institutionId: string;           // ID de la institución (como string)
  assignmentId?: number;           // ID de la asignación si existe
  indexId?: number;                // ID del índice asignado (si aplica)
  indexName?: string;              // Nombre del índice (para mostrar)
}

// Mapa clave = ID de institución (string)
type InstitutionMap = Record<string, InstitutionState>;

interface UseSectionInstitutionsReturn {
  sectionInfo: SectionInfo | null;
  institutions: InstitutionItem[];               // instituciones paginadas
  allInstitutions: InstitutionItem[];             // todas (para paginación interna)
  selectedIds: Set<string>;                       // IDs seleccionados actualmente
  originalAssignments: InstitutionMap;            // estado original (lo que viene del backend)
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  toggleInstitution: (id: string, checked: boolean) => void;
  toggleAll: (checked: boolean) => void;
  saveChanges: () => Promise<boolean>;
  clearMessages: () => void;
}

const PAGE_SIZE = 10;

export const useSectionInstitutions = (
  sectionId: string
): UseSectionInstitutionsReturn => {
  const [sectionInfo, setSectionInfo] = useState<SectionInfo | null>(null);
  const [allInstitutions, setAllInstitutions] = useState<InstitutionItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Mapa original (lo que viene del backend)
  const originalMapRef = useRef<InstitutionMap>({});
  // Versión del mapa para forzar re-render
  const [mapVersion, setMapVersion] = useState(0);
  
  // Mapa de selecciones actuales (IDs de instituciones marcadas)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Construye el mapa original a partir de las asignaciones (usando 'assignments' del backend)
  const buildOriginalMap = useCallback((assignments: AssignmentItem[]): InstitutionMap => {
    const map: InstitutionMap = {};
    assignments.forEach((a) => {
      const instId = String(a.institution_id);
      map[instId] = {
        institutionId: instId,
        assignmentId: a.id,
        indexId: a.index_for_censo_id,
        // Si el backend incluyera el nombre del índice, podrías agregarlo aquí
        indexName: undefined,
      };
    });
    return map;
  }, []);

  // Carga inicial de datos
  const loadData = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Iniciando loadData con sectionId:', sectionId);
      
      const data = await getSectionInstitutions(sectionId, signal);
      console.log('📦 data recibida:', data);
      console.log('📦 data.assignments:', data?.assigments);
      console.log('📦 data.institutions:', data?.institutions);
      
      // 👇 Usamos 'assignments' (con dos 's') porque así lo devuelve el backend
const receivedAssignments = Array.isArray(data.assigments) ? data.assigments : [];
      const receivedInstitutions = Array.isArray(data.institutions) ? data.institutions : [];

      setSectionInfo(data.section || null);
      setAllInstitutions(receivedInstitutions);
      setAssignments(receivedAssignments);
      
      const newOriginalMap = buildOriginalMap(receivedAssignments);
      console.log('🗺️ newOriginalMap:', newOriginalMap);
      originalMapRef.current = newOriginalMap;
      setMapVersion(v => v + 1);
      
      // Inicializar selectedIds con las asignaciones originales
      const initialSelected = new Set(
        receivedAssignments.map(a => String(a.institution_id))
      );
      setSelectedIds(initialSelected);
      
    } catch (err: any) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        const backendMessage = err.response?.data?.message;
        setError(backendMessage || "Error al cargar datos. Verifica la consola.");
        console.error("Error en loadData:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [sectionId, buildOriginalMap]);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  // Filtrado por nombre
  const filteredInstitutions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return allInstitutions;
    return allInstitutions.filter(inst =>
      inst.name.toLowerCase().includes(term)
    );
  }, [allInstitutions, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(filteredInstitutions.length / PAGE_SIZE);
  const paginatedInstitutions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredInstitutions.slice(start, start + PAGE_SIZE);
  }, [filteredInstitutions, currentPage]);

  // Handlers de selección
  const toggleInstitution = useCallback((id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      const idStr = String(id);
      if (checked) next.add(idStr);
      else next.delete(idStr);
      return next;
    });
  }, []);

  const toggleAll = useCallback((checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      paginatedInstitutions.forEach(inst => {
        const idStr = String(inst.id);
        if (checked) next.add(idStr);
        else next.delete(idStr);
      });
      return next;
    });
  }, [paginatedInstitutions]);

  // Guardar cambios
  const saveChanges = useCallback(async () => {
    if (!sectionInfo) return false;
    
    const institutionsToSave = Array.from(selectedIds);
    console.log('💾 Guardando instituciones:', institutionsToSave);
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const hasExisting = assignments.length > 0;
      
      let response;
      if (hasExisting) {
        response = await updateSectionInstitutions(sectionInfo.section_id, {
          institutions: institutionsToSave,
        });
      } else {
        response = await storeSectionInstitutions({
          section_id: sectionInfo.section_id,
          institutions: institutionsToSave,
        });
      }

      setSuccessMessage(response?.message || "Cambios guardados correctamente");
      // Recargar datos para reflejar los cambios
      await loadData();
      
      return true;
    } catch (err: any) {
      console.error('❌ Error al guardar:', err);
      const msg = err.response?.data?.message ?? "Error al guardar";
      // Si hay errores de validación, mostrarlos
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0] as string[];
        setError(firstError?.[0] || msg);
      } else {
        setError(msg);
      }
      return false;
    } finally {
      setSaving(false);
    }
  }, [sectionInfo, selectedIds, assignments.length, loadData]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  // Exponer el mapa original
  const originalAssignments = useMemo(() => originalMapRef.current, [mapVersion]);

  return {
    sectionInfo,
    institutions: paginatedInstitutions,
    allInstitutions: filteredInstitutions,
    selectedIds,
    originalAssignments,
    loading,
    saving,
    error,
    successMessage,
    searchTerm,
    setSearchTerm,
    currentPage,
    totalPages,
    setCurrentPage,
    toggleInstitution,
    toggleAll,
    saveChanges,
    clearMessages,
  };
};