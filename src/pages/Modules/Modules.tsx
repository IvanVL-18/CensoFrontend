import { useModulesData } from "./hooks/useModulesData";
import { useModulesModals } from "./hooks/useModulesModals";
import { useModulesMutations } from "./hooks/useModulesMutations";
import { getModule } from "./Modules.service";
import { ModulesToolbar } from "./components/ModulesToolbar";
import { ModulesTable } from "./components/ModulesTable";
import Pagination from "../../components/Pagination";
import { ModuleModal } from "./components/ModulesModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewModuleModal } from "./components/ViewModulesModal";
import { BulkErrorModal } from "./components/BulkErrorModal";

import { ToastProvider, useToast } from "../../context/ToastContext";
import { useAuthContext } from "../../context/AuthContext";
import { Toast } from "../../components/Toast";

function ToastContainer() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
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

function ModulesPageContent() {
  const {
    Modules,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshModules,
    handleFilterChange,
    handleSort,
    handleSearch,
    handlePageChange,
  } = useModulesData();

  const modals = useModulesModals();

  const {
    isSubmitting,
    mutationError,
    clearMutationError, 
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useModulesMutations({
    refreshModules,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const { hasPermission } = useAuthContext();

  const handleViewClick = async (partialModule: any) => {
    try {
      const fullModule = await getModule(partialModule.id);
      modals.openView(fullModule);
    } catch (error) {
      console.error("Error al cargar detalles del módulo", error);
    }
  };

  const modalTitle = modals.editingModule ? "Editar Módulo" : "Agregar Módulo";
  const modalInitialName = modals.editingModule?.name || "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Módulo";
    confirmMessage = `¿Estás seguro de que quieres desactivar el módulo "${modals.actionModule?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Módulo";
    confirmMessage = `¿Estás seguro de que quieres restaurar el módulo "${modals.actionModule?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el módulo "${modals.actionModule?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      <ModulesToolbar
        filter={filter}
        searchTerm={searchTerm}
        isSubmitting={isSubmitting}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearch}
        onAddClick={() => {
          clearMutationError();
          modals.openCreate();
        }}
        onBulkUpload={handleBulkUpload}
        canCreate={hasPermission("modules.create")}
      />

      <div className="p-4">
        <ModulesTable
          loading={loading}
          error={error}
          Modules={Modules}
          meta={meta}
          onSort={handleSort}
          onView={handleViewClick}
          onEdit={hasPermission("modules.edit") ? (u) => {
            clearMutationError();
            modals.openEdit(u);
          } : undefined}
          onBan={hasPermission("modules.deactivate") ? (u) => {
            clearMutationError();
            modals.openConfirm(u, "ban");
          } : undefined}
          onRestore={hasPermission("modules.restore") ? (u) => {
            clearMutationError();
            modals.openConfirm(u, "restore");
          } : undefined}
          onDelete={hasPermission("modules.delete") ? (u) => {
            clearMutationError();
            modals.openConfirm(u, "delete");
          } : undefined}
        />

        <div className="border-t border-gray-200 bg-gray-50">
          <Pagination meta={meta} links={links} onPageClick={handlePageChange} />
        </div>
      </div>

      <ModuleModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialName={modalInitialName}
        onClose={() => {
          clearMutationError();
          modals.closeForm();
        }}
        onSave={(name) => handleSave(name, modals.editingModule)}
        onClearServerError={clearMutationError}
      />

      <ConfirmModal
        isOpen={modals.isConfirmOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={confirmTitle}
        message={confirmMessage}
        confirmButtonText={confirmButtonText}
        confirmButtonColor={confirmButtonColor}
        onClose={() => {
          clearMutationError();
          modals.closeConfirm();
        }}
        onConfirm={() => handleConfirmAction(modals.actionModule, modals.actionType)}
      />

      <ViewModuleModal
        isOpen={modals.isViewOpen}
        Module={modals.viewingModule}
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

export default function Modules() {
  return (
    <ToastProvider>
      <ModulesPageContent />
    </ToastProvider>
  );
}
