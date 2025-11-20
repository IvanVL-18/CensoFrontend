import { useState, useEffect, useMemo, useCallback, type ChangeEvent } from "react";
import { getSections, createSection, updateSection,banSection, restoreSection,forceDeleteSection, type SectionFilter } from "./Section.service";
import { useToast } from "../../context/ToastContext"; // <--- 1. IMPORTAR

import type {
  Section,
  PaginatedSectionsResponse,
  Meta,
  CreateSectionDTO,
  UpdateSectionDTO,
} from "./Section.interfaces";

type SortConfig = {
  key: keyof Section;
  direction: "ascending" | "descending";
};

export function useSections() {
  // --- Estados de datos ---
  const { addToast } = useToast(); 

  const [Sections, setSections] = useState<Section[]>([]);
  const [links, setLinks] = useState<PaginatedSectionsResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Estados de filtros y orden ---
  const [filter, setFilter] = useState<SectionFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "ascending",
    
  });

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingSection, setViewingSection] = useState<Section | null>(null);
  
  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewingSection(null);
  }, []);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  // (Esto nos permite recargar la lista después de crear un item)
  const [reloadToken, setReloadToken] = useState(0);
  const reloadSections = useCallback(() => setReloadToken((t) => t + 1), []);
  // Guardará la unidad que estamos editando
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  // --- 2. NUEVOS ESTADOS PARA EL MODAL DE CONFIRMACIÓN ---
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  // Guardará la unidad que queremos desactivar, restaurar o eliminar
  const [actionSection, setActionSection] = useState<Section | null>(null);
  // Guardará qué acción estamos por confirmar
  const [actionType, setActionType] = useState<'ban' | 'restore' | 'delete' | null>(null);

  
  // --- Lógica de Carga de Datos ---

  // 1. Efecto para cargar datos
  useEffect(() => {
    setLoading(true);
    getSections(filter)
      .then((response) => {
        setSections(response.data);
        setLinks(response.links);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(`Error al cargar los Secciones: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filter, reloadToken]); 

  // 2. Función para paginación
  const loadSectionsByUrl = useCallback((url: string) => {
    setLoading(true);
    fetch(url)
      .then((res) => res.json() as Promise<PaginatedSectionsResponse>)
      .then((response) => {
        setSections(response.data);
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
    setFilter(e.target.value as SectionFilter);
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePageClick = useCallback(
    (url: string | null) => {
      if (url) {
        loadSectionsByUrl(url);
      }
    },
    [loadSectionsByUrl]
  );

  const handleSort = useCallback((key: keyof Section) => {
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
  const filteredSections = useMemo(() => {
    return Sections.filter((Section) =>
      Section.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [Sections, searchTerm]);

  const sortedSections = useMemo(() => {
    let sortableItems = [...filteredSections];
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
  }, [filteredSections, sortConfig]);

  // (Acciones CRUD) ---

  // MODIFICADO: Abre el modal
  const handleAddClick = useCallback(() => {
    setEditingSection(null);
    setModalError(null); // Limpia errores antiguos
    setIsModalOpen(true);
  }, []);
  
  // NUEVO: Cierra el modal
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setModalError(null); // Limpia errores al cerrar
    setEditingSection(null);
  }, []);

  // NUEVO: Lógica para guardar
 // Reemplaza tu 'handleModalSave' con esto:
  const handleModalSave = useCallback(
  async (data: { name: string; instructions: string | null }) => { // <--- RECIBE OBJETO
    setIsSubmitting(true);
    setModalError(null);

    try {
      // Preparamos el DTO
      const sectionData: CreateSectionDTO = {
        name: data.name,
        instructions: data.instructions || null, // Si viene vacío string, mandamos null o string vacío
      };

      if (editingSection) {
        // EDITAR
        await updateSection(editingSection.id, sectionData);
        addToast("Sección actualizada con éxito.", "success");
      } else {
        // CREAR
        await createSection(sectionData);
        addToast("Sección creada con éxito.", "success");
      }

      setIsModalOpen(false);
      setEditingSection(null);
      reloadSections(); // (Recuerda renombrar reloadUnits a reloadSections si no lo hiciste)

    } catch (err) {
      console.error("Error al guardar:", err);
      setModalError((err as Error).message || "Ocurrió un error");
    } finally {
      setIsSubmitting(false);
    }
  },
  [reloadSections, editingSection, addToast]
);
  const handleConfirmModalClose = useCallback(() => {
    setIsConfirmModalOpen(false);
    setActionSection(null);
    setActionType(null);
    setModalError(null); 
  }, []);

const handleConfirmAction = useCallback(async () => {
    if (!actionSection || !actionType) return;

    setIsSubmitting(true);
    setModalError(null);

    try {
      let successMessage = "";
      let toastType: "success" | "danger" | "warning" = "success";

      if (actionType === 'ban') {
        await banSection(actionSection.id);
        successMessage = `Módulo "${actionSection.name}" desactivado.`;
        toastType = "warning"; // Usamos 'warning' (naranja) para desactivar

      } else if (actionType === 'restore') {
        await restoreSection(actionSection.id);
        successMessage = `Módulo "${actionSection.name}" restaurado.`;
        toastType = "success";

      } else if (actionType === 'delete') { 
        await forceDeleteSection(actionSection.id);
        successMessage = `Módulo "${actionSection.name}" eliminado permanentemente.`;
        toastType = "danger";
      }

      // ¡Éxito!
      handleConfirmModalClose(); 
      reloadSections();
      addToast(successMessage, toastType); // <--- 3. AÑADIR TOAST

    } catch (err) {
      console.error("Error al procesar la acción:", err);
      const errorMessage = (err as Error).message || "Ocurrió un error";
      setModalError(errorMessage);
      addToast(`Error: ${errorMessage}`, "danger"); // <--- 3. AÑADIR TOAST DE ERROR
    } finally {
      setIsSubmitting(false);
    }
  }, [actionSection, actionType, reloadSections, handleConfirmModalClose, addToast]); // <--- 4. AÑADIR 'addToast'
  

 const onView = useCallback((Section: Section) => {
    setViewingSection(Section);
    setIsViewModalOpen(true);
  }, []);

  const onEdit = useCallback((Section: Section) => {
    setEditingSection(Section); // <--- Guarda la unidad a editar
    setModalError(null);
    setIsModalOpen(true); // <--- Abre el modal
  }, []);

  const onBan = useCallback((Section: Section) => {
    setActionSection(Section);
    setActionType('ban');
    setIsConfirmModalOpen(true); // Abre el modal de confirmación
    setModalError(null);
  }, []);

  const onRestore = useCallback((Section: Section) => {
    setActionSection(Section);
    setActionType('restore');
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

  const onDelete = useCallback((Section: Section) => {
  setActionSection(Section);
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
    sortedSections,
    meta,
    links,
    
    // Estado de filtros
    filter,
    searchTerm,

    isConfirmModalOpen,
    actionSection,
    actionType,
    
    // --- NUEVO: Estado del Modal ---
    isModalOpen,
    isSubmitting,
    modalError,
    editingSection,
    isViewModalOpen,
    viewingSection,

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