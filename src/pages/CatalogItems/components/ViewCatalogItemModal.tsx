import { X } from "lucide-react";
import type { ViewCatalogItemModalProps } from "../CatalogItems.types";

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";

  try {
    return new Date(dateString).toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "Fecha invalida";
  }
};

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500">{label}</label>
      <p className="text-lg text-gray-900 font-semibold">{value || "N/A"}</p>
    </div>
  );
}

export function ViewCatalogItemModal({
  isOpen,
  onClose,
  catalogItem,
}: ViewCatalogItemModalProps) {
  if (!isOpen || !catalogItem) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">Detalle del item de catalogo</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <DetailRow label="Valor:" value={catalogItem.value} />
            <DetailRow label="Etiqueta:" value={catalogItem.label} />
            <DetailRow
              label="Catalogo:"
              value={catalogItem.catalog_name ?? catalogItem.catalog?.name ?? "Catalogo deshabilitado"}
            />
            <DetailRow label="Fecha de creacion:" value={formatDate(catalogItem.created_at)} />
            <DetailRow
              label="Fecha de desactivacion:"
              value={formatDate(catalogItem.deleted_at)}
            />
          </div>

          <div className="flex justify-end items-center gap-4 p-4 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
