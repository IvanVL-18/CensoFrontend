import { X, AlertCircle } from "lucide-react";

interface ErrorOverlayProps {
  message: string | null;
  onDismiss: () => void;
}

export default function ErrorOverlay({
  message,
  onDismiss,
}: ErrorOverlayProps) {
  if (!message) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="relative w-full max-w-sm rounded-xl border border-red-200 bg-white p-5 shadow-2xl">
        <button
          onClick={onDismiss}
          aria-label="Cerrar error"
          className="absolute right-3 top-3 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="mt-3 text-sm font-semibold text-red-700">
            No se pudo guardar
          </p>
          <p className="mt-1 text-sm text-slate-600">{message}</p>
        </div>
      </div>
    </div>
  );
}
