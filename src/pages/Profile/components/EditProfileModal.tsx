import { X, UserRound, Phone, Smartphone, MapPin, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ProfileData, EditProfileModalProps as Props } from "../Profile.types";
import ProfileField from "./ProfileField";

export default function EditProfileModal({ open, onClose, user }: Props) {
  const [draft, setDraft] = useState<ProfileData>(user?.profile ?? {} as ProfileData);

useEffect(() => {
    if (!open || !user) return;
    setDraft(user.profile);
  }, [open, user]);

if (!open || !user) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div className="relative flex min-h-dvh items-center justify-center p-2 sm:p-4 md:p-6">
        <div
          className="
            w-[calc(100vw-1rem)] sm:w-full
            max-w-3xl
            max-h-[94dvh]
            overflow-hidden
            rounded-2xl border border-slate-200
            bg-white shadow-xl
          "
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative flex max-h-[94dvh] flex-col">
            <div className="shrink-0 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute right-3 top-3 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 sm:right-4 sm:top-4"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="pr-8">
                <p className="text-lg font-semibold text-slate-900 sm:text-xl">
                  Mi perfil
                </p>

                <div className="mt-1 inline-flex max-w-full items-center gap-2 text-sm text-slate-500">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <ProfileField
                    label="Nombre(s)"
                    icon={UserRound}
                    value={draft.name ?? ""}
                    onChange={(v) => setDraft((s) => ({ ...s, name: v }))}
                    maxLength={50}
                  />
                  <ProfileField
                    label="Apellidos"
                    icon={UserRound}
                    value={draft.lastname ?? ""}
                    onChange={(v) => setDraft((s) => ({ ...s, lastname: v }))}
                    maxLength={50}
                  />
                  <ProfileField
                    label="Teléfono fijo"
                    icon={Phone}
                    value={draft.phone ?? ""}
                    onChange={(v) => setDraft((s) => ({ ...s, phone: v }))}
                    maxLength={20}
                  />
                  <ProfileField
                    label="Teléfono móvil"
                    icon={Smartphone}
                    value={draft.mobile ?? ""}
                    onChange={(v) => setDraft((s) => ({ ...s, mobile: v }))}
                    maxLength={20}
                  />
                  <ProfileField
                    className="sm:col-span-2"
                    label="Dirección"
                    icon={MapPin}
                    value={draft.address ?? ""}
                    onChange={(v) => setDraft((s) => ({ ...s, address: v }))}
                    maxLength={200}
                  />
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-100 px-4 py-4 sm:px-6">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                >
                  Cerrar
                </button>

                <button
                  type="button"
                  onClick={() => console.log("UI only (edit):", draft)}
                  className="w-full rounded-lg bg-[var(--pantone-7421)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 active:opacity-90 sm:w-auto"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}