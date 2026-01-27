// src/pages/area/Areas.tsx
import { useAreas } from "./useArea";
import { AreasToolbar } from "./AreasToolbar";
import { AreasTable } from "./AreasTable";
import Pagination from "../../components/Pagination";
import { AreaModal } from "./AreasModal";
import { ConfirmModal } from "./ConfirmModal";

// ✅ CORREGIDO: default import
import ViewAreaModal from "./ViewAreaModal";

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
    loading,
    error,
    sortedAreas,
    meta,
    links,
    filter,
    searchTerm,
    isModalOpen,
    isSubmitting,
    modalError,
    editingArea,
    isConfirmModalOpen,
    actionArea,
    actionType,
    isViewModalOpen,
    viewingArea,
    institutions,
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
  } = useAreas();

  // (Si quieres, cambia estos textos a "Área" para consistencia)
  const modalTitle = editingArea ? "Editar Área" : "Agregar Área";
  const modalInitialName = editingArea ? editingArea.name : "";
  const modalInitialInstitutionId = editingArea ? editingArea.institution_id : "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (actionType === "ban") {
    confirmTitle = "Desactivar Área";
    confirmMessage = `¿Estás seguro de que quieres desactivar el área "${actionArea?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (actionType === "restore") {
    confirmTitle = "Restaurar Área";
    confirmMessage = `¿Estás seguro de que quieres restaurar el área "${actionArea?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el área "${actionArea?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      <AreasToolbar
        filter={filter}
        searchTerm={searchTerm}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
      />

      <div className="p-4">
        <AreasTable
          loading={loading}
          error={error}
          areas={sortedAreas}   // ✅ CORREGIDO: prop correcto
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
            meta={meta as any}
            links={links as any}
            loading={loading}
            error={error}
            onPageClick={handlePageClick}
          />
        </div>
      </div>

      <AreaModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        error={modalError}
        title={modalTitle}
        initialName={modalInitialName}
        initialInstitutionId={modalInitialInstitutionId}
        institutions={institutions}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />

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

      <ViewAreaModal
        isOpen={isViewModalOpen}
        area={viewingArea}
        onClose={handleViewModalClose}
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
