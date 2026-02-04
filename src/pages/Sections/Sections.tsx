import { useSectionsData } from "./hooks/UseSectionsData";
import { useSectionsModals } from "./hooks/UseSectionsModals";
import { useSectionsMutations } from "./hooks/UseSectionsMutations";

import { SectionsToolbar } from "./components/SectionsToolbar";
import { SectionsTable } from "./components/SectionsTable";
import Pagination from "../../components/Pagination"; 
import { SectionModal } from "./components/SectionsModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewSectionModal } from "./components/ViewUnitModal";
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
    handleSearchChange,
    handleSort,
    handlePageClick,
  } = useSectionsData();

  
  const modals = useSectionsModals();

  const { 
    isSubmitting, 
    mutationError, 
    handleSave, 
    handleConfirmAction, 
    handleBulkUpload 
  } = useSectionsMutations({
    refreshSections,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const modalTitle = modals.editingSection ? "Editar Módulo" : "Agregar Módulo";
  const modalInitialName = modals.editingSection?.name || "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Módulo";
    confirmMessage = `¿Estás seguro de que quieres desactivar el módulo "${modals.actionSection?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Módulo";
    confirmMessage = `¿Estás seguro de que quieres restaurar el módulo "${modals.actionSection?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el módulo "${modals.actionSection?.name}"? Esta acción no se puede deshacer.`;
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
        onSearchChange={handleSearchChange}
        onAddClick={modals.openCreate}      
        onBulkUpload={handleBulkUpload}   
      />

      {/* Tabla de Resultados */}
      <div className="p-4">
        <SectionsTable
          loading={loading}
          error={error}
          Sections={Sections}
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
      <SectionModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialName={modalInitialName}
        onClose={modals.closeForm}
        onSave={(name) => handleSave(name, modals.editingSection)}
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
        onConfirm={() => handleConfirmAction(modals.actionSection, modals.actionType)}
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