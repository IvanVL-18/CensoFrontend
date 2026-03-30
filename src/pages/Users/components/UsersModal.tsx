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
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pwdFocus, setPwdFocus] = useState(false);

  const hasChanges = useMemo(() => {
    const normalize = (val: any) =>
      val === null || val === undefined ? "" : String(val).trim();

    const emailChanged =
      normalize(formData.email) !== normalize(initialData?.email);
    const passwordChanged = formData.password !== "";

    const getSelectedName = (list: any[], id: string | number) => {
      const item = list.find((i) => String(i.id) === String(id));
      return item ? item.name : "";
    };

    const checkRelationChange = (
      currentId: string | number,
      initialRel: any,
      catalog: any[],
    ) => {
      const initialId = initialRel?.id || "";
      const initialName = initialRel?.name || "";
      if (normalize(currentId) === normalize(initialId)) return false;
      const currentName = getSelectedName(catalog, currentId);
      return normalize(currentName) !== normalize(initialName);
    };

    const roleChanged = checkRelationChange(
      formData.role_id,
      initialData?.role,
      roles,
    );
    const occupationChanged = checkRelationChange(
      formData.occupation_id,
      initialData?.occupation,
      occupations,
    );
    const dependencyChanged = checkRelationChange(
      formData.dependency_id,
      initialData?.dependency,
      dependencies,
    );
    const institutionChanged = checkRelationChange(
      formData.institution_id,
      initialData?.institution,
      institutions,
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

  const validateForm = (data: typeof formData) => {
    const dataForValidation: any = { ...data };
    if (initialData && !dataForValidation.password) {
      delete dataForValidation.password;
      delete dataForValidation.password_confirmation;
    }
    // Strip empty optional relation fields so Zod treats them as undefined
    if (!dataForValidation.role_id) delete dataForValidation.role_id;
    if (!dataForValidation.occupation_id) delete dataForValidation.occupation_id;
    if (!dataForValidation.dependency_id) delete dataForValidation.dependency_id;
    if (!dataForValidation.institution_id) delete dataForValidation.institution_id;

    const result = UserSchema.safeParse(dataForValidation);

    if (!result.success) {
      const listIssues = result.error.issues.filter((issue) => {
        const field = String(issue.path?.[0] ?? "");
        return field !== "password" && field !== "password_confirmation";
      });

      setFormErrors(listIssues.map((i) => i.message));

      const fe: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = String(issue.path?.[0] ?? "form");
        if (!fe[key]) fe[key] = issue.message;
      });
      setFieldErrors(fe);

      return false;
    }

    setFormErrors([]);
    setFieldErrors({});
    return true;
  };

  useEffect(() => {
    if (isOpen) {
      const findIdInCatalog = (
        catalog: any[],
        relation: any,
        fallbackId: any,
      ) => {
        if (relation && relation.name) {
          const match = catalog.find(
            (item) =>
              String(item.name).trim().toLowerCase() ===
              String(relation.name).trim().toLowerCase(),
          );
          if (match) return match.id;
        }
        if (fallbackId) {
          const directMatch = catalog.find(
            (item) => String(item.id) === String(fallbackId),
          );
          if (directMatch) return directMatch.id;
        }

        return "";
      };
      setFormData({
        email: initialData?.email || "",
        password: "",
        password_confirmation: "",
        role_id: findIdInCatalog(
          roles,
          initialData?.role,
          initialData?.role_id,
        ),
        occupation_id: findIdInCatalog(
          occupations,
          initialData?.occupation,
          initialData?.occupation_id,
        ),
        dependency_id: findIdInCatalog(
          dependencies,
          initialData?.dependency,
          initialData?.dependency_id,
        ),
        institution_id: findIdInCatalog(
          institutions,
          initialData?.institution,
          initialData?.institution_id,
        ),
      });
      setFormErrors([]);
      setFieldErrors({});
    }
  }, [isOpen, initialData, roles, occupations, dependencies, institutions]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const ok = validateForm(formData);
    if (!ok) return;

    onSave(formData);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      validateForm(next);
      return next;
    });
  };

  if (!isOpen) {
    return null;
  }

  const hasClientErrors =
    formErrors.length > 0 || Object.keys(fieldErrors).length > 0;
  const handleClose = () => {
    setFormErrors([]);
    setFieldErrors({});
    onClose();
  };
  const showConfirmStatus =
    (!initialData || formData.password.length > 0) &&
    formData.password_confirmation.length > 0;

  const passwordsMatch =
    formData.password.length > 0 &&
    formData.password === formData.password_confirmation;

  const needsPasswordMatch = !initialData || formData.password.length > 0;

  const confirmMismatch =
    needsPasswordMatch &&
    formData.password_confirmation.length > 0 &&
    formData.password !== formData.password_confirmation;

  const isUnchanged = !hasChanges;
  const isDisabled = isSubmitting || hasClientErrors || isUnchanged || confirmMismatch;

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      ></div>

      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex-1 overflow-y-auto"
          >
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Correo Electrónico:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contraseña{" "}
                  {initialData
                    ? "(Dejar vacía para no cambiar)"
                    : "(Obligatoria)"}
                  :
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setPwdFocus(true)}
                    onBlur={() => setPwdFocus(false)}
                    className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3] pr-10"
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
                {(!initialData || formData.password.length > 0) && (
                  <PasswordStrengthMeter
                    password={formData.password}
                    className="mt-2"
                    showRules={pwdFocus}
                  />
                )}
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password_confirmation"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirmar Contraseña:
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="password_confirmation"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3] pr-10"
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeClosed size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
                {showConfirmStatus && (
                  <div
                    className={`mt-2 flex items-center gap-2 text-xs font-medium ${
                      passwordsMatch ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {passwordsMatch ? (
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
                <label
                  htmlFor="role_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Rol:
                </label>
                <select
                  id="role_id"
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
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
                <label
                  htmlFor="occupation_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Ocupación:
                </label>
                <select
                  id="occupation_id"
                  name="occupation_id"
                  value={formData.occupation_id}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
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
                <label
                  htmlFor="dependency_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Dependencia:
                </label>
                <select
                  id="dependency_id"
                  name="dependency_id"
                  value={formData.dependency_id}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
                >
                  <option value="">Seleccionar Dependencia</option>
                  {dependencies.length === 0 && (
                    <option disabled>Cargando dependencia...</option>
                  )}
                  {dependencies.map((dependency: any) => (
                    <option key={dependency.id} value={dependency.id}>
                      {dependency.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="institution_id"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Institución:
                </label>
                <select
                  id="institution_id"
                  name="institution_id"
                  value={formData.institution_id}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
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
                <div id="form-errors-client">
                  <FormErrors errors={formErrors} />
                </div>
                {error && (
                  <div id="form-errors-server">
                    <FormErrors errors={[error]} />
                  </div>
                )}
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
                onClick={handleClose}
                disabled={isSubmitting}
                className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isDisabled}
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
