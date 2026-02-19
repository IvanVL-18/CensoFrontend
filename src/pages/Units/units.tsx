import { useUnitsData } from "./hooks/useUnitsData";
import { useUnitsModals } from "./hooks/useUnitsModals";
import { useUnitsMutations } from "./hooks/useUnitsMutations";
import { getUnit } from "./units.service";
import { UnitsToolbar } from "./components/UnitsToolbar";
import { UnitsTable } from "./components/UnitsTable";
import Pagination from "../../components/Pagination";
import { UnitModal } from "./components/UnitModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewUnitModal } from "./components/ViewUnitModal";
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

function UnitsPageContent() {
  const {
    units,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshUnits,
    handleFilterChange,
    handleSort,
    handleSearch,
    handlePageChange,
  } = useUnitsData();

  const modals = useUnitsModals();

  const {
    isSubmitting,
    mutationError,
    clearMutationError, 
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useUnitsMutations({
    refreshUnits,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const handleViewClick = async (partialUnit: any) => {
    try {
      const fullUnit = await getUnit(partialUnit.id);
      modals.openView(fullUnit);
    } catch (error) {
      console.error("Error al cargar detalles del módulo", error);
    }
  };

  const modalTitle = modals.editingUnit ? "Editar Módulo" : "Agregar Módulo";
  const modalInitialName = modals.editingUnit?.name || "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Módulo";
    confirmMessage = `¿Estás seguro de que quieres desactivar el módulo "${modals.actionUnit?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Módulo";
    confirmMessage = `¿Estás seguro de que quieres restaurar el módulo "${modals.actionUnit?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el módulo "${modals.actionUnit?.name}"? Esta acción no se puede deshacer.`;
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
        onSearchChange={handleSearch}
        onAddClick={() => {
          clearMutationError();
          modals.openCreate();
        }}
        onBulkUpload={handleBulkUpload}
      />

      <div className="p-4">
        <UnitsTable
          loading={loading}
          error={error}
          units={units}
          meta={meta}
          onSort={handleSort}
          onView={handleViewClick}
          onEdit={(u) => {
            clearMutationError();
            modals.openEdit(u);
          }}
          onBan={(u) => {
            clearMutationError();
            modals.openConfirm(u, "ban");
          }}
          onRestore={(u) => {
            clearMutationError();
            modals.openConfirm(u, "restore");
          }}
          onDelete={(u) => {
            clearMutationError();
            modals.openConfirm(u, "delete");
          }}
        />

        <div className="border-t border-gray-200 bg-gray-50">
          <Pagination meta={meta} links={links} onPageClick={handlePageChange} />
        </div>
      </div>

      <UnitModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialName={modalInitialName}
        onClose={() => {
          clearMutationError();
          modals.closeForm();
        }}
        onSave={(name) => handleSave(name, modals.editingUnit)}
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
        onConfirm={() => handleConfirmAction(modals.actionUnit, modals.actionType)}
      />

      <ViewUnitModal
        isOpen={modals.isViewOpen}
        unit={modals.viewingUnit}
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

export default function Units() {
  return (
    <ToastProvider>
      <UnitsPageContent />
    </ToastProvider>
  );
}
