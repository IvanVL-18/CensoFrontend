import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors";
import { UsersExtraSchema } from "../schemas/UsersExtra.schema";
import type { User, UpdateUserDTO } from "../Users.types";

interface Props {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  User: User | null;
  onClose: () => void;
  onSave: (data: UpdateUserDTO) => void;
}

const norm = (v: any) => (v === null || v === undefined ? "" : String(v));

const toNull = (v: string) => {
  const s = v.trim();
  return s === "" ? null : s;
};

const getInputClass = (hasError: boolean) =>
  [
    "w-full rounded-lg p-2 border transition outline-none",
    hasError
      ? "border-red-500 focus:ring-2 focus:ring-red-200 focus:border-red-500"
      : "border-gray-300 focus:ring-2 focus:ring-[#DDC9A3] focus:border-[#C3A67C]",
  ].join(" ");

export function UsersExtraModal({
  isOpen,
  isSubmitting,
  error,
  User,
  onClose,
  onSave,
}: Props) {
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    phone: "",
    mobile: "",
    address: "",
  });

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen || !User) return;

    setFormData({
      name: norm(User.name),
      lastname: norm(User.lastname),
      phone: norm(User.phone),
      mobile: norm(User.mobile),
      address: norm(User.address),
    });

    setFormErrors([]);
    setFieldErrors({});
  }, [isOpen, User]);

  const hasChanges = useMemo(() => {
    if (!User) return false;

    return (
      norm(formData.name).trim() !== norm(User.name).trim() ||
      norm(formData.lastname).trim() !== norm(User.lastname).trim() ||
      norm(formData.phone).trim() !== norm(User.phone).trim() ||
      norm(formData.mobile).trim() !== norm(User.mobile).trim() ||
      norm(formData.address).trim() !== norm(User.address).trim()
    );
  }, [formData, User]);

  const validateAndSetErrors = (data: typeof formData) => {
    const result = UsersExtraSchema.safeParse(data);

    if (result.success) {
      setFormErrors([]);
      setFieldErrors({});
      return true;
    }

    const uniqueMessages = Array.from(
      new Set(result.error.issues.map((issue) => issue.message))
    );

    const nextFieldErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const key = String(issue.path?.[0] ?? "form");
      if (!nextFieldErrors[key]) nextFieldErrors[key] = issue.message;
    });

    setFormErrors(uniqueMessages);
    setFieldErrors(nextFieldErrors);
    return false;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      validateAndSetErrors(next);
      return next;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!User) return;

    const isValid = validateAndSetErrors(formData);
    if (!isValid) return;

    const trim = (v: any) => (v ?? "").toString().trim();

    const payload: UpdateUserDTO = {};

    if (trim(formData.name) !== trim(User.name)) {
      payload.name = toNull(formData.name);
    }
    if (trim(formData.lastname) !== trim(User.lastname)) {
      payload.lastname = toNull(formData.lastname);
    }
    if (trim(formData.phone) !== trim(User.phone)) {
      payload.phone = toNull(formData.phone);
    }
    if (trim(formData.mobile) !== trim(User.mobile)) {
      payload.mobile = toNull(formData.mobile);
    }
    if (trim(formData.address) !== trim(User.address)) {
      payload.address = toNull(formData.address);
    }

    if (Object.keys(payload).length === 0) {
      setFormErrors(["No hay cambios para guardar."]);
      return;
    }

    onSave(payload);
  };

  const handleClose = () => {
    setFormErrors([]);
    setFieldErrors({});
    onClose();
  };

  if (!isOpen || !User) return null;

  const hasClientErrors = formErrors.length > 0;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/10 backdrop-blur-md">
        <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between bg-red-900 p-4">
            <div>
              <h2 className="text-xl font-bold text-white">Datos Personales</h2>
              <p className="text-sm text-white/80">{User.email}</p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="text-white hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre:
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={getInputClass(!!fieldErrors.name)}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Apellido:
                </label>
                <input
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className={getInputClass(!!fieldErrors.lastname)}
                />
                {fieldErrors.lastname && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.lastname}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Teléfono:
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={getInputClass(!!fieldErrors.phone)}
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Celular:
                </label>
                <input
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={getInputClass(!!fieldErrors.mobile)}
                />
                {fieldErrors.mobile && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.mobile}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Dirección:
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className={getInputClass(!!fieldErrors.address)}
                />
                {fieldErrors.address && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.address}</p>
                )}
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

            <div className="flex items-center justify-end gap-4 bg-gray-50 p-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="rounded-lg bg-[#C3A67C] px-6 py-2 font-bold text-white hover:brightness-95 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting || hasClientErrors || !hasChanges}
                className="rounded-lg border border-[#691b31] bg-white px-6 py-2 font-bold text-[#691b31] hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
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