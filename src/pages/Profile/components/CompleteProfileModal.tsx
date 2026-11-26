import { UserRound, Phone, Smartphone, MapPin, LogOut } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { CompleteProfileModalProps as Props } from "../Profile.types";
import ProfileField from "./ProfileField";
import { completeProfile } from "../Profile.service";
import { useAuthContext } from "../../../context/AuthContext";
import {
  completeProfileSchema,
  type CompleteProfileSchema,
} from "../schemas/Profile.schema";

type Field = keyof CompleteProfileSchema;
type Draft = Record<Field, string>;
type FieldErrors = Partial<Record<Field, string>>;

const FIELDS: Field[] = ["name", "lastname", "phone", "mobile", "address"];
const ALL_TOUCHED: Record<Field, boolean> = {
  name: true,
  lastname: true,
  phone: true,
  mobile: true,
  address: true,
};

function toDraft(profile?: Partial<Record<Field, string | null>>): Draft {
  return {
    name: profile?.name ?? "",
    lastname: profile?.lastname ?? "",
    phone: profile?.phone ?? "",
    mobile: profile?.mobile ?? "",
    address: profile?.address ?? "",
  };
}

function validate(draft: Draft): FieldErrors {
  const result = completeProfileSchema.safeParse(draft);
  if (result.success) return {};
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as Field;
    if (!errors[field]) errors[field] = issue.message;
  }
  return errors;
}

const onlyDigits = (v: string) => v.replace(/\D/g, "");

/**
 * Formulario obligatorio: sin botón de cerrar, sin clic fuera ni Escape.
 * Solo desaparece cuando el backend acepta los datos (o si el usuario cierra sesión).
 */
export default function CompleteProfileModal({ open, onCompleted, onLogout, user }: Props) {
  const { markProfileComplete } = useAuthContext();

  const [draft,        setDraft]        = useState<Draft>(() => toDraft(user?.profile));
  const [touched,      setTouched]      = useState<Partial<Record<Field, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(toDraft(user?.profile));
    setTouched({});
    setServerErrors({});
    setError(null);
  }, [open, user]);

  const clientErrors = useMemo(() => validate(draft), [draft]);

  if (!open || !user) return null;

  // Los errores del backend (p. ej. teléfono ya registrado) tienen prioridad;
  // los del cliente solo se muestran en campos que el usuario ya tocó.
  const fieldError = (field: Field) =>
    serverErrors[field] ?? (touched[field] ? clientErrors[field] : undefined);

  const setField = (field: Field, value: string) => {
    setDraft((s) => ({ ...s, [field]: value }));
    setTouched((t) => ({ ...t, [field]: true }));
    setServerErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
    setError(null);
  };

  const handleSave = async () => {
    setTouched(ALL_TOUCHED);

    const result = completeProfileSchema.safeParse(draft);
    if (!result.success) {
      setError("Revisa los campos marcados en rojo.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await completeProfile(result.data);
      markProfileComplete();
      onCompleted({
        ...user,
        profile: { ...result.data, profile_completed_at: new Date().toISOString() },
      });
    } catch (caught) {
      // El interceptor de Axios copia status, data y message al error.
      const err = caught as {
        status?: number;
        message?: string;
        data?: { errors?: Record<string, string[] | string> };
      };
      const backendErrors = err?.status === 422 ? err?.data?.errors : null;
      const mapped: FieldErrors = {};
      if (backendErrors) {
        for (const f of FIELDS) {
          const msg = backendErrors[f];
          if (msg) mapped[f] = Array.isArray(msg) ? msg[0] : String(msg);
        }
      }

      if (Object.keys(mapped).length > 0) {
        setServerErrors(mapped);
        setError("Revisa los campos marcados en rojo.");
      } else {
        setError(err?.message ?? "Ocurrió un error al guardar. Intenta de nuevo.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="complete-profile-title"
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/35 backdrop-blur-[2px]"
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg transition-all">
          <div className="p-4 sm:p-6">

            <div className="min-w-0">
              <p id="complete-profile-title" className="text-lg font-semibold text-slate-900">
                Ingresa tus datos
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                Todos los campos son obligatorios para poder ingresar al sistema.
              </p>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <ProfileField
                  label="Nombre(s)"
                  icon={UserRound}
                  value={draft.name}
                  onChange={(v) => setField("name", v)}
                  maxLength={50}
                  error={fieldError("name")}
                />
                <ProfileField
                  label="Apellidos"
                  icon={UserRound}
                  value={draft.lastname}
                  onChange={(v) => setField("lastname", v)}
                  maxLength={50}
                  error={fieldError("lastname")}
                />
                <ProfileField
                  label="Teléfono fijo"
                  icon={Phone}
                  value={draft.phone}
                  onChange={(v) => setField("phone", onlyDigits(v))}
                  maxLength={15}
                  error={fieldError("phone")}
                />
                <ProfileField
                  label="Teléfono móvil"
                  icon={Smartphone}
                  value={draft.mobile}
                  onChange={(v) => setField("mobile", onlyDigits(v))}
                  maxLength={15}
                  error={fieldError("mobile")}
                />
                <ProfileField
                  className="sm:col-span-2"
                  label="Dirección"
                  icon={MapPin}
                  value={draft.address}
                  onChange={(v) => setField("address", v)}
                  maxLength={200}
                  error={fieldError("address")}
                />
              </div>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={onLogout}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-red-600 disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
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
