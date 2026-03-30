import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Layers,
  Briefcase,
  Hash,
  HelpCircle,
  BarChart3,
  LayoutDashboard,
  // Icons for consistency
  Landmark,
  ClipboardList,
  CalendarRange,
  Package,
  Paperclip,
  UserCog,
  FolderOpen,
  FileText,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import PermissionRolesToolbar from "./components/PermissionRolesToolbar";
import FormErrors from "./components/FormErrors";
import GovSwitch from "./components/GovSwitch";

import { useRolesSelect } from "./hooks/useRolesSelect";
import {
  getPermissionRole,
  updatePermissionRole,
  type Permission,
} from "./PermissionRoles.service";

import { ToastProvider, useToast } from "../../context/ToastContext";
import { Toast } from "../../components/Toast";

const ACTIONS_ORDER = [
  "view",
  "create",
  "edit",
  "disable",
  "restore",
  "bulk",
  "delete",
];

const ACTION_LABEL: Record<string, string> = {
  view: "Ver",
  create: "Crear",
  edit: "Editar",
  disable: "Desactivar",
  restore: "Restaurar",
  bulk: "Carga Masiva",
  delete: "Eliminar",
};

const moduleLabelMap: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Usuarios",
  roles: "Roles",
  institutions: "Instituciones",
  dependencies: "Dependencias",
  occupations: "Ocupaciones",
  censos: "Censos",
  graph: "Graficador",
  categories: "Categorías",
  reports: "Reportes",
  modules: "Módulos",
  sections: "Secciones",
  indexes: "Índices",
  questions: "Preguntas",
  catalogs: "Catálogos",
};

const moduleIconMap: Record<string, any> = {
  dashboard: LayoutDashboard,
  users: Users,
  roles: UserCog,
  institutions: Landmark,
  dependencies: Layers,
  occupations: Briefcase,
  censos: ClipboardList,
  graph: BarChart3,
  categories: FolderOpen,
  reports: CalendarRange,
  modules: Package,
  sections: Paperclip,
  indexes: Hash,
  questions: HelpCircle,
  catalogs: FileText,
};

const MODULE_ORDER: string[] = [
  // Items from Sidebar
  "dashboard",
  "graph",
  "reports",
  "users",
  "institutions",
  "censos",

  // Items from Configuration page (in their order)
  "modules",
  "sections",
  "dependencies",
  "occupations",
  "indexes",
  "questions",
  "roles",
  "catalogs",
  "categories",
];

const normalizeModule = (m: string) => {
  const x = (m || "").toLowerCase().trim();
  if (x === "graficador") return "graph";
  if (x === "indexs" || x === "indices") return "indexes";
  if (x === "dependencie") return "dependencies";
  return x || "otros";
};

const normalizeAction = (a: string) => {
  const x = (a || "").toLowerCase().trim();

  if (["view", "ver", "read", "show", "index", "list"].includes(x))
    return "view";
  if (["create", "crear", "store", "add", "new"].includes(x)) return "create";
  if (["edit", "editar", "update"].includes(x)) return "edit";

  if (
    [
      "disable",
      "desactivar",
      "deactivate",
      "ban",
      "block",
      "inactive",
      "suspend",
    ].includes(x)
  )
    return "disable";

  if (["restore", "restaurar", "recover", "unban"].includes(x))
    return "restore";

  if (
    [
      "bulk",
      "import",
      "carga_masiva",
      "cargamasiva",
      "bulk_import",
      "massload",
    ].includes(x)
  )
    return "bulk";

  if (["delete", "eliminar", "destroy", "remove"].includes(x)) return "delete";

  return x || "unknown";
};

const parsePermission = (name: string) => {
  const parts = (name || "").split(".");
  const actionRaw = parts.pop() || "";
  const moduleRaw = parts.join(".") || "otros";
  return {
    module: normalizeModule(moduleRaw),
    action: normalizeAction(actionRaw),
  };
};

const titleFromKey = (key: string) =>
  key.replace(/[_\-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function PermissionRolesContent() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const roleEnc = searchParams.get("role") ?? "";
  const savedRoleId = localStorage.getItem("permissionRoles:lastRoleId") ?? "";

  const { roles, loading: loadingRoles, error: rolesError } = useRolesSelect();

  const [roleId, setRoleId] = useState<string>(roleEnc || savedRoleId || "");
  const [roleParamApplied, setRoleParamApplied] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);

  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [initialSelected, setInitialSelected] = useState<Set<string>>(new Set());
  const [apiRoleName, setApiRoleName] = useState("");

  useEffect(() => {
    if (loadingRoles) return;

    if (rolesError) {
      setErrors([rolesError]);
      return;
    }

    if (!roleParamApplied && roleEnc) {
      if (roleId !== roleEnc) setRoleId(roleEnc);
      setRoleParamApplied(true);
      return;
    }

    if (roleId) return;

    if (roles.length > 0) setRoleId(roles[0].id);
  }, [loadingRoles, rolesError, roles, roleEnc, roleId, roleParamApplied]);

  useEffect(() => {
    if (!roleId) return;

    const ac = new AbortController();
    setErrors([]);
    setFetching(true);

    getPermissionRole(roleId, ac.signal)
      .then((data) => {
        const collection = data.permissionsCollection ?? [];
        setAllPerms(collection);

        // Comparamos por name (estable) para saber qué permisos ya están asignados,
        // pero guardamos el id encriptado para poder enviarlo al backend al guardar.
        const assignedNames = new Set(data.role?.permissions_names ?? []);
        const initialIdSet = new Set(
          collection.filter((p) => assignedNames.has(p.name)).map((p) => p.id)
        );
        setSelected(initialIdSet);
        setInitialSelected(initialIdSet);
        localStorage.setItem("permissionRoles:lastRoleId", roleId);
        setApiRoleName(data.role?.name ?? "");
      })
      .catch((err: any) => {
        const isCanceled =
          err?.code === "ERR_CANCELED" ||
          err?.name === "CanceledError" ||
          err?.name === "AbortError";

        if (isCanceled) return;

        console.error(err);
        setErrors([
          "No se pudieron cargar los permisos del rol. Revisa consola / red.",
        ]);
        setAllPerms([]);
        setSelected(new Set());
        setInitialSelected(new Set());
      })
      .finally(() => setFetching(false));

    return () => ac.abort();
  }, [roleId]);

  const displayRoleName = useMemo(() => {
    return apiRoleName || roles.find((x) => x.id === roleId)?.name || "";
  }, [apiRoleName, roles, roleId]);

  const rolesForSelect = useMemo(() => {
    if (!roleId) return roles;

    const exists = roles.some((r) => r.id === roleId);
    if (exists) return roles;

    return [
      { id: roleId, name: displayRoleName || "Rol seleccionado" },
      ...roles,
    ];
  }, [roles, roleId, displayRoleName]);

  const modules = useMemo(() => {
    type ModuleCard = {
      moduleKey: string;
      label: string;
      icon: any;
      actions: Record<string, string>
    };

    const map = new Map<string, ModuleCard>();

    allPerms.forEach((p) => {
      const parsed = parsePermission(p.name);

      // Ignorar explícitamente cualquier permiso relacionado con notificaciones
      if (parsed.module === "notifications") return;

      const { module, action } = parsed;
      const label = moduleLabelMap[module] ?? titleFromKey(module);
      const icon = moduleIconMap[module] ?? Package; // Usar un ícono genérico de fallback

      if (!map.has(module)) {
        map.set(module, { moduleKey: module, label, icon, actions: {} });
      }
      map.get(module)!.actions[action] = p.id;
    });

    const orderIndex = (k: string) => {
      const i = MODULE_ORDER.indexOf(k);
      return i === -1 ? 999 : i;
    };

    return Array.from(map.values()).sort(
      (a, b) => orderIndex(a.moduleKey) - orderIndex(b.moduleKey),
    );
  }, [allPerms]);

  const hasChanges = useMemo(() => {
    if (initialSelected.size !== selected.size) return true;

    for (const id of initialSelected) {
      if (!selected.has(id)) return true;
    }

    return false;
  }, [selected, initialSelected]);

  const allOn = useMemo(() => {
    if (!allPerms.length) return false;
    return selected.size === allPerms.length;
  }, [allPerms.length, selected]);

  const allowAll = () => setSelected(new Set(allPerms.map((p) => p.id)));
  const clearAll = () => setSelected(new Set());

  const togglePermission = (permissionId: string, next: boolean) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (next) n.add(permissionId);
      else n.delete(permissionId);
      return n;
    });
  };

  const save = async () => {
    if (!roleId) {
      setErrors(["Selecciona un rol antes de guardar."]);
      return;
    }

    try {
      setErrors([]);
      setSaving(true);

      const permissionIds = Array.from(selected);
      const res = await updatePermissionRole(roleId, permissionIds);

      addToast(res?.message ?? "Permisos guardados correctamente.", "success");
    } catch (err) {
      console.error(err);
      addToast("No se pudieron guardar los permisos.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const actionOrderIndex = (a: string) => {
    const i = ACTIONS_ORDER.indexOf(a);
    return i === -1 ? 999 : i;
  };

  const actionLabel = (a: string) => ACTION_LABEL[a] ?? titleFromKey(a);

  const busy = fetching || saving || loadingRoles;

  return (
    <div className="w-full">
      <ToastContainer />

      <div className="mx-auto">
        <div className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-sm">
          <PermissionRolesToolbar title="Asignar Permisos" />

          <div className="p-5">
            <div className="space-y-5">
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <span className="font-semibold text-[#611232]">
                  Asignando permisos a:
                </span>{" "}
                <span className="text-slate-700">
                  {displayRoleName || "Selecciona un rol"}
                </span>
              </div>

              <div className="flex flex-col gap-4 rounded-md border border-slate-200 bg-white p-4 md:flex-row md:items-end md:justify-between">
                <div className="w-full md:max-w-xs">
                  <label className="block text-sm font-medium text-slate-700">
                    Seleccionar rol <span className="text-[#9D2449]">*</span>
                  </label>

                  <div className="relative mt-1">
                    <select
                      value={roleId}
                      onChange={(e) => {
                        const next = e.target.value;
                        setRoleId(next);
                        setSearchParams({ role: next }, { replace: true });
                        setRoleParamApplied(true);
                      }}
                      disabled={busy}
                      className="h-10 w-full appearance-none rounded-xl border border-slate-300 bg-white pl-4 pr-14 text-sm text-slate-700 shadow-sm outline-none transition focus:ring-2 focus:ring-[#9D2449]/30 disabled:bg-slate-100"
                    >
                      <option value="" disabled>
                        {loadingRoles
                          ? "Cargando roles..."
                          : "Selecciona un rol..."}
                      </option>

                      {rolesForSelect.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <div className="mr-3 h-5 w-px bg-slate-300" />
                      <svg
                        className="h-4 w-4 text-slate-500"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 8L10 12L14 8"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 md:pb-1">
                  <span className="text-sm font-semibold text-[#611232]">
                    Permitir todo
                  </span>
                  <GovSwitch
                    label="Permitir todo (global)"
                    checked={allOn}
                    onCheckedChange={(next) => (next ? allowAll() : clearAll())}
                    size="sm"
                    showStateText={false}
                  />
                </div>
              </div>

              <FormErrors errors={errors} />

              {(fetching || saving) && (
                <p className="text-sm text-slate-500">
                  {fetching ? "Cargando permisos..." : "Guardando..."}
                </p>
              )}

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {modules.map((m) => {
                  const Icon = m.icon;

                  const actionsSorted = Object.keys(m.actions).sort((a, b) => {
                    const ia = actionOrderIndex(a);
                    const ib = actionOrderIndex(b);
                    if (ia !== ib) return ia - ib;
                    return a.localeCompare(b, "es");
                  });

                  const allCardOn = actionsSorted.length
                    ? actionsSorted.every((a) => selected.has(m.actions[a]))
                    : false;

                  return (
                    <div
                      key={m.moduleKey}
                      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#611232]/10">
                            <Icon className="h-4 w-4 text-[#611232]" />
                          </div>
                          <h3 className="text-sm font-semibold text-slate-800">
                            {m.label}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            actionsSorted.forEach((a) =>
                              togglePermission(m.actions[a], !allCardOn),
                            )
                          }
                          className="text-xs font-semibold text-[#611232] hover:underline"
                          disabled={!actionsSorted.length || busy}
                        >
                          {allCardOn ? "Quitar todo" : "Permitir todo"}
                        </button>
                      </div>

                      <div className="mt-3 space-y-2">
                        {actionsSorted.map((a) => {
                          const pid = m.actions[a];
                          return (
                            <div
                              key={a}
                              className="flex items-center justify-between gap-2"
                            >
                              <span className="text-xs text-slate-700">
                                {actionLabel(a)}
                              </span>

                              <GovSwitch
                                label={`${m.label} - ${actionLabel(a)}`}
                                checked={selected.has(pid)}
                                onCheckedChange={(next: boolean) =>
                                  togglePermission(pid, next)
                                }
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
                  className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95 disabled:opacity-50"
                  onClick={() => navigate(-1)}
                  disabled={busy}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={busy || !hasChanges}
                  onClick={save}
                  className="bg-white border border-[#691b31] text-[#691b31] font-bold py-2 px-6 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PermissionRoles() {
  return (
    <ToastProvider>
      <PermissionRolesContent />
    </ToastProvider>
  );
}
