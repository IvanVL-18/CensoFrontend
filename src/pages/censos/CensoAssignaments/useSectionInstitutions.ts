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

interface InstitutionState {
  institutionId: string;
  assignmentId?: string;
}

type InstitutionMap = Record<string, InstitutionState>;

interface UseSectionInstitutionsReturn {
  sectionInfo: SectionInfo | null;
  institutions: InstitutionItem[];
  allInstitutions: InstitutionItem[];
  selectedIds: Set<string>;
  originalAssignments: InstitutionMap;
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

  const originalMapRef = useRef<InstitutionMap>({});
  const [mapVersion, setMapVersion] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const buildOriginalMap = useCallback((assignments: AssignmentItem[]): InstitutionMap => {
    const map: InstitutionMap = {};
    assignments.forEach((a) => {
      map[a.institution_id] = {
        institutionId: a.institution_id,
        assignmentId: a.id,
      };
    });
    return map;
  }, []);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getSectionInstitutions(sectionId, signal);

      const receivedAssignments = Array.isArray(data.assignments) ? data.assignments : [];
      const receivedInstitutions = Array.isArray(data.institutions) ? data.institutions : [];

      setSectionInfo(data.section || null);
      setAllInstitutions(receivedInstitutions);
      setAssignments(receivedAssignments);

      const nameToIdMap = new Map<string, string>();
      receivedInstitutions.forEach((inst) => {
        nameToIdMap.set(inst.name, String(inst.id));
      });

      const initialSelected = new Set<string>();
      receivedAssignments.forEach((assignment) => {
        const realId = nameToIdMap.get(assignment.name);
        if (realId) {
          initialSelected.add(realId);
        }
      });
      setSelectedIds(initialSelected);

      originalMapRef.current = buildOriginalMap(receivedAssignments);
      setMapVersion((v) => v + 1);

    } catch (err: any) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        const backendMessage = err.response?.data?.message;
        setError(backendMessage || "Error al cargar datos. Verifica la consola.");
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

  const filteredInstitutions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return allInstitutions;
    return allInstitutions.filter((inst) =>
      inst.name.toLowerCase().includes(term)
    );
  }, [allInstitutions, searchTerm]);

  const totalPages = Math.ceil(filteredInstitutions.length / PAGE_SIZE);
  const paginatedInstitutions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredInstitutions.slice(start, start + PAGE_SIZE);
  }, [filteredInstitutions, currentPage]);

  const toggleInstitution = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const idStr = String(id);
      if (checked) next.add(idStr);
      else next.delete(idStr);
      return next;
    });
  }, []);

  const toggleAll = useCallback((checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      paginatedInstitutions.forEach((inst) => {
        const idStr = String(inst.id);
        if (checked) next.add(idStr);
        else next.delete(idStr);
      });
      return next;
    });
  }, [paginatedInstitutions]);

  const saveChanges = useCallback(async () => {
    if (!sectionInfo) return false;

    const institutionsToSave = Array.from(selectedIds);
    const items = institutionsToSave.map((institution_id) => ({ institution_id }));

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const hasExisting = assignments.length > 0;

      let response;
      if (hasExisting) {
        response = await updateSectionInstitutions(sectionInfo.section_id, {
          items,
        });
      } else {
        response = await storeSectionInstitutions({
          census_section_id: sectionInfo.section_id,
          items,
        });
      }

      await loadData();

      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Error al guardar";
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