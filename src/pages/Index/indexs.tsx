// src/components/indexs.tsx (Corregido con el Patrón de Contexto)

import { useIndexs } from "./useIndexs";
import { IndexsToolbar } from "./IndexsToolbar";
import { IndexsTable } from "./IndexsTable";
import { Pagination } from "./Pagination";
import { IndexModal } from "./IndexModal";
import { ConfirmModal } from "./ConfirmModal";
import { ViewIndexModal } from "./ViewIndexModal"; 
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
function IndexsPageContent() {
  const {
    loading,
    error,
    sortedIndexs,
    meta,
    links,
    filter,
    searchTerm,
    isModalOpen,
    isSubmitting,
    modalError,
    editingIndex,
    isConfirmModalOpen,
    actionIndex,
    actionType,
    isViewModalOpen,
    viewingIndex,
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
  } = useIndexs(); // <--- Ahora esta llamada es SEGURA porque está DENTRO del Provider

  // Si 'editingIndex' tiene datos, el título es "Editar". Si no, "Agregar".
  const modalTitle = editingIndex ? "Editar Indice" : "Agregar Indice";

  // Si 'editingIndex' tiene datos, pasamos el nombre. Si no, pasamos "".
  const modalInitialName = editingIndex ? editingIndex.name : "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  // Asignamos un tipo explícito a la variable
  let confirmButtonColor: 'danger' | 'primary' = 'danger';
  if (actionType === 'ban') {
    confirmTitle = "Desactivar indice";
    confirmMessage = `¿Estás seguro de que quieres desactivar el indice "${actionIndex?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (actionType === 'restore') {
    confirmTitle = "Restaurar indice";
    confirmMessage = `¿Estás seguro de que quieres restaurar el indice "${actionIndex?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (actionType === 'delete') {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el indice "${actionIndex?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative"> {/* Añadido 'relative' por si acaso */}
      
      {/* 3. Renderizamos el contenedor de Toasts */}
      <ToastContainer />
      
      {/* --- Cabecera y Filtros --- */}
      <IndexsToolbar
        filter={filter}
        searchTerm={searchTerm}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
      />

      {/* --- Contenido Principal (Tabla y Paginación) --- */}
      <div className="p-4">
        
        {/* --- Tabla de datos --- */}
        <IndexsTable
          loading={loading}
          error={error}
          indexs={sortedIndexs}
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
      <IndexModal
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

      <ViewIndexModal
        isOpen={isViewModalOpen}
        index={viewingIndex}
        onClose={handleViewModalClose}
      />
    </div>
  );
}

// ---
// 3. Componente Principal (Exportado)
//    Su única función es "proveer" el contexto de Toasts
// ---
export default function Indexs() {
  return (
    <ToastProvider>
      <IndexsPageContent />
    </ToastProvider>
  );
}