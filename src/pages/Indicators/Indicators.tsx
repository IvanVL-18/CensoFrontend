import { useIndicatorsData } from "./hooks/useIndicatorsData";
import { useIndicatorsModals } from "./hooks/useIndicatorsModals";
import { useIndicatorsMutations } from "./hooks/useIndicatorsMutations";
import { getIndicator } from "./Indicators.service";
import { IndicatorsToolbar } from "./components/IndicatorsToolbar";
import { IndicatorsTable } from "./components/IndicatorsTable";
import Pagination from "../../components/Pagination";
import { IndicatorModal } from "./components/IndicatorsModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewIndicatorModal } from "./components/ViewIndicatorsModal";
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

function IndicatorsPageContent() {
  const {
    Indicators,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshIndicators,
    handleFilterChange,
    handleSort,
    handleSearch,
    handlePageChange,
  } = useIndicatorsData();

  const modals = useIndicatorsModals();

  const {
    isSubmitting,
    mutationError,
    clearMutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useIndicatorsMutations({
    refreshIndicators,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const { hasPermission } = useAuthContext();

  const handleViewClick = async (partialIndicator: any) => {
    try {
      const fullIndicator = await getIndicator(partialIndicator.id);
      modals.openView(fullIndicator);
    } catch (error) {
      console.error("Error al cargar detalles del módulo", error);
    }
  };

  const modalTitle = modals.editingIndicator
    ? "Editar Indicador"
    : "Agregar Indicador";
  const modalInitialName = modals.editingIndicator?.name || "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Indicador";
    confirmMessage = `¿Estás seguro de que quieres desactivar el indicador "${modals.actionIndicator?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Indicador";
    confirmMessage = `¿Estás seguro de que quieres restaurar el indicador "${modals.actionIndicator?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el indicador "${modals.actionIndicator?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      <IndicatorsToolbar
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
        canCreate={hasPermission("Indicators.create")}
      />

      <div className="p-4">
        <IndicatorsTable
          loading={loading}
          error={error}
          Indicators={Indicators}
          meta={meta}
          onSort={handleSort}
          onView={handleViewClick}
          onEdit={
            hasPermission("Indicators.edit")
              ? (u) => {
                  clearMutationError();
                  modals.openEdit(u);
                }
              : undefined
          }
          onBan={
            hasPermission("Indicators.deactivate")
              ? (u) => {
                  clearMutationError();
                  modals.openConfirm(u, "ban");
                }
              : undefined
          }
          onRestore={
            hasPermission("Indicators.restore")
              ? (u) => {
                  clearMutationError();
                  modals.openConfirm(u, "restore");
                }
              : undefined
          }
          onDelete={
            hasPermission("Indicators.delete")
              ? (u) => {
                  clearMutationError();
                  modals.openConfirm(u, "delete");
                }
              : undefined
          }
        />

        <div className="border-t border-gray-200 bg-gray-50">
          <Pagination
            meta={meta}
            links={links}
            onPageClick={handlePageChange}
          />
        </div>
      </div>

      <IndicatorModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialName={modalInitialName}
        onClose={() => {
          clearMutationError();
          modals.closeForm();
        }}
        onSave={(name) => handleSave(name, modals.editingIndicator)}
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
        onConfirm={() =>
          handleConfirmAction(modals.actionIndicator, modals.actionType)
        }
      />

      <ViewIndicatorModal
        isOpen={modals.isViewOpen}
        Indicator={modals.viewingIndicator}
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

export default function Indicators() {
  return (
    <ToastProvider>
      <IndicatorsPageContent />
    </ToastProvider>
  );
}
