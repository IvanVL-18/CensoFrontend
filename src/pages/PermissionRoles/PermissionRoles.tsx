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

import { useRolesSelect } from "./hooks/useRolesSelect";
import {
  getPermissionRole,
  updatePermissionRole,
  type Permission,
} from "./PermissionRoles.service";
import { ToastProvider, useToast } from "../../context/ToastContext";
import { Toast } from "../../components/Toast";


const ACTIONS_ORDER = ["view", "create", "edit", "disable", "restore", "bulk", "delete"];

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
  notifications: "Notificaciones",
  users: "Usuarios",
  roles: "Roles",
  institutions: "Instituciones",
  dependencies: "Dependencias",
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
  dependencies: Layers,
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
  "dependencies",
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


const normalizeModule = (m: string) => {
  const x = (m || "").toLowerCase().trim();


  if (x === "graficador") return "graph";

 
  if (x === "indexs" || x === "indices") return "indexes";

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

  if (["restore", "restaurar", "recover", "unban"].includes(x)) return "restore";

  
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
  const [searchParams] = useSearchParams();
  const roleEnc = searchParams.get("role") ?? "";
  const savedRoleId = localStorage.getItem("permissionRoles:lastRoleId") ?? "";

  const { roles, loading: loadingRoles, error: rolesError } = useRolesSelect();

  const [roleId, setRoleId] = useState<string>(roleEnc || savedRoleId || "");

  const [errors, setErrors] = useState<string[]>([]);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);

  const [allPerms, setAllPerms] = useState<Permission[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());


  useEffect(() => {
    if (loadingRoles) return;

    if (rolesError) {
      setErrors([rolesError]);
      return;
    }

    const has = (id: string) => roles.some((r) => r.id === id);

    if (roleEnc && has(roleEnc)) {
      if (roleId !== roleEnc) setRoleId(roleEnc);
      return;
    }

    if (roleId && has(roleId)) return;

    if (roles.length > 0) setRoleId(roles[0].id);
  }, [loadingRoles, roles, rolesError, roleEnc, roleId]);

  useEffect(() => {
    if (!roleId) return;

    const ac = new AbortController();
    setErrors([]);
    setFetching(true);

    getPermissionRole(roleId, ac.signal)
      .then((data) => {
        setAllPerms(data.permissionsCollection ?? []);
        const ids = (data.role?.permissions ?? []).map((p) => p.id);
        setSelected(new Set(ids));
        localStorage.setItem("permissionRoles:lastRoleId", roleId);
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
      })
      .finally(() => setFetching(false));

    return () => ac.abort();
  }, [roleId]);

  const roleName = useMemo(() => {
    const r = roles.find((x) => x.id === roleId);
    return r?.name ?? "";
  }, [roles, roleId]);

 
  const modules = useMemo(() => {
    type ModuleCard = {
      moduleKey: string;
      label: string;
      icon: any;
      actions: Record<string, number>; 
    };

    const map = new Map<string, ModuleCard>();

    allPerms.forEach((p) => {
      const { module, action } = parsePermission(p.name);

      const label = moduleLabelMap[module] ?? titleFromKey(module);
      const icon = moduleIconMap[module] ?? Settings;

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
    <div className="w-full bg-[#F8FAFC]">
      <ToastContainer />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <PermissionRolesToolbar
            allOn={allOn}
            onToggleAll={(next) => (next ? allowAll() : clearAll())}
          />

          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
            <span className="font-semibold text-[#611232]">
              Asignando permisos a:
            </span>{" "}
            <span className="text-slate-700">
              {roleName || "Selecciona un rol"}
            </span>
          </div>

          <FormErrors errors={errors} />

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-700">
              Seleccionar rol <span className="text-[#9D2449]">*</span>
            </label>

            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              disabled={busy}
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

          {(fetching || saving) && (
            <p className="mt-4 text-sm text-slate-500">
              {fetching ? "Cargando permisos..." : "Guardando..."}
            </p>
          )}

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {modules.map((m) => {
              const Icon = m.icon;

              const actionKeys = Object.keys(m.actions);
              const actionsSorted = actionKeys.sort((a, b) => {
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
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={() => navigate(-1)}
              disabled={busy}
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={busy}
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

export default function PermissionRoles() {
  return (
    <ToastProvider>
      <PermissionRolesContent />
    </ToastProvider>
  );
}
