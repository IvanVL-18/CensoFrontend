// src/pages/area/useArea.ts
import { useState, useEffect, useMemo, useCallback, type ChangeEvent } from "react";
import {
  getAreas,
  getArea,
  createArea,
  updateArea,
  banArea,
  restoreArea,
  forceDeleteArea,
  getInstitutions,
} from "./Area.service";

import { useToast } from "../../context/ToastContext";

import type {
  Area,
  PaginatedAreasResponse,
  Meta,
  CreateAreaDTO,
  Institution,
  AreaFilter,
  SortConfig,
} from "./Areas.interfaces";

function getPageFromUrl(url: string | null) {
  if (!url) return null;

  try {
    const u = new URL(url);
    const p = u.searchParams.get("page");
    if (!p) return null;
    const n = Number(p);
    return Number.isFinite(n) ? n : null;
  } catch {
    const match = url.match(/[?&]page=(\d+)/);
    if (!match) return null;
    return Number(match[1]);
  }
}

function getInstitutionKeyFromArea(a: any): string | null {
  return (
    (a?.institution?.id ? String(a.institution.id) : null) ||
    (a?.institution_id ? String(a.institution_id) : null) ||
    (a?.institution_eid ? String(a.institution_eid) : null) ||
    null
  );
}

function getInstitutionNameFromArea(a: any): string | null {
  return (
    (a?.institution?.name ? String(a.institution.name) : null) ||
    (a?.institution_name ? String(a.institution_name) : null) ||
    null
  );
}

export function useAreas() {
  const { addToast } = useToast();
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [links, setLinks] = useState<PaginatedAreasResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AreaFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingArea, setViewingArea] = useState<Area | null>(null);

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewingArea(null);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const reloadAreas = useCallback(() => setReloadToken((t) => t + 1), []);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionArea, setActionArea] = useState<Area | null>(null);
  const [actionType, setActionType] = useState<"ban" | "restore" | "delete" | null>(null);

  useEffect(() => {
    getInstitutions()
      .then((response) => setInstitutions(response))
      .catch((err) => {
        console.error(err);
        setError(`Error al cargar las Instituciones: ${err.message}`);
      });
  }, [reloadToken]);

  useEffect(() => {
    setLoading(true);

    getAreas(filter, sortConfig, page)
      .then((response) => {
        setAreas(response.data);
        setLinks(response.links);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(`Error al cargar las Áreas: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, [filter, sortConfig, page, reloadToken]);

  const institutionsById = useMemo(() => {
    const map = new Map<string, Institution>();

    institutions.forEach((i: any) => {
      if (i?.id) map.set(String(i.id), i);
      if (i?.eid) map.set(String(i.eid), i);
      if (i?.institution_eid) map.set(String(i.institution_eid), i);
    });

    return map;
  }, [institutions]);

  const hydratedAreas = useMemo(() => {
    return areas.map((a: any) => {
      if (a?.institution?.name) return a;

      const key = getInstitutionKeyFromArea(a);
      const inst = key ? institutionsById.get(key) ?? null : null;
      const instName = getInstitutionNameFromArea(a);

      const fallbackInstitution =
        inst ?? (instName ? { id: key ?? "N/A", name: instName } : null);

      return { ...a, institution: fallbackInstitution };
    });
  }, [areas, institutionsById]);

  const handlePageClick = useCallback((url: string | null) => {
    const nextPage = getPageFromUrl(url);
    if (!nextPage) return;
    setPage(nextPage);
  }, []);

  const handleFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as AreaFilter);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSort = useCallback((key: keyof Area | "institution_name") => {
    setSortConfig((current) => {
      let direction: "ascending" | "descending" = "ascending";
      if (current.key === key && current.direction === "ascending") direction = "descending";
      return { key, direction };
    });
    setPage(1);
  }, []);

  const filteredAreas = useMemo(() => {
    return hydratedAreas.filter((area) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !area.deleted_at) ||
        (filter === "inactive" && !!area.deleted_at);

      const matchesSearch =
        String(area.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(area.institution?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [hydratedAreas, searchTerm, filter]);

  const sortedAreas = useMemo(() => {
    const sortable = [...filteredAreas];

    sortable.sort((a, b) => {
      const key = sortConfig.key;

      const valA =
        key === "institution_name"
          ? (a.institution?.name ?? "").toLowerCase()
          : String((a as any)[key] ?? "").toLowerCase();

      const valB =
        key === "institution_name"
          ? (b.institution?.name ?? "").toLowerCase()
          : String((b as any)[key] ?? "").toLowerCase();

      if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });

    return sortable;
  }, [filteredAreas, sortConfig]);

  const handleAddClick = useCallback(() => {
    setEditingArea(null);
    setModalError(null);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setModalError(null);
    setEditingArea(null);
  }, []);

  const handleModalSave = useCallback(
    async (name: string, institution_id: string) => {
      setIsSubmitting(true);
      setModalError(null);

      try {
        const areaData: CreateAreaDTO = { name, institution_id };
        let response: any;

        if (editingArea) response = await updateArea(String(editingArea.id), areaData);
        else response = await createArea(areaData);

        addToast(response.message ?? "Área guardada correctamente", "success");

        setIsModalOpen(false);
        setEditingArea(null);
        reloadAreas();
      } catch (err: any) {
        console.error("Error al guardar el área:", err);
        const errorMessage = err.message || "Ocurrió un error al guardar";
        setModalError(errorMessage);
        addToast(errorMessage, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadAreas, editingArea, addToast]
  );

  const handleConfirmModalClose = useCallback(() => {
    setIsConfirmModalOpen(false);
    setActionArea(null);
    setActionType(null);
    setModalError(null);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!actionArea || !actionType) return;

    setIsSubmitting(true);
    setModalError(null);

    try {
      let response: any;

      if (actionType === "ban") response = await banArea(String(actionArea.id));
      else if (actionType === "restore") response = await restoreArea(String(actionArea.id));
      else if (actionType === "delete") response = await forceDeleteArea(String(actionArea.id));

      if (response) {
        const toastType =
          actionType === "ban" ? "warning" : actionType === "delete" ? "danger" : "success";

        handleConfirmModalClose();
        reloadAreas();
        addToast(response.message ?? "Acción completada", toastType);
      }
    } catch (err: any) {
      console.error("Error al procesar la acción:", err);
      const errorMessage = err.message || "Ocurrió un error inesperado";
      setModalError(errorMessage);
      addToast(errorMessage, "danger");
    } finally {
      setIsSubmitting(false);
    }
  }, [actionArea, actionType, reloadAreas, handleConfirmModalClose, addToast]);

  const onView = useCallback(
    async (area: Area) => {
      setIsViewLoading(true);

      try {
        const data: any = await getArea(String(area.id));
        const key = getInstitutionKeyFromArea(data);
        const inst = key ? institutionsById.get(key) ?? null : null;
        const instName = getInstitutionNameFromArea(data);

        const fallbackInstitution =
          inst ?? (instName ? { id: key ?? "N/A", name: instName } : null);

        setViewingArea({ ...data, institution: fallbackInstitution });
        setIsViewModalOpen(true);
      } catch (err: any) {
        console.error("Error al obtener detalle del área:", err);
        addToast(err.message || "No se pudo cargar el detalle.", "danger");
      } finally {
        setIsViewLoading(false);
      }
    },
    [addToast, institutionsById]
  );
  
  const onEdit = useCallback((area: any) => {
    const pickedId =
      area?.institution_id ? String(area.institution_id) :
      area?.institution_eid ? String(area.institution_eid) :
      "";

    setEditingArea({
      ...area,
      institution_id: pickedId,
      institution: area.institution ?? null,
    });

    setModalError(null);
    setIsModalOpen(true);
  }, []);

  const onBan = useCallback((area: Area) => {
    setActionArea(area);
    setActionType("ban");
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

  const onRestore = useCallback((area: Area) => {
    setActionArea(area);
    setActionType("restore");
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

  const onDelete = useCallback((area: Area) => {
    setActionArea(area);
    setActionType("delete");
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

  return {
    loading,
    isViewLoading,
    error,

    sortedAreas,
    meta,
    links,

    filter,
    searchTerm,
    institutions,

    isConfirmModalOpen,
    actionArea,
    actionType,

    isModalOpen,
    isSubmitting,
    modalError,
    editingArea,

    isViewModalOpen,
    viewingArea,

    handleFilterChange,
    handleSearchChange,
    handleSort,
    handlePageClick,

    handleAddClick,
    handleModalClose,
    handleModalSave,

    onView,
    onEdit,
    onBan,
    onRestore,
    onDelete,

    handleConfirmModalClose,
    handleConfirmAction,
    handleViewModalClose,
  };
}
