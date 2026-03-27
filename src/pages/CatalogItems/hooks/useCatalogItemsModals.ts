import { useState, useCallback } from "react";
import { getCatalogItem } from "../CatalogItems.service";
import type { CatalogItem } from "../CatalogItems.types";

function getCatalogName(item: CatalogItem): string | null {
  return item.catalog_name ?? item.catalog?.name ?? null;
}

function getCatalogEncryptedId(item: CatalogItem): string {
  if (item.catalog_eid) return String(item.catalog_eid);
  if (typeof item.catalog?.id === "string") return item.catalog.id;
  return "";
}

export function useCatalogItemsModals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCatalogItem, setEditingCatalogItem] = useState<CatalogItem | null>(null);

  const openCreate = useCallback(() => {
    setEditingCatalogItem(null);
    setIsFormOpen(true);
  }, []);

  const openEdit = useCallback(async (catalogItem: CatalogItem) => {
    try {
      const fullCatalogItem = await getCatalogItem(catalogItem.id);

      setEditingCatalogItem({
        ...catalogItem,
        ...fullCatalogItem,
        catalog_name: getCatalogName(fullCatalogItem) ?? getCatalogName(catalogItem),
        catalog_eid: getCatalogEncryptedId(fullCatalogItem) || getCatalogEncryptedId(catalogItem),
      });
    } catch (error) {
      console.error("Error al cargar detalles del item de catalogo:", error);
      setEditingCatalogItem(catalogItem);
    } finally {
      setIsFormOpen(true);
    }
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingCatalogItem(null);
  }, []);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingCatalogItem, setViewingCatalogItem] = useState<CatalogItem | null>(null);

  const openView = useCallback((catalogItem: CatalogItem) => {
    setViewingCatalogItem(catalogItem);
    setIsViewOpen(true);
  }, []);

  const closeView = useCallback(() => {
    setIsViewOpen(false);
    setViewingCatalogItem(null);
  }, []);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [actionCatalogItem, setActionCatalogItem] = useState<CatalogItem | null>(null);
  const [actionType, setActionType] = useState<"ban" | "restore" | "delete" | null>(null);

  const openConfirm = useCallback(
    (catalogItem: CatalogItem, type: "ban" | "restore" | "delete") => {
      setActionCatalogItem(catalogItem);
      setActionType(type);
      setIsConfirmOpen(true);
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setIsConfirmOpen(false);
    setActionCatalogItem(null);
    setActionType(null);
  }, []);

  return {
    isFormOpen,
    editingCatalogItem,
    openCreate,
    openEdit,
    closeForm,

    isViewOpen,
    viewingCatalogItem,
    openView,
    closeView,

    isConfirmOpen,
    actionCatalogItem,
    actionType,
    openConfirm,
    closeConfirm,
  };
}
