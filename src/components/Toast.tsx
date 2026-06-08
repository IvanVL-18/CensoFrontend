import  { useEffect } from "react";
import { Check, X, AlertTriangle } from "lucide-react"; // Usaremos iconos para consistencia

// Definimos los tipos de props que aceptará
type ToastType = "success" | "danger" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
}
const DUPLICATE_NAME_MESSAGE_REGEX = /en uso/i;

// Configuración de estilos para cada tipo de toast
const toastConfig = {
  success: {
    icon: <Check className="w-5 h-5" />,
    iconBg: "bg-green-100 white:bg-green-800",
    iconText: "text-green-500 white:text-green-200",
    srText: "Check icon",
  },
  danger: {
    icon: <X className="w-5 h-5" />,
    iconBg: "bg-red-100 white:bg-red-800",
    iconText: "text-red-500 white:text-red-200",
    srText: "Error icon",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    iconBg: "bg-orange-100 white:bg-orange-700",
    iconText: "text-orange-500 white:text-orange-200",
    srText: "Warning icon",
  },
};

export function Toast({ message, type, onDismiss }: ToastProps) {
  const config = toastConfig[type];
  const isDuplicateNameMessage = DUPLICATE_NAME_MESSAGE_REGEX.test(message);
  useEffect(() => {
    if (isDuplicateNameMessage) {
      onDismiss();
      return;
    }

    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => {
      clearTimeout(timer);
    };
  }, [onDismiss, isDuplicateNameMessage]);

  if (isDuplicateNameMessage) {
    return null;
  }

  return (
    <div
      className="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-sm white:text-gray-400 white:bg-gray-800"
      role="alert"
    >
      <div
        className={`inline-flex items-center justify-center shrink-0 w-8 h-8 ${config.iconBg} ${config.iconText} rounded-lg`}
      >
        {config.icon}
        <span className="sr-only">{config.srText}</span>
      </div>
      <div className="ms-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 white:text-gray-500 white:hover:text-white white:bg-gray-800 white:hover:bg-gray-700"
        aria-label="Close"
        onClick={onDismiss}
      >
        <span className="sr-only">Close</span>
        <svg
          className="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
      </button>
    </div>
  );
}