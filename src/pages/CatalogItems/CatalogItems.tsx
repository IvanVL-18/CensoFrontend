import { useState, useEffect } from "react";
import { useCatalogItemsData } from "./hooks/useCatalogItemsData";
import { useCatalogItemsModals } from "./hooks/useCatalogItemsModals";
import { useCatalogItemsMutations } from "./hooks/useCatalogItemsMutations";
import { getCatalogItem, getCatalogsForSelect } from "./CatalogItems.service";
import { CatalogItemsToolbar } from "./components/CatalogItemsToolbar";
import { CatalogItemsTable } from "./components/CatalogItemsTable";
import Pagination from "../../components/Pagination";
import { CatalogItemModal } from "./components/CatalogItemModal";
import { ConfirmModal } from "./components/ConfirmModal";
import { ViewCatalogItemModal } from "./components/ViewCatalogItemModal";

import { ToastProvider, useToast } from "../../context/ToastContext";
import { Toast } from "../../components/Toast";
import type { CatalogOption, CatalogItem } from "./CatalogItems.types";

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

function getCatalogName(catalogItem: CatalogItem): string {
  return catalogItem.catalog_name ?? catalogItem.catalog?.name ?? "Catalogo deshabilitado";
}

function getCatalogEncryptedId(catalogItem: CatalogItem): string {
  if (catalogItem.catalog_eid) return String(catalogItem.catalog_eid);
  if (typeof catalogItem.catalog?.id === "string") return catalogItem.catalog.id;
  return "";
}

function CatalogItemsPageContent() {
  const [catalogs, setCatalogs] = useState<CatalogOption[]>([]);
  const [baseCatalogs, setBaseCatalogs] = useState<CatalogOption[]>([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);

  const {
    catalogItems,
    loading,
    error,
    meta,
    links,
    filter,
    searchTerm,
    refreshDependencies,
    handleFilterChange,
    handleSort,
    handleSearch,
    handlePageChange,
  } = useCatalogItemsData();

  const modals = useCatalogItemsModals();

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    const fetchCatalogs = async () => {
      setLoadingCatalogs(true);
      try {
        let allCatalogs: CatalogOption[] = [];
        let currentPage = 1;
        let lastPage = 1;

        do {
          const response = await getCatalogsForSelect(currentPage, controller.signal);
          allCatalogs = [...allCatalogs, ...response.data];
          lastPage = response.lastPage;
          currentPage += 1;
        } while (currentPage <= lastPage);

        const uniqueCatalogs = Array.from(
          new Map(allCatalogs.map((catalog) => [catalog.id, catalog])).values(),
        );

        if (!ignore) {
          setCatalogs(uniqueCatalogs);
          setBaseCatalogs(uniqueCatalogs);
        }
      } catch (fetchError: unknown) {
        const err = fetchError as { name?: string };
        if (err?.name !== "CanceledError" && !ignore) {
          console.error("Error al cargar catalogos activos", fetchError);
          setCatalogs([]);
          setBaseCatalogs([]);
        }
      } finally {
        if (!ignore) setLoadingCatalogs(false);
      }
    };

    fetchCatalogs();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const editingItem = modals.editingCatalogItem;

    if (!editingItem) {
      setCatalogs(baseCatalogs);
      return;
    }

    const selectedCatalogId = getCatalogEncryptedId(editingItem);
    const selectedCatalogName = getCatalogName(editingItem);

    if (!selectedCatalogId) {
      setCatalogs(baseCatalogs);
      return;
    }

    const exists = baseCatalogs.some((catalog) => catalog.id === selectedCatalogId);
    if (exists) {
      setCatalogs(baseCatalogs);
      return;
    }

    setCatalogs([
      ...baseCatalogs,
      {
        id: selectedCatalogId,
        name: selectedCatalogName,
      },
    ]);
  }, [modals.editingCatalogItem, baseCatalogs]);

  const {
    isSubmitting,
    mutationError,
    clearMutationError,
    handleSave,
    handleConfirmAction,
  } = useCatalogItemsMutations({
    refreshDependencies,
    closeForm: modals.closeForm,
    closeConfirm: modals.closeConfirm,
  });

  const handleViewClick = async (partialCatalogItem: CatalogItem) => {
    try {
      const fullCatalogItem = await getCatalogItem(partialCatalogItem.id);
      modals.openView({
        ...partialCatalogItem,
        ...fullCatalogItem,
      });
    } catch (viewError) {
      console.error("Error al cargar detalles del item de catalogo", viewError);
    }
  };

  const modalTitle = modals.editingCatalogItem ? "Editar item de catalogo" : "Agregar item de catalogo";
  const modalInitialValue = modals.editingCatalogItem?.value || "";
  const modalInitialLabel = modals.editingCatalogItem?.label || "";
  const modalInitialCatalogId = modals.editingCatalogItem
    ? getCatalogEncryptedId(modals.editingCatalogItem)
    : "";
  const modalInitialCatalogName = modals.editingCatalogItem
    ? getCatalogName(modals.editingCatalogItem)
    : "";

  let confirmTitle = "";
  let confirmMessage = "";
  let confirmButtonText = "";
  let confirmButtonColor: "danger" | "primary" = "danger";

  if (modals.actionType === "ban") {
    confirmTitle = "Desactivar item";
    confirmMessage = `Estas seguro de que quieres desactivar el item "${modals.actionCatalogItem?.label}"?`;
    confirmButtonText = "Desactivar";
    confirmButtonColor = "danger";
  } else if (modals.actionType === "restore") {
    confirmTitle = "Restaurar item";
    confirmMessage = `Estas seguro de que quieres restaurar el item "${modals.actionCatalogItem?.label}"?`;
    confirmButtonText = "Restaurar";
    confirmButtonColor = "primary";
  } else if (modals.actionType === "delete") {
    confirmTitle = "Eliminar permanentemente";
    confirmMessage = `Atencion: estas seguro de que quieres eliminar permanentemente el item "${modals.actionCatalogItem?.label}"? Esta accion no se puede deshacer.`;
    confirmButtonText = "Eliminar";
    confirmButtonColor = "danger";
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden relative">
      <ToastContainer />

      <CatalogItemsToolbar
        filter={filter}
        searchTerm={searchTerm}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearch}
        onAddClick={() => {
          clearMutationError();
          modals.openCreate();
        }}
      />

      <div className="p-4">
        <CatalogItemsTable
          loading={loading}
          error={error}
          catalogItems={catalogItems}
          meta={meta}
          onSort={handleSort}
          onView={handleViewClick}
          onEdit={(catalogItem) => {
            clearMutationError();
            void modals.openEdit(catalogItem);
          }}
          onBan={(catalogItem) => {
            clearMutationError();
            modals.openConfirm(catalogItem, "ban");
          }}
          onRestore={(catalogItem) => {
            clearMutationError();
            modals.openConfirm(catalogItem, "restore");
          }}
          onDelete={(catalogItem) => {
            clearMutationError();
            modals.openConfirm(catalogItem, "delete");
          }}
        />

        <div className="border-t border-gray-200 bg-gray-50">
          <Pagination meta={meta} links={links} onPageClick={handlePageChange} />
        </div>
      </div>

      <CatalogItemModal
        isOpen={modals.isFormOpen}
        isSubmitting={isSubmitting || loadingCatalogs}
        error={mutationError}
        title={modalTitle}
        initialValue={modalInitialValue}
        initialLabel={modalInitialLabel}
        initialCatalogId={modalInitialCatalogId}
        initialCatalogName={modalInitialCatalogName}
        catalogs={catalogs}
        onClose={() => {
          clearMutationError();
          modals.closeForm();
        }}
        onSave={(value, label, catalogId) =>
          handleSave(value, label, catalogId, modals.editingCatalogItem)
        }
        onClearServerError={clearMutationError}
      />

      <ConfirmModal
        isOpen={modals.isConfirmOpen}
        isSubmitting={isSubmitting}
        error={mutationError}
        title={confirmTitle}
        message={confirmMessage}
        confirmButtonText={confirmButtonText}
        confirmButtonColor={confirmButtonColor}
        onClose={() => {
          clearMutationError();
          modals.closeConfirm();
        }}
        onConfirm={() =>
          handleConfirmAction(modals.actionCatalogItem, modals.actionType)
        }
      />

      <ViewCatalogItemModal
        isOpen={modals.isViewOpen}
        catalogItem={modals.viewingCatalogItem}
        onClose={modals.closeView}
      />
    </div>
  );
}

export default function CatalogItems() {
  return (
    <ToastProvider>
      <CatalogItemsPageContent />
    </ToastProvider>
  );
}
