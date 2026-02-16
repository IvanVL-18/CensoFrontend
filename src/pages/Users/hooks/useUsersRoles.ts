import { useEffect, useState } from "react";
import { getRolesSelector } from "../Users.service";
import type { RoleOption } from "../Users.types";

export function useUsersRoles() {
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setRolesLoading(true);

    getRolesSelector(controller.signal)
      .then((data) => {
        console.log("roles loaded:", data);
        setRoles(data);
        setRolesError(null);
      })
      .catch((err: any) => {
        if (
          err?.code === "ERR_CANCELED" ||
          err?.name === "CanceledError" ||
          err?.name === "AbortError"
        ) {
          return;
        }

        console.error("roles error:", err);
        setRolesError("No se pudieron cargar los roles");
        setRoles([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setRolesLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { roles, rolesLoading, rolesError };
}
