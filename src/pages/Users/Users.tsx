import { useEffect, useState } from "react";

import { useUsersData } from "./hooks/useUsersData";
import { useUsersModals } from "./hooks/useUsersModals";
import { useUsersMutations } from "./hooks/useUsersMutations";
import { getUser, getRolesSelector } from "./Users.service";
import type { RoleOption } from "./Users.types";

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
    setUsers, 
    loading,
    error,
    meta,
    links,
    refreshUsers,
    handleSort,
    handlePageChange,
  } = useUsersData();

  const modals = useUsersModals();

  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [rolesError, setRolesError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    getRolesSelector(controller.signal)
      .then((data) => {
        setRoles(data);
        setRolesError(null);
      })
      .catch((err: any) => {
        if (
          err?.code === "ERR_CANCELED" ||
          err?.name === "CanceledError" ||
          err?.name === "AbortError"
        ) {
          return;
        }
        console.error("roles error:", err);
        setRoles([]);
        setRolesError("No se pudieron cargar los roles.");
      });

    return () => controller.abort();
  }, []);

  const handleViewClick = async (partialUser: any) => {
    try {
      const fullUser = await getUser(partialUser.id);
      modals.openView(fullUser);
    } catch (error) {
      console.error("Error al cargar detalles del Usuario", error);
    }
  };

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
    setUsers,
  });

  const modalTitle = modals.editingUser ? "Editar Usuario" : "Agregar Usuario";
  const modalInitialEmail = modals.editingUser?.email || "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Usuario";
    confirmMessage = `¿Estás seguro de que quieres desactivar el usuario "${modals.actionUser?.email}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Usuario";
    confirmMessage = `¿Estás seguro de que quieres restaurar el usuario "${modals.actionUser?.email}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el usuario "${modals.actionUser?.email}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      <UsersToolbar
        isSubmitting={isSubmitting}
        onAddClick={modals.openCreate}
        onBulkUpload={handleBulkUpload}
      />

      <div className="p-4">
        <UsersTable
          loading={loading}
          error={error}
          Users={Users}
          meta={meta}
          onSort={handleSort}
          onView={handleViewClick}
          onEdit={modals.openEdit}
          onBan={(u) => modals.openConfirm(u, "ban")}
          onRestore={(u) => modals.openConfirm(u, "restore")}
          onDelete={(u) => modals.openConfirm(u, "delete")}
        />

        <div className="border-t border-gray-200 bg-gray-50">
          <Pagination meta={meta} links={links} onPageClick={handlePageChange} />
        </div>
      </div>

      <UserModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError || rolesError}
        title={modalTitle}
        initialEmail={modalInitialEmail}
        initialPassword=""
        initialRoleId={modals.editingUser?.role_id ?? ""}
        roles={roles}
        onClose={modals.closeForm}
        onSave={(data) => handleSave(data, modals.editingUser)}
      />

      <ConfirmModal
        isOpen={modals.isConfirmOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={confirmTitle}
        message={confirmMessage}
        confirmButtonText={confirmButtonText}
        confirmButtonColor={confirmButtonColor}
        onClose={modals.closeConfirm}
        onConfirm={() => handleConfirmAction(modals.actionUser, modals.actionType)}
      />

      <ViewUserModal
        isOpen={modals.isViewOpen}
        User={modals.viewingUser}
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

export default function Users() {
  return (
    <ToastProvider>
      <UsersPageContent />
    </ToastProvider>
  );
}
