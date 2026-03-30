import { useSectionsData } from "./hooks/UseSectionsData";
import { useSectionsModals } from "./hooks/UseSectionsModals";
import { useSectionsMutations } from "./hooks/UseSectionsMutations";
import { getSection } from "./sections.service";
import { SectionsToolbar } from "./components/SectionsToolbar";
import { SectionsTable } from "./components/SectionsTable";
import Pagination from "../../components/Pagination";
import { SectionModal } from "./components/SectionsModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewSectionModal } from "./components/ViewSectionsModal";
import { BulkErrorModal } from "./components/BulkErrorModal";

import { ToastProvider, useToast } from "../../context/ToastContext";
import { useAuthContext } from "../../context/AuthContext";
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
    Sections,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshSections,
    handleFilterChange,
    handleSort,
    handleSearch,
    handlePageChange,
  } = useSectionsData();

  const modals = useSectionsModals();

  const { hasPermission } = useAuthContext();

  const handleViewClick = async (partialSection: any) => {
    try {
      const fullSection = await getSection(partialSection.id);
      modals.openView(fullSection);
    } catch (error) {
      console.error("Error al cargar detalles de la Sección", error);
    }
  };

  const handleEditClick = async (partialSection: any) => {
  try {
    const fullSection = await getSection(partialSection.id);
    modals.openEdit(fullSection);
  } catch (error) {
    console.error("Error al cargar detalles de la Sección", error);
  }
};
  

  const {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useSectionsMutations({
    refreshSections,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const modalTitle = modals.editingSection ? "Editar Sección" : "Agregar Sección";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Sección";
    confirmMessage = `¿Estás seguro de que quieres desactivar el Sección "${modals.actionSection?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Sección";
    confirmMessage = `¿Estás seguro de que quieres restaurar la Sección "${modals.actionSection?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE la Sección "${modals.actionSection?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      {/* Barra de Herramientas */}
      <SectionsToolbar
        filter={filter}
        searchTerm={searchTerm}
        isSubmitting={isSubmitting}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearch}
        onAddClick={modals.openCreate}
        onBulkUpload={handleBulkUpload}
        canCreate={hasPermission("sections.create")}
      />

      {/* Tabla de Resultados */}
      <div className="p-4">
        <SectionsTable
          loading={loading}
          error={error}
          Sections={Sections}
          meta={meta}
          onSort={handleSort}
          onView={handleViewClick}
          onEdit={hasPermission("sections.edit") ? handleEditClick : undefined}
          onBan={hasPermission("sections.deactivate") ? (u) => modals.openConfirm(u, "ban") : undefined}
          onRestore={hasPermission("sections.restore") ? (u) => modals.openConfirm(u, "restore") : undefined}
          onDelete={hasPermission("sections.delete") ? (u) => modals.openConfirm(u, "delete") : undefined}
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
      <SectionModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialData={
          modals.editingSection
            ? { name: modals.editingSection.name, instructions: modals.editingSection.instructions }
            : undefined
        }
        onClose={modals.closeForm}
        onSave={(data) => handleSave(data, modals.editingSection)}
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
          handleConfirmAction(modals.actionSection, modals.actionType)
        }
      />

      {/* 3. Ver Detalle */}
      <ViewSectionModal
        isOpen={modals.isViewOpen}
        Section={modals.viewingSection}
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

export default function Sections() {
  return (
    <ToastProvider>
      <SectionsPageContent />
    </ToastProvider>
  );
}
