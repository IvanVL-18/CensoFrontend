import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { ConfirmModalProps } from "../Catalogs.types";

export function ConfirmModal({
  isOpen,
  isSubmitting,
  error,
  title,
  message,
  confirmButtonText = "Confirmar",
  confirmButtonColor = "danger",
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setLocalError(error || null);
  }, [error]);

  useEffect(() => {
    if (isOpen) setLocalError(null);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const extractParts = (msg: string) => {
    const match = msg.match(/^(.*?)"([^"]+)"(.*)$/s);
    if (match) {
      return {
        before: match[1],
        name: match[2],
        after: match[3],
      };
    }
    return null;
  };

  const parsed = message ? extractParts(message) : null;

  const confirmButtonClasses = {
    danger: "bg-red-900 text-white hover:bg-red-800",
    primary: "bg-white border border-[#691b31] text-[#691b31] hover:bg-gray-100",
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-30 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      />
      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-300"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {parsed ? (
              <p className="text-gray-700 break-words">
                {parsed.before} "{parsed.name}"{parsed.after}
              </p>
            ) : (
              <p className="text-gray-700 break-words">{message}</p>
            )}
            {localError && <p className="text-red-600 text-sm">{localError}</p>}
          </div>

          <div className="flex justify-end items-center gap-4 p-4 bg-gray-50">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={`font-bold py-2 px-6 rounded-lg disabled:opacity-50 ${confirmButtonClasses[confirmButtonColor]}`}
            >
              {isSubmitting ? "Procesando..." : confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}