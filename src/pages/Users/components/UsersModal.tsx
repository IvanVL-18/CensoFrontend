import {
  useState,
  useEffect,
  useMemo,
  type FormEvent,
  type ChangeEvent,
} from "react";
import {
  X,
  Eye,
  EyeClosed,
  UserRoundPen,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { FormErrors } from "./FormErrors";
import { UserSchema } from "../schemas/Users.schema";
import type { Rol } from "../../Roles/Roles.types";
import PasswordStrengthMeter from "./PasswordStrengthMeter";

const EMAIL_MAX_LENGTH = 55;
const PASSWORD_MAX_LENGTH = 30;

const findIdInCatalog = (catalog: any[], relation: any, fallbackId: any) => {
  if (relation?.name) {
    const match = catalog.find(
      (item) =>
        String(item.name).trim().toLowerCase() ===
        String(relation.name).trim().toLowerCase()
    );
    if (match) return String(match.id);
  }
  if (fallbackId) {
    const directMatch = catalog.find(
      (item) => String(item.id) === String(fallbackId)
    );
    if (directMatch) return String(directMatch.id);
  }
  return "";
};

interface ExtendedUserModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialData?: any;
  roles?: Rol[];
  occupations?: any[];
  dependencies?: any[];
  institutions?: any[];
  onClose: () => void;
  onSave: (data: any) => void;
  onOpenExtra?: (user: any) => void;
}

export function UserModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialData,
  roles = [],
  occupations = [],
  dependencies = [],
  institutions = [],
  onClose,
  onSave,
  onOpenExtra,
}: ExtendedUserModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    role_id: "",
    occupation_id: "",
    dependency_id: "",
    institution_id: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [pwdFocus, setPwdFocus] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const role_id = findIdInCatalog(roles, initialData?.role, initialData?.role_id);
    const occupation_id = findIdInCatalog(
      occupations,
      initialData?.occupation,
      initialData?.occupation_id
    );
    const dependency_id = findIdInCatalog(
      dependencies,
      initialData?.dependency,
      initialData?.dependency_id
    );
    const institution_id = findIdInCatalog(
      institutions,
      initialData?.institution,
      initialData?.institution_id
    );

    const newFormData = {
      email: initialData?.email || "",
      password: "",
      password_confirmation: "",
      role_id,
      occupation_id,
      dependency_id,
      institution_id,
    };

    setFormData(newFormData);
    setFieldErrors({});
    setTouched(
      Object.fromEntries(
        Object.entries(newFormData).map(([k, v]) => [k, v !== ""])
      )
    );
  }, [isOpen, initialData, roles, occupations, dependencies, institutions]);

  const validateForm = (data: typeof formData, isCreation = !initialData) => {
    let dataForValidation: any = { ...data };
    if (!isCreation && !dataForValidation.password) {
      const { password, password_confirmation, ...rest } = dataForValidation;
      dataForValidation = rest;
    }
    const result = UserSchema.safeParse(dataForValidation);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (path && !errors[path]) errors[path] = issue.message;
      });
      setFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const handleFieldChange =
    (field: keyof typeof formData, maxLength?: number) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let value = e.target.value;
      if (maxLength) value = value.slice(0, maxLength);
      setFormData((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateForm({ ...formData, [field]: value }, !initialData);
    };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, PASSWORD_MAX_LENGTH);
    setFormData((prev) => ({ ...prev, password: value }));
    setTouched((prev) => ({ ...prev, password: true }));
    validateForm({ ...formData, password: value }, !initialData);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, PASSWORD_MAX_LENGTH);
    setFormData((prev) => ({ ...prev, password_confirmation: value }));
    setTouched((prev) => ({ ...prev, password_confirmation: true }));
    validateForm({ ...formData, password_confirmation: value }, !initialData);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const allTouched = Object.keys(formData).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {}
    );
    setTouched(allTouched);
    if (validateForm(formData, !initialData)) {
      onSave(formData);
    }
  };

  const hasChanges = useMemo(() => {
    if (!initialData) return true;
    const normalize = (val: any) =>
      val === null || val === undefined ? "" : String(val).trim();

    const emailChanged = normalize(formData.email) !== normalize(initialData.email);
    const passwordChanged = formData.password !== "";

    const getSelectedName = (list: any[], id: string | number) => {
      const item = list.find((i) => String(i.id) === String(id));
      return item ? item.name : "";
    };

    const checkRelationChange = (
      currentId: string | number,
      initialRel: any,
      catalog: any[]
    ) => {
      const initialId = initialRel?.id || "";
      if (normalize(currentId) === normalize(initialId)) return false;
      const currentName = getSelectedName(catalog, currentId);
      return normalize(currentName) !== normalize(initialRel?.name || "");
    };

    const roleChanged = checkRelationChange(
      formData.role_id,
      initialData.role,
      roles
    );
    const occupationChanged = checkRelationChange(
      formData.occupation_id,
      initialData.occupation,
      occupations
    );
    const dependencyChanged = checkRelationChange(
      formData.dependency_id,
      initialData.dependency,
      dependencies
    );
    const institutionChanged = checkRelationChange(
      formData.institution_id,
      initialData.institution,
      institutions
    );

    return (
      emailChanged ||
      passwordChanged ||
      roleChanged ||
      occupationChanged ||
      dependencyChanged ||
      institutionChanged
    );
  }, [formData, initialData, roles, occupations, dependencies, institutions]);

  const visibleErrors = useMemo(
    () =>
      Object.entries(fieldErrors)
        .filter(([key]) => touched[key])
        .map(([, msg]) => msg)
        .filter(Boolean),
    [fieldErrors, touched]
  );

  const getFieldStyles = (field: keyof typeof formData, maxLength: number) => {
    const value = formData[field];
    const length = value.length;
    const hasError = touched[field] && !!fieldErrors[field];
    const isNearLimit = length >= maxLength - 10 && length <= maxLength;
    const isAtLimit = length >= maxLength;

    const borderColor = hasError
      ? "border-red-500 focus:ring-red-400"
      : isAtLimit
      ? "border-red-300 focus:ring-red-400"
      : isNearLimit
      ? "border-amber-300 focus:ring-amber-400"
      : "border-gray-300 focus:ring-[#DDC9A3]";

    const progressColor = isAtLimit
      ? "bg-red-600"
      : isNearLimit
      ? "bg-amber-500"
      : "bg-[#DDC9A3]";

    const charCountColor = isAtLimit
      ? "text-red-600"
      : isNearLimit
      ? "text-amber-600"
      : "text-gray-500";

    return { borderColor, progressColor, charCountColor, length };
  };

  const emailStyles = getFieldStyles("email", EMAIL_MAX_LENGTH);
  const passwordStyles = getFieldStyles("password", PASSWORD_MAX_LENGTH);

  const canSave =
    !isSubmitting &&
    Object.keys(fieldErrors).length === 0 &&
    hasChanges &&
    !(touched.password_confirmation && fieldErrors.password_confirmation);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-300">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Correo Electrónico:
                  </label>
                  <span className={`text-xs font-medium ${emailStyles.charCountColor}`}>
                    {emailStyles.length}/{EMAIL_MAX_LENGTH} caracteres
                  </span>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFieldChange("email", EMAIL_MAX_LENGTH)}
                  className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${emailStyles.borderColor}`}
                  disabled={isSubmitting}
                  autoFocus
                />
                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${emailStyles.progressColor}`}
                    style={{ width: `${(emailStyles.length / EMAIL_MAX_LENGTH) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña{" "}
                    {initialData
                      ? "(Dejar vacía para no cambiar)"
                      : "(Obligatoria)"}:
                  </label>
                  <span className={`text-xs font-medium ${passwordStyles.charCountColor}`}>
                    {passwordStyles.length}/{PASSWORD_MAX_LENGTH} caracteres
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    onFocus={() => setPwdFocus(true)}
                    onBlur={() => setPwdFocus(false)}
                    className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 pr-10 ${passwordStyles.borderColor}`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStyles.progressColor}`}
                    style={{ width: `${(passwordStyles.length / PASSWORD_MAX_LENGTH) * 100}%` }}
                  />
                </div>
                {(!initialData || formData.password.length > 0) && (
                  <PasswordStrengthMeter
                    password={formData.password}
                    className="mt-2"
                    showRules={pwdFocus}
                  />
                )}
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña:
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="password_confirmation"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleConfirmPasswordChange}
                    className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3] pr-10 ${
                      touched.password_confirmation && fieldErrors.password_confirmation
                        ? "border-red-500 focus:ring-red-400"
                        : "border-gray-300"
                    }`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeClosed size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {touched.password_confirmation && formData.password_confirmation.length > 0 && (
                  <div
                    className={`mt-2 flex items-center gap-2 text-xs font-medium ${
                      formData.password === formData.password_confirmation
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}
                  >
                    {formData.password === formData.password_confirmation ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Las contraseñas coinciden</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        <span>Las contraseñas no coinciden</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Rol:
                </label>
                <select
                  id="role_id"
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleFieldChange("role_id")}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar Rol</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="occupation_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Ocupación:
                </label>
                <select
                  id="occupation_id"
                  name="occupation_id"
                  value={formData.occupation_id}
                  onChange={handleFieldChange("occupation_id")}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar Ocupación</option>
                  {occupations.map((occ: any) => (
                    <option key={occ.id} value={occ.id}>
                      {occ.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="dependency_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Dependencia:
                </label>
                <select
                  id="dependency_id"
                  name="dependency_id"
                  value={formData.dependency_id}
                  onChange={handleFieldChange("dependency_id")}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar Dependencia</option>
                  {dependencies.map((dep: any) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="institution_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Institución:
                </label>
                <select
                  id="institution_id"
                  name="institution_id"
                  value={formData.institution_id}
                  onChange={handleFieldChange("institution_id")}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
                  disabled={isSubmitting}
                >
                  <option value="">Seleccionar Institución</option>
                  {institutions.map((inst: any) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <FormErrors errors={visibleErrors} />
                {error && <FormErrors errors={[error]} />}
              </div>
            </div>

            <div className="flex justify-end items-center gap-4 p-4 bg-gray-50">
              <button
                type="button"
                title={
                  initialData
                    ? "Completar datos (Nombre, Apellido, Teléfono, Celular, Dirección)"
                    : "Solo disponible al editar"
                }
                onClick={() => initialData && onOpenExtra?.(initialData)}
                disabled={!initialData}
                className="bg-white border border-[#691b31] text-[#691b31] font-bold rounded-lg hover:bg-gray-100 disabled:opacity-50 w-10 h-10 flex items-center justify-center transition-colors"
              >
                <UserRoundPen size={20} />
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!canSave}
                className="bg-white border border-[#691b31] text-[#691b31] font-bold py-2 px-6 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}