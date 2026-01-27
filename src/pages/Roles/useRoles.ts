import { useState, useEffect, useMemo, useCallback, type ChangeEvent } from "react";
import { getroles, createrol, updaterol,banrol, restorerol,forceDeleterol, getrol, type rolFilter } from "./Rol.service";
import { useToast } from "../../context/ToastContext"; // <--- 1. IMPORTAR

import type {
  rol,
  PaginatedrolesResponse,
  Meta,
} from "./Rol.interfaces";

type SortConfig = {
  key: keyof rol;
  direction: "ascending" | "descending";
};

export function useroles() {
  // --- Estados de datos ---
  const { addToast } = useToast(); 
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [roles, setroles] = useState<rol[]>([]);
  const [links, setLinks] = useState<PaginatedrolesResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Estados de filtros y orden ---
  const [filter, setFilter] = useState<rolFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "ascending",
    
  });

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingrol, setViewingrol] = useState<rol | null>(null);
  
  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewingrol(null);
  }, []);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  // (Esto nos permite recargar la lista después de crear un item)
  const [reloadToken, setReloadToken] = useState(0);
  const reloadroles = useCallback(() => setReloadToken((t) => t + 1), []);
  // Guardará la unidad que estamos editando
  const [editingrol, setEditingrol] = useState<rol | null>(null);

  // --- 2. NUEVOS ESTADOS PARA EL MODAL DE CONFIRMACIÓN ---
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  // Guardará la unidad que queremos desactivar, restaurar o eliminar
  const [actionrol, setActionrol] = useState<rol | null>(null);
  // Guardará qué acción estamos por confirmar
  const [actionType, setActionType] = useState<'ban' | 'restore' | 'delete' | null>(null);

  
  // --- Lógica de Carga de Datos ---

  // 1. Efecto para cargar datos
  useEffect(() => {
    setLoading(true);
    getroles(filter)
      .then((response) => {
        setroles(response.data);
        setLinks(response.links);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(`Error al cargar los Rols: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filter, reloadToken]); 

  // 2. Función para paginación
  const loadrolesByUrl = useCallback((url: string) => {
    setLoading(true);
    fetch(url)
      .then((res) => res.json() as Promise<PaginatedrolesResponse>)
      .then((response) => {
        setroles(response.data);
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
    setFilter(e.target.value as rolFilter);
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePageClick = useCallback(
    (url: string | null) => {
      if (url) {
        loadrolesByUrl(url);
      }
    },
    [loadrolesByUrl]
  );

  const handleSort = useCallback((key: keyof rol) => {
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
  const filteredroles = useMemo(() => {
    return roles.filter((rol) =>
      rol.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roles, searchTerm]);

  const sortedroles = useMemo(() => {
    let sortableItems = [...filteredroles];
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
  }, [filteredroles, sortConfig]);

  // (Acciones CRUD) ---

  // MODIFICADO: Abre el modal
  const handleAddClick = useCallback(() => {
    setEditingrol(null);
    setModalError(null); // Limpia errores antiguos
    setIsModalOpen(true);
  }, []);
  
  // NUEVO: Cierra el modal
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setModalError(null); // Limpia errores al cerrar
    setEditingrol(null);
  }, []);

  // NUEVO: Lógica para guardar
 // Reemplaza tu 'handleModalSave' con esto:
  const handleModalSave = useCallback(
  async (name: string) => {
    setIsSubmitting(true);
    setModalError(null);

    try {
      let response: any;
      const rolData = { name };

      if (editingrol) {
        response = await updaterol(editingrol.id, rolData);
      } else {
        response = await createrol(rolData);
      }

      // Usamos el mensaje del back: "Unidad creada con exito" o "Unidad actualizada con éxito."
      addToast(response.message, "success");

      setIsModalOpen(false);
      setEditingrol(null);
      reloadroles();

    } catch (err: any) {
      setModalError(err.message || "Ocurrió un error");
      addToast(err.message, "danger");
    } finally {
      setIsSubmitting(false);
    }
  },
  [reloadroles, editingrol, addToast]
);

// --- 1. AGREGA ESTA FUNCIÓN (que se había borrado) ---
const handleConfirmModalClose = useCallback(() => {
  setIsConfirmModalOpen(false);
  setActionrol(null);
  setActionType(null);
  setModalError(null); 
}, []);

// --- 2. MODAL DE ACCIÓN (Corregido para TS) ---
const handleConfirmAction = useCallback(async () => {
  if (!actionrol || !actionType) return;
  setIsSubmitting(true);

  try {
    let response: any; // <--- Le damos un tipo para que TS no se queje

    if (actionType === 'ban') {
      response = await banrol(actionrol.id);
    } else if (actionType === 'restore') {
      response = await restorerol(actionrol.id);
    } else if (actionType === 'delete') {
      response = await forceDeleterol(actionrol.id);
    }

    // Verificamos que response exista antes de usarlo (soluciona el error de 'undefined')
    if (response) {
      const toastType = actionType === 'ban' ? "warning" : actionType === 'delete' ? "danger" : "success";

      handleConfirmModalClose();
      reloadroles();
      
      // Ahora sí, tomamos el mensaje que viene del rolController.php
      addToast(response.message, toastType); 
    }

  } catch (err: any) {
    // Si el backend lanza el error 400, handleJsonResponse captura el message y lo lanza aquí
    addToast(err.message || "Error al procesar la acción", "danger");
  } finally {
    setIsSubmitting(false);
  }
}, [actionrol, actionType, reloadroles, handleConfirmModalClose, addToast]);

const onView = useCallback(async (rol: rol) => {
  // Usamos el nuevo estado, así la tabla no se entera de que estamos cargando
  setIsViewLoading(true); 
  
  try {
    const rolData = await getrol(rol.id);
    setViewingrol(rolData);
    setIsViewModalOpen(true);
  } catch (err) {
    console.error("Error al obtener detalle de la unidad:", err);
    const errorMessage = (err as Error).message || "No se pudo cargar el detalle.";
    addToast(errorMessage, "danger");
  } finally {
    setIsViewLoading(false); // Apagamos la carga del modal
  }
}, [addToast]);

  const onEdit = useCallback((rol: rol) => {
    setEditingrol(rol); // <--- Guarda la unidad a editar
    setModalError(null);
    setIsModalOpen(true); // <--- Abre el modal
  }, []);

  const onBan = useCallback((rol: rol) => {
    setActionrol(rol);
    setActionType('ban');
    setIsConfirmModalOpen(true); // Abre el modal de confirmación
    setModalError(null);
  }, []);

  const onRestore = useCallback((rol: rol) => {
    setActionrol(rol);
    setActionType('restore');
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

  const onDelete = useCallback((rol: rol) => {
  setActionrol(rol);
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
    sortedroles,
    meta,
    links,
    
    // Estado de filtros
    filter,
    searchTerm,

    isConfirmModalOpen,
    actionrol,
    actionType,
    
    // --- NUEVO: Estado del Modal ---
    isModalOpen,
    isSubmitting,
    modalError,
    editingrol,
    isViewModalOpen,
    viewingrol,

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