import { X, User } from "lucide-react";
import { useEffect, useState } from "react";

type UserProfile = {
  firstName: string;
  lastName: string;
  organization: string;
  jobTitle: string;
  email: string;
  fixedPhone: string;
  mobilePhone: string;
  address: string;
  progress: string;
  role: string;
};

type RoleOption = {
  value: string;
  label: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  user: UserProfile;
  roles: RoleOption[];
  onRoleChange?: (role: string) => void;
};

export default function ProfileModal({
  open,
  onClose,
  user,
  roles,
  onRoleChange,
}: Props) {
  const [selectedRole, setSelectedRole] = useState(user.role);

  useEffect(() => {
    setSelectedRole(user.role);
  }, [user, open]);

  if (!open) return null;

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    onRoleChange?.(value);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl lg:p-6 p-4 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Perfil del usuario
          </h2>
          <p className="text-sm text-gray-500">
            Consulta y administra la información básica del usuario.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[240px,1fr] gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-3">
              <User className="w-10 h-10 text-gray-400" />
            </div>

            <h3 className="text-sm font-semibold text-gray-900 text-center">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-xs text-gray-500 text-center">
              {user.jobTitle || "Puesto no registrado"}
            </p>

            <a
              href={`mailto:${user.email}`}
              className="mt-2 text-xs text-[var(--pantone-7421)] hover:underline break-all text-center"
            >
              {user.email}
            </a>

            <div className="mt-4 w-full">
              <label className="block text-[11px] font-medium text-gray-600 mb-1">
                Rol
              </label>
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/60 focus:border-[var(--pantone-7421)]"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 text-xs">
                  ▾
                </span>
              </div>
              <p className="mt-1 text-[10px] text-gray-500">
                Selecciona el tipo de usuario asignado.
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Nombre (s)
                </label>
                <input
                  type="text"
                  defaultValue={user.firstName}
                  placeholder="Nombre"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/60 focus:border-[var(--pantone-7421)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Nombre de la Organización
                </label>
                <input
                  type="text"
                  defaultValue={user.organization}
                  placeholder="Nombre de la organización"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/60 focus:border-[var(--pantone-7421)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Apellidos
                </label>
                <input
                  type="text"
                  defaultValue={user.lastName}
                  placeholder="Apellidos"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/60 focus:border-[var(--pantone-7421)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Puesto
                </label>
                <input
                  type="text"
                  defaultValue={user.jobTitle}
                  placeholder="Puesto"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/60 focus:border-[var(--pantone-7421)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Teléfono fijo
                </label>
                <input
                  type="text"
                  defaultValue={user.fixedPhone}
                  placeholder="7711777344"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/60 focus:border-[var(--pantone-7421)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Teléfono móvil
                </label>
                <input
                  type="text"
                  defaultValue={user.mobilePhone}
                  placeholder="Número móvil"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/60 focus:border-[var(--pantone-7421)]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  defaultValue={user.address}
                  placeholder="Dirección"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/60 focus:border-[var(--pantone-7421)]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Progreso
                </label>
                <input
                  type="text"
                  defaultValue={user.progress}
                  placeholder="Cuestionarios asignados"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/60 focus:border-[var(--pantone-7421)]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg border border-gray-300 text-xs text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-lg bg-[var(--pantone-7421)] text-xs text-white hover:bg-[var(--pantone-7421)]/90"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
