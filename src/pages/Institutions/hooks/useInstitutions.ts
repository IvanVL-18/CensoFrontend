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
} from "../Institutions.service";

import { useToast } from "../../../context/ToastContext";

import type {
  Institution,
  PaginatedInstitutionsResponse,
  Meta,
  CreateInstitutionDTO,
  UpdateInstitutionDTO,
} from "../institutions.types";

type SortConfig = {
  key: keyof Institution;
  direction: "ascending" | "descending";
};

export function useInstitutions() {
  const { addToast } = useToast();
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [links, setLinks] = useState<
    PaginatedInstitutionsResponse["links"] | null
  >(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<InstitutionFilter>("all");
  const [page, setPage] = useState(1);
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
  const [pendingCoords, setPendingCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [pendingAddressData, setPendingAddressData] = useState<{
    geocode?: string;
    municipality?: string;
  } | null>(null);

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

  const onPickLocation = useCallback(
    (
      coords: { lat: number; lon: number },
      addressData?: { geocode?: string; municipality?: string; state?: string },
    ) => {
      setPendingCoords(coords);
      setPendingAddressData(addressData ?? null);

      if (editingInstitution) {
        setEditingInstitution((prev) =>
          prev
            ? {
                ...prev,
                lat: coords.lat,
                lon: coords.lon,
                geocode: addressData?.geocode || prev.geocode,
                municipality: addressData?.municipality || prev.municipality,
              }
            : null,
        );
      }
    },
    [editingInstitution],
  );

  const handleMapModalClose = () => {
    setIsMapModalOpen(false);
    setMapInstitution(null);
    setMapEditable(false);
  };

  useEffect(() => {
    setLoading(true);
    getInstitutions(filter, "", page)
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
  }, [filter, page, reloadToken]);

  const handleFilterChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setFilter(e.target.value as InstitutionFilter);
      setPage(1);
    },
    [],
  );

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Los links del paginador apuntan a POST /institutions/search; un GET a esa
  // URL cae en GET /institutions/{id} con id="search" (400). Extraemos el
  // número de página y repetimos el POST con los filtros actuales.
  const handlePageClick = useCallback((url: string | null) => {
    if (!url) return;
    try {
      const pageParam = new URL(url).searchParams.get("page");
      if (pageParam) setPage(Number(pageParam));
    } catch (e) {
      console.error(e);
    }
  }, []);

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
    setPendingCoords(null);
    setPendingAddressData(null);
    setModalError(null);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setModalError(null);
    setEditingInstitution(null);
    setPendingCoords(null);
    setPendingAddressData(null);
  }, []);

  const handleModalSave = useCallback(
    async (institutionData: CreateInstitutionDTO | UpdateInstitutionDTO) => {
      setIsSubmitting(true);
      setModalError(null);

      try {
        let response: any;

        const dataToSave = { ...institutionData };
        if (pendingCoords) {
          dataToSave.lat = pendingCoords.lat;
          dataToSave.lon = pendingCoords.lon;
        }

        if (pendingAddressData) {
          if (pendingAddressData.geocode)
            dataToSave.geocode = pendingAddressData.geocode;
          if (pendingAddressData.municipality)
            dataToSave.municipality = pendingAddressData.municipality;
        }

        if (editingInstitution) {
          response = await updateInstitution(editingInstitution.id, dataToSave);
        } else {
          response = await createInstitution(
            dataToSave as CreateInstitutionDTO,
          );
        }

        addToast(response.message, "success");

        setIsModalOpen(false);
        setEditingInstitution(null);
        setPendingCoords(null);
        setPendingAddressData(null);
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
    [
      reloadInstitutions,
      editingInstitution,
      addToast,
      pendingCoords,
      pendingAddressData,
    ],
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
    async (Module: Institution) => {
      setIsViewLoading(true);

      try {
        const ModuleData = await getInstitution(Module.id);
        setViewingInstitution(ModuleData);
        setIsViewModalOpen(true);
      } catch (err) {
        console.error("Error al obtener detalle de la Modulo:", err);
        const errorMessage =
          (err as Error).message || "No se pudo cargar el detalle.";
        addToast(errorMessage, "danger");
      } finally {
        setIsViewLoading(false);
      }
    },
    [addToast],
  );

  const onEdit = useCallback(
    async (institution: Institution) => {
      setIsEditLoading(true);
      setPendingCoords(null);
      setPendingAddressData(null);
      setModalError(null);

      try {
        const fullInstitution = await getInstitution(institution.id);
        setEditingInstitution(fullInstitution);
        setIsModalOpen(true);
      } catch (err) {
        console.error("Error al obtener detalle de la institución:", err);
        addToast("No se pudo cargar el detalle de la institución.", "danger");
      } finally {
        setIsEditLoading(false);
      }
    },
    [addToast],
  );

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
    isEditLoading,
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
