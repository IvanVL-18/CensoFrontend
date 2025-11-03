import { useState, useEffect, useMemo, useCallback, type ChangeEvent } from "react";
// --- NUEVO ---: Importamos el servicio de creación
import { getUnits, createUnit, updateUnit,banUnit, restoreUnit,forceDeleteUnit, type UnitFilter } from "./units.service";
import type {
  Unit,
  PaginatedUnitsResponse,
  Meta,
  CreateUnitDTO,
  UpdateUnitDTO,
} from "./units.interfaces";

type SortConfig = {
  key: keyof Unit;
  direction: "ascending" | "descending";
};

export function useUnits() {
  // --- Estados de datos ---
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

  // --- NUEVO: Estado para el Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  // --- NUEVO: Estado para forzar recarga ---
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
  }, [filter, reloadToken]); // --- MODIFICADO: Se recarga también con reloadToken

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

  // --- NUEVAS FUNCIONES (Acciones CRUD) ---

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
        if (editingUnit) {
          // --- LÓGICA DE ACTUALIZAR ---
          // (Asumiendo que tu DTO es solo { name })
          const unitData: UpdateUnitDTO = { name }; 
          await updateUnit(editingUnit.id, unitData);

        } else {
          // --- LÓGICA DE CREAR (la que ya tenías) ---
          const unitData: CreateUnitDTO = { name };
          await createUnit(unitData);
        }

        // ¡Éxito!
        setIsModalOpen(false); // Cierra el modal
        setEditingUnit(null);  // Limpia el estado de edición
        reloadUnits();         // Dispara la recarga de datos

      } catch (err) {
        console.error("Error al guardar la unidad:", err);
        setModalError((err as Error).message || "Ocurrió un error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadUnits, editingUnit] // <--- AÑADIR 'editingUnit' A LAS DEPENDENCIAS
  );

  const handleConfirmModalClose = useCallback(() => {
    setIsConfirmModalOpen(false);
    setActionUnit(null);
    setActionType(null);
    setModalError(null); // Limpia error
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!actionUnit || !actionType) return;

    setIsSubmitting(true);
    setModalError(null);

    try {
      if (actionType === 'ban') {
        await banUnit(actionUnit.id);
      } else if (actionType === 'restore') {
        await restoreUnit(actionUnit.id);
      } else if (actionType === 'delete') { // <--- AÑADIR ESTE BLOQUE
        await forceDeleteUnit(actionUnit.id);
      }

      // ¡Éxito!
      handleConfirmModalClose(); // Cierra el modal
      reloadUnits();             // Recarga los datos

    } catch (err) {
      console.error("Error al procesar la acción:", err);
      setModalError((err as Error).message || "Ocurrió un error");
    } finally {
      setIsSubmitting(false);
    }
  }, [actionUnit, actionType, reloadUnits, handleConfirmModalClose]); // <-- Las dependencias están bien
  

  // --- Placeholders para el futuro ---
 const onView = useCallback((unit: Unit) => {
    setViewingUnit(unit);
    setIsViewModalOpen(true);
  }, []);

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
    handleModalClose, // --- NUEVO ---
    handleModalSave,  // --- NUEVO ---
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