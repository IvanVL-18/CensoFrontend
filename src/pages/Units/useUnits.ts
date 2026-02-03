import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ChangeEvent,
} from "react";

import {
  getUnits,
  createUnit,
  updateUnit,
  banUnit,
  restoreUnit,
  forceDeleteUnit,
  importUnits,
  getUnit,
  type UnitFilter,
} from "./units.service";
import { useToast } from "../../context/ToastContext";
import type { Unit, PaginatedUnitsResponse, Meta } from "./units.interfaces";

type SortConfig = {
  key: keyof Unit;
  direction: "ascending" | "descending";
};

export function useUnits() {
  const [bulkErrors, setBulkErrors] = useState<any[]>([]);
  const [isBulkErrorModalOpen, setIsBulkErrorModalOpen] = useState(false);
  const { addToast } = useToast();
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [links, setLinks] = useState<PaginatedUnitsResponse["links"] | null>(
    null,
  );
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<UnitFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({key: "name",direction: "ascending",});
  const [isImportModalOpen, setIsImportModalOpen] = useState(false); // Modal para subir archivo
  const [importErrors, setImportErrors] = useState<any[]>([]); // Para guardar los errores del Excel

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingUnit, setViewingUnit] = useState<Unit | null>(null);

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewingUnit(null);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const reloadUnits = useCallback(() => setReloadToken((t) => t + 1), []);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionUnit, setActionUnit] = useState<Unit | null>(null);
  const [actionType, setActionType] = useState<
    "ban" | "restore" | "delete" | null
  >(null);

const [previewData, setPreviewData] = useState<any[]>([]);
const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
const [pendingFile, setPendingFile] = useState<File | null>(null);


useEffect(() => {
    setLoading(true);
    getUnits(filter)
      .then((response) => {
        setUnits(response.data);
        setLinks(response.links);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(`Error al cargar los Modulos: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, [filter, reloadToken]);



const handleFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value as UnitFilter), []);
const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value), []);
const handlePageClick = useCallback((url: string | null) => {
    if (!url) return;
    setLoading(true);
    fetch(url)
      .then((res) => res.json() as Promise<PaginatedUnitsResponse>)
      .then((response) => {
        setUnits(response.data);
        setLinks(response.links);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => setError(`Error paginación: ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

const handleSort = useCallback((key: keyof Unit) => {
    setSortConfig(c => ({ key, direction: c.key === key && c.direction === "ascending" ? "descending" : "ascending" }));
  }, []);

const filteredUnits = useMemo(() => units.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())), [units, searchTerm]);

const sortedUnits = useMemo(() => {
    const items = [...filteredUnits];
    items.sort((a, b) => {
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA == null) return 1; 
      if (valB == null) return -1;
      if (valA < valB) return sortConfig.direction === "ascending" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
    return items;
  }, [filteredUnits, sortConfig]);

  const handleAddClick = useCallback(() => {
    setEditingUnit(null);
    setModalError(null);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setModalError(null);
    setEditingUnit(null);
  }, []);

 const handleModalSave = useCallback(async (name: string) => {
    setIsSubmitting(true);
    setModalError(null);
    try {
      let response;
      const unitData = { name };
      if (editingUnit) {
        response = await updateUnit(editingUnit.id, unitData);
      } else {
        response = await createUnit(unitData);
      }
      addToast(response.message, "success");
      setIsModalOpen(false);
      setEditingUnit(null);
      reloadUnits();
    } catch (err: any) {
      setModalError(err.message || "Ocurrió un error");
      addToast(err.message, "danger");
    } finally {
      setIsSubmitting(false);
    }
  }, [editingUnit, addToast, reloadUnits]);


  const handleConfirmModalClose = useCallback(() => {
    setIsConfirmModalOpen(false);
    setActionUnit(null);
    setActionType(null);
    setModalError(null);
  }, []);

const handleConfirmAction = useCallback(async () => {
    if (!actionUnit || !actionType) return;
    setIsSubmitting(true);
    try {
      let response: any;
      if (actionType === 'ban') response = await banUnit(actionUnit.id);
      else if (actionType === 'restore') response = await restoreUnit(actionUnit.id);
      else if (actionType === 'delete') response = await forceDeleteUnit(actionUnit.id);

      if (response) {
        const toastType = actionType === 'delete' ? "danger" : "success";
        addToast(response.message, toastType);
        setIsConfirmModalOpen(false);
        setActionUnit(null);
        setActionType(null);
        reloadUnits();
      }
    } catch (err: any) {
      addToast(err.message || "Error en la acción", "danger");
    } finally {
      setIsSubmitting(false);
    }
  }, [actionUnit, actionType, reloadUnits, addToast]);

  const onView = useCallback(async (unit: Unit) => {
    setIsViewLoading(true);
    try {
      const data = await getUnit(unit.id);
      setViewingUnit(data);
      setIsViewModalOpen(true);
    } catch (err:any) {
      addToast(err.message || "Error al cargar detalle", "danger");
    } finally {
      setIsViewLoading(false);
    }
  }, [addToast]);

  const onEdit = useCallback((unit: Unit) => {
    setEditingUnit(unit);
    setModalError(null);
    setIsModalOpen(true);
  }, []);

  const onBan = useCallback((unit: Unit) => {
    setActionUnit(unit);
    setActionType("ban");
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

  const onRestore = useCallback((unit: Unit) => {
    setActionUnit(unit);
    setActionType("restore");
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

  const onDelete = useCallback((unit: Unit) => {
    setActionUnit(unit);
    setActionType("delete");
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

const handleBulkUpload = useCallback(async (file: File) => {
    setIsSubmitting(true);
    setBulkErrors([]); // Limpiamos errores previos

    const formData = new FormData();
    formData.append('file', file); // 'file' debe coincidir con el Request de Laravel

    try {
      // Enviamos directo al backend
      const response = await importUnits(formData);
      
      // Si llega aquí es status 200 (Todo perfecto)
      addToast(response.message || "Importación exitosa", "success");
      reloadUnits(); // Recargamos la tabla para ver los nuevos datos

    } catch (err: any) {
      console.error("Error en carga masiva:", err);

      // Si el backend responde 422, es que hay errores de validación en el Excel
      if (err.status === 422 && err.data?.errors) {
        setBulkErrors(err.data.errors); // Guardamos la lista de fallos
        setIsBulkErrorModalOpen(true);  // Abrimos el modal de reporte
        addToast("El archivo se procesó con algunos errores", "warning");
        reloadUnits(); // Recargamos igual, porque los buenos SÍ se guardaron
      } else {
        // Otros errores (500, red, etc)
        addToast(err.message || "Error al subir el archivo", "danger");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [addToast, reloadUnits]);


const confirmImport = useCallback(async () => {
  setIsSubmitting(true);
  try {
    await importUnits; 
    setIsPreviewModalOpen(false);
    addToast("¡Importación exitosa!", "success");

    // 2. Refresco total
    const response = await getUnits(filter); 
    setUnits(response.data);
    reloadUnits();
    setPreviewData([]);

  } catch (error: any) {
    // Si el backend devuelve errores de validación (el array de fallos)
    if (error.errors) {
      setBulkErrors(error.errors); // Guardamos los errores para el modal
      setIsPreviewModalOpen(false); // Cerramos la preview
      setIsBulkErrorModalOpen(true); // ¡ESTO activa el modal de errores!
    } else {
      addToast(error.message || "Error al guardar", "danger");
    }
  } finally {
    setIsSubmitting(false);
  }
}, [previewData, filter, reloadUnits, addToast]);



// Retorna estos nuevos estados y funciones



  return {
    loading,
    bulkErrors,
    isViewLoading,
    isBulkErrorModalOpen,
    error,
    sortedUnits,
    meta,
    links,
    filter,
    searchTerm,
    isConfirmModalOpen,
    actionUnit,
    actionType,
    isModalOpen,
    isSubmitting,
    modalError,
    editingUnit,
    isViewModalOpen,
    viewingUnit,
    previewData,
    isPreviewModalOpen,
    pendingFile,
    isImportModalOpen,
    importErrors,
    setIsImportModalOpen,
    setImportErrors,
    setSearchTerm,
    handleBulkUpload,
    handleFilterChange,
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
    setIsBulkErrorModalOpen,
    setIsPreviewModalOpen,
    confirmImport,
    setPendingFile,
    handleSearchChange,
  };
}