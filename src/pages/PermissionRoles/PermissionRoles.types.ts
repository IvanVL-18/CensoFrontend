import type { LucideIcon } from "lucide-react";

// Define las pestañas/secciones principales de permisos
export type PermissionScope = "home" | "admin" | "operation";

// Define las acciones posibles que se pueden realizar en un módulo
export type PermissionAction = "view" | "create" | "edit" | "delete" | "export";

// Mapea cada acción a su etiqueta en español para la UI
export const ACTION_LABEL: Record<PermissionAction, string> = {
  view: "Ver",
  create: "Crear",
  edit: "Editar",
  delete: "Eliminar",
  export: "Exportar",
};

// Define el estado de los checkboxes para un solo módulo. Ej: { view: true, create: false }
export type PermissionMap = Record<string, boolean>; // { view: true, create: false }

// Define el estado completo de todos los permisos. Ej: { "admin.users": { view: true } }
export type PermissionsState = Record<string, PermissionMap>; // { "admin.users": { view: true } }

// Define la estructura de un objeto para una pestaña
export type PermissionTab = {
  key: PermissionScope;
  label: string;
  icon: LucideIcon;
};

// Define la estructura de un objeto para una tarjeta de módulo de permisos
export type PermissionModule = {
  key: string;
  label: string;
  icon: LucideIcon;
  actions?: PermissionAction[]; // opcional, si no se define usa todas
};