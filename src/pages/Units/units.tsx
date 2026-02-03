import { useUnits } from "./useUnits";
import { UnitsToolbar } from "./UnitsToolbar";
import { UnitsTable } from "./UnitsTable";
import Pagination from "../../components/Pagination";
import { UnitModal } from "./UnitModal";
import { ConfirmModal } from "./ConfirmModal";
import { ViewUnitModal } from "./ViewUnitModal";
import { BulkErrorModal } from "./BulkErrorModal";
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

function UnitsPageContent() {
  const {
    loading,
    error,
    sortedUnits,
    meta,
    links,
    filter,
    searchTerm,
    isModalOpen,
    isSubmitting,
    modalError,
    editingUnit,
    isConfirmModalOpen,
    actionUnit,
    actionType,
    isViewModalOpen,
    viewingUnit,
    isBulkErrorModalOpen,
    bulkErrors,
    setIsBulkErrorModalOpen,
    handleBulkUpload,
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
    handleViewModalClose,
    handleConfirmModalClose,
    handleConfirmAction,
  } = useUnits();

  const modalTitle = editingUnit ? "Editar Módulo" : "Agregar Módulo";
  const modalInitialName = editingUnit ? editingUnit.name : "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (actionType === "ban") {
    confirmTitle = "Desactivar Módulo";
    confirmMessage = `¿Estás seguro de que quieres desactivar el módulo "${actionUnit?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (actionType === "restore") {
    confirmTitle = "Restaurar Módulo";
    confirmMessage = `¿Estás seguro de que quieres restaurar el módulo "${actionUnit?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el módulo "${actionUnit?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />
      <UnitsToolbar
        filter={filter}
        searchTerm={searchTerm}
        isSubmitting={isSubmitting}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
        onBulkUpload={handleBulkUpload}
      />

      <div className="p-4">
        <UnitsTable
          loading={loading}
          error={error}
          units={sortedUnits}
          meta={meta}
          onSort={handleSort}
          onView={onView}
          onEdit={onEdit}
          onBan={onBan}
          onRestore={onRestore}
          onDelete={onDelete}
        />

        <div className="mt-4 flex justify-center">
          <Pagination
            meta={meta}
            links={links}
            loading={loading}
            error={error}
            onPageClick={handlePageClick}
          />
        </div>
      </div>

      {/* Modal Crear/Editar */}
      <UnitModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        error={modalError}
        title={modalTitle}
        initialName={modalInitialName}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />

      {/* Modal Confirmación (Borrar/Restaurar) */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        isSubmitting={isSubmitting}
        error={modalError}
        title={confirmTitle}
        message={confirmMessage}
        confirmButtonText={confirmButtonText}
        confirmButtonColor={confirmButtonColor}
        onClose={handleConfirmModalClose}
        onConfirm={handleConfirmAction}
      />

      {/* Modal Ver Detalle */}
      <ViewUnitModal
        isOpen={isViewModalOpen}
        unit={viewingUnit}
        onClose={handleViewModalClose}
      />

      {/* Modal Errores de Carga Masiva */}
      <BulkErrorModal
        isOpen={isBulkErrorModalOpen}
        errors={bulkErrors}
        onClose={() => setIsBulkErrorModalOpen(false)}
      />
    </div>
  );
}

export default function Units() {
  return (
    <ToastProvider>
      <UnitsPageContent />
    </ToastProvider>
  );
}
