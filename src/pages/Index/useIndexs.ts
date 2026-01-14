import { useState, useEffect, useMemo, useCallback, type ChangeEvent } from "react";
import { getIndexs, getSingleIndex, createIndex, updateIndex,banIndex, restoreIndex,forceDeleteIndex, type IndexFilter } from "./indexs.service";
import { useToast } from "../../context/ToastContext"; // <--- 1. IMPORTAR

import type {
  Index,
  PaginatedIndexsResponse,
  Meta,
  CreateIndexDTO,
  UpdateIndexDTO,
} from "./indexs.interfaces";

type SortConfig = {
  key: keyof Index;
  direction: "ascending" | "descending";
};

export function useIndexs() {
  
  const { addToast } = useToast(); 

  const [indexs, setIndexs] = useState<Index[]>([]);
  const [links, setLinks] = useState<PaginatedIndexsResponse["links"] | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 
  const [filter, setFilter] = useState<IndexFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "name",
    direction: "ascending",
    
  });

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingIndex, setViewingIndex] = useState<Index | null>(null);
  
  const handleViewModalClose = useCallback(() => {
    setIsViewModalOpen(false);
    setViewingIndex(null);
  }, []);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  
  const [reloadToken, setReloadToken] = useState(0);
  const reloadIndexs = useCallback(() => setReloadToken((t) => t + 1), []);

  const [editingIndex, setEditingIndex] = useState<Index | null>(null);
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  // Guardará la unidad que queremos desactivar, restaurar o eliminar
  const [actionIndex, setActionIndex] = useState<Index | null>(null);

  const [actionType, setActionType] = useState<'ban' | 'restore' | 'delete' | null>(null);

  


  // 1. Efecto para cargar datos
  useEffect(() => {
    setLoading(true);
    getIndexs(filter)
      .then((response) => {
        setIndexs(response.data);
        setLinks(response.links);
        setMeta(response.meta);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(`Error al cargar los Indices: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filter, reloadToken]); 

  // 2. Función para paginación
  const loadIndexsByUrl = useCallback((url: string) => {
    setLoading(true);
    fetch(url)
      .then((res) => res.json() as Promise<PaginatedIndexsResponse>)
      .then((response) => {
        setIndexs(response.data);
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

  

  const handleFilterChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value as IndexFilter);
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handlePageClick = useCallback(
    (url: string | null) => {
      if (url) {
        loadIndexsByUrl(url);
      }
    },
    [loadIndexsByUrl]
  );

  const handleSort = useCallback((key: keyof Index) => {
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


  const filteredIndexs = useMemo(() => {
    return indexs.filter((index) =>
      index.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [indexs, searchTerm]);

  const sortedIndexs = useMemo(() => {
    let sortableItems = [...filteredIndexs];
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
  }, [filteredIndexs, sortConfig]);

  

  
  const handleAddClick = useCallback(() => {
    setEditingIndex(null);
    setModalError(null); 
    setIsModalOpen(true);
  }, []);
  
  
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setModalError(null); 
    setEditingIndex(null);
  }, []);


  const handleModalSave = useCallback(
    async (name: string) => {
      setIsSubmitting(true);
      setModalError(null);

      try {
        if (editingIndex) {
         
          const indexData: UpdateIndexDTO = { name }; 
          await updateIndex(editingIndex.id, indexData);
          addToast("Indice actualizado con éxito.", "success");

        } else {
         
          const indexData: CreateIndexDTO = { name };
          await createIndex(indexData);
          addToast("Indice creado con éxito.", "success");
        }

       
        setIsModalOpen(false);
        setEditingIndex(null);  
        reloadIndexs();         

      } catch (err) {
        console.error("Error al guardar la unidad:", err);
        setModalError((err as Error).message || "Ocurrió un error");
      } finally {
        setIsSubmitting(false);
      }
    },
    [reloadIndexs, editingIndex,addToast] 
  );

  const handleConfirmModalClose = useCallback(() => {
    setIsConfirmModalOpen(false);
    setActionIndex(null);
    setActionType(null);
    setModalError(null); 
  }, []);

const handleConfirmAction = useCallback(async () => {
    if (!actionIndex || !actionType) return;

    setIsSubmitting(true);
    setModalError(null);

    try {
      let successMessage = "";
      let toastType: "success" | "danger" | "warning" = "success";

      if (actionType === 'ban') {
        await banIndex(actionIndex.id);
        successMessage = `Indice "${actionIndex.name}" desactivado.`;
        toastType = "warning"; 

      } else if (actionType === 'restore') {
        await restoreIndex(actionIndex.id);
        successMessage = `Indice "${actionIndex.name}" restaurado.`;
        toastType = "success";

      } else if (actionType === 'delete') { 
        await forceDeleteIndex(actionIndex.id);
        successMessage = `Indice "${actionIndex.name}" eliminado permanentemente.`;
        toastType = "danger";
      }

     
      handleConfirmModalClose(); 
      reloadIndexs();
      addToast(successMessage, toastType); 

    } catch (err) {
      console.error("Error al procesar la acción:", err);
      const errorMessage = (err as Error).message || "Ocurrió un error";
      setModalError(errorMessage);
      addToast(`Error: ${errorMessage}`, "danger"); 
    } finally {
      setIsSubmitting(false);
    }
  }, [actionIndex, actionType, reloadIndexs, handleConfirmModalClose, addToast]); 
  

 const onView = useCallback(async (index: Index) => {
    try {
      
      const fullIndexData = await getSingleIndex(index.id);
     
      setViewingIndex(fullIndexData);
     
      setIsViewModalOpen(true);
    } catch (err) {
      addToast("Error al cargar los detalles del índice.", "danger");
    }
  }, [addToast]);

  const onEdit = useCallback((index: Index) => {
    setEditingIndex(index); 
    setModalError(null);
    setIsModalOpen(true); 
  }, []);

  const onBan = useCallback((index: Index) => {
    setActionIndex(index);
    setActionType('ban');
    setIsConfirmModalOpen(true); 
    setModalError(null);
  }, []);

  const onRestore = useCallback((index: Index) => {
    setActionIndex(index);
    setActionType('restore');
    setIsConfirmModalOpen(true);
    setModalError(null);
  }, []);

  const onDelete = useCallback((index: Index) => {
  setActionIndex(index);
  setActionType('delete'); 
  setIsConfirmModalOpen(true);
  setModalError(null);
}, []);

  


  return {
    
    loading,
    error,
    
    
    sortedIndexs,
    meta,
    links,
    
   
    filter,
    searchTerm,

    isConfirmModalOpen,
    actionIndex,
    actionType,
    
    
    isModalOpen,
    isSubmitting,
    modalError,
    editingIndex,
    isViewModalOpen,
    viewingIndex,

    
    handleFilterChange,
    handleSearchChange,
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
    handleViewModalClose
  };
}