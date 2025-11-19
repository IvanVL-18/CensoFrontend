import { useState, useEffect, useMemo, useCallback, type ChangeEvent } from "react";
import { getOccupations, createOccupation, updateOccupation,banOccupation, restoreOccupation,forceDeleteOccupation, type OccupationFilter, getInstitutions } from "./Occupations.service";
import { useToast } from "../../context/ToastContext"; // <--- 1. IMPORTAR

import type {
  Occupation,
  PaginatedOccupationsResponse,
  Meta,
  CreateOccupationDTO,
  UpdateOccupationDTO,
  Institution,
} from "./Occupations.interfaces";

type SortConfig = {
  key: keyof Occupation | 'institution_name';
  direction: "ascending" | "descending";
};

export function useOccupations() {
  // --- Estados de datos ---
  const { addToast } = useToast(); 

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
    setLoading(true); // Inicia la carga para las ocupaciones
    getOccupations(filter, sortConfig)
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
  }, [filter, reloadToken, sortConfig]);

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
    return occupations
      .filter((occupation) =>
        occupation.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [occupations, searchTerm]);

  // El backend ahora se encarga de ordenar, por lo que solo necesitamos filtrar.
  const sortedOccupations = useMemo(() => {
    // La API ya devuelve los datos ordenados, solo aplicamos el filtro de búsqueda local.
    return filteredOccupations;
  }, [filteredOccupations]);

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

  // NUEVO: Lógica para guardar
 // Reemplaza tu 'handleModalSave' con esto:
  const handleModalSave = useCallback(
    async (name: string, institution_id: string) => {
      setIsSubmitting(true);
      setModalError(null);

      try {
        if (editingOccupation) {
          // --- LÓGICA DE ACTUALIZAR ---
          // (Asumiendo que tu DTO es solo { name })
          const occupationData: UpdateOccupationDTO = { name, institution_id }; 
          await updateOccupation(editingOccupation.id, occupationData);
          addToast("Ocupación actualizada con éxito.", "success");

        } else {
          // --- LÓGICA DE CREAR (la que ya tenías) ---
          const occupationData: CreateOccupationDTO = {  name, institution_id };
          await createOccupation(occupationData);
          addToast("Ocupación creada con éxito.", "success");
        }

        // ¡Éxito!
        setIsModalOpen(false); // Cierra el modal
        setEditingOccupation(null);  // Limpia el estado de edición
        reloadOccupations();         // Dispara la recarga de datos

      } catch (err) {
        console.error("Error al guardar la ocupación:", err);
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          setModalError("Error de conexión: No se pudo conectar con el servidor. Verifica que el backend esté funcionando y la URL de la API sea correcta.");
        } else {
          setModalError((err as Error).message || "Ocurrió un error desconocido al guardar.");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadOccupations, editingOccupation,addToast] 
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
      let successMessage = "";
      let toastType: "success" | "danger" | "warning" = "success";

      if (actionType === 'ban') {
        await banOccupation(actionOccupation.id);
        successMessage = `Ocupación "${actionOccupation.name}" desactivada.`;
        toastType = "warning"; // Usamos 'warning' (naranja) para desactivar

      } else if (actionType === 'restore') {
        await restoreOccupation(actionOccupation.id);
        successMessage = `Ocupación "${actionOccupation.name}" restaurada.`;
        toastType = "success";

      } else if (actionType === 'delete') { 
        await forceDeleteOccupation(actionOccupation.id);
        successMessage = `Ocupación "${actionOccupation.name}" eliminada permanentemente.`;
        toastType = "danger";
      }

      // ¡Éxito!
      handleConfirmModalClose(); 
      reloadOccupations();
      addToast(successMessage, toastType); // <--- 3. AÑADIR TOAST

    } catch (err) {
      console.error("Error al procesar la acción:", err);
      const errorMessage = (err as Error).message || "Ocurrió un error";
      setModalError(errorMessage);
      addToast(`Error: ${errorMessage}`, "danger"); // <--- 3. AÑADIR TOAST DE ERROR
    } finally {
      setIsSubmitting(false);
    }
  }, [actionOccupation, actionType, reloadOccupations, handleConfirmModalClose, addToast]); // <--- 4. AÑADIR 'addToast'
  

 const onView = useCallback((occupation: Occupation) => {
    setViewingOccupation(occupation);
    setIsViewModalOpen(true);
  }, []);

  const onEdit = useCallback((occupationFromTable: Occupation) => {
    // El objeto 'occupationFromTable' viene de la tabla y probablemente no tiene 'institution_id'.
    // Lo vamos a encontrar usando el 'institution_name'.
    const foundInstitution = institutions.find(
      (inst) => inst.name === occupationFromTable.institution_name
    );

    // Creamos un nuevo objeto para editar, asegurándonos de que tenga el institution_id.
    const occupationToEdit: Occupation = {
      ...occupationFromTable,
      institution_id: foundInstitution ? foundInstitution.id : "", // Usamos el ID encontrado o un string vacío si no se encuentra
    };

    setEditingOccupation(occupationToEdit); // Guardamos el objeto COMPLETO
    setModalError(null);
    setIsModalOpen(true);
  }, [institutions]); // Añadimos 'institutions' como dependencia para que la función tenga la lista actualizada.

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