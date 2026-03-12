import { useCallback, useEffect, useMemo, useState } from "react";
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

interface UseSectionInstitutionsReturn {
  sectionInfo: SectionInfo | null;
  institutions: InstitutionItem[];
  filteredInstitutions: InstitutionItem[];
  selectedIds: Set<string>;
  originalAssignmentsSet: Set<string>;
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
  const [institutions, setInstitutions] = useState<InstitutionItem[]>([]);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [originalAssignmentsSet, setOriginalAssignmentsSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);
      const data = await getSectionInstitutions(sectionId, signal);

      setSectionInfo(data.section || null);
      setInstitutions(Array.isArray(data.institutions) ? data.institutions : []);
      setAssignments(Array.isArray(data.assignments) ? data.assignments : []);

      const originalSet = new Set<string>();
      if (Array.isArray(data.assignments)) {
        data.assignments.forEach((a: AssignmentItem) => {
          originalSet.add(String(a.institution_id));
        });
      }
      setOriginalAssignmentsSet(originalSet);
      setSelectedIds(originalSet);
    } catch (err: any) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        setError(err.response?.data?.message ?? "Error al cargar datos");
      }
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  // Filtrar solo por nombre (se eliminó municipio)
  const filteredInstitutions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return institutions;
    return institutions.filter((inst) =>
      inst.name.toLowerCase().includes(term)
    );
  }, [institutions, searchTerm]);

  const totalPages = Math.ceil((filteredInstitutions?.length || 0) / PAGE_SIZE);
  const paginatedInstitutions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return (filteredInstitutions || []).slice(start, start + PAGE_SIZE);
  }, [filteredInstitutions, currentPage]);

  const toggleInstitution = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(
    (checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        (paginatedInstitutions || []).forEach((inst) => {
          if (checked) next.add(inst.id);
          else next.delete(inst.id);
        });
        return next;
      });
    },
    [paginatedInstitutions]
  );

  const saveChanges = useCallback(async () => {
    if (!sectionInfo) return false;
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const payload = {
        section_id: sectionInfo.section_id,
        institutions: Array.from(selectedIds),
      };

      const hasExisting = assignments.length > 0;

      let response;
      if (hasExisting) {
        response = await updateSectionInstitutions(sectionInfo.section_id, {
          institutions: payload.institutions,
        });
      } else {
        response = await storeSectionInstitutions(payload);
      }

      // Mostrar mensaje de éxito
      setSuccessMessage(response.message || "Cambios guardados correctamente");

      // Recargar datos frescos
      await loadData();
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Error al guardar";
      setError(msg);
      return false;
    } finally {
      setSaving(false);
    }
  }, [sectionInfo, selectedIds, assignments.length, loadData]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []);

  return {
    sectionInfo,
    institutions: paginatedInstitutions,
    filteredInstitutions: paginatedInstitutions,
    selectedIds,
    originalAssignmentsSet,
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