import { useState, useEffect, useMemo, useCallback, type ChangeEvent } from "react";
import { getUnits, createUnit, updateUnit,banUnit, restoreUnit,forceDeleteUnit, getUnit, type UnitFilter } from "./units.service";
import { useToast } from "../../context/ToastContext"; // <--- 1. IMPORTAR

import type {
  Unit,
  PaginatedUnitsResponse,
  Meta,
} from "./units.interfaces";

type SortConfig = {
  key: keyof Unit;
  direction: "ascending" | "descending";
};

export function useUnits() {
  // --- Estados de datos ---
  const { addToast } = useToast(); 
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [links, setLinks] = useState<PaginatedUnitsResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Estados de filtros y orden ---
  const [filter, setFilter] = useState<UnitFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "ascending",
    
  });

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingUnit, setViewingUnit] = useState<Unit | null>(null);
  
  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewingUnit(null);
  }, []);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  // (Esto nos permite recargar la lista después de crear un item)
  const [reloadToken, setReloadToken] = useState(0);
  const reloadUnits = useCallback(() => setReloadToken((t) => t + 1), []);
  // Guardará la unidad que estamos editando
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // --- 2. NUEVOS ESTADOS PARA EL MODAL DE CONFIRMACIÓN ---
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  // Guardará la unidad que queremos desactivar, restaurar o eliminar
  const [actionUnit, setActionUnit] = useState<Unit | null>(null);
  // Guardará qué acción estamos por confirmar
  const [actionType, setActionType] = useState<'ban' | 'restore' | 'delete' | null>(null);

  
  // --- Lógica de Carga de Datos ---

  // 1. Efecto para cargar datos
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
      .finally(() => {
        setLoading(false);
      });
  }, [filter, reloadToken]); 

  // 2. Función para paginación
  const loadUnitsByUrl = useCallback((url: string) => {
    setLoading(true);
    fetch(url)
      .then((res) => res.json() as Promise<PaginatedUnitsResponse>)
      .then((response) => {
        setUnits(response.data);
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

  // --- Controladores de Eventos (Filtros, Paginación) ---

  const handleFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as UnitFilter);
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePageClick = useCallback(
    (url: string | null) => {
      if (url) {
        loadUnitsByUrl(url);
      }
    },
    [loadUnitsByUrl]
  );

  const handleSort = useCallback((key: keyof Unit) => {
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

  // --- Lógica de Memoización (Datos Computados) ---
  const filteredUnits = useMemo(() => {
    return units.filter((unit) =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [units, searchTerm]);

  const sortedUnits = useMemo(() => {
    let sortableItems = [...filteredUnits];
    sortableItems.sort((a, b) => {
      // ... (lógica de ordenamiento sin cambios)
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
  }, [filteredUnits, sortConfig]);

  // (Acciones CRUD) ---

  // MODIFICADO: Abre el modal
  const handleAddClick = useCallback(() => {
    setEditingUnit(null);
    setModalError(null); // Limpia errores antiguos
    setIsModalOpen(true);
  }, []);
  
  // NUEVO: Cierra el modal
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setModalError(null); // Limpia errores al cerrar
    setEditingUnit(null);
  }, []);

  // NUEVO: Lógica para guardar
 // Reemplaza tu 'handleModalSave' con esto:
  const handleModalSave = useCallback(
  async (name: string) => {
    setIsSubmitting(true);
    setModalError(null);

    try {
      let response: any;
      const unitData = { name };

      if (editingUnit) {
        response = await updateUnit(editingUnit.id, unitData);
      } else {
        response = await createUnit(unitData);
      }

      // Usamos el mensaje del back: "Unidad creada con exito" o "Unidad actualizada con éxito."
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
  },
  [reloadUnits, editingUnit, addToast]
);

// --- 1. AGREGA ESTA FUNCIÓN (que se había borrado) ---
const handleConfirmModalClose = useCallback(() => {
  setIsConfirmModalOpen(false);
  setActionUnit(null);
  setActionType(null);
  setModalError(null); 
}, []);

// --- 2. MODAL DE ACCIÓN (Corregido para TS) ---
const handleConfirmAction = useCallback(async () => {
  if (!actionUnit || !actionType) return;
  setIsSubmitting(true);

  try {
    let response: any; // <--- Le damos un tipo para que TS no se queje

    if (actionType === 'ban') {
      response = await banUnit(actionUnit.id);
    } else if (actionType === 'restore') {
      response = await restoreUnit(actionUnit.id);
    } else if (actionType === 'delete') {
      response = await forceDeleteUnit(actionUnit.id);
    }

    // Verificamos que response exista antes de usarlo (soluciona el error de 'undefined')
    if (response) {
      const toastType = actionType === 'ban' ? "warning" : actionType === 'delete' ? "danger" : "success";

      handleConfirmModalClose();
      reloadUnits();
      
      // Ahora sí, tomamos el mensaje que viene del UnitController.php
      addToast(response.message, toastType); 
    }

  } catch (err: any) {
    // Si el backend lanza el error 400, handleJsonResponse captura el message y lo lanza aquí
    addToast(err.message || "Error al procesar la acción", "danger");
  } finally {
    setIsSubmitting(false);
  }
}, [actionUnit, actionType, reloadUnits, handleConfirmModalClose, addToast]);

const onView = useCallback(async (unit: Unit) => {
  // Usamos el nuevo estado, así la tabla no se entera de que estamos cargando
  setIsViewLoading(true); 
  
  try {
    const unitData = await getUnit(unit.id);
    setViewingUnit(unitData);
    setIsViewModalOpen(true);
  } catch (err) {
    console.error("Error al obtener detalle de la unidad:", err);
    const errorMessage = (err as Error).message || "No se pudo cargar el detalle.";
    addToast(errorMessage, "danger");
  } finally {
    setIsViewLoading(false); // Apagamos la carga del modal
  }
}, [addToast]);

  const onEdit = useCallback((unit: Unit) => {
    setEditingUnit(unit); // <--- Guarda la unidad a editar
    setModalError(null);
    setIsModalOpen(true); // <--- Abre el modal
  }, []);

  const onBan = useCallback((unit: Unit) => {
    setActionUnit(unit);
    setActionType('ban');
    setIsConfirmModalOpen(true); // Abre el modal de confirmación
    setModalError(null);
  }, []);

  const onRestore = useCallback((unit: Unit) => {
    setActionUnit(unit);
    setActionType('restore');
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

  const onDelete = useCallback((unit: Unit) => {
  setActionUnit(unit);
  setActionType('delete'); // <--- Esto le dice al modal qué textos mostrar
  setIsConfirmModalOpen(true);
  setModalError(null);
}, []);

  

  // --- Objeto de Retorno ---
  return {
    // Estado de carga
    loading,
    isViewLoading,
    error,
    
    // Datos
    sortedUnits,
    meta,
    links,
    
    // Estado de filtros
    filter,
    searchTerm,

    isConfirmModalOpen,
    actionUnit,
    actionType,
    
    // --- NUEVO: Estado del Modal ---
    isModalOpen,
    isSubmitting,
    modalError,
    editingUnit,
    isViewModalOpen,
    viewingUnit,

    // Controladores (Filtros, Paginación)
    handleFilterChange,
    handleSearchChange,
    handleSort,
    handlePageClick,

    // Controladores de acciones (CRUD)
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
    handleViewModalClose
  };
}