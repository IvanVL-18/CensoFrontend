// src/context/ToastContext.tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
// 1. IMPORTAMOS la función para generar IDs de la librería uuid
import { v4 as uuidv4 } from "uuid"; 

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

const ToastContext = createContext<IToastContext | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Función para AÑADIR un toast
  const addToast = (message: string, type: ToastType) => {
    // 2. CAMBIO CLAVE: Usamos uuidv4() en lugar de crypto.randomUUID()
    // Esto funcionará en localhost, en IPs de red local y en producción (HTTPS)
    const id = uuidv4(); 
    
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

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe ser usado dentro de un ToastProvider");
  }
  return context;
}