

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
import { BulkErrorModal } from "./BulkErrorModal";


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
    handleBulkUpload,
    isBulkErrorOpen,
    bulkErrors,
    closeBulkError,
  } = useIndexs(); 

 
  const modalTitle = editingIndex ? "Editar Indice" : "Agregar Indice";

  
  const modalInitialName = editingIndex ? editingIndex.name : "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative"> 
      
      
      <ToastContainer />
      
     
      <IndexsToolbar
        filter={filter}
        searchTerm={searchTerm}
        isSubmitting={isSubmitting}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
        onBulkUpload={handleBulkUpload}
      />

      <div className="p-4">
        
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

        
        <Pagination
          meta={meta}
          links={links}
          loading={loading}
          error={error}
          onPageClick={handlePageClick}
        />
      </div>
      
 
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

      <BulkErrorModal
        isOpen={isBulkErrorOpen}
        errors={bulkErrors}
        onClose={closeBulkError}
      />
    </div>
  );
}


export default function Indexs() {
  return (
    <ToastProvider>
      <IndexsPageContent />
    </ToastProvider>
  );
}