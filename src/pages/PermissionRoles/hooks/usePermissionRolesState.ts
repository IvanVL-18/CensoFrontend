import { useMemo, useState } from "react";
import type {
  PermissionAction,
  PermissionModule,
  PermissionsState,
} from "../PermissionRoles.types";

// ✅ Solo las acciones que quieres mostrar en el DISEÑO (UI)
const ALL_ACTIONS: PermissionAction[] = ["view", "create", "edit", "delete"];

// ✅ El estado DEBE tener todas las acciones del tipo PermissionAction (incluye "export")
const makeEmptyMap = (): Record<PermissionAction, boolean> => ({
  view: false,
  create: false,
  edit: false,
  delete: false,
  export: false, // <- para que no falle TS
});

export const usePermissionRolesState = (allModules: PermissionModule[]) => {
  const initial = useMemo<PermissionsState>(() => {
    const s: PermissionsState = {};
    allModules.forEach((m) => {
      s[m.key] = makeEmptyMap();
    });
    return s;
  }, [allModules]);

  const [perms, setPerms] = useState<PermissionsState>(initial);

  const setOne = (moduleKey: string, action: PermissionAction, value: boolean) => {
    setPerms((prev) => ({
      ...prev,
      [moduleKey]: { ...(prev[moduleKey] ?? makeEmptyMap()), [action]: value },
    }));
  };

  const setModuleAll = (moduleKey: string, value: boolean) => {
    setPerms((prev) => ({
      ...prev,
      [moduleKey]: {
        ...(prev[moduleKey] ?? makeEmptyMap()),
        view: value,
        create: value,
        edit: value,
        delete: value,
        export: value, // <- también aquí
      },
    }));
  };

  const setManyModulesAll = (moduleKeys: string[], value: boolean) => {
    setPerms((prev) => {
      const next = { ...prev };
      moduleKeys.forEach((k) => {
        next[k] = {
          ...(next[k] ?? makeEmptyMap()),
          view: value,
          create: value,
          edit: value,
          delete: value,
          export: value, // <- también aquí
        };
      });
      return next;
    });
  };

  const allowAll = () => {
    setPerms((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        next[k] = {
          ...(next[k] ?? makeEmptyMap()),
          view: true,
          create: true,
          edit: true,
          delete: true,
          export: true, // <- también aquí
        };
      });
      return next;
    });
  };

  return {
    perms,
    setPerms,
    setOne,
    setModuleAll,
    setManyModulesAll,
    allowAll,

    // ✅ Esto úsalo para renderizar switches (solo 4 acciones, sin export)
    ALL_ACTIONS,
  };
};