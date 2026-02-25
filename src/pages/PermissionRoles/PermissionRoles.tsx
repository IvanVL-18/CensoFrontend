import { useEffect, useMemo, useState } from "react";
import { Home, Settings, Shield, Users, Layers, Building2, Briefcase } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import PermissionRolesToolbar from "./components/PermissionRolesToolbar";
import PermissionTabs from "./components/PermissionTabs";
import FormErrors from "./components/FormErrors";
import GovSwitch from "./components/GovSwitch";

// ✅ NO consumir por ahora
// import { getPermissionRole, updatePermissionRole } from "./PermissionRoles.service";
import type { Permission } from "./PermissionRoles.service";

const DESIGN_ONLY = true; // ✅ ponlo en false cuando ya consumas API

type Scope = "home" | "admin" | "operation";
type Action = "view" | "create" | "edit" | "delete";

const ACTION_LABEL: Record<Action, string> = {
  view: "Ver",
  create: "Crear",
  edit: "Editar",
  delete: "Eliminar",
};

const moduleLabelMap: Record<string, string> = {
  dashboard: "Dashboard",
  notifications: "Notificaciones",
  users: "Usuarios",
  roles: "Roles",
  sectors: "Sectores",
  institutions: "Instituciones",
  areas: "Áreas",
  occupations: "Ocupaciones",
};

const moduleScopeMap: Record<string, Scope> = {
  dashboard: "home",
  notifications: "home",
  users: "admin",
  roles: "admin",
  sectors: "admin",
  institutions: "operation",
  areas: "operation",
  occupations: "operation",
};

const moduleIconMap: Record<string, any> = {
  dashboard: Home,
  notifications: Settings,
  users: Users,
  roles: Shield,
  sectors: Layers,
  institutions: Building2,
  areas: Layers,
  occupations: Briefcase,
};

const normalizeAction = (a: string): Action | null => {
  const x = a.toLowerCase();
  if (["view", "ver", "read", "show", "index", "list"].includes(x)) return "view";
  if (["create", "crear", "store", "add"].includes(x)) return "create";
  if (["edit", "editar", "update"].includes(x)) return "edit";
  if (["delete", "eliminar", "destroy", "remove"].includes(x)) return "delete";
  return null;
};

const parsePermission = (name: string) => {
  const parts = name.split(".");
  const actionRaw = parts.pop() || "";
  const module = parts.pop() || "otros";
  return { module, action: normalizeAction(actionRaw) };
};

// ✅ MOCK de permisos para diseño (mismo formato: {id, name})
const MOCK_PERMS: Permission[] = [
  { id: 1, name: "dashboard.view" } as Permission,
  { id: 2, name: "notifications.view" } as Permission,

  { id: 10, name: "users.view" } as Permission,
  { id: 11, name: "users.create" } as Permission,
  { id: 12, name: "users.edit" } as Permission,
  { id: 13, name: "users.delete" } as Permission,

  { id: 20, name: "roles.view" } as Permission,
  { id: 21, name: "roles.create" } as Permission,
  { id: 22, name: "roles.edit" } as Permission,
  { id: 23, name: "roles.delete" } as Permission,

  { id: 30, name: "sectors.view" } as Permission,
  { id: 31, name: "sectors.create" } as Permission,
  { id: 32, name: "sectors.edit" } as Permission,
  { id: 33, name: "sectors.delete" } as Permission,

  { id: 40, name: "institutions.view" } as Permission,
  { id: 41, name: "institutions.create" } as Permission,
  { id: 42, name: "institutions.edit" } as Permission,
  { id: 43, name: "institutions.delete" } as Permission,

  { id: 50, name: "areas.view" } as Permission,
  { id: 51, name: "areas.create" } as Permission,
  { id: 52, name: "areas.edit" } as Permission,
  { id: 53, name: "areas.delete" } as Permission,

  { id: 60, name: "occupations.view" } as Permission,
  { id: 61, name: "occupations.create" } as Permission,
  { id: 62, name: "occupations.edit" } as Permission,
  { id: 63, name: "occupations.delete" } as Permission,
];

export default function PermissionRoles() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const roleEnc = searchParams.get("role"); // puede venir null en diseño

  const [activeScope, setActiveScope] = useState<Scope>("admin");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [roleName, setRoleName] = useState("");
  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const tabs = [
    { key: "home" as const, label: "Inicio", icon: Home },
    { key: "admin" as const, label: "Administración", icon: Shield },
    { key: "operation" as const, label: "Operación", icon: Settings },
  ];

  useEffect(() => {
    // ✅ Modo diseño: llenar con mock y ya
    if (DESIGN_ONLY) {
      setErrors([]);
      setLoading(false);
      setRoleName("Rol seleccionado (Mock)");
      setAllPerms(MOCK_PERMS);
      setSelected(new Set([10, 11, 20, 40])); // algunos activados para ver switches
      return;
    }

    // 🔻 Cuando ya consumas API, aquí vuelves a tu lógica real
    // if (!roleEnc) return;
    // (async () => {
    //   try {
    //     setLoading(true);
    //     setErrors([]);
    //     const data = await getPermissionRole(roleEnc);
    //     setRoleName(data.role?.name ?? "");
    //     setAllPerms(data.permissionsCollection ?? []);
    //     const selectedIds = (data.role?.permissions ?? []).map((p) => p.id);
    //     setSelected(new Set(selectedIds));
    //   } catch (e) {
    //     console.error(e);
    //     setErrors(["No se pudo cargar permisos del rol."]);
    //   } finally {
    //     setLoading(false);
    //   }
    // })();
  }, [roleEnc]);

  const modulesByScope = useMemo(() => {
    type ModuleCard = {
      moduleKey: string;
      label: string;
      icon: any;
      scope: Scope;
      actions: Partial<Record<Action, number>>;
    };

    const map = new Map<string, ModuleCard>();

    allPerms.forEach((p) => {
      const { module, action } = parsePermission(p.name);
      if (!action) return;

      const scope = moduleScopeMap[module] ?? "operation";
      const label = moduleLabelMap[module] ?? module;
      const icon = moduleIconMap[module] ?? Settings;

      if (!map.has(module)) {
        map.set(module, { moduleKey: module, label, icon, scope, actions: {} });
      }
      map.get(module)!.actions[action] = p.id;
    });

    const acc: Record<Scope, ModuleCard[]> = { home: [], admin: [], operation: [] };
    for (const m of map.values()) acc[m.scope].push(m);

    return acc;
  }, [allPerms]);

  const currentModules = modulesByScope[activeScope];

  const togglePermission = (permissionId: number, next: boolean) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (next) n.add(permissionId);
      else n.delete(permissionId);
      return n;
    });
  };

  const allowAll = () => setSelected(new Set(allPerms.map((p) => p.id)));

  const allowAllScope = () => {
    const ids: number[] = [];
    currentModules.forEach((m) => {
      Object.values(m.actions).forEach((id) => id && ids.push(id));
    });
    setSelected((prev) => new Set([...prev, ...ids]));
  };

  const save = async () => {
    // ✅ Diseño: solo imprime y ya
    if (DESIGN_ONLY) {
      console.log("MOCK SAVE:", Array.from(selected));
      alert("Diseño: Guardado mock ✅ (revisa consola)");
      return;
    }

    // 🔻 Cuando consumas:
    // if (!roleEnc) { setErrors(["No se recibió el rol en la URL."]); return; }
    // try {
    //   setLoading(true); setErrors([]);
    //   await updatePermissionRole(roleEnc, Array.from(selected));
    //   alert("Permisos asignados correctamente ✅");
    //   navigate(-1);
    // } catch (e) {
    //   console.error(e);
    //   setErrors(["No se pudo guardar permisos."]);
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className="w-full bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <PermissionRolesToolbar onAllowAll={allowAll} />

          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <span className="font-semibold text-[#611232]">Asignando permisos a:</span>{" "}
            <span className="text-slate-700">{roleName || "Rol seleccionado"}</span>
          </div>

          {/* ✅ En diseño no mostramos error de API */}
          {!DESIGN_ONLY && <FormErrors errors={errors} />}

          <div className="mt-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#611232]">Permisos</span>
              <span className="h-px w-24 bg-slate-200 sm:w-40" />
            </div>

            <button
              type="button"
              onClick={allowAllScope}
              className="text-sm font-semibold text-[#611232] hover:underline disabled:opacity-60"
              disabled={loading}
            >
              Permitir todo en esta sección
            </button>
          </div>

          <PermissionTabs tabs={tabs as any} active={activeScope as any} onChange={setActiveScope as any} />

          {loading && <p className="mt-4 text-sm text-slate-500">Cargando...</p>}

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {currentModules.map((m) => {
              const Icon = m.icon;
              const actions = (Object.keys(ACTION_LABEL) as Action[]).filter((a) => !!m.actions[a]);

              const allOn = actions.length ? actions.every((a) => selected.has(m.actions[a]!)) : false;

              return (
                <div key={m.moduleKey} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#611232]/10">
                        <Icon className="h-5 w-5 text-[#611232]" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">{m.label}</h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => actions.forEach((a) => togglePermission(m.actions[a]!, !allOn))}
                      className="text-xs font-semibold text-[#611232] hover:underline"
                      disabled={!actions.length}
                    >
                      {allOn ? "Quitar todo" : "Permitir todo"}
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {actions.map((a) => {
                      const pid = m.actions[a]!;
                      return (
                        <div key={a} className="flex items-center justify-between gap-3">
                          <span className="text-sm text-slate-700">{ACTION_LABEL[a]}</span>

                          <GovSwitch
                            label={`${m.label} - ${ACTION_LABEL[a]}`}
                            checked={selected.has(pid)}
                            onCheckedChange={(next: boolean) => togglePermission(pid, next)}
                            size="sm"
                            showStateText={false}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
              disabled={loading}
              onClick={save}
              className="rounded-md bg-[#611232] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9D2449] disabled:opacity-60"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}