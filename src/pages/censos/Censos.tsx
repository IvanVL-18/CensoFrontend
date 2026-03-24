import { useState, useRef, useEffect } from "react";
import { useCensosData } from "./hooks/useCensosData";
import { useCensosModals } from "./hooks/useCensosModals";
import { useCensosMutations } from "./hooks/useCensosMutations";
import { CensosToolbar } from "./components/CensosToolbar";
import { CensosCards } from "./components/CensosCards";
import Pagination from "../../components/Pagination";
import { CensoCreateModal } from "./components/CensoCreateModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewCensoModal } from "./components/ViewCensosModal";
import { BulkErrorModal } from "./components/BulkErrorModal";
import { ToastProvider, useToast } from "../../context/ToastContext";
import { Toast } from "../../components/Toast";
import type { CensoManualFormRef } from "./components/CensoManualForm";
import { useNavigate } from "react-router-dom";
import { CloneCensoModal } from "./components/CloneCensoModal";

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
  const navigate = useNavigate();

  const [createModalMode, setCreateModalMode] = useState<"create" | "upload">(
    "create",
  );
  const [formKey, setFormKey] = useState(0);

  const modals = useCensosModals();

  const {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
    clearMutationError,
  } = useCensosMutations({
    refreshCensos,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const censoFormRef = useRef<CensoManualFormRef>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (modals.isFormOpen && !modals.editingCenso) {
      censoFormRef.current?.reset();
    }
  }, [modals.isFormOpen, modals.editingCenso]);

  const handleAddClick = () => {
    setCreateModalMode("create");
    modals.openCreate();
    setFormKey((prev) => prev + 1);
  };

  const handleCloseForm = () => {
    modals.closeForm();
    setIsFormValid(false);
    setIsDirty(false);
    clearMutationError();
  };

  const handleOpenEdit = (censo: any) => {
    modals.openEdit(censo);
    setFormKey((prev) => prev + 1);
    setIsFormValid(false);
    setIsDirty(false);
    clearMutationError();
  };

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar censo";
    confirmMessage = `¿Estás seguro de que quieres desactivar el censo "${modals.actionCenso?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar censo";
    confirmMessage = `¿Estás seguro de que quieres restaurar el censo  "${modals.actionCenso?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el censo "${modals.actionCenso?.name}"? Esta acción no se puede deshacer.`;
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
          onEdit={handleOpenEdit}
          onView={(censo) => modals.openView(censo)}
          onBan={(u) => modals.openConfirm(u, "ban")}
          onRestore={(u) => modals.openConfirm(u, "restore")}
          onDelete={(u) => modals.openConfirm(u, "delete")}
          onModules={(censo) => navigate(`/censos/${censo.id}/modulos`)}
          onClone={(censo) => modals.openClone(censo)}
        />

        <div className="border-t border-gray-200 bg-gray-50 mt-6">
          <Pagination
            meta={meta}
            links={links}
            onPageClick={handlePageChange}
          />
        </div>
      </div>

      <CensoCreateModal
        key={formKey}
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        onClose={handleCloseForm}
        onSave={(data) => handleSave(data, modals.editingCenso)}
        onBulkUpload={handleBulkUpload}
        mode={createModalMode}
        editingCenso={modals.editingCenso}
        onFormValidityChange={setIsFormValid}
        isFormValid={isFormValid}
        onDirtyChange={setIsDirty}
        isDirty={isDirty}
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

      <CloneCensoModal
        isOpen={modals.isCloneOpen}
        onClose={modals.closeClone}
        targetCenso={modals.cloningCenso}
        onSuccess={refreshCensos}
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
