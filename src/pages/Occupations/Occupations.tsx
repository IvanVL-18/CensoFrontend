// src/components/occupation.tsx (Corregido con el Patrón de Contexto)

import { useOccupations } from "./useOccupation";
import { OccupationsToolbar } from "./OccupationsToolbar";
import { OccupationsTable } from "./OccupationsTable";
import { Pagination } from "./Pagination";
import { OccupationModal } from "./OccupationsModal";
import { ConfirmModal } from "./ConfirmModal";
import { ViewOccupationModal } from "./ViewOccupationModal"; 
// <--- Tus imports están perfectos
import { ToastProvider, useToast } from "../../context/ToastContext"; 
import { Toast } from "../../components/Toast";

// ---
// 1. Contenedor de Toasts
//    (Lo sacamos fuera para que sea más limpio)
// ---
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
function OccupationsPageContent() {
  const {
    loading,
    error,
    sortedOccupations,
    meta,
    links,
    filter,
    searchTerm,
    isModalOpen,
    isSubmitting,
    modalError,
    editingOccupation,
    isConfirmModalOpen,
    actionOccupation,
    actionType,
    isViewModalOpen,
    viewingOccupation,
    institutions,
    selectedInstitution,
    handleInstitutionChange,
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
  } = useOccupations(); // <--- Ahora esta llamada es SEGURA porque está DENTRO del Provider

  // Si 'editingOccupation' tiene datos, el título es "Editar". Si no, "Agregar".
  const modalTitle = editingOccupation ? "Editar Ocupación" : "Agregar Ocupación";

  // Si 'editingOccupation' tiene datos, pasamos el nombre. Si no, pasamos "".
  const modalInitialName = editingOccupation ? editingOccupation.name : "";

  // Si 'editingOccupation' tiene datos, pasamos el ID de su institución. Si no, pasamos "".
  const modalInitialInstitutionId = editingOccupation ? editingOccupation.institution_id : "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  // Asignamos un tipo explícito a la variable
  let confirmButtonColor: 'danger' | 'primary' = 'danger';
  if (actionType === 'ban') {
    confirmTitle = "Desactivar Ocupación";
    confirmMessage = `¿Estás seguro de que quieres desactivar la ocupación "${actionOccupation?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (actionType === 'restore') {
    confirmTitle = "Restaurar Ocupación";
    confirmMessage = `¿Estás seguro de que quieres restaurar la ocupación "${actionOccupation?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (actionType === 'delete') {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE la ocupación "${actionOccupation?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative"> {/* Añadido 'relative' por si acaso */}
      
      {/* 3. Renderizamos el contenedor de Toasts */}
      <ToastContainer />
      
      {/* --- Cabecera y Filtros --- */}
      <OccupationsToolbar
        filter={filter}
        searchTerm={searchTerm}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
        // --- Props añadidas ---
        institutions={institutions}
        selectedInstitution={selectedInstitution}
        onInstitutionChange={handleInstitutionChange}
      />

      {/* --- Contenido Principal (Tabla y Paginación) --- */}
      <div className="p-4">
        
        {/* --- Tabla de datos --- */}
        <OccupationsTable
          loading={loading}
          error={error}
          occupation={sortedOccupations}
          meta={meta}
          onSort={handleSort}
          onView={onView}
          onEdit={onEdit}
          onBan={onBan}
          onRestore={onRestore}
          onDelete={onDelete}
        />

        {/* --- Paginación --- */}
        <Pagination
          meta={meta}
          links={links}
          loading={loading}
          error={error}
          onPageClick={handlePageClick}
        />
      </div>
      
      {/* --- Modales --- */}
      <OccupationModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        error={modalError}
        title={modalTitle} 
        initialName={modalInitialName}
        // --- Props añadidas ---
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

      <ViewOccupationModal
        isOpen={isViewModalOpen}
        occupation={viewingOccupation}
        onClose={handleViewModalClose}
      />
    </div>
  );
}

// ---
// 3. Componente Principal (Exportado)
//    Su única función es "proveer" el contexto de Toasts
// ---
export default function Occupations() {
  return (
    <ToastProvider>
      <OccupationsPageContent />
    </ToastProvider>
  );
}