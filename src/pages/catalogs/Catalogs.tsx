import { useState, useEffect } from "react";
import { useCatalogsData } from "./hooks/useCatalogsData";
import { useCatalogsModals } from "./hooks/useCatalogsModals";
import { useCatalogsMutations } from "./hooks/useCatalogsMutations";
import { getCatalog, getModules } from "./Catalogs.service";
import { CatalogsToolbar } from "./components/CatalogsToolbar";
import { CatalogsTable } from "./components/CatalogsTable";
import Pagination from "../../components/Pagination";
import { CatalogModal } from "./components/CatalogsModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewCatalogModal } from "./components/ViewCatalogsModal";
import { BulkErrorModal } from "./components/BulkErrorModal";
import { ToastProvider, useToast } from "../../context/ToastContext";
import { Toast } from "../../components/Toast";
import type { Module } from "./Catalogs.types";

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
  const [Modules, setModules] = useState<Module[]>([]);
  const [originalActiveModules, setOriginalActiveModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);

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

  const modals = useCatalogsModals();

  useEffect(() => {
    const fetchActiveModules = async () => {
      setLoadingModules(true);
      try {
        let activeModules: Module[] = [];
        let currentPage = 1;
        let lastPage = 1;

        do {
          const response = await getModules('active', '', currentPage);
          const responseData = response.data || response;
          const pageModules = Array.isArray(responseData)
            ? responseData
            : responseData?.data && Array.isArray(responseData.data)
            ? responseData.data
            : [];

          activeModules = [...activeModules, ...pageModules];

          const newLastPage =
            response.meta?.last_page ??
            responseData?.last_page ??
            responseData?.meta?.last_page;

          if (newLastPage) {
            lastPage = newLastPage;
          } else {
            break;
          }

          currentPage++;
        } while (currentPage <= lastPage);

        setModules(activeModules);
        setOriginalActiveModules(activeModules); 
      } catch (error) {
        console.error("Error al cargar Modulos:", error);
        setModules([]);
        setOriginalActiveModules([]);
      } finally {
        setLoadingModules(false);
      }
    };

    fetchActiveModules();
  }, []);

  useEffect(() => {
    const editingCat = modals.editingCatalog;
    if (editingCat?.module_id) {
      const currentModuleId = String(editingCat.module_id).trim();
      const exists = originalActiveModules.some(u => String(u.id).trim() === currentModuleId);
      if (!exists) {
        setModules([
          ...originalActiveModules,
          {
            id: currentModuleId,
            name: editingCat.module_name || 'Modulo desconocida',
          }
        ]);
      } else {
        setModules(originalActiveModules);
      }
    } else {
      setModules(originalActiveModules);
    }
  }, [modals.editingCatalog, originalActiveModules]);

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
    initialModuleId: modals.editingCatalog?.module_id || "",
    initialModuleName: modals.editingCatalog?.module_name || modals.editingCatalog?.Module?.name || "",
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
        isSubmitting={isSubmitting || loadingModules}
        error={mutationError}
        title={modalConfig.title}
        initialName={modalConfig.initialName}
        initialSlug={modalConfig.initialSlug}
        initialModuleId={modalConfig.initialModuleId}
        initialModuleName={modalConfig.initialModuleName}
        Modules={Modules}
        onClose={modals.closeForm}
        onSave={(name, slug, ModuleId) =>
          handleSave(name, slug, ModuleId, modals.editingCatalog)
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