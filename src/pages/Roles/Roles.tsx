import { useroles } from "./useRoles";
import { RolesToolbar } from "./RolesToolbar";
import { RolesTable } from "./RolesTable";
import Pagination from "../../components/Pagination";
import { RolModal } from "./RolModal";
import { ConfirmModal } from "./ConfirmModal";
import { ViewrolModal } from "./ViewRolModal";
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

function RolesPageContent() {
  const {
    loading,
    error,
    sortedroles,
    meta,
    links,
    filter,
    searchTerm,
    isModalOpen,
    isSubmitting,
    modalError,
    editingrol,
    isConfirmModalOpen,
    actionrol,
    actionType,
    isViewModalOpen,
    viewingrol,
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
  } = useroles();

  const modalTitle = editingrol ? "Editar Rol" : "Agregar Rol";
  const modalInitialName = editingrol ? editingrol.name : "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (actionType === "ban") {
    confirmTitle = "Desactivar Rol";
    confirmMessage = `¿Estás seguro de que quieres desactivar el Rol "${actionrol?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (actionType === "restore") {
    confirmTitle = "Restaurar Rol";
    confirmMessage = `¿Estás seguro de que quieres restaurar el Rol "${actionrol?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el Rol "${actionrol?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />
      <RolesToolbar
        filter={filter}
        searchTerm={searchTerm}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
      />

      <div className="p-4">
        <RolesTable
          loading={loading}
          error={error}
          roles={sortedroles}
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

      <RolModal
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

      <ViewrolModal
        isOpen={isViewModalOpen}
        rol={viewingrol}
        onClose={handleViewModalClose}
      />
    </div>
  );
}

export default function Roles() {
  return (
    <ToastProvider>
      <RolesPageContent/>
    </ToastProvider>
  );
}
