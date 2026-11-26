import { LogOut, UserRound } from "lucide-react";
import { createPortal } from "react-dom";
import type { CompleteProfilePromptModalProps as Props } from "../Profile.types";

/**
 * Aviso obligatorio: no se cierra con clic fuera ni con Escape.
 * Solo se puede ir a completar los datos o cerrar sesión.
 */
export default function CompleteProfilePromptModal({
  open,
  onGoToComplete,
  onLogout,
}: Props) {
  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-profile-prompt-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 backdrop-blur-[2px] px-4"
    >
      <div className="w-full max-w-sm overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        <div className="relative p-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <UserRound className="h-6 w-6" />
            </div>

            <p
              id="complete-profile-prompt-title"
              className="mt-3 text-base font-semibold text-slate-900"
            >
              Bienvenido
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Para continuar, completa tus datos de perfil.
            </p>

            <button
              type="button"
              autoFocus
              onClick={onGoToComplete}
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-[var(--pantone-7421)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 active:opacity-90"
            >
              Completar datos
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
