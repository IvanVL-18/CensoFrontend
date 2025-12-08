import { useState, useEffect, useCallback, type FormEvent, type ChangeEvent } from "react";
import { X } from "lucide-react";
import type { Institution, InstitutionFormData, UpdateInstitutionDTO } from "./Institutions.interfaces";
import { 
  validateInstitution,
  validateInstitutionName,
  validateInstitutionMunicipality,
  validateInstitutionGeocode,
  validateInstitutionTypeinst,
} from "../../utils/validation";

interface InstitutionModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  editingInstitution: Institution | null;
  onClose: () => void;
  onSave: (formData: InstitutionFormData | UpdateInstitutionDTO) => Promise<void>;
}

export function InstitutionModal({
  isOpen,
  isSubmitting,
  error,
  title,
  editingInstitution,
  onClose,
  onSave,
}: InstitutionModalProps) {
  const [name, setName] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [geocode, setGeocode] = useState("");
  const [typeinst, setTypeinst] = useState("");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Resetear formulario cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setName(editingInstitution?.name || "");
      setMunicipality(editingInstitution?.municipality || "");
      setGeocode(editingInstitution?.geocode || "");
      setTypeinst(editingInstitution?.typeinst || "");
      setTouchedFields(new Set());
      
      if (editingInstitution) { // Validar campos iniciales si hay datos de edición
        const formData = {
          name: editingInstitution.name,
          municipality: editingInstitution.municipality,
          geocode: editingInstitution.geocode,
          typeinst: editingInstitution.typeinst,
        };
        const initialErrors = validateInstitution(formData);
        setFormErrors(initialErrors);
      } else {
        setFormErrors([]);
      }
    }
  }, [isOpen, editingInstitution]);

  // Validar formulario completo
  const validateForm = useCallback(() => {
    const formData: InstitutionFormData = { name, municipality, geocode, typeinst };
    return validateInstitution(formData);
  }, [name, municipality, geocode, typeinst]);

  // Validar en tiempo real cuando cambian los campos
  useEffect(() => {
    if (touchedFields.size > 0) {
      const errors = validateForm();
      setFormErrors(errors);
    }
  }, [name, municipality, geocode, typeinst, touchedFields.size, validateForm]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Marcar todos los campos como "tocados" para mostrar todos los errores
    setTouchedFields(new Set(['name', 'municipality', 'geocode', 'typeinst']));
    
    const errors = validateForm();
    setFormErrors(errors);
    
    if (errors.length === 0) {
      // Preparar datos para enviar
      const formData: InstitutionFormData = {
        name: name.trim(),
        municipality: municipality.trim(),
        geocode: geocode.trim(),
        typeinst: typeinst.trim(),
      };
      
      await onSave(formData); // onSave ya maneja la lógica de crear vs editar
    }
  };

  // Manejador genérico para cambios en los campos
  const handleFieldChange = (
    setter: (value: string) => void,
    fieldName: string,
    value: string
  ) => {
    setter(value);
    // Marcar el campo como "tocado" para activar la validación en tiempo real
    setTouchedFields(prev => {
      const newSet = new Set(prev);
      newSet.add(fieldName);
      return newSet;
    });
  };

  // Función para obtener los errores de un campo específico
  const getFieldErrors = (fieldName: string): string[] => {
    if (!touchedFields.has(fieldName)) return [];

    switch (fieldName) {
      case 'name':
        return validateInstitutionName(name);
      case 'municipality':
        return validateInstitutionMunicipality(municipality);
      case 'geocode':
        return validateInstitutionGeocode(geocode);
      case 'typeinst':
        return validateInstitutionTypeinst(typeinst);
      default:
        return [];
    }
  }

  // Función para obtener clase CSS según estado del campo
  const getInputClassName = (fieldName: string) => {
    const hasError = getFieldErrors(fieldName).length > 0;
    return `border rounded-lg p-3 w-full focus:outline-none transition-colors ${
      hasError 
        ? "border-red-500 focus:ring-2 focus:ring-red-400" 
        : "border-gray-300 focus:border-[#DDC9A3] focus:ring-2 focus:ring-[#DDC9A3]"
    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`;
  };
  
  // Función para mostrar el primer error de un campo
  const renderFieldError = (fieldName: string) => {
    const errors = getFieldErrors(fieldName);
    if (errors.length === 0) return null;
    return (
      <p className="text-red-500 text-xs mt-1">{errors[0]}</p>
    )
  }

  // Determinar si el botón de guardar debe estar deshabilitado
  const isSaveDisabled = useCallback(() => {
    return isSubmitting || (touchedFields.size > 0 && formErrors.length > 0);
  }, [isSubmitting, touchedFields, formErrors.length]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay con alto z-index */}
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal con z-index más alto */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[85vh] flex flex-col">
          
          {/* Header fijo */}
          <div className="flex justify-between items-center p-4 bg-red-900 flex-shrink-0">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
              aria-label="Cerrar modal"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>

          {/* Formulario con scroll */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-grow overflow-hidden">
            <div className="p-6 space-y-4 overflow-y-auto flex-grow">
              {/* Nombre de la Institución */}
              <div className="space-y-2">
                <label
                  htmlFor="institutionName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre de la Institución:
                </label>
                <input
                  type="text"
                  id="institutionName"
                  value={name}
                  onChange={(e) => handleFieldChange(setName, 'name', e.target.value)}
                  onBlur={() => setTouchedFields(prev => new Set([...prev, 'name']))}
                  placeholder="Ingresar nombre..."
                  className={getInputClassName('name')}
                  disabled={isSubmitting}
                  autoFocus
                />
                {renderFieldError('name')}
              </div>

              {/* Municipalidad */}
              <div className="space-y-2">
                <label
                  htmlFor="municipality"
                  className="block text-sm font-medium text-gray-700"
                >
                  Municipalidad:
                </label>
                <input
                  type="text"
                  id="municipality"
                  value={municipality}
                  onChange={(e) => handleFieldChange(setMunicipality, 'municipality', e.target.value)}
                  onBlur={() => setTouchedFields(prev => new Set([...prev, 'municipality']))}
                  placeholder="Ingresar municipio..."
                  className={getInputClassName('municipality')}
                  disabled={isSubmitting}
                />
                {renderFieldError('municipality')}
              </div>

              {/* Código Postal / Geocódigo */}
              <div className="space-y-2">
                <label
                  htmlFor="geocode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Código Postal / Geocódigo:
                </label>
                <input
                  type="text"
                  id="geocode"
                  value={geocode}
                  onChange={(e) => handleFieldChange(setGeocode, 'geocode', e.target.value)}
                  onBlur={() => setTouchedFields(prev => new Set([...prev, 'geocode']))}
                  placeholder="Ingresar código..."
                  className={getInputClassName('geocode')}
                  disabled={isSubmitting}
                />
                {renderFieldError('geocode')}
              </div>

              {/* Tipo */}
              <div className="space-y-2">
                <label
                  htmlFor="typeinst"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tipo:
                </label>
                <input
                  type="text"
                  id="typeinst"
                  value={typeinst}
                  onChange={(e) => handleFieldChange(setTypeinst, 'typeinst', e.target.value)}
                  onBlur={() => setTouchedFields(prev => new Set([...prev, 'typeinst']))}
                  placeholder="Ingresar tipo..."
                  className={getInputClassName('typeinst')}
                  disabled={isSubmitting}
                />
                {renderFieldError('typeinst')}
              </div>

              {/* Mostrar errores generales en un cuadro */}
              {(formErrors.length > 0 || error) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-2">
                  <h3 className="text-red-800 font-semibold mb-2 text-sm">
                    {formErrors.length > 0 ? "Corrige los siguientes errores:" : "Error del servidor:"}
                  </h3>
                  <div className="space-y-1">
                    {error ? (
                      <p className="text-red-600 text-sm">{error}</p>
                    ) : (
                      formErrors.map((error, idx) => (
                        <p key={idx} className="text-red-600 text-sm">
                          • {error}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer fijo */}
            <div className="flex justify-end items-center gap-4 p-4 bg-gray-50 border-t border-gray-200 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="
                  px-6 py-3 rounded-lg font-medium transition-colors
                  bg-[#C3A67C] text-white 
                  hover:brightness-95 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  min-w-[100px]
                "
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaveDisabled()}
                className="
                  px-6 py-3 rounded-lg font-medium transition-colors
                  bg-white border border-[#691b31] text-[#691b31]
                  hover:bg-gray-50 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  min-w-[100px]
                "
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
