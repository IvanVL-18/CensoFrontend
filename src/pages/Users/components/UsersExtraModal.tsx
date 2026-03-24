import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors";
import { UsersExtraSchema } from "../schemas/UsersExtra.schema";
import type { User, UpdateUserDTO } from "../Users.types";

const NAME_MAX_LENGTH = 50;
const LASTNAME_MAX_LENGTH = 50;
const PHONE_MAX_LENGTH = 20;
const MOBILE_MAX_LENGTH = 20;
const ADDRESS_MAX_LENGTH = 200;

const norm = (v: any) => (v === null || v === undefined ? "" : String(v));
const toNull = (v: string) => {
  const s = v.trim();
  return s === "" ? null : s;
};

interface Props {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  User: User | null;
  onClose: () => void;
  onSave: (data: UpdateUserDTO) => void;
}

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen || !User) return;
    const initialData = {
      name: norm(User.name),
      lastname: norm(User.lastname),
      phone: norm(User.phone),
      mobile: norm(User.mobile),
      address: norm(User.address),
    };
    setFormData(initialData);
    setFieldErrors({});
    setTouched(
      Object.fromEntries(
        Object.entries(initialData).map(([k, v]) => [k, v !== ""])
      )
    );
  }, [isOpen, User]);

  const handleClose = () => {
    setFormData({ name: "", lastname: "", phone: "", mobile: "", address: "" });
    setFieldErrors({});
    setTouched({});
    onClose();
  };

  const validateForm = (data: typeof formData) => {
    const result = UsersExtraSchema.safeParse(data);
    const errors: Record<string, string> = {};
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field) errors[field] = issue.message;
      });
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (field: keyof typeof formData, maxLength: number) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value.slice(0, maxLength);
      setFormData((prev) => ({ ...prev, [field]: value }));
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateForm({ ...formData, [field]: value });
    };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const allTouched = Object.keys(formData).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {}
    );
    setTouched(allTouched);
    if (validateForm(formData)) {
      const payload: UpdateUserDTO = {};
      const trim = (v: any) => (v ?? "").toString().trim();

      if (trim(formData.name) !== trim(User?.name))
        payload.name = toNull(formData.name);
      if (trim(formData.lastname) !== trim(User?.lastname))
        payload.lastname = toNull(formData.lastname);
      if (trim(formData.phone) !== trim(User?.phone))
        payload.phone = toNull(formData.phone);
      if (trim(formData.mobile) !== trim(User?.mobile))
        payload.mobile = toNull(formData.mobile);
      if (trim(formData.address) !== trim(User?.address))
        payload.address = toNull(formData.address);

      if (Object.keys(payload).length > 0) onSave(payload);
    }
  };

  const visibleErrors = useMemo(
    () =>
      Object.entries(fieldErrors)
        .filter(([key]) => touched[key])
        .map(([, msg]) => msg)
        .filter(Boolean),
    [fieldErrors, touched]
  );

  const hasChanges = useMemo(() => {
    if (!User) return false;
    const trim = (v: any) => (v ?? "").toString().trim();
    return (
      trim(formData.name) !== trim(User.name) ||
      trim(formData.lastname) !== trim(User.lastname) ||
      trim(formData.phone) !== trim(User.phone) ||
      trim(formData.mobile) !== trim(User.mobile) ||
      trim(formData.address) !== trim(User.address)
    );
  }, [formData, User]);

  if (!isOpen || !User) return null;

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

  const nameStyles = getFieldStyles("name", NAME_MAX_LENGTH);
  const lastnameStyles = getFieldStyles("lastname", LASTNAME_MAX_LENGTH);
  const phoneStyles = getFieldStyles("phone", PHONE_MAX_LENGTH);
  const mobileStyles = getFieldStyles("mobile", MOBILE_MAX_LENGTH);
  const addressStyles = getFieldStyles("address", ADDRESS_MAX_LENGTH);

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-9999 transition-opacity"
        onClick={handleClose}
      />
      <div className="fixed inset-0 bg-[#000000ab] z-10000 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
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

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre:
                  </label>
                  <span
                    className={`text-xs font-medium ${nameStyles.charCountColor}`}
                  >
                    {nameStyles.length}/{NAME_MAX_LENGTH} caracteres
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleFieldChange("name", NAME_MAX_LENGTH)}
                  placeholder="Ingresar nombre..."
                  className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${nameStyles.borderColor}`}
                  disabled={isSubmitting}
                  autoFocus
                />
                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${nameStyles.progressColor}`}
                    style={{
                      width: `${(nameStyles.length / NAME_MAX_LENGTH) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Apellido:
                  </label>
                  <span
                    className={`text-xs font-medium ${lastnameStyles.charCountColor}`}
                  >
                    {lastnameStyles.length}/{LASTNAME_MAX_LENGTH} caracteres
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.lastname}
                  onChange={handleFieldChange("lastname", LASTNAME_MAX_LENGTH)}
                  placeholder="Ingresar apellido..."
                  className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${lastnameStyles.borderColor}`}
                  disabled={isSubmitting}
                />
                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${lastnameStyles.progressColor}`}
                    style={{
                      width: `${(lastnameStyles.length / LASTNAME_MAX_LENGTH) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono:
                  </label>
                  <span
                    className={`text-xs font-medium ${phoneStyles.charCountColor}`}
                  >
                    {phoneStyles.length}/{PHONE_MAX_LENGTH} caracteres
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={handleFieldChange("phone", PHONE_MAX_LENGTH)}
                  placeholder="Ingresar teléfono..."
                  className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${phoneStyles.borderColor}`}
                  disabled={isSubmitting}
                />
                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${phoneStyles.progressColor}`}
                    style={{
                      width: `${(phoneStyles.length / PHONE_MAX_LENGTH) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Celular:
                  </label>
                  <span
                    className={`text-xs font-medium ${mobileStyles.charCountColor}`}
                  >
                    {mobileStyles.length}/{MOBILE_MAX_LENGTH} caracteres
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={handleFieldChange("mobile", MOBILE_MAX_LENGTH)}
                  placeholder="Ingresar celular..."
                  className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${mobileStyles.borderColor}`}
                  disabled={isSubmitting}
                />
                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${mobileStyles.progressColor}`}
                    style={{
                      width: `${(mobileStyles.length / MOBILE_MAX_LENGTH) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Dirección:
                  </label>
                  <span
                    className={`text-xs font-medium ${addressStyles.charCountColor}`}
                  >
                    {addressStyles.length}/{ADDRESS_MAX_LENGTH} caracteres
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={handleFieldChange("address", ADDRESS_MAX_LENGTH)}
                  placeholder="Ingresar dirección..."
                  className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${addressStyles.borderColor}`}
                  disabled={isSubmitting}
                />
                <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${addressStyles.progressColor}`}
                    style={{
                      width: `${(addressStyles.length / ADDRESS_MAX_LENGTH) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <FormErrors errors={visibleErrors} />
                {error && <FormErrors errors={[error]} />}
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
                disabled={isSubmitting || visibleErrors.length > 0 || !hasChanges}
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