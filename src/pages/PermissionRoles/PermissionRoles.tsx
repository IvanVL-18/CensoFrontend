import React, { useEffect, useMemo, useState } from "react";
import { Home, Settings, Shield } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import PermissionRolesToolbar from "./components/PermissionRolesToolbar";
import PermissionRolesForm, { type RoleOption } from "./components/PermissionRolesForm";
import PermissionTabs from "./components/PermissionTabs";
import PermissionModuleCard from "./components/PermissionModuleCard";
import FormErrors from "./components/FormErrors";

import type { PermissionModule, PermissionScope, PermissionTab } from "./PermissionRoles.types";
import { usePermissionRolesState } from "./hooks/usePermissionRolesState";

// ✅ ya tienes getRol
import { getRol } from "../Roles/Roles.service";

// ✅ AGREGA esta función en Roles.service.ts (te la dejo abajo)
// y luego la importas aquí:
import { getRolesSelector } from "../Roles/Roles.service";

const PermissionRoles: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ✅ llega de la URL: /permission-roles?role=xxxxx
  const roleParamId = searchParams.get("role");

  // Tabs como tu diseño
  const tabs: PermissionTab[] = [
    { key: "home", label: "Inicio", icon: Home },
    { key: "admin", label: "Administración", icon: Shield },
    { key: "operation", label: "Operación", icon: Settings },
  ];

  // Módulos por sección
  const MODULES_BY_SCOPE: Record<PermissionScope, PermissionModule[]> = {
    home: [
      { key: "home.dashboard", label: "Dashboard", icon: Home },
      { key: "home.notifications", label: "Notificaciones", icon: Settings, actions: ["view"] },
    ],
    admin: [
      { key: "admin.users", label: "Usuarios", icon: Shield },
      { key: "admin.roles", label: "Roles", icon: Shield },
      { key: "admin.sectors", label: "Sectores", icon: Settings },
    ],
    operation: [
      { key: "op.institutions", label: "Instituciones", icon: Settings },
      { key: "op.areas", label: "Áreas", icon: Settings },
      { key: "op.occupations", label: "Ocupaciones", icon: Settings },
    ],
  };

  const allModules = useMemo(() => Object.values(MODULES_BY_SCOPE).flat(), []);
  const [activeScope, setActiveScope] = useState<PermissionScope>("admin");

  // ✅ ahora el “rol seleccionado” (FK)
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  // Para banner
  const [roleName, setRoleName] = useState<string>("");

  // Lista roles para el select
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [rolesLoading, setRolesLoading] = useState<boolean>(true);

  const { perms, setOne, setManyModulesAll, setModuleAll, allowAll } =
    usePermissionRolesState(allModules);

  const currentModules = MODULES_BY_SCOPE[activeScope];

  const onAllowAllScope = () => {
    setManyModulesAll(currentModules.map((m) => m.key), true);
  };

  // ✅ cargar roles para el selector
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setRolesLoading(true);
        const list = await getRolesSelector(); // [{id,name}]
        if (!mounted) return;
        setRoles(list);
      } catch (e) {
        console.error("Error cargando roles para selector", e);
        if (!mounted) return;
        setRoles([]);
      } finally {
        if (mounted) setRolesLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ✅ si viene role por URL, lo fijamos como seleccionado
  useEffect(() => {
    if (!roleParamId) return;
    setSelectedRoleId(roleParamId);
  }, [roleParamId]);

  // ✅ cargar datos del rol para banner / descripción
  useEffect(() => {
    if (!selectedRoleId) return;

    (async () => {
      try {
        const fullRol: any = await getRol(selectedRoleId);
        setRoleName(fullRol?.name ?? "");
        if (fullRol?.description) setDescription(fullRol.description);

        // ⚠️ aquí después precargamos permisos reales cuando tengas el JSON
      } catch (e) {
        console.error("Error al cargar detalles del Rol", e);
      }
    })();
  }, [selectedRoleId]);

  const onChangeField = (field: "roleId" | "description", value: string) => {
    if (field === "roleId") {
      setSelectedRoleId(value);

      // opcional: si ya está en el array, pinta el nombre rápido
      const found = roles.find((r) => r.id === value);
      if (found) setRoleName(found.name);
    }

    if (field === "description") setDescription(value);
  };

  const onSubmit = () => {
    const nextErrors: string[] = [];

    if (!selectedRoleId) nextErrors.push("Selecciona un rol.");
    if (!description.trim()) nextErrors.push("La descripción es obligatoria.");

    setErrors(nextErrors);
    if (nextErrors.length) return;

    const payload = {
      role_id: selectedRoleId,
      description: description.trim(),
      permissions: perms,
    };

    console.log("SAVE Permission Role:", payload);
    alert("Listo ✅ (por ahora solo imprime en consola).");
  };

  return (
    <div className="w-full bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <PermissionRolesToolbar onAllowAll={allowAll} />

          {/* Banner */}
          {selectedRoleId && (
            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
              <span className="font-semibold text-[#611232]">Asignando permisos a:</span>{" "}
              <span className="text-slate-700">{roleName || "Rol seleccionado"}</span>
            </div>
          )}

          <PermissionRolesForm
            roleId={selectedRoleId}
            roles={roles}
            description={description}
            onChange={onChangeField}
            disableRoleSelect={!!roleParamId} // ✅ si viene de modal, no lo cambies
            isLoadingRoles={rolesLoading}
          />

          <FormErrors errors={errors} />

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#611232]">Permisos</span>
              <span className="h-px w-24 bg-slate-200 sm:w-40" />
            </div>

            <button
              type="button"
              onClick={onAllowAllScope}
              className="text-sm font-semibold text-[#611232] hover:underline"
            >
              Permitir todo en esta sección
            </button>
          </div>

          <PermissionTabs tabs={tabs} active={activeScope} onChange={setActiveScope} />

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentModules.map((m) => (
              <PermissionModuleCard
                key={m.key}
                module={m}
                value={perms[m.key]}
                onToggle={(action, next) => setOne(m.key, action, next)}
                onToggleAll={(next) => setModuleAll(m.key, next)}
              />
            ))}
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onSubmit}
              className="rounded-md bg-[#611232] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9D2449]"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionRoles;