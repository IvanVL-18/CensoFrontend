import { useQuestions } from "./useQuestions";
import { QuestionsToolbar } from "./QuestionsToolbar";
import { QuestionsTable } from "./QuestionsTable";
import Pagination from "../../components/Pagination";
import { QuestionModal } from "./QuestionModal";
import { ConfirmModal } from "./ConfirmModal";
import { ViewQuestionModal } from "./ViewQuestionModal";

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
    loading,
    error,
    sortedQuestions,
    meta,
    links,
    filter,
    searchTerm,
    isModalOpen,
    isSubmitting,
    modalError,
    editingQuestion,
    isConfirmModalOpen,
    actionQuestion,
    actionType,
    isViewModalOpen,
    viewingQuestion,
    handleFilterChange,
    handleSearchChange,
    handleSort,
    handlePageClick,
    handleAddClick,
    handleModalClose,
    handleModalSave,
    onView,
    onEdit,
    onBan,
    onRestore,
    onDelete,
    handleViewModalClose,
    handleConfirmModalClose,
    handleConfirmAction,
  } = useQuestions();

  const modalTitle = editingQuestion ? "Editar Pregunta" : "Agregar Pregunta";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (actionType === "ban") {
    confirmTitle = "Desactivar Pregunta";
    confirmMessage = `¿Estás seguro de que quieres desactivar el pregunta"${actionQuestion?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (actionType === "restore") {
    confirmTitle = "Restaurar Pregunta";
    confirmMessage = `¿Estás seguro de que quieres restaurar el pregunta"${actionQuestion?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE la pregunta"${actionQuestion?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      <QuestionsToolbar
        filter={filter}
        searchTerm={searchTerm}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
      />

      <div className="p-4">
        <QuestionsTable
          loading={loading}
          error={error}
          questions={sortedQuestions}
          meta={meta}
          onSort={handleSort}
          onView={onView}
          onEdit={onEdit}
          onBan={onBan}
          onRestore={onRestore}
          onDelete={onDelete}
        />

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

      <QuestionModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        error={modalError}
        title={modalTitle}
        initialData={editingQuestion ?? undefined}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        isSubmitting={isSubmitting}
        error={modalError}
        title={confirmTitle}
        message={confirmMessage}
        confirmButtonText={confirmButtonText}
        confirmButtonColor={confirmButtonColor}
        onClose={handleConfirmModalClose}
        onConfirm={handleConfirmAction}
      />

      <ViewQuestionModal
        isOpen={isViewModalOpen}
        question={viewingQuestion}
        onClose={handleViewModalClose}
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
