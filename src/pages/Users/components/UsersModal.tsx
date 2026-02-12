import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { FormErrors } from "./FormErrors";
import type {
  UserModalProps,
  CreateUserDTO,
  UpdateUserDTO,
} from "../Users.types";
import { Userschema } from "../schemas/Users.schema";

type FormState = {
  name: string;
  lastname: string;
  phone: string;
  movil: string;
  address: string;
  email: string;
  password: string;
  password_confirmation: string;
  occupation_id: string;
  role_id: string;
};

const emptyForm: FormState = {
  name: "",
  lastname: "",
  phone: "",
  movil: "",
  address: "",
  email: "",
  password: "",
  password_confirmation: "",
  occupation_id: "",
  role_id: "",
};

const ROLE_OPTIONS = [
  { value: "1", label: "Encuestado" },
  { value: "2", label: "Manager" },
  { value: "3", label: "Administración" },
  { value: "4", label: "Super Administrador" },
];

export function UserModal({
  isOpen,
  isSubmitting,
  error,
  title,
  mode,
  initialValues,
  onClose,
  onSave,
}: UserModalProps) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConf, setShowPasswordConf] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setForm({
      name: initialValues?.name ?? "",
      lastname: (initialValues as any)?.lastname ?? "",
      phone: (initialValues as any)?.phone ?? "",
      movil: (initialValues as any)?.movil ?? "",
      address: (initialValues as any)?.address ?? "",
      email: (initialValues as any)?.email ?? "",
      occupation_id: (initialValues as any)?.occupation_id ?? "",
      role_id: (initialValues as any)?.role_id ?? "",
      password: "",
      password_confirmation: "",
    });

    setFormErrors([]);
    setShowPassword(false);
    setShowPasswordConf(false);
  }, [isOpen, initialValues]);

  const validateForm = (values: FormState) => {
    const payload =
      mode === "edit" && !values.password
        ? { ...values, password: undefined, password_confirmation: undefined }
        : values;

    const z = Userschema.safeParse(payload);

    const errors: string[] = [];
    if (!z.success) errors.push(...z.error.issues.map((i) => i.message));

    if (mode === "create") {
      if (!values.password) errors.push("La contraseña es obligatoria.");
      if (!values.password_confirmation)
        errors.push("La confirmación de contraseña es obligatoria.");

      if (
        values.password &&
        values.password_confirmation &&
        values.password !== values.password_confirmation
      ) {
        errors.push("Las contraseñas no coinciden.");
      }
    } else {
      if (values.password) {
        if (!values.password_confirmation) {
          errors.push("Confirma la contraseña para poder actualizarla.");
        } else if (values.password !== values.password_confirmation) {
          errors.push("Las contraseñas no coinciden.");
        }
      }
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleChange =
    (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
      const next = { ...form, [key]: e.target.value };
      setForm(next);
      validateForm(next);
    };

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = { ...form, role_id: e.target.value };
    setForm(next);
    validateForm(next);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm(form)) return;

    if (mode === "create") {
      const payload: CreateUserDTO = {
        name: form.name,
        lastname: form.lastname,
        phone: form.phone,
        movil: form.movil,
        address: form.address,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
        occupation_id: form.occupation_id,
        role_id: form.role_id,
      };
      onSave(payload);
      return;
    }

    const payload: UpdateUserDTO = {
      name: form.name,
      lastname: form.lastname,
      phone: form.phone,
      movil: form.movil,
      address: form.address,
      email: form.email,
      occupation_id: form.occupation_id,
      role_id: form.role_id,
      ...(form.password
        ? {
            password: form.password,
            password_confirmation: form.password_confirmation,
          }
        : {}),
    };

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
          <div className="flex justify-between items-center p-4 bg-red-900 rounded-t-lg">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre:"
                  value={form.name}
                  onChange={handleChange("name")}
                />
                <Input
                  label="Apellido:"
                  value={form.lastname}
                  onChange={handleChange("lastname")}
                />

                <Input
                  label="Teléfono (10):"
                  value={form.phone}
                  onChange={handleChange("phone")}
                />
                <Input
                  label="Móvil (10):"
                  value={form.movil}
                  onChange={handleChange("movil")}
                />

                <div className="md:col-span-2">
                  <Input
                    label="Dirección:"
                    value={form.address}
                    onChange={handleChange("address")}
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Correo:"
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                  />
                </div>

                <div className="md:col-span-2">
                  <PasswordInput
                    label={`Contraseña ${mode === "create" ? "(obligatoria)" : "(opcional)"}`}
                    value={form.password}
                    show={showPassword}
                    onToggle={() => setShowPassword((s) => !s)}
                    onChange={handleChange("password")}
                  />
                </div>

                <div className="md:col-span-2">
                  <PasswordInput
                    label={`Confirmar contraseña ${
                      mode === "create"
                        ? "(obligatoria)"
                        : "(solo si cambias contraseña)"
                    }`}
                    value={form.password_confirmation}
                    show={showPasswordConf}
                    onToggle={() => setShowPasswordConf((s) => !s)}
                    onChange={handleChange("password_confirmation")}
                  />
                </div>

                <Input
                  label="Ocupación (ID):"
                  value={form.occupation_id}
                  onChange={handleChange("occupation_id")}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol:
                  </label>
                  <select
                    value={form.role_id}
                    onChange={handleRoleChange}
                    className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
                    disabled={isSubmitting}
                  >
                    <option value="">Seleccionar rol</option>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <FormErrors errors={formErrors} />
                {error && <FormErrors errors={[error]} />}
              </div>

              <div className="flex justify-end items-center gap-4 mt-6">
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
                  disabled={isSubmitting}
                  className="bg-white border border-[#691b31] text-[#691b31] font-bold py-2 px-6 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

function Input({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
      />
    </div>
  );
}

function PasswordInput({
  label,
  value,
  show,
  onToggle,
  onChange,
}: {
  label: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="border border-gray-300 rounded-lg p-2 w-full pr-10 focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
