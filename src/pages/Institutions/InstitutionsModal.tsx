import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { CreateInstitutionDTO } from "./Institutions.interfaces";
import { validateInstitution } from "../../utils/validation"; // Importamos nuestra nueva función

interface InstitutionModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  initialMunicipality?: string;
  initialGeocode?: string;
  initialType?: string;
  onClose: () => void;
  onSave: (formData: CreateInstitutionDTO) => Promise<void>;
}

export function InstitutionModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialName = "",
  initialMunicipality = "",
  initialGeocode = "",
  initialType = "",
  onClose,
  onSave,
}: InstitutionModalProps) {
  const [name, setName] = useState(initialName);
  const [municipality, setMunicipality] = useState(initialMunicipality);
  const [geocode, setGeocode] = useState(initialGeocode);
  const [typeinst, setTypeinst] = useState(initialType);

  // Manejo de errores del formulario
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Sincronizar el estado con las props iniciales cuando cambian (para editar)
  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setMunicipality(initialMunicipality);
      setGeocode(initialGeocode);
      setTypeinst(initialType);
      // Limpiamos los errores de formulario de la sesión anterior al abrir
      setFormErrors([]);
    }
  }, [isOpen, initialName, initialMunicipality, initialGeocode, initialType]);

  // Efecto para validar el formulario en cada cambio de los inputs
  useEffect(() => {
    // No mostramos errores hasta que el usuario intente guardar por primera vez.
    // `hadAttemptedSubmit` nos ayuda a controlar esto.
    // Pero si ya hay errores, validamos en tiempo real para limpiarlos.
    if (formErrors.length > 0) { // Solo re-valida si ya se mostró un error
      validateAndSetErrors();
    }
  }, [name, municipality, geocode, typeinst]);

  const validateAndSetErrors = () => {
    const errors = validateInstitution({ name, municipality, geocode, typeinst });
    setFormErrors(errors);
    return errors.length === 0;
  };

  // Lógica de envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAndSetErrors()) {
      onSave({ name, municipality, geocode, typeinst }); // Enviamos todo el objeto a onSave
    }
  };

  // Manejador para cambios en los campos del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "institutionName") setName(value);
    if (id === "municipality") setMunicipality(value);
    if (id === "geocode") setGeocode(value);
    if (id === "typeinst") setTypeinst(value);
  };

  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-6">
              {/* Nombre del módulo */}
              <label
                htmlFor="institutionName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre de la Institución:
              </label>
              <input
                type="text"
                id="institutionName"
                value={name}
                onChange={handleInputChange}
                placeholder="Ingresar nombre..."
                className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${formErrors.some(e => e.toLowerCase().includes('nombre')) ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-[#DDC9A3]"}`}
                disabled={isSubmitting}
                autoFocus
                aria-invalid={formErrors.some(e => e.toLowerCase().includes('nombre')) ? "true" : "false"}
                aria-describedby={formErrors.some(e => e.toLowerCase().includes('nombre')) ? "form-errors" : undefined}
              />

              {/* Municipalidad */}
              <label
                htmlFor="municipality"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Municipalidad:
              </label>
              <input
                type="text"
                id="municipality"
                value={municipality}
                onChange={handleInputChange}
                placeholder="Ingresar municipio..."
                className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${formErrors.some(e => e.toLowerCase().includes('municipalidad')) ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-[#DDC9A3]"}`}
                disabled={isSubmitting}
                aria-invalid={formErrors.some(e => e.toLowerCase().includes('municipalidad')) ? "true" : "false"}
                aria-describedby={formErrors.some(e => e.toLowerCase().includes('municipalidad')) ? "form-errors" : undefined}
              />

              {/* Geocódigo */}
              <label
                htmlFor="geocode"
                className="block text-sm font-medium text-gray-700 mt-4 mb-2"
              >
                Código Postal / Geocódigo:
              </label>
              <input
                type="text" // Aseguramos que sea de tipo texto
                id="geocode"
                value={geocode}
                onChange={handleInputChange}
                placeholder="Ingresar código..."
                className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${formErrors.some(e => e.toLowerCase().includes('geocódigo')) ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-[#DDC9A3]"}`}
                disabled={isSubmitting}
                aria-invalid={formErrors.some(e => e.toLowerCase().includes('geocódigo')) ? "true" : "false"}
                aria-describedby={formErrors.some(e => e.toLowerCase().includes('geocódigo')) ? "form-errors" : undefined}
              />

              {/* Tipo */}
              <label
                htmlFor="typeinst"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tipo:
              </label>
              <input
                type="text"
                id="typeinst"
                value={typeinst}
                onChange={handleInputChange}
                placeholder="Ingresar tipo..."
                className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${formErrors.some(e => e.toLowerCase().includes('tipo')) ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-[#DDC9A3]"}`}
                disabled={isSubmitting}
                aria-invalid={formErrors.some(e => e.toLowerCase().includes('tipo')) ? "true" : "false"}
                aria-describedby={formErrors.some(e => e.toLowerCase().includes('tipo')) ? "form-errors" : undefined}
              />

              {/* Mostramos los errores */}
              {formErrors.length > 0 && (
                <div id="form-errors" className="text-red-500 text-xs mt-2">
                  {formErrors.map((error, idx) => (
                    <p key={idx}>{error}</p>
                  ))}
                </div>
              )}

              {/* Mostramos error del servidor */}
              {error && (
                <div id="form-errors-server" className="text-red-500 text-xs mt-2">
                  <p>{error}</p>
                </div>
              )}
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
                disabled={isSubmitting || formErrors.length > 0}
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
