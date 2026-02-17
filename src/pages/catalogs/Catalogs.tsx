import { useState, useEffect } from "react";
import { useCatalogsData } from "./hooks/useCatalogsData";
import { useCatalogsModals } from "./hooks/useCatalogsModals";
import { useCatalogsMutations } from "./hooks/useCatalogsMutations";
import { getCatalog, getUnits } from "./Catalogs.service";
import { CatalogsToolbar } from "./components/CatalogsToolbar";
import { CatalogsTable } from "./components/CatalogsTable";
import Pagination from "../../components/Pagination";
import { CatalogModal } from "./components/CatalogsModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewCatalogModal } from "./components/ViewCatalogsModal";
import { BulkErrorModal } from "./components/BulkErrorModal";
import { ToastProvider, useToast } from "../../context/ToastContext";
import { Toast } from "../../components/Toast";
import type { Unit } from "./Catalogs.types";

function ToastContainer() {
  const { toasts, removeToast } = useToast();
  
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

const confirmConfig = {
  ban: {
    title: "Desactivar catálogo",
    buttonText: "Desactivar",
    color: "danger" as const,
    getMessage: (name: string) => `¿Estás seguro de que quieres desactivar el catálogo "${name}"?`,
  },
  restore: {
    title: "Restaurar catálogo",
    buttonText: "Restaurar",
    color: "primary" as const,
    getMessage: (name: string) => `¿Estás seguro de que quieres restaurar el catálogo "${name}"?`,
  },
  delete: {
    title: "Eliminar Permanentemente",
    buttonText: "Eliminar",
    color: "danger" as const,
    getMessage: (name: string) => 
      `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el catálogo "${name}"? Esta acción no se puede deshacer.`,
  },
};

function CatalogsPageContent() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const {
    Catalogs,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshCatalogs,
    handleFilterChange,
    handleSort,
    handleSearch,
    handlePageChange,
  } = useCatalogsData();

  useEffect(() => {
    const fetchUnits = async () => {
      setLoadingUnits(true);
      try {
        const response = await getUnits();
        const unitsData = response.data || response;
        
        setUnits(
          Array.isArray(unitsData) 
            ? unitsData 
            : unitsData?.data && Array.isArray(unitsData.data) 
              ? unitsData.data 
              : []
        );
      } catch (error) {
        console.error("Error al cargar unidades:", error);
        setUnits([]);
      } finally {
        setLoadingUnits(false);
      }
    };
    
    fetchUnits();
  }, []);

  const modals = useCatalogsModals();

  const {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useCatalogsMutations({
    refreshCatalogs,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const handleViewClick = async (partialCatalog: any) => {
    try {
      const fullCatalog = await getCatalog(partialCatalog.id);
      modals.openView(fullCatalog);
    } catch (error) {
      console.error("Error al cargar detalles del catálogo", error);
    }
  };

  const modalConfig = {
    title: modals.editingCatalog ? "Editar catálogo" : "Agregar catálogo",
    initialName: modals.editingCatalog?.name || "",
    initialSlug: modals.editingCatalog?.slug || "",
    initialUnitId: modals.editingCatalog?.unit_id?.toString() || "",
  };

  const confirmModal = modals.actionType && modals.actionCatalog
    ? confirmConfig[modals.actionType]
    : null;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      <CatalogsToolbar
        filter={filter}
        searchTerm={searchTerm}
        isSubmitting={isSubmitting}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearch}
        onAddClick={modals.openCreate}
        onBulkUpload={handleBulkUpload}
      />

      <div className="p-4">
        <CatalogsTable
          loading={loading}
          error={error}
          Catalogs={Catalogs}
          meta={meta}
          onSort={handleSort}
          onView={handleViewClick}
          onEdit={modals.openEdit}
          onBan={c => modals.openConfirm(c, "ban")}
          onRestore={c => modals.openConfirm(c, "restore")}
          onDelete={c => modals.openConfirm(c, "delete")}
        />

        <div className="border-t border-gray-200 bg-gray-50">
          <Pagination
            meta={meta}
            links={links}
            onPageClick={handlePageChange}
          />
        </div>
      </div>

      <CatalogModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting || loadingUnits}
        error={mutationError}
        title={modalConfig.title}
        initialName={modalConfig.initialName}
        initialSlug={modalConfig.initialSlug}
        initialUnitId={modalConfig.initialUnitId}
        units={units}
        onClose={modals.closeForm}
        onSave={(name, slug, unitId) => 
          handleSave(name, slug, unitId, modals.editingCatalog)
        }
      />

      {confirmModal && (
        <ConfirmModal
          isOpen={modals.isConfirmOpen}
          isSubmitting={isSubmitting}
          error={mutationError}
          title={confirmModal.title}
          message={confirmModal.getMessage(modals.actionCatalog?.name || "")}
          confirmButtonText={confirmModal.buttonText}
          confirmButtonColor={confirmModal.color}
          onClose={modals.closeConfirm}
          onConfirm={() => handleConfirmAction(modals.actionCatalog, modals.actionType)}
        />
      )}

      <ViewCatalogModal
        isOpen={modals.isViewOpen}
        Catalog={modals.viewingCatalog}
        onClose={modals.closeView}
      />

      <BulkErrorModal
        isOpen={modals.isBulkErrorOpen}
        errors={modals.bulkErrors}
        onClose={modals.closeBulkError}
      />
    </div>
  );
}

export default function Catalogs() {
  return (
    <ToastProvider>
      <CatalogsPageContent />
    </ToastProvider>
  );
}