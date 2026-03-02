import type { LucideIcon } from "lucide-react";

export type PermissionScope = "home" | "admin" | "operation";

export type PermissionAction = "view" | "create" | "edit" | "delete" | "export"| "restore";

export const ACTION_LABEL: Record<PermissionAction, string> = {
  view: "Ver",
  create: "Crear",
  edit: "Editar",
  delete: "Eliminar", 
  export: "Exportar",
  restore: "Restaurar",
};

export type PermissionMap = Record<string, boolean>; 

export type PermissionsState = Record<string, PermissionMap>; 

export type PermissionTab = {
  key: PermissionScope;
  label: string;
  icon: LucideIcon;
};

export type PermissionModule = {
  key: string;
  label: string;
  icon: LucideIcon;
  actions?: PermissionAction[]; 
};