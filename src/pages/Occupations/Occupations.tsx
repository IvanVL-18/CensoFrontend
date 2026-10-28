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

  const modals = useOccupationsModals();

  const {
    isSubmitting,
    mutationError,
    clearMutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useOccupationsMutations({
    refreshOccupations,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
    currentOccupations: Occupations, 
  });

  const { hasPermission } = useAuthContext();

  const handleViewClick = async (partialOccupation: any) => {
    try {
      clearMutationError(); 
      const fullOccupation = await getOccupation(partialOccupation.id);
      modals.openView(fullOccupation);
    } catch (error) {
      console.error("Error al cargar detalles de la Ocupación", error);
    }
  };

  const handleEditClick = async (partialOccupation: any) => {
    try {
      clearMutationError();
      const fullOccupation = await getOccupation(partialOccupation.id);
      modals.openEdit(fullOccupation);
    } catch (error) {
      console.error("Error al cargar detalles de la Ocupación para editar", error);
    }
  };

  const modalTitle = modals.editingOccupation
    ? "Editar Ocupación"
    : "Agregar Ocupación";
  const modalInitialName = modals.editingOccupation?.name || "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Ocupación";
    confirmMessage = `¿Estás seguro de que quieres desactivar la Ocupación "${modals.actionOccupation?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Ocupación";
    confirmMessage = `¿Estás seguro de que quieres restaurar la Ocupación "${modals.actionOccupation?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE la Ocupación "${modals.actionOccupation?.name}"? Esta acción no se puede deshacer.`;
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
        onAddClick={() => {
          clearMutationError();
          modals.openCreate();
        }}
        onBulkUpload={handleBulkUpload}
        canCreate={hasPermission("occupations.create")}
      />

      {/* Tabla */}
      <div className="p-4">
        <OccupationsTable
          loading={loading}
          error={error}
          Occupations={Occupations}
          meta={meta}
          onSort={handleSort}
          onView={handleViewClick}
          onEdit={hasPermission("occupations.edit") ? handleEditClick : undefined}
          onBan={hasPermission("occupations.deactivate") ? (o) => {
            clearMutationError();
            modals.openConfirm(o, "ban");
          } : undefined}
          onRestore={hasPermission("occupations.restore") ? (o) => {
            clearMutationError();
            modals.openConfirm(o, "restore");
          } : undefined}
          onDelete={hasPermission("occupations.delete") ? (o) => {
            clearMutationError();
            modals.openConfirm(o, "delete");
          } : undefined}
        />

        {/* Paginación */}
        <div className="border-t border-gray-200 bg-gray-50">
          <Pagination meta={meta} links={links} onPageClick={handlePageChange} />
        </div>
      </div>

      {/* 1) Crear / Editar */}
      <OccupationModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialName={modalInitialName}
        onClose={() => {
          clearMutationError();
          modals.closeForm();
        }}
        onSave={(name) => handleSave(name, modals.editingOccupation)}
      />

      {/* 2) Confirmación */}
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
          handleConfirmAction(modals.actionOccupation, modals.actionType)
        }
      />

      {/* 3) Ver */}
      <ViewOccupationModal
        isOpen={modals.isViewOpen}
        Occupation={modals.viewingOccupation}
        onClose={modals.closeView}
      />

      {/* 4) Errores Excel */}
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