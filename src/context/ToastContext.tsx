// src/context/ToastContext.tsx (Corregido)

import { createContext, useContext, useState } from "react";
// <--- CAMBIO AQUÍ: Importamos ReactNode por separado como un TIPO
import type { ReactNode } from "react";

// Tipos
type ToastType = "success" | "danger" | "warning";

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface IToastContext {
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

// 1. Creamos el Contexto
const ToastContext = createContext<IToastContext | undefined>(undefined);

// 2. Creamos el Proveedor (Provider)
//    (Esta línea ahora funcionará porque ReactNode está bien importado)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Función para AÑADIR un toast
  const addToast = (message: string, type: ToastType) => {
    // Creamos un ID único
    const id = crypto.randomUUID();
    setToasts((currentToasts) => [...currentToasts, { id, message, type }]);
  };

  // Función para QUITAR un toast
  const removeToast = (id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// 3. Creamos el Hook para usar el contexto fácilmente
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe ser usado dentro de un ToastProvider");
  }
  return context;
}