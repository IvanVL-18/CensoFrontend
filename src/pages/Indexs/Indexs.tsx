import { useIndexsData } from "./hooks/useIndexsData";
import { useIndexsModals } from "./hooks/useIndexsModals";
import { useIndexsMutations } from "./hooks/useIndexsMutations";
import { getIndex } from "./Indexs.service";
import { IndexsToolbar } from "./components/IndexsToolbar";
import { IndexsTable } from "./components/IndexsTable";
import Pagination from "../../components/Pagination";
import { IndexModal } from "./components/IndexsModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewIndexModal } from "./components/ViewIndexsModal";
import { BulkErrorModal } from "./components/BulkErrorModal";

import { ToastProvider, useToast } from "../../context/ToastContext";
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

function IndexsPageContent() {
  const {
    Indexs,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshIndexs,
    handleFilterChange,
    handleSort,
    handleSearch,
    handlePageChange,
  } = useIndexsData();

  const modals = useIndexsModals();

  const {
    isSubmitting,
    mutationError,
    clearMutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useIndexsMutations({
    refreshIndexs,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const handleViewClick = async (partialIndex: any) => {
    try {
      clearMutationError(); 
      const fullIndex = await getIndex(partialIndex.id);
      modals.openView(fullIndex);
    } catch (error) {
      console.error("Error al cargar detalles del Índice", error);
    }
  };

  const modalTitle = modals.editingIndex ? "Editar Índice" : "Agregar Índice";
  const modalInitialName = modals.editingIndex?.name || "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Índice";
    confirmMessage = `¿Estás seguro de que quieres desactivar el Índice "${modals.actionIndex?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Índice";
    confirmMessage = `¿Estás seguro de que quieres restaurar el Índice "${modals.actionIndex?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el Índice "${modals.actionIndex?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      <IndexsToolbar
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
      />

      <div className="p-4">
        <IndexsTable
          loading={loading}
          error={error}
          Indexs={Indexs}
          meta={meta}
          onSort={handleSort}
          onView={handleViewClick}
          onEdit={(i) => {
            clearMutationError();
            modals.openEdit(i);
          }}
          onBan={(i) => {
            clearMutationError();
            modals.openConfirm(i, "ban");
          }}
          onRestore={(i) => {
            clearMutationError();
            modals.openConfirm(i, "restore");
          }}
          onDelete={(i) => {
            clearMutationError();
            modals.openConfirm(i, "delete");
          }}
        />

        <div className="border-t border-gray-200 bg-gray-50">
          <Pagination meta={meta} links={links} onPageClick={handlePageChange} />
        </div>
      </div>

      <IndexModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialName={modalInitialName}
        onClose={() => {
          clearMutationError();
          modals.closeForm();
        }}
        onSave={(name) => handleSave(name, modals.editingIndex)}
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
        onConfirm={() => handleConfirmAction(modals.actionIndex, modals.actionType)}
      />

      <ViewIndexModal
        isOpen={modals.isViewOpen}
        Index={modals.viewingIndex}
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

export default function Indexs() {
  return (
    <ToastProvider>
      <IndexsPageContent />
    </ToastProvider>
  );
}