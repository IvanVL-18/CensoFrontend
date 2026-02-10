import { useCategoriesData } from "./hooks/useCategoriesData";
import { useCategoriesModals } from "./hooks/useCategoriesModals";
import { useCategoriesMutations } from "./hooks/useCategoriesMutations";
import { getCategory } from "./Categories.service";
import { CategoriesToolbar } from "./components/CategoriesToolbar";
import { CategoriesTable } from "./components/CategoriesTable";
import Pagination from "../../components/Pagination";
import { CategoryModal } from "./components/CategoriesModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewCategoryModal } from "./components/ViewCategoriesModal";
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

function CategoriesPageContent() {
  const {
    Categories,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshCategories,
    handleFilterChange,
    handleSort,
    handleSearch,
    handlePageChange,
  } = useCategoriesData();

  const handleViewClick = async (partialCategory: any) => {
    try {
      const fullCategory = await getCategory(partialCategory.id);
      modals.openView(fullCategory);
    } catch (error) {
      console.error("Error al cargar detalles de la categoría", error);
    }
  };
  const modals = useCategoriesModals();

  const {
    isSubmitting,
    mutationError,
    handleSave,
    handleConfirmAction,
    handleBulkUpload,
  } = useCategoriesMutations({
    refreshCategories,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
    openBulkError: modals.openBulkError,
  });

  const modalTitle = modals.editingCategory ? "Editar categoría" : "Agregar categoría";
  const modalInitialName = modals.editingCategory?.name || "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar categoría";
    confirmMessage = `¿Estás seguro de que quieres desactivar la categoría "${modals.actionCategory?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar categoría";
    confirmMessage = `¿Estás seguro de que quieres restaurar la categoría "${modals.actionCategory?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE la categoría "${modals.actionCategory?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      {/* Barra de Herramientas */}
      <CategoriesToolbar
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
        <CategoriesTable
          loading={loading}
          error={error}
          Categories={Categories}
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
      <CategoryModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={modalTitle}
        initialName={modalInitialName}
        onClose={modals.closeForm}
        onSave={(name) => handleSave(name, modals.editingCategory)}
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
          handleConfirmAction(modals.actionCategory, modals.actionType)
        }
      />

      {/* 3. Ver Detalle */}
      <ViewCategoryModal
        isOpen={modals.isViewOpen}
        Category={modals.viewingCategory}
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

export default function Categories() {
  return (
    <ToastProvider>
      <CategoriesPageContent />
    </ToastProvider>
  );
}
