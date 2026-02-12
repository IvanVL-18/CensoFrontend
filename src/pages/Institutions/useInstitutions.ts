import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ChangeEvent,
} from "react";
import {
  getInstitutions,
  getInstitution,
  createInstitution,
  updateInstitution,
  banInstitution,
  restoreInstitution,
  forceDeleteInstitution,
  type InstitutionFilter,
} from "./Institutions.service";
import { useToast } from "../../context/ToastContext";

import type {
  Institution,
  PaginatedInstitutionsResponse,
  Meta,
  CreateInstitutionDTO,
  UpdateInstitutionDTO,
} from "./Institutions.interfaces";

type SortConfig = {
  key: keyof Institution;
  direction: "ascending" | "descending";
};

export function useInstitutions() {
  const { addToast } = useToast();
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [links, setLinks] = useState<
    PaginatedInstitutionsResponse["links"] | null
  >(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<InstitutionFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "created_at",
    direction: "ascending",
  });

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingInstitution, setViewingInstitution] =
    useState<Institution | null>(null);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapInstitution, setMapInstitution] = useState<Institution | null>(
    null,
  );
  const [mapEditable, setMapEditable] = useState(false);

  const [isEditMapOpen, setIsEditMapOpen] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lon: number } | null>(null);

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewingInstitution(null);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [reloadToken, setReloadToken] = useState(0);
  const reloadInstitutions = useCallback(
    () => setReloadToken((t) => t + 1),
    [],
  );

  const [editingInstitution, setEditingInstitution] =
    useState<Institution | null>(null);
 

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [actionInstitution, setActionInstitution] =
    useState<Institution | null>(null);

  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

  const onShowMap = useCallback(
    (institution: Institution, editable: boolean = false) => {
      setMapInstitution(institution);
      setMapEditable(editable);
      setIsMapModalOpen(true);
    },
    [],
  );
  
  const onEditLocation = useCallback(() => {
    if (!editingInstitution) return;
    setIsEditMapOpen(true);
  }, [editingInstitution]);


  const onCloseEditMap = useCallback(() => {
    setIsEditMapOpen(false);
  }, []);

 
  const onPickLocation = useCallback((coords: { lat: number; lon: number }) => {
    setPendingCoords(coords);
  }, []);

  const handleMapModalClose = () => {
    setIsMapModalOpen(false);
    setMapInstitution(null);
    setMapEditable(false);
  };

  useEffect(() => {
    setLoading(true);
    getInstitutions(filter)
      .then((response) => {
        setInstitutions(response.data);
        setLinks(response.links);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(`Error al cargar las instituciones: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filter, reloadToken]);

  const loadInstitutionsByUrl = useCallback((url: string) => {
    setLoading(true);
    fetch(url)
      .then((res) => res.json() as Promise<PaginatedInstitutionsResponse>)
      .then((response) => {
        setInstitutions(response.data);
        setLinks(response.links);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(`Error al cargar la página: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleFilterChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setFilter(e.target.value as InstitutionFilter);
    },
    [],
  );

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePageClick = useCallback(
    (url: string | null) => {
      if (url) {
        loadInstitutionsByUrl(url);
      }
    },
    [loadInstitutionsByUrl],
  );

  const handleSort = useCallback((key: keyof Institution) => {
    setSortConfig((currentConfig) => {
      let direction: "ascending" | "descending" = "ascending";
      if (
        currentConfig.key === key &&
        currentConfig.direction === "ascending"
      ) {
        direction = "descending";
      }
      return { key, direction };
    });
  }, []);

  const filteredInstitutions = useMemo(() => {
    return institutions.filter((institution) =>
      institution.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [institutions, searchTerm]);

  const sortedInstitutions = useMemo(() => {
    let sortableItems = [...filteredInstitutions];
    sortableItems.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (valA < valB) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (valA > valB) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [filteredInstitutions, sortConfig]);

  const handleAddClick = useCallback(() => {
    setEditingInstitution(null);
    setModalError(null);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setModalError(null);
    setEditingInstitution(null);
  }, []);

  const handleModalSave = useCallback(
    async (institutionData: CreateInstitutionDTO | UpdateInstitutionDTO) => {
      setIsSubmitting(true);
      setModalError(null);

      try {
        let response: any;

        if (editingInstitution) {
          response = await updateInstitution(
            editingInstitution.id,
            institutionData,
          );
        } else {
          response = await createInstitution(
            institutionData as CreateInstitutionDTO,
          );
        }

        addToast(response.message, "success");

        setIsModalOpen(false);
        setEditingInstitution(null);
        reloadInstitutions();
      } catch (err: any) {
        console.error("Error al guardar la institución:", err);

        const errorMessage = err.message || "Ocurrió un error inesperado";
        setModalError(errorMessage);
        addToast(errorMessage, "danger");
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadInstitutions, editingInstitution, addToast],
  );

  const handleConfirmModalClose = useCallback(() => {
    setIsConfirmModalOpen(false);
    setActionInstitution(null);
    setActionType(null);
    setModalError(null);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!actionInstitution || !actionType) return;

    setIsSubmitting(true);
    setModalError(null);

    try {
      let response: any;

      if (actionType === "ban") {
        response = await banInstitution(actionInstitution.id);
      } else if (actionType === "restore") {
        response = await restoreInstitution(actionInstitution.id);
      } else if (actionType === "delete") {
        response = await forceDeleteInstitution(actionInstitution.id);
      }

      if (response) {
        const toastType =
          actionType === "ban"
            ? "warning"
            : actionType === "delete"
              ? "danger"
              : "success";

        handleConfirmModalClose();
        reloadInstitutions();

        addToast(response.message, toastType);
      }
    } catch (err: any) {
      console.error("Error al procesar la acción:", err);
      const errorMessage =
        err.message || "Ocurrió un error al procesar la solicitud";
      setModalError(errorMessage);
      addToast(errorMessage, "danger");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    actionInstitution,
    actionType,
    reloadInstitutions,
    handleConfirmModalClose,
    addToast,
  ]);

  const onView = useCallback(
    async (unit: Institution) => {
      setIsViewLoading(true);

      try {
        const unitData = await getInstitution(unit.id);
        setViewingInstitution(unitData);
        setIsViewModalOpen(true);
      } catch (err) {
        console.error("Error al obtener detalle de la unidad:", err);
        const errorMessage =
          (err as Error).message || "No se pudo cargar el detalle.";
        addToast(errorMessage, "danger");
      } finally {
        setIsViewLoading(false);
      }
    },
    [addToast],
  );

  const onEdit = useCallback((institution: Institution) => {
    setEditingInstitution(institution);
    setPendingCoords(null);
    setModalError(null);
    setIsModalOpen(true);
  }, []);

  const onBan = useCallback((institution: Institution) => {
    setActionInstitution(institution);
    setActionType("ban");
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

  const onRestore = useCallback((institution: Institution) => {
    setActionInstitution(institution);
    setActionType("restore");
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

  const onDelete = useCallback((institution: Institution) => {
    setActionInstitution(institution);
    setActionType("delete");
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

  return {
    loading,
    isViewLoading,
    error,

    sortedInstitutions,
    meta,
    links,

    filter,
    searchTerm,

    isConfirmModalOpen,
    actionInstitution,
    actionType,

    isModalOpen,
    isSubmitting,
    modalError,
    editingInstitution,
    isViewModalOpen,
    viewingInstitution,
    isMapModalOpen,
    mapInstitution,
    mapEditable,

    handleFilterChange,
    handleSearchChange,
    handleSort,
    handlePageClick,

    handleAddClick,
    handleModalClose,
    handleModalSave,
    onShowMap,
    onView,
    onEdit,
    onBan,
    onRestore,
    onDelete,
    handleConfirmModalClose,
    handleConfirmAction,
    handleViewModalClose,
    handleMapModalClose,

  pendingCoords,
  isEditMapOpen,
  onEditLocation,
  onCloseEditMap,
  onPickLocation,
  };
}
