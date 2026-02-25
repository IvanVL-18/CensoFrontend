import { X, UserRound, Phone, Smartphone, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import type { ProfileData, CompleteProfileModalProps as Props } from "../Profile.types";

function InputRow({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  maxLength,
  className,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Icon className="h-4 w-4" />
        </span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-900 shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/25 focus:border-[var(--pantone-7421)]"
        />
      </div>
    </div>
  );
}

export default function CompleteProfileModal({ open, onClose, user }: Props) {
  const [draft, setDraft] = useState<ProfileData>(user.profile);

  useEffect(() => {
    if (!open) return;
    setDraft(user.profile);
  }, [open, user]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-[2px] px-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        <div className="relative p-5">
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-4 top-4 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-start gap-3">
            <div className="min-w-0">
              <p className="text-base font-semibold text-slate-900">
                Ingresa tus datos
              </p>
              <p className="mt-0.5 text-sm text-slate-500">
                Completa tu infomación para poder ingresar al sistema.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputRow
                label="Nombre(s)"
                icon={UserRound}
                value={draft.name}
                onChange={(v) => setDraft((s) => ({ ...s, name: v }))}
                maxLength={50}
              />
              <InputRow
                label="Apellidos"
                icon={UserRound}
                value={draft.lastname}
                onChange={(v) => setDraft((s) => ({ ...s, lastname: v }))}
                maxLength={50}
              />
              <InputRow
                label="Teléfono fijo"
                icon={Phone}
                value={draft.phone}
                onChange={(v) => setDraft((s) => ({ ...s, phone: v }))}
                maxLength={20}
              />
              <InputRow
                label="Teléfono móvil"
                icon={Smartphone}
                value={draft.mobile}
                onChange={(v) => setDraft((s) => ({ ...s, mobile: v }))}
                maxLength={20}
              />
              <InputRow
                className="md:col-span-2"
                label="Dirección"
                icon={MapPin}
                value={draft.address}
                onChange={(v) => setDraft((s) => ({ ...s, address: v }))}
                maxLength={200}
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => console.log("UI only (complete):", draft)}
              className="rounded-lg bg-[var(--pantone-7421)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 active:opacity-90 transition"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}