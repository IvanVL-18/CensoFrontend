import { useSectionsData } from "./hooks/UseSectionsData";
import { useSectionsModals } from "./hooks/UseSectionsModals";
import { useSectionsMutations } from "./hooks/UseSectionsMutations";
import { getSection } from "./sections.service";
import { SectionsToolbar } from "./components/SectionsToolbar";
import { SectionsTable } from "./components/SectionsTable";
import Pagination from "../../components/Pagination"; 
// Asegúrate de que el nombre del componente coincida con el archivo (SectionsModal vs SectionModal)
import { SectionModal } from "./components/SectionsModal"; 
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewSectionModal } from "./components/ViewSectionModal";
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
    sections, // Ojo: renombré la variable en el hook a minúscula
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

  const modalTitle = modals.editingSection ? "Editar Sección" : "Nueva Sección";
  const modalInitialName = modals.editingSection?.name || "";
  const modalInitialInstructions = modals.editingSection?.instructions || ""; 
  const handleEditClick = async (partialSection: any) => {
    try {
      // Opcional: Podrías poner un loading global aquí si quisieras
      // Llamamos al endpoint SHOW que sí trae las instrucciones
      const fullSection = await getSection(partialSection.id);
      
      // Abrimos el modal con la data COMPLETA
      modals.openEdit(fullSection);
    } catch (error) {
      console.error("Error al cargar detalles de la sección", error);
      // Aquí podrías usar addToast del contexto si lo exportaras o pasaras
    }
  };
  const handleViewClick = async (partialSection: any) => {
    try {
      const fullSection = await getSection(partialSection.id);
      modals.openView(fullSection);
    } catch (error) {
      console.error("Error al cargar detalles", error);
    }
  };

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Sección";
    confirmMessage = `¿Estás seguro de desactivar "${modals.actionSection?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Sección";
    confirmMessage = `¿Estás seguro de restaurar "${modals.actionSection?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de ELIMINAR PERMANENTEMENTE "${modals.actionSection?.name}"?`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />
      
      <SectionsToolbar
        filter={filter}
        searchTerm={searchTerm}
        isSubmitting={isSubmitting}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onAddClick={modals.openCreate}
        onBulkUpload={handleBulkUpload}
      />

      <div className="p-4">
        <SectionsTable
          loading={loading}
          error={error}
          Sections={sections}
          meta={meta}
          onSort={handleSort}
          onView={handleViewClick}
          onEdit={handleEditClick}
          onBan={(s) => modals.openConfirm(s, "ban")}
          onRestore={(s) => modals.openConfirm(s, "restore")}
          onDelete={(s) => modals.openConfirm(s, "delete")}
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

      {/* --- MODALES --- */}

      {/* 1. Crear / Editar */}
      <SectionModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialName={modalInitialName}
        // ✅ Pasamos las instrucciones iniciales
        initialInstructions={modalInitialInstructions} 
        onClose={modals.closeForm}
        // ✅ El hook handleSave ya sabe manejar el objeto completo
        onSave={(data) => handleSave(data, modals.editingSection)}
      />

      {/* 2. Confirmación */}
      <ConfirmModal
        isOpen={modals.isConfirmOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
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
        section={modals.viewingSection} // Ajustar prop según componente
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