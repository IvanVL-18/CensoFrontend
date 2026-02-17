import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { FormErrors } from "./FormErrors";
import type { UserModalProps } from "../Users.types";
import { CreateUserSchema, UpdateUserSchema } from "../schemas/Users.schema";

export function UserModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialEmail = "",
  initialPassword = "",
  initialRoleId = "",
  roles = [],
  onClose,
  onSave,
}: UserModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialPassword);
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [roleId, setRoleId] = useState(initialRoleId);

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);

  const isEditing = Boolean(initialEmail);

  const schema = useMemo(
    () => (isEditing ? UpdateUserSchema : CreateUserSchema),
    [isEditing]
  );

  useEffect(() => {
    if (!isOpen) return;

    setEmail(initialEmail ?? "");
    setPassword(initialPassword ?? "");
    setPasswordConfirmation("");
    setRoleId(""); 
    setShowPassword(false);
    setShowPasswordConfirmation(false);
    setFormErrors([]);
    setTouched(false);
  }, [isOpen, initialEmail, initialPassword]);

  useEffect(() => {
    if (!touched) return;

    const result = schema.safeParse(buildPayload());

    if (!result.success) {
      setFormErrors(result.error.issues.map((i) => i.message));
    } else {
      setFormErrors([]);
    }
  }, [email, password, passwordConfirmation, roleId]);


  const buildPayload = () => ({
    email: String(email ?? ""),
    password: String(password ?? ""),
    password_confirmation: String(passwordConfirmation ?? ""),
    role_id: String(roleId ?? ""),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const result = schema.safeParse(buildPayload());

    if (!result.success) {
      setFormErrors(result.error.issues.map((i) => i.message));
      return;
    }

    onSave(buildPayload());
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTouched(true);
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTouched(true);
    setPassword(e.target.value);
  };

  const handlePasswordConfirmationChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setTouched(true);
    setPasswordConfirmation(e.target.value);
  };

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTouched(true);
    setRoleId(e.target.value);
  };

  if (!isOpen) return null;

  const inputBase =
    "border rounded-lg p-2 w-full focus:outline-none focus:ring-2 border-gray-300 focus:ring-[#DDC9A3]";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">

          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-white">
              <X size={22} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block text-sm font-medium mb-2">
                  Correo
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="ej. usuario@dominio.com"
                  className={inputBase}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Rol
                </label>
                <select
                  value={roleId}
                  onChange={handleRoleChange}
                  className={inputBase}
                  disabled={isSubmitting || roles.length === 0}
                >
                  <option value="">Selecciona un rol...</option>
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Contraseña
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Ingresar contraseña..."
                    className={`${inputBase} pr-10`}
                    disabled={isSubmitting}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-2 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirmar contraseña
                </label>

                <div className="relative">
                  <input
                    type={showPasswordConfirmation ? "text" : "password"}
                    value={passwordConfirmation}
                    onChange={handlePasswordConfirmationChange}
                    placeholder="Confirmar contraseña..."
                    className={`${inputBase} pr-10`}
                    disabled={isSubmitting}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPasswordConfirmation(!showPasswordConfirmation)
                    }
                    className="absolute inset-y-0 right-2 flex items-center"
                  >
                    {showPasswordConfirmation ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {(formErrors.length > 0 || error) && (
              <div className="px-6 pb-4">
                <FormErrors
                  errors={error ? [error] : formErrors}
                />
              </div>
            )}

            <div className="flex justify-end gap-4 p-4 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="border border-[#691b31] text-[#691b31] font-bold py-2 px-6 rounded-lg"
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
