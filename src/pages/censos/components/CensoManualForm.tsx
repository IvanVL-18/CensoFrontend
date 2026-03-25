import {
  useState,
  type FormEvent,
  type ChangeEvent,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useMemo,
} from "react";
import { Calendar, FileText } from "lucide-react";
import { FormErrors } from "./FormErrors";
import { createCensoSchema } from "../schemas/Censos.schema";

const MAX_NAME_LENGTH = 65;
const MAX_DESC_LENGTH = 200;

interface CensoManualFormProps {
  isSubmitting: boolean;
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
    const [description, setDescription] = useState(
      initialData?.description ?? "",
    );
    const [startDate, setStartDate] = useState(initialData?.init_date ?? "");
    const [endDate, setEndDate] = useState(initialData?.deadline ?? "");
    const [nameCharCount, setNameCharCount] = useState(
      initialData?.name?.length ?? 0,
    );
    const [descCharCount, setDescCharCount] = useState(
      initialData?.description?.length ?? 0,
    );
    const [formErrors, setFormErrors] = useState<string[]>([]);
    const [serverError, setServerError] = useState<string | null>(
      error ?? null,
    );
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
    }, [
      name,
      description,
      startDate,
      endDate,
      onFullValidityChange,
      censoSchema,
    ]);

    useEffect(() => {
      if (!onDirtyChange) return;
      const baseName = initialData?.name ?? "";
      const baseDescription = initialData?.description ?? "";
      const baseInitDate = initialData?.init_date ?? "";
      const baseDeadline = initialData?.deadline ?? "";
      const hasChanges =
        name !== baseName ||
        description !== baseDescription ||
        startDate !== baseInitDate ||
        endDate !== baseDeadline;
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

        setNameCharCount((prev) =>
          !touchedFields.name ? (initialData.name?.length ?? 0) : prev,
        );
        setDescCharCount((prev) =>
          !touchedFields.description
            ? (initialData.description?.length ?? 0)
            : prev,
        );

        setSubmitted(false);
        setIgnoreServerError(false);
      } else {
        setName("");
        setDescription("");
        setStartDate("");
        setEndDate("");
        setNameCharCount(0);
        setDescCharCount(0);
        setTouchedFields({
          name: false,
          description: false,
          init_date: false,
          deadline: false,
        });
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
          setNameCharCount(0);
          setDescCharCount(0);
          setFormErrors([]);
          setServerError(null);
          setTouchedFields({
            name: false,
            description: false,
            init_date: false,
            deadline: false,
          });
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
            setTouchedFields({
              name: true,
              description: true,
              init_date: true,
              deadline: true,
            });
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
            if (currentDesc !== baseDesc) payload.description = currentDesc;

            if (startDate !== (initialData.init_date ?? ""))
              payload.init_date = startDate;
            if (endDate !== (initialData.deadline ?? ""))
              payload.deadline = endDate;

            if (Object.keys(payload).length === 0) {
              return true;
            }

            onSubmit(payload);
          } else {
            onSubmit({
              name,
              description,
              init_date: startDate,
              deadline: endDate,
            });
          }

          return true;
        },
        getErrors: () => formErrors,
      }),
      [
        censoSchema,
        formErrors,
        name,
        description,
        startDate,
        endDate,
        onSubmit,
      ],
    );

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
      const newName = e.target.value;
      if (newName.length <= MAX_NAME_LENGTH) {
        setName(newName);
        setNameCharCount(newName.length);
        setServerError(null);
        setTouchedFields((prev) => ({ ...prev, name: true }));
        setSubmitted(false);
        setIgnoreServerError(false);
      }
    };

    const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
      setStartDate(e.target.value);
      setServerError(null);
      setTouchedFields((prev) => ({ ...prev, init_date: true }));
      setSubmitted(false);
      setIgnoreServerError(false);
    };

    const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
      setEndDate(e.target.value);
      setServerError(null);
      setTouchedFields((prev) => ({ ...prev, deadline: true }));
      setSubmitted(false);
      setIgnoreServerError(false);
    };

    const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newDesc = e.target.value;
      if (newDesc.length <= MAX_DESC_LENGTH) {
        setDescription(newDesc);
        setDescCharCount(newDesc.length);
        setServerError(null);
        setTouchedFields((prev) => ({ ...prev, description: true }));
        setSubmitted(false);
        setIgnoreServerError(false);
      }
    };

    const handleFormSubmit = (e: FormEvent) => e.preventDefault();

    const hasErrors = formErrors.length > 0 || !!serverError;

    const isNameNearLimit =
      nameCharCount >= MAX_NAME_LENGTH - 10 && nameCharCount <= MAX_NAME_LENGTH;
    const isNameAtLimit = nameCharCount >= MAX_NAME_LENGTH;
    const nameInputBorderColor = hasErrors
      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
      : isNameAtLimit
        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
        : isNameNearLimit
          ? "border-amber-300 focus:border-amber-500 focus:ring-amber-200"
          : "border-gray-200 focus:border-[#DDC9A3] focus:ring-[#DDC9A3]/20";
    const nameProgressBarColor = isNameAtLimit
      ? "bg-red-500"
      : isNameNearLimit
        ? "bg-amber-500"
        : "bg-[#DDC9A3]";
    const nameCharCountColor = isNameAtLimit
      ? "text-red-600"
      : isNameNearLimit
        ? "text-amber-600"
        : "text-gray-400";

    const isDescNearLimit =
      descCharCount >= MAX_DESC_LENGTH - 30 && descCharCount <= MAX_DESC_LENGTH;
    const isDescAtLimit = descCharCount >= MAX_DESC_LENGTH;
    const descProgressBarColor = isDescAtLimit
      ? "bg-red-500"
      : isDescNearLimit
        ? "bg-amber-500"
        : "bg-[#DDC9A3]";
    const descCharCountColor = isDescAtLimit
      ? "text-red-600"
      : isDescNearLimit
        ? "text-amber-600"
        : "text-gray-400";

    return (
      <form onSubmit={handleFormSubmit} noValidate className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="censoName"
              className="flex items-center text-sm font-semibold text-gray-700"
            >
              Nombre del censo
            </label>
            <span className={`text-xs font-medium ${nameCharCountColor}`}>
              {nameCharCount}/{MAX_NAME_LENGTH}
            </span>
          </div>
          <input
            type="text"
            id="censoName"
            value={name}
            onChange={handleNameChange}
            placeholder="Ej. Censo de población 2024"
            maxLength={MAX_NAME_LENGTH}
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-4 transition duration-200 ${nameInputBorderColor}`}
            disabled={isSubmitting}
            autoFocus
          />
          <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ease-out ${nameProgressBarColor}`}
              style={{ width: `${(nameCharCount / MAX_NAME_LENGTH) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="flex items-center text-sm font-semibold text-gray-700 mb-2"
            >
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
              <Calendar
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="flex items-center text-sm font-semibold text-gray-700 mb-2"
            >
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
              <Calendar
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="description"
              className="flex items-center text-sm font-semibold text-gray-700"
            >
              <FileText size={16} className="mr-2 text-gray-400" />
              Descripción breve (opcional)
            </label>
            <span className={`text-xs font-medium ${descCharCountColor}`}>
              {descCharCount}/{MAX_DESC_LENGTH}
            </span>
          </div>
          <textarea
            id="description"
            value={description}
            onChange={handleDescriptionChange}
            rows={3}
            maxLength={MAX_DESC_LENGTH}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#DDC9A3] focus:ring-4 focus:ring-[#DDC9A3]/20 transition duration-200 resize-none"
            placeholder="Describe el propósito o alcance del censo..."
          />
          <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ease-out ${descProgressBarColor}`}
              style={{ width: `${(descCharCount / MAX_DESC_LENGTH) * 100}%` }}
            />
          </div>
        </div>

        <FormErrors errors={formErrors} />
        {serverError && <FormErrors errors={[serverError]} />}
      </form>
    );
  },
);

CensoManualForm.displayName = "CensoManualForm";
