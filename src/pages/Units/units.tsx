import { useUnitsData } from "./hooks/useUnitsData";
import { useUnitsModals } from "./hooks/useUnitsModals";
import { useUnitsMutations } from "./hooks/useUnitsMutations";

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
    units,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshUnits,     
    handleFilterChange,
    handleSearchChange,
    handleSort,
    handlePageClick,
  } = useUnitsData();

  
  const modals = useUnitsModals();

  const { 
    isSubmitting, 
    mutationError, 
    handleSave, 
    handleConfirmAction, 
    handleBulkUpload 
  } = useUnitsMutations({
    refreshUnits,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

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
      
      {/* Barra de Herramientas */}
      <UnitsToolbar
        filter={filter}
        searchTerm={searchTerm}
        isSubmitting={isSubmitting}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onAddClick={modals.openCreate}      
        onBulkUpload={handleBulkUpload}   
      />

      {/* Tabla de Resultados */}
      <div className="p-4">
        <UnitsTable
          loading={loading}
          error={error}
          units={units}
          meta={meta}
          onSort={handleSort}
          onView={modals.openView}         
          onEdit={modals.openEdit}          
          onBan={(u) => modals.openConfirm(u, "ban")}
          onRestore={(u) => modals.openConfirm(u, "restore")}
          onDelete={(u) => modals.openConfirm(u, "delete")}
        />

        {/* Paginación */}
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

      {/* --- MODALES --- */}

      {/* 1. Crear / Editar */}
      <UnitModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialName={modalInitialName}
        onClose={modals.closeForm}
        onSave={(name) => handleSave(name, modals.editingUnit)}
      />

      {/* 2. Confirmación (Ban/Restore/Delete) */}
      <ConfirmModal
        isOpen={modals.isConfirmOpen}
        isSubmitting={isSubmitting}
        error={mutationError} // Si falla el borrado, se muestra aquí
        title={confirmTitle}
        message={confirmMessage}
        confirmButtonText={confirmButtonText}
        confirmButtonColor={confirmButtonColor}
        onClose={modals.closeConfirm}
        onConfirm={() => handleConfirmAction(modals.actionUnit, modals.actionType)}
      />

      {/* 3. Ver Detalle */}
      <ViewUnitModal
        isOpen={modals.isViewOpen}
        unit={modals.viewingUnit}
        onClose={modals.closeView}
      />

      {/* 4. Errores de Excel */}
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