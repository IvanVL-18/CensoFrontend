import { X } from "lucide-react";

type UiModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export default function UiModal({ open, title, onClose, footer, children }: UiModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-[201] w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-gray-200">
        {/* Top bar vino */}
        <div className="h-4 rounded-t-2xl bg-[#691B31]" />
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#691B31]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>

        {/* Bottom bar vino + footer acciones a la derecha */}
        <div className="px-6 py-3 border-t bg-white flex items-center justify-end gap-3">
          {footer}
        </div>
        <div className="h-4 rounded-b-2xl bg-[#691B31]" />
      </div>
    </div>
  );
}
