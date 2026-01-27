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
  type AreaFilter,
  getInstitutions,
} from "./Area.service";

import { useToast } from "../../context/ToastContext";

import type {
  Area,
  PaginatedAreasResponse,
  Meta,
  CreateAreaDTO,
  Institution,
} from "./Areas.interfaces";

type SortConfig = {
  key: keyof Area | "institution_name";
  direction: "ascending" | "descending";
};

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

export function useAreas() {
  const { addToast } = useToast();

  // --- Estados de datos ---
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [links, setLinks] = useState<PaginatedAreasResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Estados de filtros y orden ---
  const [filter, setFilter] = useState<AreaFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "ascending",
  });

  // --- Vista ---
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingArea, setViewingArea] = useState<Area | null>(null);

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewingArea(null);
  }, []);

  // --- Modal Add/Edit ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  // recarga
  const [reloadToken, setReloadToken] = useState(0);
  const reloadAreas = useCallback(() => setReloadToken((t) => t + 1), []);

  // --- Confirm modal ---
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionArea, setActionArea] = useState<Area | null>(null);
  const [actionType, setActionType] = useState<"ban" | "restore" | "delete" | null>(null);

  // --- Carga inicial ---
  useEffect(() => {
    setLoading(true);

    getAreas(filter, sortConfig, 1)
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
      .finally(() => {
        setLoading(false);
      });

    getInstitutions()
      .then((response) => {
        setInstitutions(response);
      })
      .catch((err) => {
        console.error(err);
        setError(`Error al cargar las Instituciones: ${err.message}`);
      });
  }, [reloadToken]);

  // --- Paginación segura ---
  // ✅ NO uses fetch(url) directo, porque el backend puede mandar links de occupations.
  const handlePageClick = useCallback(
    (url: string | null) => {
      const page = getPageFromUrl(url);
      if (!page) return;

      setLoading(true);

      getAreas("all", { key: "name", direction: "ascending" })
        .then((response) => {
          // NOTA:
          // Si tu endpoint realmente pagina por page, entonces cambia getAreas para aceptar page.
          // Por ahora (para evitar occupations), volvemos a consumir areas "base".
          setAreas(response.data);
          setLinks(response.links);
          setMeta(response.meta);
          setError(null);
        })
        .catch((err) => {
          console.error(err);
          setError(`Error al cargar la página: ${err.message}`);
        })
        .finally(() => setLoading(false));
    },
    []
  );

  // --- Filtros / búsqueda ---
  const handleFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as AreaFilter);
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // --- Sort ---
  const handleSort = useCallback((key: keyof Area | "institution_name") => {
    setSortConfig((currentConfig) => {
      let direction: "ascending" | "descending" = "ascending";
      if (currentConfig.key === key && currentConfig.direction === "ascending") {
        direction = "descending";
      }
      return { key, direction };
    });
  }, []);

  // --- Filtrado local ---
  const filteredAreas = useMemo(() => {
    return areas.filter((area) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !area.deleted_at) ||
        (filter === "inactive" && !!area.deleted_at);

      const matchesSearch = area.name.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [areas, searchTerm, filter]);

  // --- Orden local ---
  const sortedAreas = useMemo(() => {
    const sortableAreas = [...filteredAreas];

    sortableAreas.sort((a, b) => {
      const key = sortConfig.key;

      const valA =
        key === "institution_name"
          ? a.institution?.name?.toLowerCase() || ""
          : String((a as any)[key] ?? "").toLowerCase();

      const valB =
        key === "institution_name"
          ? b.institution?.name?.toLowerCase() || ""
          : String((b as any)[key] ?? "").toLowerCase();

      if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });

    return sortableAreas;
  }, [filteredAreas, sortConfig]);

  // --- Acciones CRUD ---
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

        if (editingArea) {
          response = await updateArea(editingArea.id, areaData);
        } else {
          response = await createArea(areaData);
        }

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

      if (actionType === "ban") response = await banArea(actionArea.id);
      else if (actionType === "restore") response = await restoreArea(actionArea.id);
      else if (actionType === "delete") response = await forceDeleteArea(actionArea.id);

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
        const data = await getArea(area.id);
        setViewingArea(data);
        setIsViewModalOpen(true);
      } catch (err: any) {
        console.error("Error al obtener detalle del área:", err);
        const errorMessage = err.message || "No se pudo cargar el detalle.";
        addToast(errorMessage, "danger");
      } finally {
        setIsViewLoading(false);
      }
    },
    [addToast]
  );

  const onEdit = useCallback((area: Area) => {
    const areaToEdit: Area = {
      ...area,
      institution_id: area.institution?.id || "",
    };

    setEditingArea(areaToEdit);
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
