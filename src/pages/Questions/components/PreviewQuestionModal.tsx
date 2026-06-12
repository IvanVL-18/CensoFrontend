import { X, ChevronLeft, ChevronRight, Save, Calculator, AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { getQuestionComponent } from "../Questions.service";
import { Form } from "@formio/react";
// Bootstrap scoped: solo aplica dentro de <div className="bs">
// Form.io necesita Bootstrap para renderizar sus campos correctamente.
import "../../../styles/bootstrap-scoped.css";
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

type RepeatConfig = {
  repeat: boolean;
  data_repeat_type: "fixed" | "array";
  data_repeat_number?: number | string;
  data_repeat_config?: any[];
};

type QuestionSchema = {
  components: any[];
  display?: string;
  repeat_config?: RepeatConfig;
  operations?: OperationConfig[];
  [key: string]: any;
};

/**
 * Metadata que devuelve el controlador junto con el schema.
 * Corresponde a los campos extra de getsave_form en QuestionsController.
 */
type QuestionMeta = {
  question: string;
  index: string;
  unit_name: string;
  section_name: string;
  questionary_year: string | number;
};

/* Motor matemático y sanitización: ver src/lib/formioOperations.ts
   y src/lib/formioSchema.ts (compartidos por todos los modales). */

/* =========================================================
   ======================= HOOKS ===========================
   ========================================================= */

/**
 * Gestiona la carga del schema:
 * - Sanitiza inputMask/displayMask null antes de pasarlo a Form.io
 * - Deshabilita campos calculados (calculateValue) sin mutar el objeto original
 * - Construye el array de submissions según repeat_config
 * - Expone metadata del controlador (question, index, unit_name, etc.)
 * - Cancela el fetch si el modal se cierra antes de completar
 */
const useFormSchema = (isOpen: boolean, questionId: string | number | null) => {
  const [schema, setSchema]           = useState<QuestionSchema | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([{}]);
  const [operations, setOperations]   = useState<OperationConfig[]>([]);
  const [meta, setMeta]               = useState<QuestionMeta | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const buildSubmissions = useCallback((repeatConfig?: RepeatConfig): any[] => {
    if (!repeatConfig?.repeat) return [{}];

    if (repeatConfig.data_repeat_type === "fixed") {
      const total = parseInt(String(repeatConfig.data_repeat_number ?? "1")) || 1;
      return Array.from({ length: total }, () => ({}));
    }

    if (repeatConfig.data_repeat_type === "array") {
      const items = repeatConfig.data_repeat_config;
      return Array.isArray(items) && items.length > 0
        ? items.map((item: any) => ({ ...item }))
        : [{}];
    }

    return [{}];
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSchema(null);
      setSubmissions([{}]);
      setOperations([]);
      setMeta(null);
      setError(null);
      return;
    }

    if (!questionId) return;

    const controller = new AbortController();

    setLoading(true);
    setError(null);
    setSchema(null);
    setSubmissions([{}]);
    setMeta(null);

    getQuestionComponent(questionId, controller.signal)
      .then((res) => {
        if (!res?.question_structure) {
          throw new Error("El componente está vacío o no tiene estructura asignada.");
        }

        let parsed: QuestionSchema =
          typeof res.question_structure === "string"
            ? JSON.parse(res.question_structure)
            : { ...res.question_structure };

        // Sanitizar antes de cualquier otra operación
        parsed = sanitizeSchema(parsed);

        // FIX #4: disableCalculatedFields ahora retorna nuevo array (no muta)
        if (parsed.components)
          parsed = { ...parsed, components: disableCalculatedFields(parsed.components) };

        parsed.display = "form";


        setSubmissions(buildSubmissions(parsed.repeat_config));
        setOperations(parsed.operations ?? []);
        setSchema(parsed);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") {
          setError(err.message || "Error al cargar la estructura del componente.");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [isOpen, questionId, buildSubmissions]);

  return { schema, submissions, setSubmissions, operations, meta, loading, error };
};

/**
 * Gestiona la paginación entre iteraciones.
 * Usa una ref para el dato actual: evita re-renders que rompan el foco de Form.io.
 *
 * FIX #1: expone currentDataRef para que el componente principal pueda construir
 * el snapshot de datos vivos al calcular los totales.
 */
const useRepeatNavigation = (
  submissions: any[],
  setSubmissions: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const currentDataRef = useRef<any>({});

  // Resetear cuando cambia el número de páginas (nueva pregunta cargada)
  useEffect(() => {
    setCurrentIndex(0);
    currentDataRef.current = submissions[0] ?? {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissions.length]);

  const handleChange = useCallback((event: any) => {
    if (event?.changed) {
      currentDataRef.current = { ...event.data };
      // Solo forzamos re-render para los totales, no para el formulario
      setRenderTrigger((t) => t + 1);
    }
  }, []);

  const commitAndNavigate = useCallback(
    (direction: 1 | -1) => {
      const fromIndex = currentIndex;
      const toIndex   = currentIndex + direction;

      if (toIndex < 0 || toIndex >= submissions.length) return;

      setSubmissions((prev) => {
        const copy = [...prev];
        copy[fromIndex] = { ...currentDataRef.current };
        return copy;
      });

      setCurrentIndex(toIndex);
      currentDataRef.current = submissions[toIndex] ?? {};
    },
    [currentIndex, submissions, setSubmissions]
  );

  /** Devuelve el array completo con la última iteración guardada */
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
    currentDataRef,   // FIX #1: expuesto para calcular totales con datos vivos
    handleChange,
    commitAndNavigate,
    commitCurrent,
    submissionForPage,
  };
};

/* =========================================================
   ================= SUB-COMPONENTES =======================
   ========================================================= */

const LoadingState = () => (
  <div className="flex flex-col justify-center items-center h-48 gap-3 text-gray-400">
    <Loader2 size={32} className="animate-spin text-[#9B2347]" />
    <p className="font-medium text-sm tracking-wide">Cargando maquetación...</p>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg">
    <AlertCircle size={20} className="mt-0.5 shrink-0" />
    <p className="font-semibold text-sm">{message}</p>
  </div>
);

const OperationResults = ({ results }: { results: OperationResult[] }) => {
  if (!results.length) return null;
  return (
    <div className="bg-blue-50/60 p-5 rounded-xl border border-blue-100">
      <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
        <Calculator size={16} />
        Totales Generales
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {results.map((op, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
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

/**
 * FIX #5: onFinish y onClose son opcionales para poder diferenciar
 * entre un modal de solo preview (sin onSave) y uno con guardado.
 * Si no hay onFinish en la última iteración, se muestra "Cerrar" en su lugar.
 */
const NavigationFooter = ({
  currentIndex,
  total,
  onPrev,
  onNext,
  onFinish,
  onClose,
}: {
  currentIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onFinish?: () => void;
  onClose: () => void;
}) => {
  if (total <= 1) return null;

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200 shrink-0">
      <button
        onClick={onPrev}
        disabled={currentIndex === 0}
        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft size={16} /> Anterior
      </button>

      <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
        {currentIndex + 1} / {total}
      </span>

      {currentIndex < total - 1 ? (
        <button
          onClick={onNext}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#9B2347] text-white rounded-lg shadow-sm hover:bg-[#7a1b38] transition-colors"
        >
          Siguiente <ChevronRight size={16} />
        </button>
      ) : onFinish ? (
        // FIX #5: solo muestra "Guardar" si se recibió el callback
        <button
          onClick={onFinish}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors"
        >
          <Save size={16} /> Guardar Registro
        </button>
      ) : (
        // Modo solo-preview: muestra "Cerrar" en lugar de "Guardar"
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-gray-600 text-white rounded-lg shadow-sm hover:bg-gray-700 transition-colors"
        >
          <X size={16} /> Cerrar
        </button>
      )}
    </div>
  );
};

/* =========================================================
   ================= COMPONENTE PRINCIPAL ==================
   ========================================================= */

type PreviewQuestionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  questionId: string | number | null;
  /** Callback con los datos finales de TODAS las iteraciones.
   *  Si se omite, el modal funciona en modo solo-preview (sin botón Guardar). */
  onSave?: (submissions: any[]) => void;
};

export function PreviewQuestionModal({
  isOpen,
  onClose,
  questionId,
  onSave,
}: PreviewQuestionModalProps) {
  const { schema, submissions, setSubmissions, operations, meta, loading, error } =
    useFormSchema(isOpen, questionId);

  const {
    currentIndex,
    renderTrigger,
    currentDataRef,   // FIX #1
    handleChange,
    commitAndNavigate,
    commitCurrent,
    submissionForPage,
  } = useRepeatNavigation(submissions, setSubmissions);

  /**
   * FIX #1: los totales ahora usan un snapshot que incluye los datos vivos
   * de la iteración activa (currentDataRef), no solo las iteraciones ya
   * confirmadas con navigate. Equivalente al updateOperator() de formio_editor.js
   * que pasa data_repeat_config completo tras cada submit.
   */
  const evaluatedResults = useMemo(() => {
    const liveSubmissions = [...submissions];
    liveSubmissions[currentIndex] = { ...currentDataRef.current };
    return evaluateOperations(operations, liveSubmissions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operations, submissions, renderTrigger, currentIndex]);

  const handleFinish = () => {
    const finalData = commitCurrent();
    onSave?.(finalData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] flex flex-col max-h-[95vh] overflow-hidden">

        {/* HEADER — FIX #3: muestra índice y título de la pregunta cuando están disponibles */}
        <div className="flex justify-between items-center px-6 py-4 bg-[#9B2347] text-white shrink-0">
          <div className="flex flex-col min-w-0">
            <h2 className="text-lg font-bold tracking-tight truncate">
              {meta
                ? `${meta.index ? `${meta.index} — ` : ""}${meta.question || "Vista Previa"}`
                : "Vista Previa del Componente"}
            </h2>
            {/* Subtítulo con sección, unidad y año */}
            {meta && (meta.section_name || meta.unit_name || meta.questionary_year) && (
              <span className="text-xs text-white/70 mt-0.5 truncate">
                {[meta.section_name, meta.unit_name, meta.questionary_year]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="hover:bg-white/20 p-1.5 rounded-lg transition-colors shrink-0 ml-4"
          >
            <X size={22} />
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto p-6 bg-gray-50 flex-grow space-y-5">
          {loading && <LoadingState />}
          {error && <ErrorState message={error} />}

          {!loading && schema && !error && (
            <>
              {/* .bs: Bootstrap scoped — Form.io necesita Bootstrap para renderizar
                   correctamente sus inputs, grids y estilos internos. El wrapper .bs
                   asegura que Bootstrap no afecte al resto del modal (que usa Tailwind). */}
              {/* Sin overflow-x-auto: recortaba los dropdowns de los selects;
                  el scroll horizontal lo manejan los componentes anchos (formio-theme.css) */}
              <div className="bs">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-w-0">
                  <FormAny
                    /**
                     * La key combina questionId + currentIndex para forzar el
                     * remontaje completo de Form.io al paginar, evitando que
                     * datos de una iteración contaminen la siguiente.
                     */
                    key={`form-${questionId}-${currentIndex}`}
                    form={schema}
                    submission={submissionForPage}
                    onChange={handleChange}
                    options={{ noAlerts: true, language: "es", noDefaultSubmitButton: true }}
                  />
                </div>
              </div>

              <OperationResults results={evaluatedResults} />
            </>
          )}
        </div>

        {/* FOOTER: paginador, solo visible si hay múltiples iteraciones */}
        {!loading && !error && (
          <NavigationFooter
            currentIndex={currentIndex}
            total={submissions.length}
            onPrev={() => commitAndNavigate(-1)}
            onNext={() => commitAndNavigate(1)}
            onFinish={onSave ? handleFinish : undefined}  // FIX #5
            onClose={onClose}
          />
        )}

      </div>
    </div>
  );
}