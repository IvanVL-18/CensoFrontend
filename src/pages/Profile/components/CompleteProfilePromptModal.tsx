import { UserRound } from "lucide-react";
import type { CompleteProfilePromptModalProps as Props } from "../Profile.types";

export default function CompleteProfilePromptModal({
  open,
  onClose,
  onGoToComplete,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-[2px] px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative p-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <UserRound className="h-6 w-6" />
            </div>

            <p className="mt-3 text-base font-semibold text-slate-900">
              Bienvenido
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Para continuar, completa tus datos de perfil.
            </p>

            <button
              onClick={onGoToComplete}
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-[var(--pantone-7421)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 active:opacity-90 transition"
            >
              Completar datos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}