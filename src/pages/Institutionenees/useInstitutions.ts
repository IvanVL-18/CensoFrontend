import { useState, useEffect, useMemo, useCallback, type ChangeEvent } from "react";
import { 
  getInstitutions,
  getInstitution, 
  createInstitution, 
  updateInstitution,
  banInstitution, 
  restoreInstitution,
  forceDeleteInstitution, 
  type InstitutionFilter 
} from "./Institutions.service";
import { useToast } from "../../context/ToastContext"; // <--- 1. IMPORTAR

import type {
  Institution,
  PaginatedInstitutionsResponse,
  Meta,
  CreateInstitutionDTO,
} from "./Institutions.interfaces";

type SortConfig = {
  key: keyof Institution;
  direction: "ascending" | "descending";
};

export function useInstitutions() {
  // --- Estados de datos ---
  const { addToast } = useToast(); 
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [links, setLinks] = useState<PaginatedInstitutionsResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Estados de filtros y orden ---
  const [filter, setFilter] = useState<InstitutionFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "created_at",
    direction: "ascending",
    
  });

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingInstitution, setViewingInstitution] = useState<Institution | null>(null);
  
  // --- Estado para el Modal del Mapa ---
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapInstitution, setMapInstitution] = useState<Institution | null>(null);

  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewingInstitution(null);
  }, []);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  // (Esto nos permite recargar la lista después de crear un item)
  const [reloadToken, setReloadToken] = useState(0);
  const reloadInstitutions = useCallback(() => setReloadToken((t) => t + 1), []);
  // Guardará la institución que estamos editando
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);

  // --- 2. NUEVOS ESTADOS PARA EL MODAL DE CONFIRMACIÓN ---
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  // Guardará la institución que queremos desactivar, restaurar o eliminar
  const [actionInstitution, setActionInstitution] = useState<Institution | null>(null);
  // Guardará qué acción estamos por confirmar
  const [actionType, setActionType] = useState<'ban' | 'restore' | 'delete' | null>(null);

  // --- Manejadores para el Modal del Mapa ---
  const onShowMap = useCallback((institution: Institution) => {
  setMapInstitution(institution);
  setIsMapModalOpen(true);
}, []);

  const handleMapModalClose = () => {
    setIsMapModalOpen(false);
    setMapInstitution(null);
  };
  
  // --- Lógica de Carga de Datos ---

  // 1. Efecto para cargar datos
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

  // 2. Función para paginación
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

  // --- Controladores de Eventos (Filtros, Paginación) ---

  const handleFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as InstitutionFilter);
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePageClick = useCallback(
    (url: string | null) => {
      if (url) {
        loadInstitutionsByUrl(url);
      }
    },
    [loadInstitutionsByUrl]
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

  // --- Lógica de Memoización (Datos Computados) ---
  const filteredInstitutions = useMemo(() => {
    return institutions.filter((institution) =>
      institution.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [institutions, searchTerm]);

  const sortedInstitutions = useMemo(() => {
    let sortableItems = [...filteredInstitutions];
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
  }, [filteredInstitutions, sortConfig]);

  // (Acciones CRUD) ---

  // MODIFICADO: Abre el modal
  const handleAddClick = useCallback(() => {
    setEditingInstitution(null);
    setModalError(null); // Limpia errores antiguos
    setIsModalOpen(true);
  }, []);
  
  // NUEVO: Cierra el modal
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setModalError(null); // Limpia errores al cerrar
    setEditingInstitution(null);
  }, []);

  // NUEVO: Lógica para guardar
 // Reemplaza tu 'handleModalSave' con esto:
  const handleModalSave = useCallback(
  async (institutionData: CreateInstitutionDTO) => {
    setIsSubmitting(true);
    setModalError(null);

    try {
      let response: any; // Declaramos para capturar el JSON del back

      if (editingInstitution) {
        // ACTUALIZAR
        response = await updateInstitution(editingInstitution.id, institutionData);
      } else {
        // CREAR
        response = await createInstitution(institutionData);
      }

      // Usamos el mensaje dinámico del back: "Institución creada con éxito"
      addToast(response.message, "success");

      setIsModalOpen(false);
      setEditingInstitution(null);
      reloadInstitutions();

    } catch (err: any) {
      console.error("Error al guardar la institución:", err);
      // El service ahora lanza el mensaje exacto de Laravel
      const errorMessage = err.message || "Ocurrió un error inesperado";
      setModalError(errorMessage);
      addToast(errorMessage, "danger");
    } finally {
      setIsSubmitting(false);
    }
  },
  [reloadInstitutions, editingInstitution, addToast]
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

    if (actionType === 'ban') {
      response = await banInstitution(actionInstitution.id);
    } else if (actionType === 'restore') {
      response = await restoreInstitution(actionInstitution.id);
    } else if (actionType === 'delete') { 
      response = await forceDeleteInstitution(actionInstitution.id);
    }

    // Validamos que tengamos respuesta para evitar el error de 'undefined' en TS
    if (response) {
      const toastType = actionType === 'ban' ? "warning" : actionType === 'delete' ? "danger" : "success";

      handleConfirmModalClose(); 
      reloadInstitutions();
      
      // Sincronización total con los mensajes de tu UnitController de PHP
      addToast(response.message, toastType);
    }

  } catch (err: any) {
    console.error("Error al procesar la acción:", err);
    const errorMessage = err.message || "Ocurrió un error al procesar la solicitud";
    setModalError(errorMessage);
    addToast(errorMessage, "danger");
  } finally {
    setIsSubmitting(false);
  }
}, [actionInstitution, actionType, reloadInstitutions, handleConfirmModalClose, addToast]);

// --- Modificación en useUnits.ts ---

const onView = useCallback(async (unit: Institution) => {
  // Usamos el nuevo estado, así la tabla no se entera de que estamos cargando
  setIsViewLoading(true); 
  
  try {
    const unitData = await getInstitution(unit.id);
    setViewingInstitution(unitData);
    setIsViewModalOpen(true);
  } catch (err) {
    console.error("Error al obtener detalle de la unidad:", err);
    const errorMessage = (err as Error).message || "No se pudo cargar el detalle.";
    addToast(errorMessage, "danger");
  } finally {
    setIsViewLoading(false); // Apagamos la carga del modal
  }
}, [addToast]);

  const onEdit = useCallback((institution: Institution) => {
    setEditingInstitution(institution); // <--- Guarda la institución a editar
    setModalError(null);
    setIsModalOpen(true); // <--- Abre el modal
  }, []);

  const onBan = useCallback((institution: Institution) => {
    setActionInstitution(institution);
    setActionType('ban');
    setIsConfirmModalOpen(true); // Abre el modal de confirmación
    setModalError(null);
  }, []);

  const onRestore = useCallback((institution: Institution) => {
    setActionInstitution(institution);
    setActionType('restore');
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

  const onDelete = useCallback((institution: Institution) => {
  setActionInstitution(institution);
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
    sortedInstitutions,
    meta,
    links,
    
    // Estado de filtros
    filter,
    searchTerm,

    isConfirmModalOpen,
    actionInstitution,
    actionType,
    
    // --- NUEVO: Estado del Modal ---
    isModalOpen,
    isSubmitting,
    modalError,
    editingInstitution,
    isViewModalOpen,
    viewingInstitution,
    isMapModalOpen,
    mapInstitution,

    // Controladores (Filtros, Paginación)
    handleFilterChange,
    handleSearchChange,
    handleSort,
    handlePageClick,

    // Controladores de acciones (CRUD)
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
  };
}