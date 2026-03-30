import { X, UserRound, Phone, Smartphone, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ProfileData, CompleteProfileModalProps as Props } from "../Profile.types";
import ProfileField from "./ProfileField";
import { completeProfile } from "../Profile.service";
import { useAuthContext } from "../../../context/AuthContext";

const EMPTY: ProfileData = { name: null, lastname: null, phone: null, mobile: null, address: null };

export default function CompleteProfileModal({ open, onClose, user }: Props) {
  const { markProfileComplete } = useAuthContext();

  const [draft,      setDraft]      = useState<ProfileData>(user?.profile ?? EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(user?.profile ?? EMPTY);
    setError(null);
  }, [open, user]);

  if (!open || !user) return null;

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await completeProfile(draft);
      markProfileComplete();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Error al guardar el perfil");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    
    if (!draft.name?.trim() || !draft.lastname?.trim() || !draft.address?.trim()) {
      setError("Nombre, apellidos y dirección son obligatorios.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await completeProfile(draft);
      onCompleted({
        ...user,
        profile: {
          ...draft,
          profile_completed_at: new Date().toISOString(),
        },
      });
    } catch {
      setError("Ocurrió un error al guardar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/35 backdrop-blur-[2px]">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all">
          <div className="relative p-4 sm:p-6">

            <button
              onClick={onClose}
              aria-label="Cerrar"
              disabled={submitting}
              className="absolute right-4 top-4 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-3">
              <div className="min-w-0">
                <p className="text-lg font-semibold text-slate-900">Ingresa tus datos</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Completa tu información para poder ingresar al sistema.
                </p>
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
                  className="sm:col-span-2"
                  label="Dirección"
                  icon={MapPin}
                  value={draft.address ?? ""}
                  onChange={(v) => setDraft((s) => ({ ...s, address: v }))}
                  maxLength={200}
                />
              </div>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={submitting}
                className="w-full rounded-lg bg-[var(--pantone-7421)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 active:opacity-90 transition disabled:opacity-60 sm:w-auto"
              >
                {submitting ? "Guardando..." : "Guardar"}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
