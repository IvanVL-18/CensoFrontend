import { useState, type FormEvent, type ChangeEvent, forwardRef, useImperativeHandle, useEffect } from "react";
import { Calendar, FileText, Type } from "lucide-react";
import { FormErrors } from "./FormErrors";
import { Censoschema } from "../schemas/Censos.schema";

const MAX_LENGTH = 65;

interface CensoManualFormProps {
  isSubmitting: boolean;
  onSubmit: (data: { name: string; description?: string; init_date?: string; deadline?: string }) => void;
  error?: string | null;
  initialData?: {
    name?: string;
    description?: string;
    init_date?: string;
    deadline?: string;
  };
}

export interface CensoManualFormRef {
  reset: () => void;
  submit: () => boolean;
}

export const CensoManualForm = forwardRef<CensoManualFormRef, CensoManualFormProps>(
  ({ isSubmitting, onSubmit, error, initialData }, ref) => {
    // Estados inicializados con initialData (si existe)
    const [name, setName] = useState(initialData?.name ?? "");
    const [description, setDescription] = useState(initialData?.description ?? "");
    const [startDate, setStartDate] = useState(initialData?.init_date ?? "");
    const [endDate, setEndDate] = useState(initialData?.deadline ?? "");
    const [charCount, setCharCount] = useState(initialData?.name?.length ?? 0);
    
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [serverError, setServerError] = useState<string | null>(error ?? null);

    // Si el error prop cambia externamente, actualizamos serverError
    useEffect(() => {
      setServerError(error ?? null);
    }, [error]);

    // Si initialData cambia (por ejemplo, se edita otro registro sin desmontar),
    // actualizamos los estados del formulario
    useEffect(() => {
  console.log('🔄 initialData recibido en form:', initialData);
  if (initialData) {
    setName(initialData.name ?? "");
    setDescription(initialData.description ?? "");
    setStartDate(initialData.init_date ?? "");
    setEndDate(initialData.deadline ?? "");
    setCharCount(initialData.name?.length ?? 0);
    console.log('📅 startDate asignado:', initialData.init_date);
    console.log('📅 endDate asignado:', initialData.deadline);
  }
}, [initialData]);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setName("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setCharCount(0);
        setFormErrors([]);
        setServerError(null);
      },
      submit: () => {
        const result = Censoschema.safeParse({ name });
        if (!result.success) {
          const errors = result.error.issues.map((err) => err.message);
          setFormErrors(errors);
          return false;
        }
        setFormErrors([]);
        onSubmit({
          name,
          description: description.trim() || undefined,
          init_date: startDate || undefined,
          deadline: endDate || undefined,
        });
        return true;
      },
    }));

    const validateForm = (currentName: string) => {
      const result = Censoschema.safeParse({ name: currentName });
      if (!result.success) {
        const errors = result.error.issues.map((err) => err.message);
        setFormErrors(errors);
        return false;
      }
      setFormErrors([]);
      return true;
    };

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;
      if (newName.length <= MAX_LENGTH) {
        setName(newName);
        setCharCount(newName.length);
        validateForm(newName);
        setServerError(null);
      }
    };

    const handleFormSubmit = (e: FormEvent) => {
      e.preventDefault();
    };

    const hasErrors = formErrors.length > 0 || !!serverError;
    const isNearLimit = charCount >= MAX_LENGTH - 10 && charCount <= MAX_LENGTH;
    const isAtLimit = charCount >= MAX_LENGTH;

    const getInputBorderColor = () => {
      if (hasErrors) return 'border-red-300 focus:border-red-500 focus:ring-red-200';
      if (isAtLimit) return 'border-red-300 focus:border-red-500 focus:ring-red-200';
      if (isNearLimit) return 'border-amber-300 focus:border-amber-500 focus:ring-amber-200';
      return 'border-gray-200 focus:border-[#DDC9A3] focus:ring-[#DDC9A3]/20';
    };

    const getProgressBarColor = () => {
      if (isAtLimit) return 'bg-red-500';
      if (isNearLimit) return 'bg-amber-500';
      return 'bg-[#DDC9A3]';
    };

    const getCharCountColor = () => {
      if (isAtLimit) return 'text-red-600';
      if (isNearLimit) return 'text-amber-600';
      return 'text-gray-400';
    };

    return (
      <form onSubmit={handleFormSubmit} noValidate className="space-y-5">
        {/* Campo: Nombre del censo */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="censoName" className="flex items-center text-sm font-semibold text-gray-700">
              <Type size={18} className="mr-2 text-gray-400" />
              Nombre del censo
            </label>
            <span className={`text-xs font-medium ${getCharCountColor()}`}>
              {charCount}/{MAX_LENGTH}
            </span>
          </div>
          <input
            type="text"
            id="censoName"
            value={name}
            onChange={handleNameChange}
            placeholder="Ej. Censo de población 2024"
            maxLength={MAX_LENGTH}
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-4 transition duration-200 ${getInputBorderColor()}`}
            disabled={isSubmitting}
            autoFocus
          />
          <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ease-out ${getProgressBarColor()}`}
              style={{ width: `${(charCount / MAX_LENGTH) * 100}%` }}
            />
          </div>
        </div>

        {/* Fechas: Inicio y Fin */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={16} className="mr-2 text-gray-400" />
              Inicio
            </label>
            <div className="relative">
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDC9A3] focus:ring-4 focus:ring-[#DDC9A3]/20 transition duration-200 appearance-none"
              />
              <Calendar size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label htmlFor="endDate" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={16} className="mr-2 text-gray-400" />
              Fin
            </label>
            <div className="relative">
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDC9A3] focus:ring-4 focus:ring-[#DDC9A3]/20 transition duration-200 appearance-none"
              />
              <Calendar size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Campo: Descripción breve */}
        <div>
          <label htmlFor="description" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <FileText size={16} className="mr-2 text-gray-400" />
            Descripción breve
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDC9A3] focus:ring-4 focus:ring-[#DDC9A3]/20 transition duration-200 resize-none"
            placeholder="Describe el propósito o alcance del censo..."
          />
        </div>

        {/* Mostrar errores de validación y del servidor */}
        <FormErrors errors={formErrors} />
        {serverError && <FormErrors errors={[serverError]} />}
      </form>
    );
  }
);

CensoManualForm.displayName = "CensoManualForm";