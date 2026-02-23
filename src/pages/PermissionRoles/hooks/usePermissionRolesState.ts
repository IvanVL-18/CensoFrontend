import { useMemo, useState } from "react";
import type {
  PermissionAction,
  PermissionModule,
  PermissionsState,
} from "../PermissionRoles.types";

const ALL_ACTIONS: PermissionAction[] = ["view", "create", "edit", "delete"];

const makeEmptyMap = (): Record<PermissionAction, boolean> => ({
  view: false,
  create: false,
  edit: false,
  delete: false,
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
      [moduleKey]: { ...prev[moduleKey], [action]: value },
    }));
  };

  const setModuleAll = (moduleKey: string, value: boolean) => {
    setPerms((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        view: value,
        create: value,
        edit: value,
        delete: value,
      },
    }));
  };

  const setManyModulesAll = (moduleKeys: string[], value: boolean) => {
    setPerms((prev) => {
      const next = { ...prev };
      moduleKeys.forEach((k) => {
        next[k] = {
          ...next[k],
          view: value,
          create: value,
          edit: value,
          delete: value,
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
          ...next[k],
          view: true,
          create: true,
          edit: true,
          delete: true,
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