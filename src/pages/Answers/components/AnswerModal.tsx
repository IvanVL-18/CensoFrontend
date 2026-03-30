import {
  X,
  ChevronLeft,
  ChevronRight,
  Save,
  Calculator,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Form } from "@formio/react";
import "../../../styles/bootstrap-scoped.css";
import type { CensusQuestion, AnswerData } from "../Answers.types";
import { useAnswerMutation } from "../hooks/useAnswerMutation";

const FormAny = Form as any;

/* =========================================================
   =================== TIPOS INTERNOS ======================
   ========================================================= */

type QuestionSchema = {
  components: any[];
  display?: string;
  repeat_config?: {
    repeat: boolean;
    data_repeat_type: "fixed" | "array";
    data_repeat_number?: number | string;
    data_repeat_config?: any[];
  };
  operations?: { label: string; expression: string }[];
  [key: string]: any;
};

type OperationConfig = { label: string; expression: string };
type OperationResult = { label: string; result: number | string };

/* =========================================================
   ================== SANITIZACIÓN =========================
   ========================================================= */

const sanitizeComponents = (components: any[]): any[] =>
  components.map((comp) => {
    const s = { ...comp };
    if (s.inputMask === null) s.inputMask = "";
    if (s.displayMask === null) s.displayMask = "";
    if (Array.isArray(s.components))
      s.components = sanitizeComponents(s.components);
    if (Array.isArray(s.columns))
      s.columns = s.columns.map((col: any) => ({
        ...col,
        components: sanitizeComponents(col.components ?? []),
      }));
    if (Array.isArray(s.rows))
      s.rows = s.rows.map((row: any[]) =>
        Array.isArray(row)
          ? row.map((cell: any) => ({
              ...cell,
              components: sanitizeComponents(cell.components ?? []),
            }))
          : row
      );
    return s;
  });

const sanitizeSchema = (schema: QuestionSchema): QuestionSchema => ({
  ...schema,
  display: "form",
  components: sanitizeComponents(schema.components ?? []),
});

/* =========================================================
   ================ MOTOR MATEMÁTICO =======================
   ========================================================= */

const parseExpression = (expression: string) => {
  const match = expression.match(/(\w+)\(([^,]*)(?:,\s*([^)]+))?\)/);
  if (!match) return null;
  return {
    operation: match[1].toUpperCase(),
    variable: match[2]?.trim() || null,
    condition: match[3]?.trim() || null,
  };
};

const extractNumbers = (dataArray: any[], variable: string): number[] =>
  dataArray
    .map((e) => e?.[variable])
    .filter((v) => v !== null && v !== undefined && v !== "")
    .map(Number)
    .filter((v) => !isNaN(v));

const evalCondition = (record: any, condition: string): boolean => {
  try {
    const keys = Object.keys(record);
    // eslint-disable-next-line no-new-func
    return new Function(...keys, `return ${condition};`)(...keys.map((k) => record[k]));
  } catch {
    return false;
  }
};

const filterByCondition = (
  dataArray: any[],
  variable: string,
  condition: string
): number[] =>
  dataArray
    .filter((r) => evalCondition(r, condition))
    .map((r) => r?.[variable])
    .filter((v) => v !== null && v !== undefined && !isNaN(Number(v)))
    .map(Number);

const evaluateOperations = (
  operations: OperationConfig[],
  submissions: any[]
): OperationResult[] => {
  if (!operations?.length || !submissions?.length) return [];

  return operations.map((config) => {
    const parsed = parseExpression(config.expression);
    if (!parsed) return { label: config.label, result: "Sintaxis inválida" };

    const { operation, variable, condition } = parsed;
    const isConditional = condition !== null;
    const values =
      isConditional && variable
        ? filterByCondition(submissions, variable, condition!)
        : variable
        ? extractNumbers(submissions, variable)
        : [];

    let result: number | string;
    switch (operation) {
      case "SUMAR":
      case "SUMARSI":
        result = values.reduce((a, b) => a + b, 0);
        break;
      case "CONTAR":
      case "CONTARSI":
        result = values.length;
        break;
      case "PROMEDIAR":
      case "PROMEDIARSI":
        result = values.length
          ? parseFloat(
              (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
            )
          : 0;
        break;
      case "MAX":
      case "MAXSI":
        result = values.length ? Math.max(...values) : 0;
        break;
      case "MIN":
      case "MINSI":
        result = values.length ? Math.min(...values) : 0;
        break;
      default:
        result = "Operación no reconocida";
    }
    return { label: config.label, result };
  });
};

/* =========================================================
   ==================== HOOK INTERNO =======================
   ========================================================= */

const useRepeatNavigation = (
  submissions: any[],
  setSubmissions: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const currentDataRef = useRef<any>({});

  useEffect(() => {
    setCurrentIndex(0);
    currentDataRef.current = submissions[0] ?? {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions.length]);

  const handleChange = useCallback((event: any) => {
    if (event?.changed || event?.data) {
      currentDataRef.current = { ...event.data };
      setRenderTrigger((t) => t + 1);
    }
  }, []);

  const commitAndNavigate = useCallback(
    (direction: 1 | -1) => {
      const toIndex = currentIndex + direction;
      if (toIndex < 0 || toIndex >= submissions.length) return;
      setSubmissions((prev) => {
        const copy = [...prev];
        copy[currentIndex] = { ...currentDataRef.current };
        return copy;
      });
      setCurrentIndex(toIndex);
      currentDataRef.current = submissions[toIndex] ?? {};
    },
    [currentIndex, submissions, setSubmissions]
  );

  const commitCurrent = useCallback((): any[] => {
    const final = [...submissions];
    final[currentIndex] = { ...currentDataRef.current };
    return final;
  }, [currentIndex, submissions]);

  const submissionForPage = useMemo(
    () => ({ data: submissions[currentIndex] ?? {} }),
    [submissions, currentIndex]
  );

  return {
    currentIndex,
    renderTrigger,
    currentDataRef,
    handleChange,
    commitAndNavigate,
    commitCurrent,
    submissionForPage,
  };
};

/* =========================================================
   ================ SUBCOMPONENTES =========================
   ========================================================= */

const OperationResults = ({ results }: { results: OperationResult[] }) => {
  if (!results.length) return null;
  return (
    <div className="bg-blue-50/60 p-5 rounded-xl border border-blue-100">
      <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
        <Calculator size={16} /> Totales Generales
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {results.map((op, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center"
          >
            <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1 truncate">
              {op.label}
            </span>
            <span className="text-2xl font-black text-blue-700">{op.result}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   ================ COMPONENTE PRINCIPAL ===================
   ========================================================= */

interface AnswerModalProps {
  isOpen: boolean;
  question: CensusQuestion | null;
  onClose: () => void;
  onAnswerSaved: (censusQuestionId: string, answer: AnswerData) => void;
}

export function AnswerModal({
  isOpen,
  question,
  onClose,
  onAnswerSaved,
}: AnswerModalProps) {
  const [schema, setSchema] = useState<QuestionSchema | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([{}]);
  const [operations, setOperations] = useState<OperationConfig[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const { isSubmitting, handleSave } = useAnswerMutation({
    onAnswerSaved,
    onClose,
  });

  const disableCalculatedFields = useCallback((components: any[]): any[] => {
    if (!Array.isArray(components)) return [];
    return components.map((comp: any) => {
      const c = { ...comp };
      if (
        c.calculateValue &&
        typeof c.calculateValue === "string" &&
        c.calculateValue.trim() !== ""
      ) {
        c.disabled = true;
      }
      if (Array.isArray(c.components))
        c.components = disableCalculatedFields(c.components);
      if (Array.isArray(c.columns))
        c.columns = c.columns.map((col: any) => ({
          ...col,
          components: disableCalculatedFields(col.components ?? []),
        }));
      if (Array.isArray(c.rows))
        c.rows = c.rows.map((row: any) =>
          Array.isArray(row)
            ? row.map((cell: any) => ({
                ...cell,
                components: disableCalculatedFields(cell.components ?? []),
              }))
            : row
        );
      return c;
    });
  }, []);

  // Parsea la respuesta guardada para precargar form.io
  const parseExistingAnswer = useCallback(
    (answerString: string | null, count: number): any[] => {
      if (!answerString) return Array.from({ length: count }, () => ({}));
      try {
        const parsed = JSON.parse(answerString);
        if (Array.isArray(parsed)) return parsed;
        return [parsed];
      } catch {
        return Array.from({ length: count }, () => ({}));
      }
    },
    []
  );

  useEffect(() => {
    if (!isOpen || !question) {
      setSchema(null);
      setSubmissions([{}]);
      setOperations([]);
      setIsDirty(false);
      return;
    }

    try {
      let parsed: QuestionSchema =
        typeof question.question_structure === "string"
          ? JSON.parse(question.question_structure)
          : { ...question.question_structure };

      parsed = sanitizeSchema(parsed);
      if (parsed.components) {
        parsed = {
          ...parsed,
          components: disableCalculatedFields(parsed.components),
        };
      }

      // Calcular iteraciones según repeat_config
      const rc = parsed.repeat_config;
      let count = 1;
      if (rc?.repeat) {
        if (rc.data_repeat_type === "fixed") {
          count = parseInt(String(rc.data_repeat_number ?? "1")) || 1;
        } else if (
          rc.data_repeat_type === "array" &&
          Array.isArray(rc.data_repeat_config)
        ) {
          count = rc.data_repeat_config.length || 1;
        }
      }

      const existingData = parseExistingAnswer(
        question.answer?.answer ?? null,
        count
      );

      // Merge con data_repeat_config si es de tipo array (p.ej. labels por unidad)
      let initialSubmissions: any[];
      if (
        rc?.repeat &&
        rc.data_repeat_type === "array" &&
        Array.isArray(rc.data_repeat_config)
      ) {
        initialSubmissions = rc.data_repeat_config.map(
          (item: any, i: number) => ({
            ...item,
            ...(existingData[i] ?? {}),
          })
        );
      } else {
        initialSubmissions =
          existingData.length > 0
            ? existingData
            : Array.from({ length: count }, () => ({}));
      }

      setSubmissions(initialSubmissions);
      setOperations(parsed.operations ?? []);
      setSchema(parsed);
      setIsDirty(false);
    } catch (e) {
      console.error("Error al parsear question_structure:", e);
    }
  }, [isOpen, question, disableCalculatedFields, parseExistingAnswer]);

  const {
    currentIndex,
    renderTrigger,
    currentDataRef,
    handleChange: handleRepeatChange,
    commitAndNavigate,
    commitCurrent,
    submissionForPage,
  } = useRepeatNavigation(submissions, setSubmissions);

  const handleChange = useCallback(
    (event: any) => {
      handleRepeatChange(event);
      if (event?.changed) setIsDirty(true);
    },
    [handleRepeatChange]
  );

  const evaluatedResults = useMemo(() => {
    const live = [...submissions];
    live[currentIndex] = { ...currentDataRef.current };
    return evaluateOperations(operations, live);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operations, submissions, renderTrigger, currentIndex]);

  const handleFinish = useCallback(async () => {
    if (!question) return;
    const finalData = commitCurrent();
    await handleSave(question, finalData);
  }, [question, commitCurrent, handleSave]);

  const isRepeat = submissions.length > 1;

  if (!isOpen || !question) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={(e) =>
        e.target === e.currentTarget && !isSubmitting && onClose()
      }
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] flex flex-col max-h-[95vh] overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 bg-[var(--pantone-7421)] text-white shrink-0">
          <div className="flex flex-col min-w-0">
            <h2 className="text-lg font-bold tracking-tight truncate">
              {question.index ? `${question.index} — ` : ""}
              {question.name}
            </h2>
            {question.instructions && (
              <span className="text-xs text-white/70 mt-0.5 line-clamp-1">
                {question.instructions}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar modal"
            className="hover:bg-white/20 p-1.5 rounded-lg transition-colors shrink-0 ml-4 disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto p-6 bg-gray-50 flex-grow space-y-5">
          {schema ? (
            <>
              {/* bootstrap-scoped: form.io necesita Bootstrap para renderizar correctamente */}
              <div className="bs overflow-x-auto">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-w-0">
                  <FormAny
                    key={`answer-${question.id}-${currentIndex}`}
                    form={schema}
                    submission={submissionForPage}
                    onChange={handleChange}
                    options={{
                      noAlerts: true,
                      language: "es",
                      noDefaultSubmitButton: true,
                    }}
                  />
                </div>
              </div>
              <OperationResults results={evaluatedResults} />
            </>
          ) : (
            <div className="flex justify-center items-center h-40 text-gray-400 gap-2">
              <Loader2 size={24} className="animate-spin" />
              <span>Cargando formulario...</span>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200 shrink-0 gap-3">
          {/* Paginación para formularios repeat */}
          {isRepeat ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => commitAndNavigate(-1)}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                {currentIndex + 1} / {submissions.length}
              </span>
              <button
                onClick={() => commitAndNavigate(1)}
                disabled={currentIndex === submissions.length - 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold bg-[#C3A67C] text-white rounded-lg hover:brightness-95 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleFinish}
              disabled={isSubmitting || !isDirty}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-[var(--pantone-7421)] text-white rounded-lg disabled:opacity-50 hover:brightness-90 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Guardando...
                </>
              ) : (
                <>
                  <Save size={16} /> Guardar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
