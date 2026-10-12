import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors";
import { UsersExtraSchema } from "../schemas/UsersExtra.schema";
import type { User, UpdateUserDTO } from "../Users.types";
import { CharCountInput } from "../../../components/CharCountInput";


interface Props {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  User: User | null;
  onClose: () => void;
  onSave: (data: UpdateUserDTO) => void;
}

const norm = (v: any) => (v === null || v === undefined ? "" : String(v));


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

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      validateAndSetErrors(next);
      return next;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!User) return;
    const isValid = validateAndSetErrors(formData);
    if (!isValid) return;
    // El backend valida con "sometimes|string": los campos vacíos se omiten
    // (no se envían como null ni "") para que no fallen la validación.
    const fields = ["name", "lastname", "phone", "mobile", "address"] as const;
    const payload: UpdateUserDTO = {};
    for (const field of fields) {
      const value = formData[field].trim();
      if (value !== "" && value !== norm(User[field]).trim()) {
        payload[field] = value;
      }
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
            <button type="button" onClick={handleClose} className="text-white hover:text-gray-300">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">

              {/* Nombre */}
              <div>
                <CharCountInput
                  id="name"
                  label="Nombre:"
                  value={formData.name}
                  maxLength={50}
                  placeholder=""
                  disabled={isSubmitting}
                  hasError={!!fieldErrors.name}
                  onChange={(val) => handleFieldChange("name", val)}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <CharCountInput
                  id="lastname"
                  label="Apellido:"
                  value={formData.lastname}
                  maxLength={50}
                  placeholder=""
                  disabled={isSubmitting}
                  hasError={!!fieldErrors.lastname}
                  onChange={(val) => handleFieldChange("lastname", val)}
                />
                {fieldErrors.lastname && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.lastname}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <CharCountInput
                  id="phone"
                  label="Teléfono:"
                  value={formData.phone}
                  maxLength={15}
                  placeholder=""
                  disabled={isSubmitting}
                  hasError={!!fieldErrors.phone}
                  onChange={(val) => handleFieldChange("phone", val)}
                />
                {fieldErrors.phone && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Celular */}
              <div>
                <CharCountInput
                  id="mobile"
                  label="Celular:"
                  value={formData.mobile}
                  maxLength={15}
                  placeholder=""
                  disabled={isSubmitting}
                  hasError={!!fieldErrors.mobile}
                  onChange={(val) => handleFieldChange("mobile", val)}
                />
                {fieldErrors.mobile && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.mobile}</p>
                )}
              </div>

              {/* Dirección - col-span-2 */}
              <div className="md:col-span-2">
                <CharCountInput
                  id="address"
                  label="Dirección:"
                  value={formData.address}
                  maxLength={200}
                  placeholder=""
                  disabled={isSubmitting}
                  hasError={!!fieldErrors.address}
                  onChange={(val) => handleFieldChange("address", val)}
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