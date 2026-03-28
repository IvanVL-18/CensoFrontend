import { useState, useEffect } from "react";
import { useCensosData } from "./hooks/useCensusUserData";
import { useCensosModals } from "./hooks/useCensusUserModals";
import { useCensosMutations } from "./hooks/useCensusUserMutations";
import { CensosToolbar } from "./components/CensusUserToolbar";
import { CensosCards } from "./components/CensusUserCard";
import Pagination from "../../components/Pagination";
import { BulkErrorModal } from "./components/BulkErrorModal";
import { ToastProvider, useToast } from "../../context/ToastContext";
import { Toast } from "../../components/Toast";
import { useNavigate } from "react-router-dom";
import { getCenso } from "./CensusUser.service";
import type { Censo } from "./CensusUser.types";

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

  const [isFormValid, setIsFormValid] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isPreparingEdit, setIsPreparingEdit] = useState(false);
  const [descriptionCache, setDescriptionCache] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (modals.isFormOpen && !modals.editingCenso) {
     
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

  const handleOpenEdit = async (censo: Censo) => {
    if (isPreparingEdit) return;

    const censoId = String(censo.id);
    const cachedDescription = descriptionCache[censoId] ?? censo.description ?? "";

    setIsPreparingEdit(true);
    setIsFormValid(false);
    setIsDirty(false);
    clearMutationError();

    try {
      const fullCenso = await getCenso(censo.id);
      const resolvedDescription =
        fullCenso.description ?? cachedDescription;

      if (resolvedDescription.trim() !== "") {
        setDescriptionCache((prev) => ({
          ...prev,
          [censoId]: resolvedDescription.trim(),
        }));
      }

      modals.openEdit({
        ...censo,
        ...fullCenso,
        description: resolvedDescription,
        start_date: fullCenso.start_date ?? censo.start_date,
        end_date: fullCenso.end_date ?? censo.end_date,
      });
    } catch (err) {
      console.error("Error al cargar el detalle del censo:", err);
      modals.openEdit({
        ...censo,
        description: cachedDescription,
      });
    } finally {
      setFormKey((prev) => prev + 1);
      setIsPreparingEdit(false);
    }
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
          onModules={(censo) => navigate(`/census-user/${censo.id}/modulos`)}
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
