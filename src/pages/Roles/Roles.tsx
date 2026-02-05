import { useRolesData } from "./hooks/useRolesData";
import { useRolesModals } from "./hooks/useRolesModals";
import { useRolesMutations } from "./hooks/useRolesMutations";

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
    Roles,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshRoles,     
    handleFilterChange,
    handleSearchChange,
    handleSort,
    handlePageClick,
  } = useRolesData();

  
  const modals = useRolesModals();

  const { 
    isSubmitting, 
    mutationError, 
    handleSave, 
    handleConfirmAction, 
    handleBulkUpload 
  } = useRolesMutations({
    refreshRoles,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

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
      
      {/* Barra de Herramientas */}
      <RolesToolbar
        filter={filter}
        searchTerm={searchTerm}
        isSubmitting={isSubmitting}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onAddClick={modals.openCreate}      
        onBulkUpload={handleBulkUpload}   
      />

      {/* Tabla de Resultados */}
      <div className="p-4">
        <RolesTable
          loading={loading}
          error={error}
          Roles={Roles}
          meta={meta}
          onSort={handleSort}
          onView={modals.openView}         
          onEdit={modals.openEdit}          
          onBan={(u) => modals.openConfirm(u, "ban")}
          onRestore={(u) => modals.openConfirm(u, "restore")}
          onDelete={(u) => modals.openConfirm(u, "delete")}
        />

        {/* Paginación */}
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

      {/* --- MODALES --- */}

      {/* 1. Crear / Editar */}
      <RolModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialName={modalInitialName}
        onClose={modals.closeForm}
        onSave={(name) => handleSave(name, modals.editingRol)}
      />

      {/* 2. Confirmación (Ban/Restore/Delete) */}
      <ConfirmModal
        isOpen={modals.isConfirmOpen}
        isSubmitting={isSubmitting}
        error={mutationError} // Si falla el borrado, se muestra aquí
        title={confirmTitle}
        message={confirmMessage}
        confirmButtonText={confirmButtonText}
        confirmButtonColor={confirmButtonColor}
        onClose={modals.closeConfirm}
        onConfirm={() => handleConfirmAction(modals.actionRol, modals.actionType)}
      />

      {/* 3. Ver Detalle */}
      <ViewRolModal
        isOpen={modals.isViewOpen}
        Rol={modals.viewingRol}
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

export default function Roles() {
  return (
    <ToastProvider>
      <RolesPageContent />
    </ToastProvider>
  );
}