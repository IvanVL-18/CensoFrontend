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

  const handleViewClick = async (partialQuestion: any) => {
    try {
      const fullQuestion = await getQuestion(partialQuestion.id);
      modals.openView(fullQuestion);
    } catch (error) {
      console.error("Error al cargar detalles del módulo", error);
    }
  };
  const modals = useQuestionsModals();

  const {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useQuestionsMutations({
    refreshQuestions,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

 const modalTitle = modals.editingQuestion ? "Editar Pregunta" : "Nueva Pregunta";
  // CAMBIO: Pasamos el objeto completo como initialData
  const modalInitialData = modals.editingQuestion || null;

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar Módulo";
    confirmMessage = `¿Estás seguro de que quieres desactivar el módulo "${modals.actionQuestion?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar Módulo";
    confirmMessage = `¿Estás seguro de que quieres restaurar el módulo "${modals.actionQuestion?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el módulo "${modals.actionQuestion?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      {/* Barra de Herramientas */}
      <QuestionsToolbar
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
        <QuestionsTable
          loading={loading}
          error={error}
          Questions={Questions}
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
      <QuestionModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialData={modalInitialData} // USAMOS LA NUEVA PROP
        onClose={modals.closeForm}
        onSave={(data) => handleSave(data, modals.editingQuestion)} // Pasamos data completa
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
