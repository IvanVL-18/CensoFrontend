import { useDependenciesData } from "./hooks/useDependenciesData";
import { useDependenciesModals } from "./hooks/useDependenciesModals";
import { useDependenciesMutations } from "./hooks/useDependenciesMutations";
import { getDependency } from "./Dependencies.service";
import { DependenciesToolbar } from "./components/DependenciesToolbar";
import { DependenciesTable } from "./components/DependenciesTable";
import Pagination from "../../components/Pagination";
import { DependencyModal } from "./components/DependenciesModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewDependencyModal } from "./components/ViewDependenciesModal";
import { BulkErrorModal } from "./components/BulkErrorModal";

import { ToastProvider, useToast } from "../../context/ToastContext";
import { Toast } from "../../components/Toast";

function ToastContainer() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
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

function DependenciesPageContent() {
  const {
    Dependencies,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshDependencies,
    handleFilterChange,
    handleSort,
    handleSearch,
    handlePageChange,
  } = useDependenciesData();

  const modals = useDependenciesModals();

  const {
    isSubmitting,
    mutationError,
    clearMutationError, 
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useDependenciesMutations({
    refreshDependencies,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const handleViewClick = async (partialDependency: any) => {
    try {
      const fullDependency = await getDependency(partialDependency.id);
      modals.openView(fullDependency);
    } catch (error) {
      console.error("Error al cargar detalles del Dependencia", error);
    }
  };

  const modalTitle = modals.editingDependency ? "Editar Dependencia" : "Agregar Dependencia";
  const modalInitialName = modals.editingDependency?.name || "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Dependencia";
    confirmMessage = `¿Estás seguro de que quieres desactivar el Dependencia "${modals.actionDependency?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Dependencia";
    confirmMessage = `¿Estás seguro de que quieres restaurar el Dependencia "${modals.actionDependency?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el Dependencia "${modals.actionDependency?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      <DependenciesToolbar
        filter={filter}
        searchTerm={searchTerm}
        isSubmitting={isSubmitting}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearch}
        onAddClick={() => {
          clearMutationError(); // ✅
          modals.openCreate();
        }}
        onBulkUpload={handleBulkUpload}
      />

      <div className="p-4">
        <DependenciesTable
          loading={loading}
          error={error}
          Dependencies={Dependencies}
          meta={meta}
          onSort={handleSort}
          onView={handleViewClick}
          onEdit={(a) => {
            clearMutationError(); 
            modals.openEdit(a);
          }}
          onBan={(a) => {
            clearMutationError(); 
            modals.openConfirm(a, "ban");
          }}
          onRestore={(a) => {
            clearMutationError(); 
            modals.openConfirm(a, "restore");
          }}
          onDelete={(a) => {
            clearMutationError();
            modals.openConfirm(a, "delete");
          }}
        />

        <div className="border-t border-gray-200 bg-gray-50">
          <Pagination meta={meta} links={links} onPageClick={handlePageChange} />
        </div>
      </div>

      <DependencyModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialName={modalInitialName}
        onClose={() => {
          clearMutationError(); 
          modals.closeForm();
        }}
        onSave={(name) => handleSave(name, modals.editingDependency)}
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
        onConfirm={() => handleConfirmAction(modals.actionDependency, modals.actionType)}
      />

      <ViewDependencyModal
        isOpen={modals.isViewOpen}
        Dependency={modals.viewingDependency}
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

export default function Dependencies() {
  return (
    <ToastProvider>
      <DependenciesPageContent />
    </ToastProvider>
  );
}
