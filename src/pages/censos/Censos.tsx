import { useState } from "react";
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
    handleSort,
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

  const handleAddClick = () => setShowSelectionModal(true);

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

  const handleCloseSelection = () => setShowSelectionModal(false);

  const confirmConfig: Record<string, any> = {
    ban: {
      title: "Desactivar categoría",
      message: `¿Estás seguro de que quieres desactivar la categoría "${modals.actionCenso?.name}"?`,
      buttonText: "Desactivar",
      color: "danger",
    },
    restore: {
      title: "Restaurar categoría",
      message: `¿Estás seguro de que quieres restaurar la categoría "${modals.actionCenso?.name}"?`,
      buttonText: "Restaurar",
      color: "primary",
    },
    delete: {
      title: "Eliminar Permanentemente",
      message: `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE la categoría "${modals.actionCenso?.name}"? Esta acción no se puede deshacer.`,
      buttonText: "Eliminar",
      color: "danger",
    },
  };

  const currentConfirm = modals.actionType ? confirmConfig[modals.actionType] : null;

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
      />

      {currentConfirm && (
        <ConfirmModal
          isOpen={modals.isConfirmOpen}
          isSubmitting={isSubmitting}
          error={mutationError}
          title={currentConfirm.title}
          message={currentConfirm.message}
          confirmButtonText={currentConfirm.buttonText}
          confirmButtonColor={currentConfirm.color}
          onClose={modals.closeConfirm}
          onConfirm={() =>
            handleConfirmAction(modals.actionCenso, modals.actionType)
          }
        />
      )}

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