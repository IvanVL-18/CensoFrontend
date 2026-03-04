import { useRolesData } from "./hooks/useRolesData";
import { useRolesModals } from "./hooks/useRolesModals";
import { useRolesMutations } from "./hooks/useRolesMutations";
import { getRol } from "./Roles.service";
import { RolesToolbar } from "./components/RolesToolbar";
import { RolesTable } from "./components/RolesTable";
import Pagination from "../../components/Pagination";
import { RolModal } from "./components/RolesModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewRolModal } from "./components/ViewRolesModal";
import { BulkErrorModal } from "./components/BulkErrorModal";

import { ToastProvider, useToast } from "../../context/ToastContext";
import { Toast } from "../../components/Toast";

function ToastContainer() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2">
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
    Roles,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshRoles,
    handleFilterChange,
    handleSort,
    handleSearch,
    handlePageChange,
  } = useRolesData();

  const modals = useRolesModals();

  const {
    isSubmitting,
    mutationError,
    clearMutationError, 
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useRolesMutations({
    refreshRoles,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const handleViewClick = async (partialRol: any) => {
    try {
      const fullRol = await getRol(partialRol.id);
      modals.openView(fullRol);
    } catch (error) {
      console.error("Error al cargar detalles del Rol", error);
    }
  };

  const modalTitle = modals.editingRol ? "Editar Rol" : "Agregar Rol";
  const modalInitialName = modals.editingRol?.name || "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Rol";
    confirmMessage = `¿Estás seguro de que quieres desactivar el Rol "${modals.actionRol?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Rol";
    confirmMessage = `¿Estás seguro de que quieres restaurar el Rol "${modals.actionRol?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el Rol "${modals.actionRol?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      <RolesToolbar
        filter={filter}
        searchTerm={searchTerm}
        isSubmitting={isSubmitting}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearch}
        onAddClick={() => {
          clearMutationError();
          modals.openCreate();
        }}
        onBulkUpload={handleBulkUpload}
      />

      <div className="p-4">
        <RolesTable
          loading={loading}
          error={error}
          Roles={Roles}
          meta={meta}
          onSort={handleSort}
          onView={handleViewClick}
          onEdit={(r) => {
            clearMutationError();
            modals.openEdit(r);
          }}
          onBan={(r) => {
            clearMutationError();
            modals.openConfirm(r, "ban");
          }}
          onRestore={(r) => {
            clearMutationError();
            modals.openConfirm(r, "restore");
          }}
          onDelete={(r) => {
            clearMutationError();
            modals.openConfirm(r, "delete");
          }}
        />
        <div className="border-t border-gray-200 bg-gray-50">
          <Pagination meta={meta} links={links} onPageClick={handlePageChange} />
        </div>
      </div>

      <RolModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialName={modalInitialName}
        onClose={() => {
          clearMutationError();
          modals.closeForm();
        }}
        onSave={(name) => handleSave(name, modals.editingRol)}
        onClearServerError={clearMutationError}
      />
      <ConfirmModal
        isOpen={modals.isConfirmOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={confirmTitle}
        message={confirmMessage}
        confirmButtonText={confirmButtonText}
        confirmButtonColor={confirmButtonColor}
        onClose={() => {
          clearMutationError();
          modals.closeConfirm();
        }}
        onConfirm={() => handleConfirmAction(modals.actionRol, modals.actionType)}
      />
      <ViewRolModal
        isOpen={modals.isViewOpen}
        Rol={modals.viewingRol}
        onClose={modals.closeView}
      />
      <BulkErrorModal
        isOpen={modals.isBulkErrorOpen}
        errors={modals.bulkErrors}
        onClose={modals.closeBulkError}
      />
    </div>
  );
}

export default function Roles() {
  return (
    <ToastProvider>
      <RolesPageContent />
    </ToastProvider>
  );
}
