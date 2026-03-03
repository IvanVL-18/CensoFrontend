import { useState, useRef, useEffect } from "react";
import { useCensosData } from "./hooks/useCensosData";
import { useCensosModals } from "./hooks/useCensosModals";
import { useCensosMutations } from "./hooks/useCensosMutations";
import { CensosToolbar } from "./components/CensosToolbar";
import { CensosCards } from "./components/CensosCards";
import Pagination from "../../components/Pagination";
import { CensoCreateModal } from "./components/CensoCreateModal";
import { CensoCreateSelectionModal } from "./components/CensoCreateSelectionModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewCensoModal } from "./components/ViewCensosModal";
import { BulkErrorModal } from "./components/BulkErrorModal";
import { ToastProvider, useToast } from "../../context/ToastContext";
import { Toast } from "../../components/Toast";
import type { CensoManualFormRef } from "./components/CensoManualForm";

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

function CensosPageContent() {
  const {
    Censos,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshCensos,
    handleFilterChange,
    handleSearch,
    handlePageChange,
  } = useCensosData();

  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [createModalMode, setCreateModalMode] = useState<"create" | "upload">("create");

  const modals = useCensosModals();

  const {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useCensosMutations({
    refreshCensos,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const censoFormRef = useRef<CensoManualFormRef>(null);
  const [isFormValid, setIsFormValid] = useState(false);

  // Limpiar formulario al abrir el modal en modo creación (como en CategoryModal)
  useEffect(() => {
    if (modals.isFormOpen && !modals.editingCenso) {
      censoFormRef.current?.reset();
    }
  }, [modals.isFormOpen, modals.editingCenso]);

  const handleAddClick = () => {
    setShowSelectionModal(true);
  };

  const handleSelectManual = () => {
    setCreateModalMode("create");
    modals.openCreate();
    setShowSelectionModal(false);
  };

  const handleSelectTemplate = () => {
    setCreateModalMode("upload");
    modals.openCreate();
    setShowSelectionModal(false);
  };

  const handleCloseSelection = () => {
    setShowSelectionModal(false);
  };

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar categoría";
    confirmMessage = `¿Estás seguro de que quieres desactivar la categoría "${modals.actionCenso?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar categoría";
    confirmMessage = `¿Estás seguro de que quieres restaurar la categoría "${modals.actionCenso?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE la categoría "${modals.actionCenso?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      <CensosToolbar
        filter={filter}
        searchTerm={searchTerm}
        isSubmitting={isSubmitting}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearch}
        onAddClick={handleAddClick}
        onBulkUpload={handleBulkUpload}
      />

      <div className="p-4">
        <CensosCards
          censos={Censos}
          meta={meta}
          loading={loading}
          error={error}
          onEdit={modals.openEdit}
          onBan={(u) => modals.openConfirm(u, "ban")}
          onRestore={(u) => modals.openConfirm(u, "restore")}
          onDelete={(u) => modals.openConfirm(u, "delete")}
        />

        <div className="border-t border-gray-200 bg-gray-50 mt-6">
          <Pagination
            meta={meta}
            links={links}
            onPageClick={handlePageChange}
          />
        </div>
      </div>

      {/* Modales */}
      <CensoCreateSelectionModal
        isOpen={showSelectionModal}
        onClose={handleCloseSelection}
        onSelectManual={handleSelectManual}
        onSelectTemplate={handleSelectTemplate}
      />

      <CensoCreateModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        onClose={modals.closeForm}
        onSave={(data) => handleSave(data, modals.editingCenso)}
        onBulkUpload={handleBulkUpload}
        mode={createModalMode}
        editingCenso={modals.editingCenso}
        formRef={censoFormRef}
        onFormValidityChange={setIsFormValid}
        isFormValid={isFormValid}
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
        onConfirm={() =>
          handleConfirmAction(modals.actionCenso, modals.actionType)
        }
      />

      <ViewCensoModal
        isOpen={modals.isViewOpen}
        Censo={modals.viewingCenso}
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

export default function Censos() {
  return (
    <ToastProvider>
      <CensosPageContent />
    </ToastProvider>
  );
}