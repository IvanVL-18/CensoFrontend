import { useSections } from "./useSection";
import { SectionsToolbar } from "./SectionToolbar";
import { SectionsTable } from "./SectionTable";
import Pagination from "../../components/Pagination";
import { SectionModal } from "./SectionModal";
import { ConfirmModal } from "./ConfirmModal";
import { ViewSectionModal } from "./ViewSectionModal";
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

function SectionsPageContent() {
  const {
    loading,
    error,
    sortedSections,
    meta,
    links,
    filter,
    searchTerm,
    isModalOpen,
    isSubmitting,
    modalError,
    editingSection,
    isConfirmModalOpen,
    actionSection,
    actionType,
    isViewModalOpen,
    viewingSection,
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
  } = useSections(); 

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";
  if (actionType === "ban") {
    confirmTitle = "Desactivar Módulo";
    confirmMessage = `¿Estás seguro de que quieres desactivar el módulo "${actionSection?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (actionType === "restore") {
    confirmTitle = "Restaurar Módulo";
    confirmMessage = `¿Estás seguro de que quieres restaurar el módulo "${actionSection?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el módulo "${actionSection?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      {" "}
      <ToastContainer />
      <SectionsToolbar
        filter={filter}
        searchTerm={searchTerm}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
      />
      <div className="p-4">
        <SectionsTable
          loading={loading}
          error={error}
          Sections={sortedSections}
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
      {/* --- Modales --- */}
      <SectionModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        error={modalError}
        title={editingSection ? "Editar Sección" : "Agregar Sección"}
        initialData={
          editingSection
            ? {
                name: editingSection.name,
                instructions: editingSection.instructions,
              }
            : undefined
        }
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
      <ViewSectionModal
        isOpen={isViewModalOpen}
        Section={viewingSection}
        onClose={handleViewModalClose}
      />
    </div>
  );
}

export default function Section() {
  return (
    <ToastProvider>
      <SectionsPageContent />
    </ToastProvider>
  );
}
