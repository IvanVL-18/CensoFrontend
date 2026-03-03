import { useState, type FormEvent, type ChangeEvent, forwardRef, useImperativeHandle, useEffect } from "react";
import { Calendar, FileText, Type } from "lucide-react";
import { FormErrors } from "./FormErrors";
import { Censoschema } from "../schemas/Censos.schema";

const MAX_LENGTH = 125;

interface CensoManualFormProps {
  isSubmitting: boolean;
  onSubmit: (data: { name: string; description?: string; init_date: string; deadline: string }) => void;
  error?: string | null;
  initialData?: {
    name?: string;
    description?: string;
    init_date?: string;
    deadline?: string;
  };
  onErrorChange?: (errors: string[]) => void;
  onFullValidityChange?: (isValid: boolean) => void;
}

export interface CensoManualFormRef {
  reset: () => void;
  submit: () => boolean;
  getErrors: () => string[];
}

export const CensoManualForm = forwardRef<CensoManualFormRef, CensoManualFormProps>(
  ({ isSubmitting, onSubmit, error, initialData, onErrorChange, onFullValidityChange }, ref) => {
    const [name, setName] = useState(initialData?.name ?? "");
    const [description, setDescription] = useState(initialData?.description ?? "");
    const [startDate, setStartDate] = useState(initialData?.init_date ?? "");
    const [endDate, setEndDate] = useState(initialData?.deadline ?? "");
    const [charCount, setCharCount] = useState(initialData?.name?.length ?? 0);
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [serverError, setServerError] = useState<string | null>(error ?? null);
    const [touchedFields, setTouchedFields] = useState({
      name: false,
      description: false,
      init_date: false,
      deadline: false,
    });

    useEffect(() => {
      setServerError(error ?? null);
    }, [error]);

    useEffect(() => {
      onErrorChange?.(formErrors);
    }, [formErrors, onErrorChange]);

    const getVisibleErrors = () => {
      const result = Censoschema.safeParse({ name, description, init_date: startDate, deadline: endDate });
      if (result.success) return [];

      const fieldErrorsMap: Record<string, string[]> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrorsMap[field]) fieldErrorsMap[field] = [];
        fieldErrorsMap[field].push(issue.message);
      });

      const visible: string[] = [];
      Object.entries(touchedFields).forEach(([field, touched]) => {
        if (touched && fieldErrorsMap[field]) {
          visible.push(...fieldErrorsMap[field]);
        }
      });
      return visible;
    };

    useEffect(() => {
      const visibleErrors = getVisibleErrors();
      setFormErrors((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(visibleErrors)) {
          return visibleErrors;
        }
        return prev;
      });
    }, [name, description, startDate, endDate, touchedFields]);

    // Notifica al padre sobre la validez completa (útil para habilitar el botón)
    useEffect(() => {
      const result = Censoschema.safeParse({ name, description, init_date: startDate, deadline: endDate });
      // Puedes activar este log para depurar
      // console.log('Validación completa:', result.success, result.error?.issues);
      onFullValidityChange?.(result.success);
    }, [name, description, startDate, endDate, onFullValidityChange]);

    // Maneja cambios en initialData (se ejecuta al abrir el modal en edición)
    useEffect(() => {
      if (initialData) {
        const newName = initialData.name ?? "";
        setName(newName);
        setDescription(initialData.description ?? "");
        setStartDate(initialData.init_date ?? "");
        setEndDate(initialData.deadline ?? "");
        setCharCount(newName.length);
        setTouchedFields({
          name: true,
          description: true,
          init_date: true,
          deadline: true,
        });
      } else {
        // Reset para creación
        setName("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setCharCount(0);
        setTouchedFields({
          name: false,
          description: false,
          init_date: false,
          deadline: false,
        });
        setFormErrors([]);
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
        setTouchedFields({
          name: false,
          description: false,
          init_date: false,
          deadline: false,
        });
      },
      submit: () => {
        const result = Censoschema.safeParse({ name, description, init_date: startDate, deadline: endDate });
        if (!result.success) {
          setTouchedFields({
            name: true,
            description: true,
            init_date: true,
            deadline: true,
          });
          const allErrors = result.error.issues.map((err) => err.message);
          setFormErrors(allErrors);
          setServerError(null);
          return false;
        }
        setServerError(null);
        onSubmit({
          name,
          description,
          init_date: startDate,
          deadline: endDate,
        });
        return true;
      },
      getErrors: () => formErrors,
    }));

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;
      if (newName.length <= MAX_LENGTH) {
        setName(newName);
        setCharCount(newName.length);
        setServerError(null);
        setTouchedFields((prev) => ({ ...prev, name: true }));
      }
    };

    const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
      setStartDate(e.target.value);
      setServerError(null);
      setTouchedFields((prev) => ({ ...prev, init_date: true }));
    };

    const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
      setEndDate(e.target.value);
      setServerError(null);
      setTouchedFields((prev) => ({ ...prev, deadline: true }));
    };

    const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(e.target.value);
      setServerError(null);
      setTouchedFields((prev) => ({ ...prev, description: true }));
    };

    const handleFormSubmit = (e: FormEvent) => {
      e.preventDefault();
    };

    const hasErrors = formErrors.length > 0 || !!serverError;
    const isNearLimit = charCount >= MAX_LENGTH - 10 && charCount <= MAX_LENGTH;
    const isAtLimit = charCount >= MAX_LENGTH;

    const inputBorderColor = hasErrors
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
      : isAtLimit
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
      : isNearLimit
      ? 'border-amber-300 focus:border-amber-500 focus:ring-amber-200'
      : 'border-gray-200 focus:border-[#DDC9A3] focus:ring-[#DDC9A3]/20';

    const progressBarColor = isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-[#DDC9A3]';
    const charCountColor = isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-gray-400';

    return (
      <form onSubmit={handleFormSubmit} noValidate className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="censoName" className="flex items-center text-sm font-semibold text-gray-700">
              <Type size={18} className="mr-2 text-gray-400" />
              Nombre del censo
            </label>
            <span className={`text-xs font-medium ${charCountColor}`}>
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
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-4 transition duration-200 ${inputBorderColor}`}
            disabled={isSubmitting}
            autoFocus
          />
          <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ease-out ${progressBarColor}`}
              style={{ width: `${(charCount / MAX_LENGTH) * 100}%` }}
            />
          </div>
        </div>

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
                onChange={handleStartDateChange}
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
                onChange={handleEndDateChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDC9A3] focus:ring-4 focus:ring-[#DDC9A3]/20 transition duration-200 appearance-none"
              />
              <Calendar size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <FileText size={16} className="mr-2 text-gray-400" />
            Descripción breve
          </label>
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            rows={3}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDC9A3] focus:ring-4 focus:ring-[#DDC9A3]/20 transition duration-200 resize-none"
            placeholder="Describe el propósito o alcance del censo..."
          />
        </div>

        <FormErrors errors={formErrors} />
        {serverError && <FormErrors errors={[serverError]} />}
      </form>
    );
  }
);

CensoManualForm.displayName = "CensoManualForm";