import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { X } from "lucide-react";
import { FormErrors } from "./FormErrors";
import { UserSchema } from "../schemas/Users.schema"; 
import type { Rol } from "../../Roles/Roles.types";

// Definimos una interfaz local para las props extendidas
interface ExtendedUserModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialData?: any; 
  roles?: Rol[];
  occupations?: any[];
  areas?: any[];
  institutions?: any[];
  onClose: () => void;
  onSave: (data: any) => void;
}

export function UserModal({
  isOpen,
  isSubmitting,
  error, 
  title,
  initialData,
  roles = [],
  occupations = [],
  areas = [],
  institutions = [],
  onClose,
  onSave,
}: ExtendedUserModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    role_id: "",
    occupation_id: "",
    area_id: "",
    institution_id: "",
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: initialData?.email || "",
        password: "", // La contraseña siempre inicia vacía
        password_confirmation: "",
        role_id: initialData?.role_id || "",
        occupation_id: initialData?.occupation_id || "",
        area_id: initialData?.area_id || "",
        institution_id: initialData?.institution_id || "",
      });
      setFormErrors([]);
    }
  }, [isOpen, initialData]);

  const validateForm = (data: typeof formData) => {
    // Nota: Asegúrate de actualizar UserSchema para validar todos los campos nuevos
    const result = UserSchema.safeParse(data);
    if (!result.success) {
      const errorMessages = result.error.issues.map((err) => err.message);
      setFormErrors(errorMessages);
      return false; 
    } else {
      setFormErrors([]);
      return true; 
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Descomenta la validación cuando hayas actualizado tu esquema Zod
    // const isValid = validateForm(formData);
    // if (isValid) {
      onSave(formData); 
    // }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) {
    return null;
  }

  const hasClientErrors = formErrors.length > 0;
  const hasServerError = !!error;

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      ></div>

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
              {/* Email */}
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico:</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]" />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña {initialData ? "(Dejar en blanco para mantener)" : ""}:</label>
                <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]" />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña:</label>
                <input type="password" id="password_confirmation" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]" />
              </div>

              {/* Selectores de Relaciones */}
              <div>
                <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-1">Rol:</label>
                <select id="role_id" name="role_id" value={formData.role_id} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]">
                  <option value="">Seleccionar Rol</option>
                  {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="occupation_id" className="block text-sm font-medium text-gray-700 mb-1">Ocupación:</label>
                <select id="occupation_id" name="occupation_id" value={formData.occupation_id} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]">
                  <option value="">Seleccionar Ocupación</option>
                  {occupations.map((occ: any) => <option key={occ.id} value={occ.id}>{occ.name}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="area_id" className="block text-sm font-medium text-gray-700 mb-1">Área:</label>
                <select id="area_id" name="area_id" value={formData.area_id} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]">
                  <option value="">Seleccionar Área</option>
                  {areas.map((area: any) => <option key={area.id} value={area.id}>{area.name}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="institution_id" className="block text-sm font-medium text-gray-700 mb-1">Institución:</label>
                <select id="institution_id" name="institution_id" value={formData.institution_id} onChange={handleChange} className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#DDC9A3]">
                  <option value="">Seleccionar Institución</option>
                  {institutions.map((inst: any) => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <div id="form-errors-client"><FormErrors errors={formErrors} /></div>
                {error && <div id="form-errors-server"><FormErrors errors={[error]} /></div>}
              </div>
            </div>

            <div className="flex justify-end items-center gap-4 p-4 bg-gray-50">
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
                disabled={isSubmitting || hasClientErrors}
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