import { useQuestionsData } from "./hooks/useQuestionsData";
import { useQuestionsModals } from "./hooks/useQuestionsModals";
import { useQuestionsMutations } from "./hooks/useQuestionsMutations";
import { PreviewQuestionModal } from "./components/PreviewQuestionModal";
import { getQuestion } from "./Questions.service";
import { QuestionsToolbar } from "./components/QuestionsToolbar";
import { QuestionsTable } from "./components/QuestionsTable";
import Pagination from "../../components/Pagination";
import { QuestionModal } from "./components/QuestionsModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewQuestionModal } from "./components/ViewQuestionsModal";
import { BulkErrorModal } from "./components/BulkErrorModal";
import { ToastProvider, useToast } from "../../context/ToastContext";
import { useAuthContext } from "../../context/AuthContext";
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

function QuestionsPageContent() {
  const {
    Questions,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshQuestions,
    handleFilterChange,
    handleSort,
    handleSearch,
    handlePageChange,
  } = useQuestionsData();

  const modals = useQuestionsModals();

  const {
    isSubmitting,
    mutationError,
    clearMutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useQuestionsMutations({
    refreshQuestions,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const { hasPermission } = useAuthContext();

  const handleEditClick = async (partialQuestion: any) => {
    modals.openEdit(partialQuestion); 
    try {
      const fullQuestion = await getQuestion(partialQuestion.id);
      modals.openEdit(fullQuestion); 
    } catch {
    }
  };

  const handleViewClick = async (partialQuestion: any) => {
    try {
      const fullQuestion = await getQuestion(partialQuestion.id);
      modals.openView(fullQuestion);
    } catch {
      console.error("Error al cargar detalles de la pregunta");
    }
  };

  const modalTitle = modals.editingQuestion
    ? "Editar Pregunta"
    : "Nueva Pregunta";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Pregunta";
    confirmMessage = `¿Estás seguro de que quieres desactivar la pregunta "${modals.actionQuestion?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Pregunta";
    confirmMessage = `¿Estás seguro de que quieres restaurar la pregunta "${modals.actionQuestion?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE la pregunta "${modals.actionQuestion?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      <QuestionsToolbar
        filter={filter}
        searchTerm={searchTerm}
        isSubmitting={isSubmitting}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearch}
        onAddClick={modals.openCreate}
        onBulkUpload={handleBulkUpload}
        canCreate={hasPermission("questions.create")}
      />

      <div className="p-4">
        <QuestionsTable
          loading={loading}
          error={error}
          Questions={Questions}
          meta={meta}
          onSort={handleSort}
          onView={handleViewClick}
          onEdit={hasPermission("questions.edit") ? handleEditClick : undefined}
          onBan={hasPermission("questions.deactivate") ? (u) => modals.openConfirm(u, "ban") : undefined}
          onRestore={hasPermission("questions.restore") ? (u) => modals.openConfirm(u, "restore") : undefined}
          onDelete={hasPermission("questions.delete") ? (u) => modals.openConfirm(u, "delete") : undefined}
        />

        <div className="border-t border-gray-200 bg-gray-50">
          <Pagination
            meta={meta}
            links={links}
            onPageClick={handlePageChange}
          />
        </div>
      </div>

      {/* 1. Crear / Editar */}
      <QuestionModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialData={modals.editingQuestion || null}
        onClose={() => {
          clearMutationError(); 
          modals.closeForm();
        }}
        onSave={(data) => handleSave(data, modals.editingQuestion)}
        onClearServerError={clearMutationError} // ← igual que Dependencies
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
          handleConfirmAction(modals.actionQuestion, modals.actionType)
        }
      />

      {/* 3. Ver Detalle */}
      <ViewQuestionModal
        isOpen={modals.isViewOpen}
        Question={modals.viewingQuestion}
        onClose={modals.closeView}
        onOpenPreview={modals.openPreview}
      />

      <PreviewQuestionModal
        isOpen={modals.isPreviewOpen}
        onClose={modals.closePreview}
        questionId={modals.viewingQuestion?.id || null}
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

export default function Questions() {
  return (
    <ToastProvider>
      <QuestionsPageContent />
    </ToastProvider>
  );
}
