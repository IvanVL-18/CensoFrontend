import { useMemo, useState } from "react";
import type {
  PermissionAction,
  PermissionModule,
  PermissionsState,
} from "../PermissionRoles.types";

const ALL_ACTIONS: PermissionAction[] = ["view", "create", "edit", "delete", "export", "restore"];

const makeEmptyMap = (): Record<PermissionAction, boolean> => ({
  view: false,
  create: false,
  edit: false,
  delete: false,
  export: false, 
  restore: false,
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
        restore: value, 
        export: value, 
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
          restore: value, 
          export: value, 
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
          restore: true, 
          export: true, 
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

    ALL_ACTIONS,
  };
};