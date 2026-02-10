import { usePermissionsData } from "./hooks/usePermissionsData";
import { usePermissionsModals } from "./hooks/usePermissionsModals";
import { usePermissionsMutations } from "./hooks/usePermissionsMutations";
import { getPermission } from "./Permissions.service";
import { PermissionsToolbar } from "./components/PermissionsToolbar";
import { PermissionsTable } from "./components/PermissionsTable";
import Pagination from "../../components/Pagination";
import { PermissionModal } from "./components/PermissionsModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewPermissionModal } from "./components/ViewPermissionsModal";
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

function PermissionsPageContent() {
  const {
    Permissions,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshPermissions,
    handleFilterChange,
    handleSort,
    handleSearch,
    handlePageChange,
  } = usePermissionsData();

  const handleViewClick = async (partialPermission: any) => {
    try {
      const fullPermission = await getPermission(partialPermission.id);
      modals.openView(fullPermission);
    } catch (error) {
      console.error("Error al cargar detalles del módulo", error);
    }
  };
  const modals = usePermissionsModals();

  const {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = usePermissionsMutations({
    refreshPermissions,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const modalTitle = modals.editingPermission ? "Editar Módulo" : "Agregar Módulo";
  const modalInitialName = modals.editingPermission?.name || "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Módulo";
    confirmMessage = `¿Estás seguro de que quieres desactivar el módulo "${modals.actionPermission?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Módulo";
    confirmMessage = `¿Estás seguro de que quieres restaurar el módulo "${modals.actionPermission?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el módulo "${modals.actionPermission?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      {/* Barra de Herramientas */}
      <PermissionsToolbar
        filter={filter}
        searchTerm={searchTerm}
        isSubmitting={isSubmitting}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearch}
        onAddClick={modals.openCreate}
        onBulkUpload={handleBulkUpload}
      />

      {/* Tabla de Resultados */}
      <div className="p-4">
        <PermissionsTable
          loading={loading}
          error={error}
          Permissions={Permissions}
          meta={meta}
          onSort={handleSort}
          onView={handleViewClick}
          onEdit={modals.openEdit}
          onBan={(u) => modals.openConfirm(u, "ban")}
          onRestore={(u) => modals.openConfirm(u, "restore")}
          onDelete={(u) => modals.openConfirm(u, "delete")}
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
      <PermissionModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialName={modalInitialName}
        onClose={modals.closeForm}
        onSave={(name) => handleSave(name, modals.editingPermission)}
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
          handleConfirmAction(modals.actionPermission, modals.actionType)
        }
      />

      {/* 3. Ver Detalle */}
      <ViewPermissionModal
        isOpen={modals.isViewOpen}
        Permission={modals.viewingPermission}
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

export default function Permissions() {
  return (
    <ToastProvider>
      <PermissionsPageContent />
    </ToastProvider>
  );
}
