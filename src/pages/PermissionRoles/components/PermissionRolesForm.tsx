import React from "react";

export type RoleOption = {
  id: string;     
  name: string;
};

type Props = {
  roleId: string; 
  roles: RoleOption[];

  description: string;

  onChange: (field: "roleId" | "description", value: string) => void;
  disabled?: boolean;
  disableRoleSelect?: boolean; 
  isLoadingRoles?: boolean;
};

const PermissionRolesForm: React.FC<Props> = ({
  roleId,
  roles,
  description,
  onChange,
  disabled = false,
  disableRoleSelect = false,
  isLoadingRoles = false,
}) => {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-12">
      {/* SELECT ROLE */}
      <div className="sm:col-span-4">
        <label className="block text-sm font-medium text-slate-700">
          Rol <span className="text-[#9D2449]">*</span>
        </label>

        <select
          value={roleId}
          onChange={(e) => onChange("roleId", e.target.value)}
          disabled={disabled || disableRoleSelect || isLoadingRoles}
          className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#9D2449]/40 disabled:bg-slate-100"
        >
          <option value="" disabled>
            {isLoadingRoles ? "Cargando roles..." : "Selecciona un rol..."}
          </option>

          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:col-span-8">
        <label className="block text-sm font-medium text-slate-700">
          Descripción <span className="text-[#9D2449]">*</span>
        </label>
        <input
          value={description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Descripción *"
          disabled={disabled}
          className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#9D2449]/40 disabled:bg-slate-100"
        />
      </div>
    </div>
  );
};

export default PermissionRolesForm;