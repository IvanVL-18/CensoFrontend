import { useAreasData } from "./hooks/useAreasData";
import { useAreasModals } from "./hooks/useAreasModals";
import { useAreasMutations } from "./hooks/useAreasMutations";
import { getArea } from "./Areas.service";
import { AreasToolbar } from "./components/AreasToolbar";
import { AreasTable } from "./components/AreasTable";
import Pagination from "../../components/Pagination";
import { AreaModal } from "./components/AreasModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewAreaModal } from "./components/ViewAreasModal";
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

function AreasPageContent() {
  const {
    Areas,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshAreas,
    handleFilterChange,
    handleSort,
    handleSearch,
    handlePageChange,
  } = useAreasData();

  const modals = useAreasModals();

  const {
    isSubmitting,
    mutationError,
    clearMutationError, 
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useAreasMutations({
    refreshAreas,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const handleViewClick = async (partialArea: any) => {
    try {
      const fullArea = await getArea(partialArea.id);
      modals.openView(fullArea);
    } catch (error) {
      console.error("Error al cargar detalles del Área", error);
    }
  };

  const modalTitle = modals.editingArea ? "Editar Área" : "Agregar Área";
  const modalInitialName = modals.editingArea?.name || "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Área";
    confirmMessage = `¿Estás seguro de que quieres desactivar el Área "${modals.actionArea?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Área";
    confirmMessage = `¿Estás seguro de que quieres restaurar el Área "${modals.actionArea?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el Área "${modals.actionArea?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      <AreasToolbar
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
        <AreasTable
          loading={loading}
          error={error}
          Areas={Areas}
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

      <AreaModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialName={modalInitialName}
        onClose={() => {
          clearMutationError(); 
          modals.closeForm();
        }}
        onSave={(name) => handleSave(name, modals.editingArea)}
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
        onConfirm={() => handleConfirmAction(modals.actionArea, modals.actionType)}
      />

      <ViewAreaModal
        isOpen={modals.isViewOpen}
        Area={modals.viewingArea}
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

export default function Areas() {
  return (
    <ToastProvider>
      <AreasPageContent />
    </ToastProvider>
  );
}
