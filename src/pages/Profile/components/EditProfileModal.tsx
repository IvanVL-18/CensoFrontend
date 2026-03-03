import { X, UserRound, Phone, Smartphone, MapPin, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProfileData, EditProfileModalProps as Props } from "../Profile.types";
import ProfileField from "./ProfileField";

export default function EditProfileModal({ open, onClose, user }: Props) {
  const [draft, setDraft] = useState<ProfileData>(user.profile);

  useEffect(() => {
    if (!open) return;
    setDraft(user.profile);
  }, [open, user]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/35 backdrop-blur-[2px]">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all">
          <div className="relative p-4 sm:p-6">
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-3">
              <div className="min-w-0">
                <p className="text-lg font-semibold text-slate-900">Mi perfil</p>

                <div className="mt-1 inline-flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
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
                  className="md:col-span-2"
                  label="Dirección"
                  icon={MapPin}
                  value={draft.address ?? ""}
                  onChange={(v) => setDraft((s) => ({ ...s, address: v }))}
                  maxLength={200}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition sm:w-auto"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={() => console.log("UI only (edit):", draft)}
                className="w-full rounded-lg bg-[var(--pantone-7421)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 active:opacity-90 transition sm:w-auto"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}