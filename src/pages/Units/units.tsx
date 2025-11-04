import { useUnits } from "./useUnits";
import { UnitsToolbar } from "./UnitsToolbar";
import { UnitsTable } from "./UnitsTable";
import { Pagination } from "./Pagination";
import { UnitModal } from "./UnitModal";
import { ConfirmModal } from "./ConfirmModal";
import { ViewUnitModal } from "./ViewUnitModal"; 

export default function Units() {
  const {
    loading,
    error,
    sortedUnits,
    meta,
    links,
    filter,
    searchTerm,
    isModalOpen,
    isSubmitting,
    modalError,
    editingUnit,
    isConfirmModalOpen,
    actionUnit,
    actionType,
    isViewModalOpen,
    viewingUnit,
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
  } = useUnits();
  // Si 'editingUnit' tiene datos, el título es "Editar". Si no, "Agregar".
  const modalTitle = editingUnit ? "Editar Modulo" : "Agregar Modulo";

  // Si 'editingUnit' tiene datos, pasamos el nombre. Si no, pasamos "".
  const modalInitialName = editingUnit ? editingUnit.name : "";

  

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  // Asignamos un tipo explícito a la variable
  let confirmButtonColor: 'danger' | 'primary' = 'danger';
  if (actionType === 'ban') {
    confirmTitle = "Desactivar Módulo";
    confirmMessage = `¿Estás seguro de que quieres desactivar el módulo "${actionUnit?.name}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (actionType === 'restore') {
    confirmTitle = "Restaurar Módulo";
    confirmMessage = `¿Estás seguro de que quieres restaurar el módulo "${actionUnit?.name}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (actionType === 'delete') {
    confirmTitle = "Eliminar Permanentemente";
    confirmMessage = `¡Atención! ¿Estás seguro de que quieres ELIMINAR PERMANENTEMENTE el módulo "${actionUnit?.name}"? Esta acción no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }
  

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden"> {/* Este es tu contenedor principal */}
      
      {/* --- Cabecera y Filtros --- */}
      <UnitsToolbar
        filter={filter}
        searchTerm={searchTerm}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onAddClick={handleAddClick}
      />

      {/* --- Contenido Principal (Tabla y Paginación) --- */}
      <div className="p-4">
        
        {/* --- Tabla de datos --- */}
        <UnitsTable
          loading={loading}
          error={error}
          units={sortedUnits}
          meta={meta}
          onSort={handleSort}
          onView={onView}
          onEdit={onEdit}
          onBan={onBan}
          onRestore={onRestore}
          onDelete={onDelete}
        />

        {/* --- Paginación --- */}
        <Pagination
          meta={meta}
          links={links}
          loading={loading}
          error={error}
          onPageClick={handlePageClick}
        />
      </div>
      
      {/* --- MUEVE ESTO AQUÍ --- */}
      {/* El modal se renderiza fuera del div p-4 para que el overlay funcione correctamente */}
      <UnitModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        error={modalError}
        title={modalTitle} 
        initialName={modalInitialName}
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

      <ViewUnitModal
        isOpen={isViewModalOpen}
        unit={viewingUnit}
        onClose={handleViewModalClose}
      />
    </div>
  );
}