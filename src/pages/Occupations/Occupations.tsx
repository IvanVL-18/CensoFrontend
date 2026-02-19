import { useOccupationsData } from "./hooks/useOccupationsData";
import { useOccupationsModals } from "./hooks/useOccupationsModals";
import { useOccupationsMutations } from "./hooks/useOccupationsMutations";
import { getOccupation } from "./Occupations.service";
import { OccupationsToolbar } from "./components/OccupationsToolbar";
import { OccupationsTable } from "./components/OccupationsTable";
import Pagination from "../../components/Pagination";
import { OccupationModal } from "./components/OccupationsModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewOccupationModal } from "./components/ViewOccupationsModal";
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

function OccupationsPageContent() {
  const {
    Occupations,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshOccupations,
    handleFilterChange,
    handleSort,
    handleSearch,
    handlePageChange,
  } = useOccupationsData();

  const handleViewClick = async (partialOccupation: any) => {
    try {
      const fullOccupation = await getOccupation(partialOccupation.id);
      modals.openView(fullOccupation);
    } catch (error) {
      console.error("Error al cargar detalles de la Ocupación", error);
    }
  };
  const modals = useOccupationsModals();

  const {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useOccupationsMutations({
    refreshOccupations,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const modalTitle = modals.editingOccupation ? "Editar Ocupación" : "Agregar Ocupación";
  const modalInitialName = modals.editingOccupation?.name || "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Ocupación";
    confirmMessage = `¿Estás seguro de que quieres desactivar el Ocupación "${modals.actionOccupation?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Ocupación";
    confirmMessage = `¿Estás seguro de que quieres restaurar el Ocupación "${modals.actionOccupation?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el Ocupación "${modals.actionOccupation?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      {/* Barra de Herramientas */}
      <OccupationsToolbar
        filter={filter}
        searchTerm={searchTerm}
        isSubmitting={isSubmitting}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearch}
        onAddClick={modals.openCreate}
        onBulkUpload={handleBulkUpload}
      />

      {/* Tabla de Resultados */}
      <div className="p-4">
        <OccupationsTable
          loading={loading}
          error={error}
          Occupations={Occupations}
          meta={meta}
          onSort={handleSort}
          onView={handleViewClick}
          onEdit={modals.openEdit}
          onBan={(u) => modals.openConfirm(u, "ban")}
          onRestore={(u) => modals.openConfirm(u, "restore")}
          onDelete={(u) => modals.openConfirm(u, "delete")}
        />

        {/* Paginación */}
        <div className="border-t border-gray-200 bg-gray-50">
          <Pagination
            meta={meta}
            links={links}
            onPageClick={handlePageChange}
          />
        </div>
      </div>

      {/* --- MODALES --- */}

      {/* 1. Crear / Editar */}
      <OccupationModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialName={modalInitialName}
        onClose={modals.closeForm}
        onSave={(name) => handleSave(name, modals.editingOccupation)}
      />

      {/* 2. Confirmación (Ban/Restore/Delete) */}
      <ConfirmModal
        isOpen={modals.isConfirmOpen}
        isSubmitting={isSubmitting}
        error={mutationError} 
        title={confirmTitle}
        message={confirmMessage}
        confirmButtonText={confirmButtonText}
        confirmButtonColor={confirmButtonColor}
        onClose={modals.closeConfirm}
        onConfirm={() =>
          handleConfirmAction(modals.actionOccupation, modals.actionType)
        }
      />

      {/* 3. Ver Detalle */}
      <ViewOccupationModal
        isOpen={modals.isViewOpen}
        Occupation={modals.viewingOccupation}
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

export default function Occupations() {
  return (
    <ToastProvider>
      <OccupationsPageContent />
    </ToastProvider>
  );
}
