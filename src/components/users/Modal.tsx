import { useEffect } from "react";
import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  widthClass?: string;
};

export default function Modal({ open, title, onClose, children, widthClass = "max-w-md" }: ModalProps) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={onClose} aria-hidden />
      <div className={`relative w-full ${widthClass} rounded-xl bg-white shadow-xl`}>
        <div className="flex items-center justify-between rounded-t-xl bg-neutral-800 text-white px-4 py-3">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-full hover:bg-white/10" aria-label="Cerrar">×</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
