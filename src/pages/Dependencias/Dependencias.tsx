import { useDependenciasData } from "./hooks/useDependenciasData";
import { useDependenciasModals } from "./hooks/useDependenciasModals";
import { useDependenciasMutations } from "./hooks/useDependenciasMutations";
import { getDependencia } from "./Dependencias.service";
import { DependenciasToolbar } from "./components/DependenciasToolbar";
import { DependenciasTable } from "./components/DependenciasTable";
import Pagination from "../../components/Pagination";
import { DependenciaModal } from "./components/DependenciasModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewDependenciaModal } from "./components/ViewDependenciasModal";
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

function DependenciasPageContent() {
  const {
    Dependencias,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshDependencias,
    handleFilterChange,
    handleSort,
    handleSearch,
    handlePageChange,
  } = useDependenciasData();

  const modals = useDependenciasModals();

  const {
    isSubmitting,
    mutationError,
    clearMutationError, 
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useDependenciasMutations({
    refreshDependencias,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const handleViewClick = async (partialDependencia: any) => {
    try {
      const fullDependencia = await getDependencia(partialDependencia.id);
      modals.openView(fullDependencia);
    } catch (error) {
      console.error("Error al cargar detalles del Dependencia", error);
    }
  };

  const modalTitle = modals.editingDependencia ? "Editar Dependencia" : "Agregar Dependencia";
  const modalInitialName = modals.editingDependencia?.name || "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Dependencia";
    confirmMessage = `¿Estás seguro de que quieres desactivar Dependencia "${modals.actionDependencia?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Dependencia";
    confirmMessage = `¿Estás seguro de que quieres restaurar la Dependencia "${modals.actionDependencia?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE la Dependencia "${modals.actionDependencia?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      <DependenciasToolbar
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
        <DependenciasTable
          loading={loading}
          error={error}
          Dependencias={Dependencias}
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

      <DependenciaModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialName={modalInitialName}
        onClose={() => {
          clearMutationError(); 
          modals.closeForm();
        }}
        onSave={(name) => handleSave(name, modals.editingDependencia)}
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
        onConfirm={() => handleConfirmAction(modals.actionDependencia, modals.actionType)}
      />

      <ViewDependenciaModal
        isOpen={modals.isViewOpen}
        Dependencia={modals.viewingDependencia}
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

export default function Dependencias() {
  return (
    <ToastProvider>
      <DependenciasPageContent />
    </ToastProvider>
  );
}
