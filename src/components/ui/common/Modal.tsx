import { useEffect, memo } from "react";
import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  widthClass?: string;
};

function ModalBase({
  open,
  title,
  onClose,
  children,
  widthClass = "max-w-md",
}: ModalProps) {
  // 🔹 Escucha tecla ESC solo cuando el modal está abierto
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  // 🔹 Si no está abierto, ni lo renderizamos (ahorra pintura del DOM)
  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/30 backdrop-blur-sm
        animate-fadeIn
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose} // click fuera cierra modal
    >
      <div
        className={`
          relative w-full ${widthClass}
          rounded-xl bg-white shadow-xl border border-neutral-200
          animate-slideIn
        `}
        onClick={(e) => e.stopPropagation()} // 🔹 evita cerrar al hacer clic dentro
      >
        {/* Header */}
        <div className="flex items-center justify-between rounded-t-xl bg-[#5b1d27] text-white px-4 py-3">
          {title && (
            <h3 id="modal-title" className="font-semibold text-sm md:text-base">
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/10 focus:ring-2 focus:ring-[#b48a70] transition"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// ✅ Evita re-render si las props no cambian
export default memo(ModalBase);
