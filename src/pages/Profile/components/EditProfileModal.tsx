import { useState } from "react";
import {
  X,
  UserRound,
  Phone,
  Smartphone,
  MapPin,
  Mail,
  Shield,
  Briefcase,
  Building2,
  Landmark,
  Loader2,
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { createPortal } from "react-dom";
import type { EditProfileModalProps as Props } from "../Profile.types";
import ProfileField from "./ProfileField";
import { useEditProfile, type CatalogItem } from "../hooks/useEditProfile";
import ErrorOverlay from "../../../components/ErrorOverlay";

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
      <label
        htmlFor={id}
        className="block text-xs font-medium text-slate-700 mb-1"
      >
        {label}
      </label>
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
  const {
    canAlwaysEdit,
    isSurveyor,
    isIncomplete,
    isEditable,
    profile,
    loading,
    submitting,
    error,
    dismissError,
    success,
    draft,
    setDraftField,
    draftErrors,
    accountDraft,
    setAccountDraftField,
    catalogs,
    loadingCatalogs,
    passwordDraft,
    setPasswordField,
    passwordValidation,
    showPassword,
    toggleShowPassword,
    showConfirm,
    toggleShowConfirm,
    hasChanges,
    hasDraftErrors,
    handleSave,
  } = useEditProfile(open);

  // Bloqueo local para evitar múltiples clics antes de que "submitting"
  // se actualice (por ejemplo, si hay validaciones async previas a la petición)
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveClick = async () => {
    if (isSaving || submitting) return;
    setIsSaving(true);
    try {
      await handleSave();
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  const saveDisabled =
    submitting || isSaving || !hasChanges || hasDraftErrors;

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
                disabled={submitting || isSaving}
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
                            <ReadonlyField
                              label="Rol"
                              icon={Shield}
                              value={profile?.role?.name ?? ""}
                            />
                            <SelectField
                              label="Ocupación"
                              icon={Briefcase}
                              value={accountDraft.occupation_id}
                              onChange={(v) =>
                                setAccountDraftField("occupation_id", v)
                              }
                              options={catalogs.occupations}
                              placeholder="Seleccionar ocupación"
                              disabled={loadingCatalogs || submitting || isSaving}
                            />
                            <SelectField
                              label="Dependencia"
                              icon={Building2}
                              value={accountDraft.dependency_id}
                              onChange={(v) =>
                                setAccountDraftField("dependency_id", v)
                              }
                              options={catalogs.dependencies}
                              placeholder="Seleccionar dependencia"
                              disabled={loadingCatalogs || submitting || isSaving}
                            />
                            <ReadonlyField
                              label="Institución"
                              icon={Landmark}
                              value={profile?.institution?.name ?? ""}
                            />
                          </>
                        ) : (
                          <>
                            <ReadonlyField
                              label="Rol"
                              icon={Shield}
                              value={profile.role?.name ?? ""}
                            />
                            <ReadonlyField
                              label="Ocupación"
                              icon={Briefcase}
                              value={profile.occupation?.name ?? ""}
                            />
                            <ReadonlyField
                              label="Dependencia"
                              icon={Building2}
                              value={profile.dependency?.name ?? ""}
                            />
                            <ReadonlyField
                              label="Institución"
                              icon={Landmark}
                              value={profile.institution?.name ?? ""}
                            />
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
                            <ProfileField
                              label="Nombre(s)"
                              icon={UserRound}
                              value={draft.name}
                              onChange={(v) => setDraftField("name", v)}
                              maxLength={50}
                              error={draftErrors.name}
                            />
                            <ProfileField
                              label="Apellidos"
                              icon={UserRound}
                              value={draft.lastname}
                              onChange={(v) => setDraftField("lastname", v)}
                              maxLength={50}
                              error={draftErrors.lastname}
                            />
                            <ProfileField
                              label="Teléfono fijo"
                              icon={Phone}
                              value={draft.phone}
                              onChange={(v) => setDraftField("phone", v)}
                              maxLength={15}
                              numbersOnly
                              error={draftErrors.phone}
                            />
                            <ProfileField
                              label="Teléfono móvil"
                              icon={Smartphone}
                              value={draft.mobile}
                              onChange={(v) => setDraftField("mobile", v)}
                              maxLength={15}
                              numbersOnly
                              error={draftErrors.mobile}
                            />
                            <ProfileField
                              className="sm:col-span-2"
                              label="Dirección"
                              icon={MapPin}
                              value={draft.address}
                              onChange={(v) => setDraftField("address", v)}
                              maxLength={200}
                              error={draftErrors.address}
                            />
                          </>
                        ) : (
                          <>
                            <ReadonlyField
                              label="Nombre(s)"
                              icon={UserRound}
                              value={profile.name ?? ""}
                            />
                            <ReadonlyField
                              label="Apellidos"
                              icon={UserRound}
                              value={profile.lastname ?? ""}
                            />
                            <ReadonlyField
                              label="Teléfono fijo"
                              icon={Phone}
                              value={profile.phone ?? ""}
                            />
                            <ReadonlyField
                              label="Teléfono móvil"
                              icon={Smartphone}
                              value={profile.mobile ?? ""}
                            />
                            <ReadonlyField
                              className="sm:col-span-2"
                              label="Dirección"
                              icon={MapPin}
                              value={profile.address ?? ""}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cambiar contraseña */}
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Cambiar contraseña
                      <span className="ml-2 normal-case text-slate-400">
                        (Opcional)
                      </span>
                    </p>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4 space-y-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                        <PasswordField
                          label="Nueva contraseña"
                          value={passwordDraft.password}
                          onChange={(v) => setPasswordField("password", v)}
                          show={showPassword}
                          onToggleShow={toggleShowPassword}
                        />
                        <PasswordField
                          label="Confirmar contraseña"
                          value={passwordDraft.password_confirmation}
                          onChange={(v) =>
                            setPasswordField("password_confirmation", v)
                          }
                          show={showConfirm}
                          onToggleShow={toggleShowConfirm}
                        />
                      </div>
                      {passwordValidation && passwordValidation.length > 0 && (
                        <ul className="space-y-1 pl-1">
                          {passwordValidation.map((err) => (
                            <li
                              key={err}
                              className="flex items-center gap-1.5 text-xs text-red-600"
                            >
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                              {err}
                            </li>
                          ))}
                        </ul>
                      )}
                      {passwordValidation?.length === 0 &&
                        passwordDraft.password_confirmation && (
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
                              {catalogs.censuses.map(
                                (census: any, index: number) => (
                                  <li
                                    key={index}
                                    className={`ms-5 ${index !== catalogs.censuses.length - 1 ? "mb-5" : ""}`}
                                  >
                                    <div className="absolute -start-[7px] mt-1.5 h-3 w-3 rounded-full bg-slate-300 border border-white" />
                                    <time className="text-xs font-medium text-slate-400">
                                      {census.init_date ?? "Sin fecha"}
                                    </time>
                                    <p className="mt-1 text-sm font-medium text-slate-600">
                                      {census.name}
                                    </p>
                                  </li>
                                ),
                              )}
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
                  disabled={submitting || isSaving}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={handleSaveClick}
                  disabled={saveDisabled}
                  className="w-full rounded-lg bg-[var(--pantone-7421)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 active:opacity-90 disabled:opacity-60 sm:w-auto"
                >
                  {submitting || isSaving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>

            <ErrorOverlay message={error} onDismiss={dismissError} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
