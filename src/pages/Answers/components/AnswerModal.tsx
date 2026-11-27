import {
  ArrowLeft,
  Info,
  ChevronLeft,
  ChevronRight,
  Save,
  Calculator,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Form } from "@formio/react";
import "../../../styles/bootstrap-scoped.css";
import type { CensusQuestion, AnswerData } from "../Answers.types";
import { useAnswerMutation } from "../hooks/useAnswerMutation";
import {
  evaluateOperations,
  type OperationConfig,
  type OperationResult,
} from "../../../lib/formioOperations";
import {
  sanitizeSchema,
  disableCalculatedFields,
} from "../../../lib/formioSchema";

const FormAny = Form as any;

const NO_FORM_MESSAGE =
  "Esta pregunta todavía no tiene formulario para contestarla en línea. Se contesta en el cuaderno de Excel del INEGI.";

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

/* Motor matemático y sanitización: ver src/lib/formioOperations.ts
   y src/lib/formioSchema.ts (compartidos por todos los modales). */

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
  // Por qué no hay formulario que mostrar; sin esto la pantalla se quedaba en «Cargando formulario…».
  const [formError, setFormError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([{}]);
  const [operations, setOperations] = useState<OperationConfig[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const { isSubmitting, handleSave } = useAnswerMutation({
    onAnswerSaved,
    onClose,
  });

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
    setSchema(null);
    setFormError(null);
    setSubmissions([{}]);
    setOperations([]);
    setIsDirty(false);

    if (!isOpen || !question) return;

    // Las preguntas que entran por los cuadernos de Excel no tienen formulario Form.io.
    if (!question.question_structure) {
      setFormError(NO_FORM_MESSAGE);
      return;
    }

    try {
      let parsed: QuestionSchema =
        typeof question.question_structure === "string"
          ? JSON.parse(question.question_structure)
          : { ...question.question_structure };

      if (!Array.isArray(parsed?.components) || parsed.components.length === 0) {
        setFormError(NO_FORM_MESSAGE);
        return;
      }

      parsed = { ...sanitizeSchema(parsed), display: "form" };
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
      setFormError("No se pudo leer el formulario de esta pregunta. Avisa al equipo del censo.");
    }
  }, [isOpen, question, parseExistingAnswer]);

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
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50">

      {/* HEADER */}
      <header className="shrink-0 bg-[var(--pantone-7421)] text-white shadow-md">
        <div className="flex w-full items-start gap-3 px-3 py-4 sm:px-5 lg:px-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Volver"
            className="mt-0.5 shrink-0 rounded-lg p-2 transition-colors hover:bg-white/20 disabled:opacity-50"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex min-w-0 flex-grow flex-wrap items-baseline gap-x-3 gap-y-1.5">
            {question.index && (
              <span className="inline-flex shrink-0 translate-y-[-1px] items-center self-start rounded-md bg-white/20 px-2.5 py-1 text-xs font-bold tracking-wide">
                {question.index}
              </span>
            )}
            <h2 className="text-base font-bold leading-snug tracking-tight sm:text-lg md:text-xl">
              {question.name}
            </h2>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="flex-grow overflow-y-auto">
        <div className="w-full space-y-5 px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
          {schema ? (
            <>
              {/* Instrucción completa de la pregunta */}
              {question.instructions && (
                <div className="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                  <Info size={18} className="mt-0.5 shrink-0 text-blue-500" />
                  <p className="whitespace-pre-line text-sm leading-relaxed text-blue-900/80">
                    {question.instructions}
                  </p>
                </div>
              )}

              {/* bootstrap-scoped: form.io necesita Bootstrap para renderizar correctamente.
                  Sin overflow-x-auto aquí: recortaba los dropdowns de los selects;
                  el scroll horizontal lo manejan los componentes anchos (formio-theme.css) */}
              <div className="bs">
                <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
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
          ) : formError ? (
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            >
              <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p>{formError}</p>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center gap-2 text-gray-400">
              <Loader2 size={24} className="animate-spin" />
              <span>Cargando formulario...</span>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="shrink-0 border-t border-gray-200 bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
        <div className="flex w-full items-center justify-between gap-3 px-3 py-4 sm:px-5 lg:px-6">
          {/* Paginación para formularios repeat */}
          {isRepeat ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => commitAndNavigate(-1)}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-500">
                {currentIndex + 1} / {submissions.length}
              </span>
              <button
                onClick={() => commitAndNavigate(1)}
                disabled={currentIndex === submissions.length - 1}
                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-40"
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
              className="rounded-lg bg-[#C3A67C] px-5 py-2 text-sm font-semibold text-white transition-colors hover:brightness-95 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleFinish}
              disabled={isSubmitting || !isDirty}
              className="flex items-center gap-2 rounded-lg bg-[var(--pantone-7421)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:brightness-90 disabled:opacity-50"
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
      </footer>
    </div>
  );
}
