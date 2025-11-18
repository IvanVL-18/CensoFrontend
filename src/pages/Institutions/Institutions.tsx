import { useInstitutions } from "./useInstitutions";
import { InstitutionsToolbar } from "./InstitutionsToolbar";
import { InstitutionsTable } from "./InstitutionsTable";
import { Pagination } from "./Pagination";
import { InstitutionModal } from "./InstitutionsModal";
import { ConfirmModal } from "./ConfirmModal";
import { ViewInstitutionModal } from "./ViewInstitutionsModal";
import { MapModal } from "./MapModal"; // <-- Importamos el nuevo modal
import { ToastProvider, useToast } from "../../context/ToastContext";
import { Toast } from "../../components/Toast";

// El resto de tu código...

// --- 1. Contenedor de Toasts ---
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

// --- 2. Componente Interno para el Contenido de la Página ---
function InstitutionsPageContent() {
  const hook = useInstitutions();
  const {
    loading,
    error,
    sortedUnits: sortedInstitutions,
    meta: paginationMeta,
    links,
    filter,
    searchTerm,
    isModalOpen,
    isSubmitting,
    modalError,
    editingInstitution,
    isConfirmModalOpen,
    actionInstitution,
    actionType,
    isViewModalOpen,
    viewingInstitution,
    isMapModalOpen,
    mapInstitution,
    handleFilterChange,
    handleSearchChange,
    handleSort,
    handlePageClick,
    handleAddClick,
    handleModalClose,
    onShowMap,
    handleModalSave,
    onView,
    onEdit,
    onBan,
    onRestore,
    onDelete,
    handleViewModalClose,
    handleConfirmModalClose,
    handleMapModalClose,
    handleConfirmAction,
  } = hook;

  // Si 'editingInstitution' tiene datos, el título es "Editar". Si no, "Agregar".
  const modalTitle = editingInstitution ? "Editar Institución" : "Agregar Institución";
  const initialName = editingInstitution ? editingInstitution.name : "";
  const initialMunicipality = editingInstitution ? editingInstitution.municipality : "";
  const initialGeocode = editingInstitution ? editingInstitution.geocode : "";
  const initialType = editingInstitution ? editingInstitution.typeinst : "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: 'danger' | 'primary' = 'danger';

  if (actionType === 'ban') {
    confirmTitle = "Desactivar Institución";
    confirmMessage = `¿Estás seguro de que quieres desactivar la institución "${actionInstitution?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (actionType === 'restore') {
    confirmTitle = "Restaurar Institución";
    confirmMessage = `¿Estás seguro de que quieres restaurar la institución "${actionInstitution?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (actionType === 'delete') {
    confirmTitle = "Eliminar Institución Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE la institución "${actionInstitution?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }


  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      {/* Contenedor de Toasts */}
      <ToastContainer />

      {/* Cabecera y Filtros */}
      <InstitutionsToolbar
        filter={filter}
        searchTerm={searchTerm}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
      />

      {/* Contenido Principal (Tabla y Paginación) */}
      <div className="p-4">
        {/* Tabla de datos */}
        <InstitutionsTable
          loading={loading}
          error={error}
          institutions={sortedInstitutions}
          meta={paginationMeta}
          onSort={handleSort}
          onShowMap={onShowMap} // <-- Pasamos la nueva función
          onView={onView}
          onEdit={onEdit}
          onBan={onBan}
          onRestore={onRestore}
          onDelete={onDelete}
        />

        {/* Paginación */}
        <Pagination
          meta={paginationMeta}
          links={links}
          loading={loading}
          error={error}
          onPageClick={handlePageClick}
        />
      </div>

      {/* Modales */}
      <InstitutionModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        error={modalError}
        title={modalTitle}
        initialName={initialName}
        initialMunicipality={initialMunicipality}
        initialGeocode={initialGeocode}
        initialType={initialType}
        onClose={handleModalClose} // La función del hook
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

      <ViewInstitutionModal
        isOpen={isViewModalOpen}
        unit={viewingInstitution}
        onClose={handleViewModalClose}
      />

      <MapModal
        isOpen={isMapModalOpen}
        onClose={handleMapModalClose}
        geocode={mapInstitution?.geocode || null}
        municipality={mapInstitution?.municipality || null}
        institutionName={mapInstitution?.name || null}
      />
    </div>
  );
}

// Componente Principal (Exportado)
export default function Institutions() {
  return (
    <ToastProvider>
      <InstitutionsPageContent />
    </ToastProvider>
  );
}
