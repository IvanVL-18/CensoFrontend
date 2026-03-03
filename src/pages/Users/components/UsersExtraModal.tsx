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

  const validateForm = () => {
    const result = UsersExtraSchema.safeParse(formData);
    if (!result.success) {
      setFormErrors(result.error.issues.map((i) => i.message));
      return false;
    }
    setFormErrors([]);
    return true;
  };
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextDependencyElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((p) => {
      const next = { ...p, [name]: value };

      const result = UsersExtraSchema.safeParse(next);
      if (!result.success) {
        setFormErrors(result.error.issues.map((i) => i.message));

        const fe: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          const key = String(issue.path?.[0] ?? "form");
          if (!fe[key]) fe[key] = issue.message;
        });
        setFieldErrors(fe);
      } else {
        setFormErrors([]);
        setFieldErrors({});
      }

      return next;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!User) return;
    if (!validateForm()) return;

    const trim = (v: any) => (v ?? "").toString().trim();

    const payload: UpdateUserDTO = {};

    if (trim(formData.name) !== trim(User.name))
      payload.name = toNull(formData.name);
    if (trim(formData.lastname) !== trim(User.lastname))
      payload.lastname = toNull(formData.lastname);
    if (trim(formData.phone) !== trim(User.phone))
      payload.phone = toNull(formData.phone);
    if (trim(formData.mobile) !== trim(User.mobile))
      payload.mobile = toNull(formData.mobile);
    if (trim(formData.address) !== trim(User.address))
      payload.address = toNull(formData.address);

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
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={handleClose}
      ></div>

      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <div>
              <h2 className="text-xl font-bold text-white">Datos Personales</h2>
              <p className="text-sm text-white/80">{User.email}</p>
            </div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre:
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido:
                </label>
                <input
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono:
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Celular:
                </label>
                <input
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
                />
                {fieldErrors.mobile && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.mobile}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección:
                </label>
                <textDependency
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]"
                />
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
                onClick={handleClose}
                disabled={isSubmitting}
                className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting || hasClientErrors || !hasChanges}
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
