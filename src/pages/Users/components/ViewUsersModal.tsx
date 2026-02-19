import { X } from "lucide-react";
import type { ViewUserModalProps } from "../Users.types";

const formatDate = (dateString: string | null) => {
  if (!dateString) {
    return "N/A"; 
  }
  try {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (e) {
    return "Fecha inválida";
  }
};

function DetailRow({ label, value }: { label: string, value: string | null }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500">
        {label}
      </label>
      <p className="text-lg text-gray-900 font-semibold">{value || "N/A"}</p>
    </div>
  );
}

export function ViewUserModal({ isOpen, onClose, User }: ViewUserModalProps) {
  if (!isOpen || !User) {
    return null;
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-blue bg-opacity-30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}>
      </div>

      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">

          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">Detalle del Usuario</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto">
            <DetailRow 
              label="Nombre Completo:" 
              value={`${User.name || ""} ${User.lastname || ""}`.trim()} 
            />
            <DetailRow label="Correo Electrónico:" value={User.email} />
            <DetailRow label="Teléfono:" value={User.phone} />
            <DetailRow label="Celular:" value={User.mobile} />
            <DetailRow label="Dirección:" value={User.address} />
            
            <hr className="border-gray-200" />
            <DetailRow label="Rol:" value={User.role?.name || "N/A"} />
            <DetailRow label="Ocupación:" value={User.occupation?.name || "N/A"} />
            <DetailRow label="Área:" value={User.area?.name || "N/A"} />
            <DetailRow label="Institución:" value={User.institution?.name || "N/A"} />
            <hr className="border-gray-200" />
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
              className="
                bg-[#C3A67C] text-white font-bold 
                py-2 px-6 rounded-lg 
                hover:brightness-95
              "
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}