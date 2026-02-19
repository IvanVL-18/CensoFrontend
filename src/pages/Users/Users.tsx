import { useUsersData } from "./hooks/useUsersData";
import { useUsersModals } from "./hooks/useUsersModals";
import { useUsersMutations } from "./hooks/useUsersMutations";
import { getUser } from "./Users.service";
import { UsersToolbar } from "./components/UsersToolbar";
import { UsersTable } from "./components/UsersTable";
import Pagination from "../../components/Pagination";
import { UserModal } from "./components/UsersModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewUserModal } from "./components/ViewUsersModal";
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

function UsersPageContent() {
  const {
    Users,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    roles,
    occupations,
    areas,
    institutions,
    refreshUsers,
    handleFilterChange,
    handleSort,
    handleSearch,
    handlePageChange,
  } = useUsersData();

  const handleViewClick = async (partialUser: any) => {
    try {
      const fullUser = await getUser(partialUser.id);
      modals.openView(fullUser);
    } catch (error) {
      console.error("Error al cargar detalles del Usuario", error);
    }
  };

  const handleEditClick = async (partialUser: any) => {
    try {
      const fullUser = await getUser(partialUser.id);
      modals.openEdit(fullUser);
    } catch (error) {
      console.error("Error al cargar detalles del Usuario para editar", error);
      modals.openEdit(partialUser);
    }
  };

  const modals = useUsersModals();

  const {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useUsersMutations({
    refreshUsers,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const modalTitle = modals.editingUser ? "Editar Usuario" : "Agregar Usuario";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Usuario";
    confirmMessage = `¿Estás seguro de que quieres desactivar el Usuario "${modals.actionUser?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Usuario";
    confirmMessage = `¿Estás seguro de que quieres restaurar el Usuario "${modals.actionUser?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el Usuario "${modals.actionUser?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      {/* Barra de Herramientas */}
      <UsersToolbar
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
        <UsersTable
          loading={loading}
          error={error}
          Users={Users}
          meta={meta}
          onSort={handleSort}
          onView={handleViewClick}
          onEdit={handleEditClick}
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
      <UserModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialData={modals.editingUser}
        roles={roles}
        occupations={occupations}
        areas={areas}
        institutions={institutions}
        onClose={modals.closeForm}
        onSave={(data) => handleSave(data, modals.editingUser)}
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
          handleConfirmAction(modals.actionUser, modals.actionType)
        }
      />

      {/* 3. Ver Detalle */}
      <ViewUserModal
        isOpen={modals.isViewOpen}
        User={modals.viewingUser}
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

export default function Users() {
  return (
    <ToastProvider>
      <UsersPageContent />
    </ToastProvider>
  );
}
