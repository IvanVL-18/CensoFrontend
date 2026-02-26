import { useEffect, useMemo, useState } from "react";
import {
  Settings,
  Shield,
  Users,
  Layers,
  Building2,
  Briefcase,
  Hash,
  HelpCircle,
  BookCopy,
  FileText,
  BarChart3,
  Tag,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import PermissionRolesToolbar from "./components/PermissionRolesToolbar";
import FormErrors from "./components/FormErrors";
import GovSwitch from "./components/GovSwitch";

import type { Permission, RoleOption } from "./PermissionRoles.service";
import { getRolesForSelect } from "./PermissionRoles.service";

const DESIGN_ONLY = true;

type Action = "view" | "create" | "edit" | "disable" | "bulk" | "delete";

const ACTIONS_ORDER: Action[] = ["view", "create", "edit", "disable", "bulk", "delete"];

const ACTION_LABEL: Record<Action, string> = {
  view: "Ver",
  create: "Crear",
  edit: "Editar",
  disable: "Desactivar",
  bulk: "Carga Masiva",
  delete: "Eliminar",
};

const moduleLabelMap: Record<string, string> = {
  dashboard: "Dashboard",
  notifications: "Notificaciones",
  users: "Usuarios",
  roles: "Roles",
  institutions: "Instituciones",
  areas: "Áreas",
  occupations: "Ocupaciones",
  censos: "Censos",
  graph: "Graficador",
  categories: "Categoría",
  reports: "Reportes",
  modules: "Módulos",
  sections: "Secciones",
  indexes: "Índices",
  questions: "Preguntas",
  catalogs: "Catálogos",
};

const moduleIconMap: Record<string, any> = {
  dashboard: LayoutDashboard,
  notifications: Settings,
  users: Users,
  roles: Shield,
  institutions: Building2,
  areas: Layers,
  occupations: Briefcase,
  censos: FileText,
  graph: BarChart3,
  categories: Tag,
  reports: FileText,
  modules: Layers,
  sections: BookCopy,
  indexes: Hash,
  questions: HelpCircle,
  catalogs: BookCopy,
};

const MODULE_ORDER: string[] = [
  "dashboard",
  "notifications",
  "users",
  "roles",
  "institutions",
  "areas",
  "occupations",
  "censos",
  "graph",
  "reports",
  "categories",
  "modules",
  "sections",
  "indexes",
  "questions",
  "catalogs",
];

const BULK_MODULES = new Set(["modules", "sections", "indexes", "questions", "censos"]);
const VIEW_ONLY_MODULES = new Set(["graph", "dashboard", "reports"]);

const normalizeAction = (a: string): Action | null => {
  const x = a.toLowerCase();
  if (["view", "ver", "read", "show", "index", "list"].includes(x)) return "view";
  if (["create", "crear", "store", "add", "new"].includes(x)) return "create";
  if (["edit", "editar", "update"].includes(x)) return "edit";
  if (["disable", "desactivar", "deactivate", "ban", "block", "inactive", "suspend"].includes(x))
    return "disable";
  if (["bulk", "import", "carga_masiva", "cargamasiva", "bulk_import", "massload"].includes(x))
    return "bulk";
  if (["delete", "eliminar", "destroy", "remove"].includes(x)) return "delete";
  return null;
};

const parsePermission = (name: string) => {
  const parts = name.split(".");
  const actionRaw = parts.pop() || "";
  const module = parts.pop() || "otros";
  return { module, action: normalizeAction(actionRaw) };
};

let _pid = 1;
const makeModulePerms = (module: string): Permission[] => {
  const p = (act: Action) => ({ id: _pid++, name: `${module}.${act}` } as Permission);

  if (VIEW_ONLY_MODULES.has(module)) return [p("view")];

  const perms: Permission[] = [p("view"), p("create"), p("edit"), p("disable")];
  if (BULK_MODULES.has(module)) perms.push(p("bulk"));
  perms.push(p("delete"));
  return perms;
};

const MOCK_PERMS: Permission[] = [
  ...makeModulePerms("dashboard"),
  ...makeModulePerms("notifications"),
  ...makeModulePerms("users"),
  ...makeModulePerms("roles"),
  ...makeModulePerms("institutions"),
  ...makeModulePerms("areas"),
  ...makeModulePerms("occupations"),
  ...makeModulePerms("censos"),
  ...makeModulePerms("graph"),
  ...makeModulePerms("reports"),
  ...makeModulePerms("categories"),
  ...makeModulePerms("modules"),
  ...makeModulePerms("sections"),
  ...makeModulePerms("indexes"),
  ...makeModulePerms("questions"),
  ...makeModulePerms("catalogs"),
];

const defaultSelectedByRoleName = (roleName: string, allPerms: Permission[]) => {
  const n = roleName.toLowerCase();
  const isAdmin = n.includes("admin");
  const isOper = n.includes("oper");
  const ids = allPerms.map((p) => p.id);

  if (isAdmin) return new Set(ids);

  if (isOper) {
    const allowedModules = new Set([
      "institutions",
      "areas",
      "occupations",
      "indexes",
      "questions",
      "censos",
      "graph",
      "reports",
      "dashboard",
      "notifications",
    ]);
    const allowedActions = new Set<Action>(["view", "create", "edit", "bulk", "disable"]);
    const selected = new Set<number>();

    allPerms.forEach((p) => {
      const { module, action } = parsePermission(p.name);
      if (!action) return;
      if (!allowedModules.has(module)) return;
      if (!allowedActions.has(action)) return;
      selected.add(p.id);
    });

    return selected;
  }

  const selected = new Set<number>();
  allPerms.forEach((p) => {
    const { action } = parsePermission(p.name);
    if (action === "view") selected.add(p.id);
  });
  return selected;
};

const isCanceled = (e: any) =>
  e?.code === "ERR_CANCELED" || e?.name === "CanceledError" || e?.name === "AbortError";

export default function PermissionRoles() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleEnc = searchParams.get("role") ?? "";
  const savedRoleId = localStorage.getItem("permissionRoles:lastRoleId") ?? "";

  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const [roleId, setRoleId] = useState<string>(roleEnc || savedRoleId || "");
  const [roleName, setRoleName] = useState("");

  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  useEffect(() => {
    setAllPerms(MOCK_PERMS);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoadingRoles(true);
        setErrors([]);

        const data = await getRolesForSelect("active", controller.signal);
        setRoles(data);

        const has = (id: string) => data.some((r) => r.id === id);

        const desired =
          (roleEnc && has(roleEnc) && roleEnc) ||
          (savedRoleId && has(savedRoleId) && savedRoleId) ||
          (data[0]?.id ?? "");

        if (desired) setRoleId(desired);
        setErrors([]);
      } catch (e) {
        if (!isCanceled(e)) setErrors(["No se pudieron cargar los roles."]);
      } finally {
        setLoadingRoles(false);
      }
    })();

    return () => controller.abort();
  }, [roleEnc, savedRoleId]);

  useEffect(() => {
    const r = roles.find((x) => x.id === roleId);
    const name = r?.name ?? "";
    setRoleName(name);

    if (roleId) localStorage.setItem("permissionRoles:lastRoleId", roleId);

    if (DESIGN_ONLY && allPerms.length) {
      setSelected(defaultSelectedByRoleName(name, allPerms));
    }
  }, [roleId, roles, allPerms]);

  const allOn = useMemo(() => {
    if (!allPerms.length) return false;
    return selected.size === allPerms.length;
  }, [allPerms.length, selected]);

  const allowAll = () => setSelected(new Set(allPerms.map((p) => p.id)));
  const clearAll = () => setSelected(new Set());

  const togglePermission = (permissionId: number, next: boolean) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (next) n.add(permissionId);
      else n.delete(permissionId);
      return n;
    });
  };

  const modules = useMemo(() => {
    type ModuleCard = {
      moduleKey: string;
      label: string;
      icon: any;
      actions: Partial<Record<Action, number>>;
    };

    const map = new Map<string, ModuleCard>();

    allPerms.forEach((p) => {
      const { module, action } = parsePermission(p.name);
      if (!action) return;

      const label = moduleLabelMap[module] ?? module;
      const icon = moduleIconMap[module] ?? Settings;

      if (!map.has(module)) map.set(module, { moduleKey: module, label, icon, actions: {} });
      map.get(module)!.actions[action] = p.id;
    });

    const orderIndex = (k: string) => {
      const i = MODULE_ORDER.indexOf(k);
      return i === -1 ? 999 : i;
    };

    return Array.from(map.values()).sort((a, b) => orderIndex(a.moduleKey) - orderIndex(b.moduleKey));
  }, [allPerms]);

  const save = async () => {
    try {
      setLoading(true);
      if (roleId) localStorage.setItem("permissionRoles:lastRoleId", roleId);
      console.log("MOCK SAVE:", { roleId, selected: Array.from(selected) });
      alert("Diseño: Guardado mock (revisa consola)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <PermissionRolesToolbar
            allOn={allOn}
            onToggleAll={(next) => (next ? allowAll() : clearAll())}
          />

          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <span className="font-semibold text-[#611232]">Asignando permisos a:</span>{" "}
            <span className="text-slate-700">{roleName || "Selecciona un rol"}</span>
          </div>

          <FormErrors errors={errors} />

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700">
              Seleccionar rol <span className="text-[#9D2449]">*</span>
            </label>

            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              disabled={loading || loadingRoles}
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#9D2449]/40 disabled:bg-slate-100 sm:max-w-md"
            >
              <option value="" disabled>
                {loadingRoles ? "Cargando roles..." : "Selecciona un rol..."}
              </option>

              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {loading && <p className="mt-4 text-sm text-slate-500">Cargando...</p>}

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {modules.map((m) => {
              const Icon = m.icon;
              const actions = ACTIONS_ORDER.filter((a) => !!m.actions[a]);
              const allCardOn = actions.length
                ? actions.every((a) => selected.has(m.actions[a]!))
                : false;

              return (
                <div key={m.moduleKey} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#611232]/10">
                        <Icon className="h-4 w-4 text-[#611232]" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">{m.label}</h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => actions.forEach((a) => togglePermission(m.actions[a]!, !allCardOn))}
                      className="text-xs font-semibold text-[#611232] hover:underline"
                      disabled={!actions.length}
                    >
                      {allCardOn ? "Quitar todo" : "Permitir todo"}
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    {actions.map((a) => {
                      const pid = m.actions[a]!;
                      return (
                        <div key={a} className="flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-700">{ACTION_LABEL[a]}</span>

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