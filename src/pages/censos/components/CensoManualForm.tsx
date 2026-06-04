import {
  useState,
  type FormEvent,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo,
} from "react";
import { Calendar, FileText } from "lucide-react";
import { FormErrors } from "./FormErrors";
import { createCensoSchema } from "../schemas/Censos.schema";
import { CharCountInput } from "../../../components/CharCountInput";

const MAX_NAME_LENGTH = 65;
const MAX_DESC_LENGTH = 200;

interface CensoManualFormProps {
  isSubmitting: boolean;
  isPreparingEdit?: boolean;
  onSubmit: (data: any) => void;
  error?: string | null;
  initialData?: {
    name?: string;
    description?: string;
    init_date?: string;
    deadline?: string;
  };
  onErrorChange?: (errors: string[]) => void;
  onFullValidityChange?: (isValid: boolean) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export interface CensoManualFormRef {
  reset: () => void;
  submit: () => boolean;
  getErrors: () => string[];
}

export const CensoManualForm = forwardRef<
  CensoManualFormRef,
  CensoManualFormProps
>(
  (
    {
      isSubmitting,
      isPreparingEdit = false,
      onSubmit,
      error,
      initialData,
      onErrorChange,
      onFullValidityChange,
      onDirtyChange,
    },
    ref,
  ) => {
    const [name, setName] = useState(initialData?.name ?? "");
    const [description, setDescription] = useState(initialData?.description ?? "");
    const [startDate, setStartDate] = useState(initialData?.init_date ?? "");
    const [endDate, setEndDate] = useState(initialData?.deadline ?? "");
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [serverError, setServerError] = useState<string | null>(error ?? null);
    const [touchedFields, setTouchedFields] = useState({
      name: false,
      description: false,
      init_date: false,
      deadline: false,
    });
    const [submitted, setSubmitted] = useState(false);
    const [ignoreServerError, setIgnoreServerError] = useState(false);

    const censoSchema = useMemo(
      () => createCensoSchema(!!initialData),
      [initialData],
    );

    useEffect(() => {
      if (!ignoreServerError) setServerError(error ?? null);
    }, [error, ignoreServerError]);

    useEffect(() => {
      onErrorChange?.(formErrors);
    }, [formErrors, onErrorChange]);

    const getVisibleErrors = () => {
      const result = censoSchema.safeParse({
        name,
        description,
        init_date: startDate,
        deadline: endDate,
      });
      if (result.success) return [];

      const fieldErrorsMap: Record<string, string[]> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrorsMap[field]) fieldErrorsMap[field] = [];
        fieldErrorsMap[field].push(issue.message);
      });

      const visible: string[] = [];
      Object.entries(fieldErrorsMap).forEach(([field, errors]) => {
        const fieldValue =
          field === "name"
            ? name
            : field === "description"
              ? description
              : field === "init_date"
                ? startDate
                : endDate;
        if (!submitted && (!fieldValue || fieldValue.trim() === "")) return;
        visible.push(...errors);
      });

      return visible;
    };

    useEffect(() => {
      const visibleErrors = getVisibleErrors();
      setFormErrors((prev) =>
        JSON.stringify(prev) !== JSON.stringify(visibleErrors)
          ? visibleErrors
          : prev,
      );
    }, [name, description, startDate, endDate, submitted, censoSchema]);

    useEffect(() => {
      const result = censoSchema.safeParse({
        name,
        description,
        init_date: startDate,
        deadline: endDate,
      });
      onFullValidityChange?.(result.success);
    }, [name, description, startDate, endDate, onFullValidityChange, censoSchema]);

    useEffect(() => {
      if (!onDirtyChange) return;
      const hasChanges =
        name !== (initialData?.name ?? "") ||
        description !== (initialData?.description ?? "") ||
        startDate !== (initialData?.init_date ?? "") ||
        endDate !== (initialData?.deadline ?? "");
      onDirtyChange(hasChanges);
    }, [name, description, startDate, endDate, initialData, onDirtyChange]);

    useEffect(() => {
      if (initialData) {
        setName((prev) =>
          !touchedFields.name || prev === "" ? (initialData.name ?? "") : prev,
        );
        setDescription((prev) =>
          !touchedFields.description || prev === ""
            ? (initialData.description ?? "")
            : prev,
        );
        setStartDate((prev) =>
          !touchedFields.init_date || prev === ""
            ? (initialData.init_date ?? "")
            : prev,
        );
        setEndDate((prev) =>
          !touchedFields.deadline || prev === ""
            ? (initialData.deadline ?? "")
            : prev,
        );
        setSubmitted(false);
        setIgnoreServerError(false);
      } else {
        setName("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setTouchedFields({ name: false, description: false, init_date: false, deadline: false });
        setFormErrors([]);
        setServerError(null);
        setSubmitted(false);
        setIgnoreServerError(true);
      }
    }, [initialData]);

    useImperativeHandle(
      ref,
      () => ({
        reset: () => {
          setName("");
          setDescription("");
          setStartDate("");
          setEndDate("");
          setFormErrors([]);
          setServerError(null);
          setTouchedFields({ name: false, description: false, init_date: false, deadline: false });
          setSubmitted(false);
          setIgnoreServerError(true);
        },
        submit: () => {
          setSubmitted(true);
          setIgnoreServerError(false);
          const result = censoSchema.safeParse({
            name,
            description,
            init_date: startDate,
            deadline: endDate,
          });
          if (!result.success) {
            setTouchedFields({ name: true, description: true, init_date: true, deadline: true });
            setFormErrors(result.error.issues.map((err) => err.message));
            setServerError(null);
            return false;
          }
          setServerError(null);

          if (initialData) {
            const payload: any = {};
            const currentName = name.trim();
            const baseName = (initialData.name ?? "").trim();
            if (currentName !== baseName) payload.name = currentName;

            const currentDesc = description?.trim() ?? "";
            const baseDesc = initialData.description?.trim() ?? "";
            if (currentDesc !== "") {
              payload.description = currentDesc;
            } else if (currentDesc !== baseDesc && baseDesc !== "") {
              payload.description = currentDesc;
            }

            if (startDate !== (initialData.init_date ?? "")) payload.init_date = startDate;
            if (endDate !== (initialData.deadline ?? "")) payload.deadline = endDate;
            if (Object.keys(payload).length === 0) return true;
            onSubmit(payload);
          } else {
            onSubmit({ name, description, init_date: startDate, deadline: endDate });
          }
          return true;
        },
        getErrors: () => formErrors,
      }),
      [censoSchema, formErrors, name, description, startDate, endDate, onSubmit],
    );

    const handleFormSubmit = (e: FormEvent) => e.preventDefault();

    return (
      <form onSubmit={handleFormSubmit} noValidate className="space-y-5">
        {/* Nombre */}
        <CharCountInput
          id="censoName"
          label="Nombre del censo"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          placeholder="Ej. Censo de población 2024"
          disabled={isSubmitting}
          hasError={formErrors.length > 0}
          autoFocus
          onChange={(val) => {
            setName(val);
            setServerError(null);
            setTouchedFields((prev) => ({ ...prev, name: true }));
            setSubmitted(false);
            setIgnoreServerError(false);
          }}
        />

        {/* Período */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-gray-700">
            <Calendar size={20} className="mr-2 text-gray-400" />
            Período del censo
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-xs font-medium text-gray-500 mb-1.5">
                Inicio
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setServerError(null);
                    setTouchedFields((prev) => ({ ...prev, init_date: true }));
                    setSubmitted(false);
                    setIgnoreServerError(false);
                  }}
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDC9A3] focus:ring-4 focus:ring-[#DDC9A3]/20 transition duration-200 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full"
                />
                <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label htmlFor="endDate" className="block text-xs font-medium text-gray-500 mb-1.5">
                Fin
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setServerError(null);
                    setTouchedFields((prev) => ({ ...prev, deadline: true }));
                    setSubmitted(false);
                    setIgnoreServerError(false);
                  }}
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDC9A3] focus:ring-4 focus:ring-[#DDC9A3]/20 transition duration-200 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full"
                />
                <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <CharCountInput
          as="textarea"
          id="description"
          label="Descripción breve (opcional)"
          labelIcon={<FileText size={20} className="text-gray-400" />}
          value={description}
          maxLength={MAX_DESC_LENGTH}
          rows={3}
          placeholder={isPreparingEdit ? "Cargando descripción..." : "Describe el propósito o alcance del censo..."}
          onChange={(val) => {
            setDescription(val);
            setServerError(null);
            setTouchedFields((prev) => ({ ...prev, description: true }));
            setSubmitted(false);
            setIgnoreServerError(false);
          }}
        />

        <FormErrors errors={formErrors} />
        {serverError && <FormErrors errors={[serverError]} />}
      </form>
    );
  },
);

CensoManualForm.displayName = "CensoManualForm";
