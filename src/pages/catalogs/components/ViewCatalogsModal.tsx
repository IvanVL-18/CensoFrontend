import { X, AlertTriangle } from "lucide-react";
import type { ViewCatalogModalProps } from "../Catalogs.types";

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return "Fecha inválida";
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

export function ViewCatalogModal({ isOpen, onClose, Catalog }: ViewCatalogModalProps) {
  if (!isOpen || !Catalog) return null;

  const ModuleDisplay = Catalog.Module_name || null;
  const isModuleInactive = Catalog.Module_is_active === false;

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">Detalle del Catálogo</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {/* Alerta si la Modulo está inactiva */}
            {isModuleInactive && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
                  <p className="text-sm text-yellow-700">
                    <span className="font-bold">Modulo inactiva:</span> Esta Modulo ha sido desactivada. El catálogo aún existe pero su Modulo ya no está disponible.
                  </p>
                </div>
              </div>
            )}

            <DetailRow label="Nombre del catálogo:" value={Catalog.name} />
            <DetailRow label="Slug:" value={Catalog.slug} />
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Modulo:</label>
              <div className="flex items-center gap-2">
                <p className="text-lg text-gray-900 font-semibold">
                  {ModuleDisplay}
                </p>
                {isModuleInactive && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    Inactiva
                  </span>
                )}
              </div>
            </div>

            <DetailRow label="Fecha de creación:" value={formatDate(Catalog.created_at)} />
            
            {Catalog.deleted_at && (
              <div>
                <label className="block text-sm font-medium text-gray-500">Fecha de desactivación:</label>
                <p className="text-lg text-red-600 font-semibold">
                  {formatDate(Catalog.deleted_at)}
                </p>
              </div>
            )}
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