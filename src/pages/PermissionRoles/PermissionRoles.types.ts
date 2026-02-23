import type { LucideIcon } from "lucide-react";

export type Props = {
  label?: string;
  logoSrc?: string; 
};

export type PermissionScope = "home" | "admin" | "operation";
export type PermissionAction = "view" | "create" | "edit" | "delete";

export const ACTION_LABEL: Record<PermissionAction, string> = {
  view: "Ver",
  create: "Crear",
  edit: "Editar",
  delete: "Eliminar",
};

export type PermissionMap = Record<PermissionAction, boolean>;

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
  actions?: PermissionAction[]; // si un módulo no usa todas
};