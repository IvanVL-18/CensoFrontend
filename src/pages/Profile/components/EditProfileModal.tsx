import {
  X, UserRound, Phone, Smartphone, MapPin,
  Mail, Shield, Briefcase, Building2, Landmark,
  Loader2, ChevronDown, Lock, Eye, EyeOff,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { EditProfileModalProps as Props } from "../Profile.types";
import ProfileField from "./ProfileField";
import { getProfile, updateProfile, getCatalogList, type FullProfile, type UpdateProfileData } from "../Profile.service";
import { passwordChangeSchema } from "../schemas/Profile.schema";
import { useAuthContext } from "../../../context/AuthContext";

// Campo de solo lectura (no editable)
function ReadonlyField({
  label,
  icon: Icon,
  value,
  className,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="block text-xs font-medium text-slate-700 mb-1">{label}</p>
      <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-100 px-3 py-2 text-sm text-slate-600">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="truncate">{value || "—"}</span>
      </div>
    </div>
  );
}

type CatalogItem = { id: string | number; name: string };

function SelectField({
  label,
  icon: Icon,
  value,
  onChange,
  options,
  placeholder,
  className,
  disabled,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  onChange: (v: string) => void;
  options: CatalogItem[];
  placeholder: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div className={className}>
      <p className="block text-xs font-medium text-slate-700 mb-1">{label}</p>
      <div className="relative flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
        <Icon className="h-4 w-4 shrink-0 text-slate-400 mr-2" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-1 bg-transparent focus:outline-none text-sm text-slate-700 appearance-none cursor-pointer disabled:cursor-not-allowed disabled:text-slate-400 pr-4"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.id} value={String(opt.id)}>
              {opt.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 h-4 w-4 shrink-0 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  className?: string;
}) {
  const id = `pw-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
          <Lock className="h-4 w-4" />
        </span>
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={30}
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--pantone-7421)]/40 focus:border-[var(--pantone-7421)]"
        />
        <button
          type="button"
          onClick={onToggleShow}
          tabIndex={-1}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default function EditProfileModal({ open, onClose }: Props) {
  const { user: authUser } = useAuthContext();
  const canAlwaysEdit = authUser?.role === "Admin" || authUser?.role === "Super Admin";
  const isSurveyor    = authUser?.role === "Surveyed";

  const [profile,    setProfile]    = useState<FullProfile | null>(null);
  const [draft,      setDraft]      = useState({ name: "", lastname: "", phone: "", mobile: "", address: "" });
  const [accountDraft,         setAccountDraft]         = useState({ occupation_id: "", dependency_id: "", census_id: "" });
  const [originalAccountDraft, setOriginalAccountDraft] = useState({ occupation_id: "", dependency_id: "", census_id: "" });
  const [passwordDraft, setPasswordDraft] = useState({ password: "", password_confirmation: "" });
  const [showPassword,  setShowPassword]  = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [catalogs, setCatalogs] = useState<{ occupations: CatalogItem[]; dependencies: CatalogItem[]; censuses: CatalogItem[] }>({ occupations: [], dependencies: [], censuses: [] });
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [success,    setSuccess]    = useState<string | null>(null);

  // Perfil incompleto si falta nombre, apellidos o dirección
  const isIncomplete = !profile?.name?.trim() || !profile?.lastname?.trim() || !profile?.address?.trim();
  const isEditable = isIncomplete || canAlwaysEdit;

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(null);
    setLoading(true);

    getProfile()
      .then((p) => {
        setProfile(p);
        setDraft({
          name:     p.name     ?? "",
          lastname: p.lastname ?? "",
          phone:    p.phone    ?? "",
          mobile:   p.mobile   ?? "",
          address:  p.address  ?? "",
        });
      })
      .catch((err) => {
        setError(err?.message ?? "Error al cargar el perfil.");
      })
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open || !canAlwaysEdit) return;
    const controller = new AbortController();
    setLoadingCatalogs(true);
    Promise.all([
      getCatalogList("occupations/data/list",  controller.signal),
      getCatalogList("dependency/data/list",   controller.signal),
      getCatalogList("censuses/active/content",    controller.signal),
    ])
      .then(([
        occsData,
        depsData,
        censusesData,
      ]: [CatalogItem[], CatalogItem[], CatalogItem[] | { censuses?: CatalogItem[] }]) => {
        const censusItems = Array.isArray(censusesData)
          ? censusesData
          : censusesData?.censuses ?? [];

        setCatalogs({
          occupations: occsData,
          dependencies: depsData,
          censuses: censusItems,
        });
      })
      .catch(() => {})
      .finally(() => { if (!controller.signal.aborted) setLoadingCatalogs(false); });
    return () => controller.abort();
  }, [open, canAlwaysEdit]);

  // Fetch censos asignados para Surveyed — usa el endpoint exclusivo del rol
  useEffect(() => {
    if (!open || !isSurveyor) return;
    const controller = new AbortController();
    getCatalogList("answers/my-censuses", controller.signal)
      .then((data) => {
        const items = Array.isArray(data) ? data : (data as any)?.censuses ?? [];
        setCatalogs((prev) => ({ ...prev, censuses: items }));
      })
      .catch(() => {});
    return () => controller.abort();
  }, [open, isSurveyor]);

  // Sincroniza accountDraft cuando el perfil Y los catálogos están listos
  useEffect(() => {
    if (!profile || !canAlwaysEdit) return;

    const findId = (
      catalog: CatalogItem[],
      relation: { id: string | number; name: string } | null | undefined,
    ): string => {
      if (!relation) return "";
      const byId = catalog.find((item) => String(item.id) === String(relation.id));
      if (byId) return String(byId.id);
      const byName = catalog.find(
        (item) => item.name.trim().toLowerCase() === relation.name.trim().toLowerCase(),
      );
      return byName ? String(byName.id) : "";
    };

    const initial = {
      occupation_id: findId(catalogs.occupations,  profile.occupation),
      dependency_id: findId(catalogs.dependencies, profile.dependency),
      census_id:     findId(catalogs.censuses,     profile.census),
    };
    setAccountDraft(initial);
    setOriginalAccountDraft(initial);
  }, [profile, catalogs]);

  const passwordValidation = useMemo(() => {
    const { password, password_confirmation } = passwordDraft;
    if (!password) return null;
    const result = passwordChangeSchema.safeParse({ password, password_confirmation });
    if (result.success) return [];
    return result.error.issues
      .filter((e) => !(e.path[0] === "password_confirmation" && !password_confirmation))
      .map((e) => e.message);
  }, [passwordDraft]);

  const hasChanges = useMemo(() => {
    const personalChanged =
      draft.name     !== (profile?.name     ?? "") ||
      draft.lastname !== (profile?.lastname ?? "") ||
      draft.phone    !== (profile?.phone    ?? "") ||
      draft.mobile   !== (profile?.mobile   ?? "") ||
      draft.address  !== (profile?.address  ?? "");
    const passwordChanged = !!passwordDraft.password;
    if (!canAlwaysEdit) return personalChanged || passwordChanged;
    const accountChanged =
      accountDraft.occupation_id !== originalAccountDraft.occupation_id ||
      accountDraft.dependency_id !== originalAccountDraft.dependency_id ||
      accountDraft.census_id     !== originalAccountDraft.census_id;
    return personalChanged || accountChanged || passwordChanged;
  }, [draft, profile, accountDraft, originalAccountDraft, canAlwaysEdit, passwordDraft]);

  const handleSave = async () => {
    if (passwordDraft.password && passwordValidation && passwordValidation.length > 0) {
      setError("Corrige los errores en la contraseña antes de guardar.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const payload: UpdateProfileData = {
        name:     draft.name     || null,
        lastname: draft.lastname || null,
        address:  draft.address  || null,
      };
      // Only include phone/mobile if changed — backend unique validation doesn't exclude current user
      if (draft.phone !== (profile?.phone ?? "")) {
        payload.phone = draft.phone || null;
      }
      if (draft.mobile !== (profile?.mobile ?? "")) {
        payload.mobile = draft.mobile || null;
      }
      if (canAlwaysEdit) {
        payload.occupation_id  = accountDraft.occupation_id  || null;
        payload.dependency_id  = accountDraft.dependency_id  || null;
        payload.census_id      = accountDraft.census_id      || null;
      }
      if (passwordDraft.password) {
        payload.password              = passwordDraft.password;
        payload.password_confirmation = passwordDraft.password_confirmation;
      }
      const res = await updateProfile(payload);
      setPasswordDraft({ password: "", password_confirmation: "" });
      setShowPassword(false);
      setShowConfirm(false);
      setSuccess(res.message ?? "Perfil actualizado correctamente.");
    } catch (err: any) {
      setError(err?.message ?? "Error al guardar los cambios.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
        onClick={onClose}
      />
    <div className="relative flex min-h-dvh items-center justify-center p-2 sm:p-4 md:p-6">
    <div
      className="w-[calc(100vw-1rem)] sm:w-full max-w-3xl h-[705px] max-h-[94dvh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative flex h-full flex-col">

        {/* Header */}
        <div className="shrink-0 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
          <button
            onClick={onClose}
            aria-label="Cerrar"
            disabled={submitting}
            className="absolute right-3 top-3 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 sm:right-4 sm:top-4 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="pr-8">
            <p className="text-lg font-semibold text-slate-900 sm:text-xl">
              Mi perfil
            </p>

            {profile && (
              <div className="mt-1 inline-flex max-w-full items-center gap-2 text-sm text-slate-500">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {loading && (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Cargando perfil...</span>
            </div>
          )}

          {!loading && error && !profile && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {!loading && profile && (
            <div className="space-y-4">

              {/* Información de cuenta */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Información de cuenta
                  {canAlwaysEdit && (
                    <span className="ml-2 normal-case text-slate-400">
                      (Editable)
                    </span>
                  )}
                </p>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {canAlwaysEdit ? (
                      <>
                        <ReadonlyField label="Rol" icon={Shield} value={profile?.role?.name ?? ""} />

                        <SelectField
                          label="Ocupación"
                          icon={Briefcase}
                          value={accountDraft.occupation_id}
                          onChange={(v) =>
                            setAccountDraft((s) => ({ ...s, occupation_id: v }))
                          }
                          options={catalogs.occupations}
                          placeholder="Seleccionar ocupación"
                          disabled={loadingCatalogs || submitting}
                        />

                        <SelectField
                          label="Dependencia"
                          icon={Building2}
                          value={accountDraft.dependency_id}
                          onChange={(v) =>
                            setAccountDraft((s) => ({ ...s, dependency_id: v }))
                          }
                          options={catalogs.dependencies}
                          placeholder="Seleccionar dependencia"
                          disabled={loadingCatalogs || submitting}
                        />

                        <ReadonlyField label="Institución" icon={Landmark} value={profile?.institution?.name ?? ""} />
                      </>
                    ) : (
                      <>
                        <ReadonlyField label="Rol" icon={Shield} value={profile.role?.name ?? ""} />
                        <ReadonlyField label="Ocupación" icon={Briefcase} value={profile.occupation?.name ?? ""} />
                        <ReadonlyField label="Dependencia" icon={Building2} value={profile.dependency?.name ?? ""} />
                        <ReadonlyField label="Institución" icon={Landmark} value={profile.institution?.name ?? ""} />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Datos personales */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Datos personales
                  {isIncomplete && (
                    <span className="ml-2 normal-case text-amber-500">
                      (Completa tu información)
                    </span>
                  )}
                  {!isIncomplete && canAlwaysEdit && (
                    <span className="ml-2 normal-case text-slate-400">
                      (Editable)
                    </span>
                  )}
                </p>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    {isEditable ? (
                      <>
                        <ProfileField label="Nombre(s)" icon={UserRound} value={draft.name} onChange={(v) => setDraft((s) => ({ ...s, name: v }))} maxLength={50} />
                        <ProfileField label="Apellidos" icon={UserRound} value={draft.lastname} onChange={(v) => setDraft((s) => ({ ...s, lastname: v }))} maxLength={50} />
                        <ProfileField label="Teléfono fijo" icon={Phone} value={draft.phone} onChange={(v) => setDraft((s) => ({ ...s, phone: v }))} maxLength={20} />
                        <ProfileField label="Teléfono móvil" icon={Smartphone} value={draft.mobile} onChange={(v) => setDraft((s) => ({ ...s, mobile: v }))} maxLength={20} />
                        <ProfileField className="sm:col-span-2" label="Dirección" icon={MapPin} value={draft.address} onChange={(v) => setDraft((s) => ({ ...s, address: v }))} maxLength={200} />
                      </>
                    ) : (
                      <>
                        <ReadonlyField label="Nombre(s)" icon={UserRound} value={profile.name ?? ""} />
                        <ReadonlyField label="Apellidos" icon={UserRound} value={profile.lastname ?? ""} />
                        <ReadonlyField label="Teléfono fijo" icon={Phone} value={profile.phone ?? ""} />
                        <ReadonlyField label="Teléfono móvil" icon={Smartphone} value={profile.mobile ?? ""} />
                        <ReadonlyField className="sm:col-span-2" label="Dirección" icon={MapPin} value={profile.address ?? ""} />
                      </>
                    )}
                  </div>
                </div>
              </div>
              {/* Cambiar contraseña */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Cambiar contraseña
                  <span className="ml-2 normal-case text-slate-400">(Opcional)</span>
                </p>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4 space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <PasswordField
                      label="Nueva contraseña"
                      value={passwordDraft.password}
                      onChange={(v) => setPasswordDraft((s) => ({ ...s, password: v }))}
                      show={showPassword}
                      onToggleShow={() => setShowPassword((s) => !s)}
                    />
                    <PasswordField
                      label="Confirmar contraseña"
                      value={passwordDraft.password_confirmation}
                      onChange={(v) => setPasswordDraft((s) => ({ ...s, password_confirmation: v }))}
                      show={showConfirm}
                      onToggleShow={() => setShowConfirm((s) => !s)}
                    />
                  </div>
                  {passwordValidation && passwordValidation.length > 0 && (
                    <ul className="space-y-1 pl-1">
                      {passwordValidation.map((err) => (
                        <li key={err} className="flex items-center gap-1.5 text-xs text-red-600">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                          {err}
                        </li>
                      ))}
                    </ul>
                  )}
                  {passwordValidation?.length === 0 && passwordDraft.password_confirmation && (
                    <p className="flex items-center gap-1.5 text-xs text-green-600">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                      Contraseña válida
                    </p>
                  )}
                </div>
              </div>

              {/* Censos asignados — solo visible para Encuestadores */}
{isSurveyor && (
<div>
  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
    Censos asignados
  </p>

  <details className="group rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
    <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
      <span>Ver censos</span>

      <ChevronDown
        size={18}
        className="text-slate-400 transition-transform duration-200 group-open:rotate-180"
      />
    </summary>

    <div className="mt-5 max-h-64 overflow-y-auto pr-2">
      {catalogs.censuses.length > 0 ? (
        <ol className="relative border-s border-slate-200">
  {catalogs.censuses.map((census: any, index: number) => (
    <li
      key={index}
      className={`ms-5 ${
        index !== catalogs.censuses.length - 1 ? "mb-5" : ""
      }`}
    >
      <div className="absolute -start-[7px] mt-1.5 h-3 w-3 rounded-full bg-slate-300 border border-white" />

      <time className="text-xs font-medium text-slate-400">
        {census.init_date ?? "Sin fecha"}
      </time>

      <p className="mt-1 text-sm font-medium text-slate-600">
        {census.name}
      </p>
    </li>
  ))}
</ol>
      ) : (
        <p className="text-sm text-slate-500">
          No hay censos asignados.
        </p>
      )}
    </div>
  </details>
</div>
)}

              {error && (
                <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              {success && (
                <p className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                  {success}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 px-4 py-4 sm:px-6">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={submitting || !hasChanges}
              className="w-full rounded-lg bg-[var(--pantone-7421)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 active:opacity-90 disabled:opacity-60 sm:w-auto"
            >
              {submitting ? "Guardando..." : "Guardar cambios"}
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
