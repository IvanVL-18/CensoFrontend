import { useModulosData } from "./hooks/useModulosData";
import { useModulosModals } from "./hooks/useModulosModals";
import { useModulosMutations } from "./hooks/useModulosMutations";
import { getModulo } from "./Modulos.service";
import { ModulosToolbar } from "./components/ModulosToolbar";
import { ModulosTable } from "./components/ModulosTable";
import Pagination from "../../components/Pagination";
import { ModuloModal } from "./components/ModulosModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewModuloModal } from "./components/ViewModulosModal";
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

function ModulosPageContent() {
  const {
    Modulos,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshModulos,
    handleFilterChange,
    handleSort,
    handleSearch,
    handlePageChange,
  } = useModulosData();

  const handleViewClick = async (partialModulo: any) => {
    try {
      const fullModulo = await getModulo(partialModulo.id);
      modals.openView(fullModulo);
    } catch (error) {
      console.error("Error al cargar detalles del módulo", error);
    }
  };
  const modals = useModulosModals();

  const {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useModulosMutations({
    refreshModulos,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const modalTitle = modals.editingModulo ? "Editar Módulo" : "Agregar Módulo";
  const modalInitialName = modals.editingModulo?.name || "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Módulo";
    confirmMessage = `¿Estás seguro de que quieres desactivar el módulo "${modals.actionModulo?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Módulo";
    confirmMessage = `¿Estás seguro de que quieres restaurar el módulo "${modals.actionModulo?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el módulo "${modals.actionModulo?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      {/* Barra de Herramientas */}
      <ModulosToolbar
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
        <ModulosTable
          loading={loading}
          error={error}
          Modulos={Modulos}
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
      <ModuloModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialName={modalInitialName}
        onClose={modals.closeForm}
        onSave={(name) => handleSave(name, modals.editingModulo)}
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
          handleConfirmAction(modals.actionModulo, modals.actionType)
        }
      />

      {/* 3. Ver Detalle */}
      <ViewModuloModal
        isOpen={modals.isViewOpen}
        Modulo={modals.viewingModulo}
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

export default function Modulos() {
  return (
    <ToastProvider>
      <ModulosPageContent />
    </ToastProvider>
  );
}
