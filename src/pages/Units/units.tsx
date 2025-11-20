// src/components/units.tsx (Corregido con el Patrón de Contexto)

import { useUnits } from "./useUnits";
import { UnitsToolbar } from "./UnitsToolbar";
import { UnitsTable } from "./UnitsTable";
import { Pagination } from "./Pagination";
import { UnitModal } from "./UnitModal";
import { ConfirmModal } from "./ConfirmModal";
import { ViewUnitModal } from "./ViewUnitModal"; 
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
function UnitsPageContent() {
  const {
    loading,
    error,
    sortedUnits,
    meta,
    links,
    filter,
    searchTerm,
    isModalOpen,
    isSubmitting,
    modalError,
    editingUnit,
    isConfirmModalOpen,
    actionUnit,
    actionType,
    isViewModalOpen,
    viewingUnit,
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
  } = useUnits(); // <--- Ahora esta llamada es SEGURA porque está DENTRO del Provider

  // Si 'editingUnit' tiene datos, el título es "Editar". Si no, "Agregar".
  const modalTitle = editingUnit ? "Editar Modulo" : "Agregar Modulo";

  // Si 'editingUnit' tiene datos, pasamos el nombre. Si no, pasamos "".
  const modalInitialName = editingUnit ? editingUnit.name : "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  // Asignamos un tipo explícito a la variable
  let confirmButtonColor: 'danger' | 'primary' = 'danger';
  if (actionType === 'ban') {
    confirmTitle = "Desactivar Módulo";
    confirmMessage = `¿Estás seguro de que quieres desactivar el módulo "${actionUnit?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (actionType === 'restore') {
    confirmTitle = "Restaurar Módulo";
    confirmMessage = `¿Estás seguro de que quieres restaurar el módulo "${actionUnit?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (actionType === 'delete') {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el módulo "${actionUnit?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative"> {/* Añadido 'relative' por si acaso */}
      
      {/* 3. Renderizamos el contenedor de Toasts */}
      <ToastContainer />
      
      {/* --- Cabecera y Filtros --- */}
      <UnitsToolbar
        filter={filter}
        searchTerm={searchTerm}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
      />

      {/* --- Contenido Principal (Tabla y Paginación) --- */}
      <div className="p-4">
        
        {/* --- Tabla de datos --- */}
        <UnitsTable
          loading={loading}
          error={error}
          units={sortedUnits}
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
      <UnitModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        error={modalError}
        title={modalTitle} 
        initialName={modalInitialName}
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

      <ViewUnitModal
        isOpen={isViewModalOpen}
        unit={viewingUnit}
        onClose={handleViewModalClose}
      />
    </div>
  );
}

// ---
// 3. Componente Principal (Exportado)
//    Su única función es "proveer" el contexto de Toasts
// ---
export default function Units() {
  return (
    <ToastProvider>
      <UnitsPageContent />
    </ToastProvider>
  );
}