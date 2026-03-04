import { useState, useEffect } from "react";
import { getRolesForSelect, type RoleOption } from "../PermissionRoles.service";

export function useRolesSelect() {
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchRoles = async () => {
      try {
        setLoading(true);
     
        const data = await getRolesForSelect("active", controller.signal);
        setRoles(data);
        setError(null);
      } catch (err: any) {
       
        if (err.name === "CanceledError" || err.code === "ERR_CANCELED") return;
        
        console.error("Error al cargar roles para el select:", err);
        setError(err.message || "No se pudieron cargar los roles.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchRoles();

    return () => controller.abort();
  }, []); 

  return { roles, loading, error };
}
