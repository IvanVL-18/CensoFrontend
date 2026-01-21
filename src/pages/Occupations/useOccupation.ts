import { useState, useEffect, useMemo, useCallback, type ChangeEvent } from "react";
import { getOccupations, getOccupation, createOccupation, updateOccupation,banOccupation, restoreOccupation,forceDeleteOccupation, type OccupationFilter, getInstitutions } from "./Occupations.service";
import { useToast } from "../../context/ToastContext"; // <--- 1. IMPORTAR

import type {
  Occupation,
  PaginatedOccupationsResponse,
  Meta,
  CreateOccupationDTO,
  
  Institution,
} from "./Occupations.interfaces";

type SortConfig = {
  key: keyof Occupation | 'institution_name';
  direction: "ascending" | "descending";
};

export function useOccupations() {
  // --- Estados de datos ---
  const { addToast } = useToast(); 
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [links, setLinks] = useState<PaginatedOccupationsResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Estados de filtros y orden ---
  const [filter, setFilter] = useState<OccupationFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "ascending",
    
  });

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingOccupation, setViewingOccupation] = useState<Occupation | null>(null);
  
  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewingOccupation(null);
  }, []);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  // (Esto nos permite recargar la lista después de crear un item)
  const [reloadToken, setReloadToken] = useState(0);
  const reloadOccupations = useCallback(() => setReloadToken((t) => t + 1), []);
  // Guardará la unidad que estamos editando
  const [editingOccupation, setEditingOccupation] = useState<Occupation | null>(null);

  // --- 2. NUEVOS ESTADOS PARA EL MODAL DE CONFIRMACIÓN ---
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  // Guardará la unidad que queremos desactivar, restaurar o eliminar
  const [actionOccupation, setActionOccupation] = useState<Occupation | null>(null);
  // Guardará qué acción estamos por confirmar
  const [actionType, setActionType] = useState<'ban' | 'restore' | 'delete' | null>(null);

  
  // --- Lógica de Carga de Datos ---

  // 1. Efecto para cargar datos
  useEffect(() => {
    setLoading(true);
    // <--- CAMBIO 1: Pedimos los datos al backend UNA SOLA VEZ.
    // El ordenamiento y filtrado se harán en el cliente.
    getOccupations("all", { key: "name", direction: "ascending" }) // Pedimos una lista base ordenada por nombre
      .then((response) => {
        setOccupations(response.data);
        setLinks(response.links);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(`Error al cargar las Ocupaciones: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });

    // Carga las instituciones (generalmente solo una vez)
    getInstitutions()
      .then((response) => {
        setInstitutions(response);
        // No necesitas setError aquí a menos que quieras un estado de error separado
      })
      .catch((err) => {
        console.error(err);
        // Podrías establecer un error específico para las instituciones si lo deseas
        setError(`Error al cargar las Instituciones: ${err.message}`);
      });
    // <--- CAMBIO 2: Quitamos 'sortConfig' de las dependencias para evitar recargas.
  }, [reloadToken]);

  // 2. Función para paginación
  const loadOccupationsByUrl = useCallback((url: string) => {
    setLoading(true);
    fetch(url)
      .then((res) => res.json() as Promise<PaginatedOccupationsResponse>)
      .then((response) => {
        setOccupations(response.data);
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
    setFilter(e.target.value as OccupationFilter);
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePageClick = useCallback(
    (url: string | null) => {
      if (url) {
        loadOccupationsByUrl(url);
      }
    },
    [loadOccupationsByUrl]
  );

  const handleSort = useCallback((key: keyof Occupation | 'institution_name') => {
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
  const filteredOccupations = useMemo(() => {
    // <--- CAMBIO 3: Lógica de filtrado combinada (estado + búsqueda)
    return occupations.filter((occupation) => {
      // Primero, filtramos por estado (activo/inactivo)
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !occupation.deleted_at) ||
        (filter === "inactive" && occupation.deleted_at);

      // Luego, filtramos por el término de búsqueda
      const matchesSearch = occupation.name.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [occupations, searchTerm, filter]); // <--- CAMBIO 4: Añadimos 'filter' a las dependencias del memo

  // El backend ahora se encarga de ordenar, por lo que solo necesitamos filtrar.
  const sortedOccupations = useMemo(() => {
    // Hacemos una copia para no mutar el estado original filtrado
    const sortableOccupations = [...filteredOccupations];

    // Aplicamos el ordenamiento localmente basado en la configuración actual
    sortableOccupations.sort((a, b) => {
      const key = sortConfig.key;

      // <--- CAMBIO 1: Lógica para acceder a la propiedad anidada 'institution.name'
      const valA = (key === 'institution_name'
        ? a.institution?.name?.toLowerCase() || ''
        : (a as any)[key]?.toString().toLowerCase()) || '';

      const valB = (key === 'institution_name'
        ? b.institution?.name?.toLowerCase() || ''
        : (b as any)[key]?.toString().toLowerCase()) || '';

      if (valA < valB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (valA > valB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    return sortableOccupations;
  }, [filteredOccupations, sortConfig]);

  // (Acciones CRUD) ---

  // MODIFICADO: Abre el modal
  const handleAddClick = useCallback(() => {
    setEditingOccupation(null);
    setModalError(null); // Limpia errores antiguos
    setIsModalOpen(true);
  }, []);
  
  // NUEVO: Cierra el modal
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setModalError(null); // Limpia errores al cerrar
    setEditingOccupation(null);
  }, []);

 const handleModalSave = useCallback(
  async (name: string, institution_id: string) => {
    setIsSubmitting(true);
    setModalError(null);

    try {
      const occupationData: CreateOccupationDTO = { name, institution_id };
      let response: any; // Declaramos para capturar el JSON del back

      if (editingOccupation) {
        // ACTUALIZAR
        response = await updateOccupation(editingOccupation.id, occupationData);
      } else {
        // CREAR
        response = await createOccupation(occupationData);
      }

      // El mensaje viene directamente de tu controlador PHP
      addToast(response.message, "success");

      setIsModalOpen(false);
      setEditingOccupation(null);
      reloadOccupations();

    } catch (err: any) {
      console.error("Error al guardar la ocupación:", err);
      // El service lanza el error con el message del back (ej. "La ocupación ya existe")
      const errorMessage = err.message || "Ocurrió un error al guardar";
      setModalError(errorMessage);
      addToast(errorMessage, "danger");
    } finally {
      setIsSubmitting(false);
    }
  },
  [reloadOccupations, editingOccupation, addToast]
);

  const handleConfirmModalClose = useCallback(() => {
    setIsConfirmModalOpen(false);
    setActionOccupation(null);
    setActionType(null);
    setModalError(null); 
  }, []);

const handleConfirmAction = useCallback(async () => {
  if (!actionOccupation || !actionType) return;

  setIsSubmitting(true);
  setModalError(null);

  try {
    let response: any;

    if (actionType === 'ban') {
      response = await banOccupation(actionOccupation.id);
    } else if (actionType === 'restore') {
      response = await restoreOccupation(actionOccupation.id);
    } else if (actionType === 'delete') { 
      response = await forceDeleteOccupation(actionOccupation.id);
    }

    // Validamos que exista respuesta para evitar el error de "undefined" en TS
    if (response) {
      const toastType = actionType === 'ban' ? "warning" : actionType === 'delete' ? "danger" : "success";

      handleConfirmModalClose(); 
      reloadOccupations();
      
      // Sincronización total con Laravel
      addToast(response.message, toastType);
    }

  } catch (err: any) {
    console.error("Error al procesar la acción:", err);
    const errorMessage = err.message || "Ocurrió un error inesperado";
    setModalError(errorMessage);
    addToast(errorMessage, "danger");
  } finally {
    setIsSubmitting(false);
  }
}, [actionOccupation, actionType, reloadOccupations, handleConfirmModalClose, addToast]);
  

const onView = useCallback(async (Occupation: Occupation) => {
  // Usamos el nuevo estado, así la tabla no se entera de que estamos cargando
  setIsViewLoading(true); 
  
  try {
    const OccupationData = await getOccupation(Occupation.id);
    setViewingOccupation(OccupationData);
    setIsViewModalOpen(true);
  } catch (err) {
    console.error("Error al obtener detalle de la unidad:", err);
    const errorMessage = (err as Error).message || "No se pudo cargar el detalle.";
    addToast(errorMessage, "danger");
  } finally {
    setIsViewLoading(false); // Apagamos la carga del modal
  }
}, [addToast]);

  const onEdit = useCallback((occupation: Occupation) => {
    // <--- CAMBIO 2: Usamos la nueva estructura para obtener el ID de la institución
    const occupationToEdit: Occupation = {
      ...occupation,
      institution_id: occupation.institution?.id || "",
    };

    setEditingOccupation(occupationToEdit); // Guardamos el objeto COMPLETO
    setModalError(null);
    setIsModalOpen(true);
  }, []); // Ya no depende de 'institutions'

  const onBan = useCallback((occupation: Occupation) => {
    setActionOccupation(occupation);
    setActionType('ban');
    setIsConfirmModalOpen(true); // Abre el modal de confirmación
    setModalError(null);
  }, []);

  const onRestore = useCallback((occupation: Occupation) => {
    setActionOccupation(occupation);
    setActionType('restore');
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

  const onDelete = useCallback((occupation: Occupation) => {
  setActionOccupation(occupation);
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
    sortedOccupations,
    meta,
    links,
    
    // Estado de filtros
    filter,
    searchTerm,
    institutions,

    isConfirmModalOpen,
    actionOccupation,
    actionType,
    
    // --- NUEVO: Estado del Modal ---
    isModalOpen,
    isSubmitting,
    modalError,
    editingOccupation,
    isViewModalOpen,
    viewingOccupation,

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