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
    // Aquí definimos la posición de TODOS los toasts
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

// ---
// 2. Componente Interno para el Contenido de la Página
//    (Este componente contiene TODO tu código anterior)
// ---
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
  } = useSections(); // <--- Ahora esta llamada es SEGURA porque está DENTRO del Provider

  // Si 'editingSection' tiene datos, el título es "Editar". Si no, "Agregar".
  const modalTitle = editingSection ? "Editar Modulo" : "Agregar Modulo";

  // Si 'editingSection' tiene datos, pasamos el nombre. Si no, pasamos "".
  const modalInitialName = editingSection ? editingSection.name : "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  // Asignamos un tipo explícito a la variable
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
      {/* Añadido 'relative' por si acaso */}
      {/* 3. Renderizamos el contenedor de Toasts */}
      <ToastContainer />
      {/* --- Cabecera y Filtros --- */}
      <SectionsToolbar
        filter={filter}
        searchTerm={searchTerm}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
      />
      {/* --- Contenido Principal (Tabla y Paginación) --- */}
      <div className="p-4">
        {/* --- Tabla de datos --- */}
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

        {/* --- Paginación --- */}
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
        // PASAMOS EL OBJETO COMPLETO O UNDEFINED
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

// ---
// 3. Componente Principal (Exportado)
//    Su única función es "proveer" el contexto de Toasts
// ---
export default function Section() {
  return (
    <ToastProvider>
      <SectionsPageContent />
    </ToastProvider>
  );
}
