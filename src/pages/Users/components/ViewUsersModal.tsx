import { X } from "lucide-react";
import type { ViewUserModalProps } from "../Users.types";

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
    return "Fecha inválida";
  }
};

const safeText = (value: string | null | undefined) => {
  const v = (value ?? "").toString().trim();
  return v.length > 0 ? v : "N/A";
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500">{label}</label>
      <p className="text-base text-gray-900 font-semibold break-words">
        {value}
      </p>
    </div>
  );
}

export function ViewUserModal({ isOpen, onClose, User }: ViewUserModalProps) {
  if (!isOpen || !User) return null;

  const fullName =
    [User.name, User.lastname]
      .filter((x) => (x ?? "").trim().length > 0)
      .join(" ") || "N/A";

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">
              Detalle del Usuario
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <DetailRow label="Nombre completo:" value={fullName} />
            <DetailRow label="Correo:" value={safeText(User.email)} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow label="Teléfono:" value={safeText(User.phone)} />
              <DetailRow label="Móvil:" value={safeText(User.movil)} />
            </div>

            <DetailRow label="Dirección:" value={safeText(User.address)} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailRow
                label="Rol (role_id):"
                value={safeText(User.role_id)}
              />
              <DetailRow
                label="Ocupación (occupation_id):"
                value={safeText(User.occupation_id)}
              />
            </div>

            <DetailRow
              label="Fecha de creación:"
              value={formatDate(User.created_at)}
            />
            <DetailRow
              label="Fecha de desactivación:"
              value={formatDate(User.deleted_at)}
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
