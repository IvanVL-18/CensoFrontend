import { ArrowLeft, ChevronLeft, ChevronRight, Save, Calculator, AlertCircle, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getquestionComponent } from "../Answers.service";
import { Form } from "@formio/react";
import "../../../styles/bootstrap-scoped.css";

const FormAny = Form as any;

type OperationConfig = {
  label: string;
  expression: string;
};

type OperationResult = {
  label: string;
  result: number | string;
};

type RepeatConfig = {
  repeat: boolean;
  data_repeat_type: "fixed" | "array";
  data_repeat_number?: number | string;
  data_repeat_config?: any[];
};

type questionschema = {
  components: any[];
  display?: string;
  repeat_config?: RepeatConfig;
  operations?: OperationConfig[];
  [key: string]: any;
};

type questionMeta = {
  question: string;
  index: string;
  unit_name: string;
  section_name: string;
  questionary_year: string | number;
};

/* =========================================================
   ================== SANITIZACIÓN =========================
   ========================================================= */

const sanitizeComponents = (components: any[]): any[] =>
  components.map((comp) => {
    const s = { ...comp };
    if (s.inputMask === null)   s.inputMask   = "";
    if (s.displayMask === null) s.displayMask = "";
    if (Array.isArray(s.components)) s.components = sanitizeComponents(s.components);
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

const sanitizeSchema = (schema: questionschema): questionschema => ({
  ...schema,
  display: schema.display ?? "form",
  components: sanitizeComponents(schema.components ?? []),
});

/* =========================================================
   ================== MOTOR MATEMÁTICO =====================
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
    .map((entry) => entry?.[variable])
    .filter((val) => val !== null && val !== undefined && val !== "")
    .map((val) => Number(val))
    .filter((val) => !isNaN(val));

const evalCondition = (record: any, condition: string): boolean => {
  try {
    const keys = Object.keys(record);
    const fn = new Function(...keys, `return ${condition};`);
    return fn(...keys.map((k) => record[k]));
  } catch {
    return false;
  }
};

const filterByCondition = (dataArray: any[], variable: string, condition: string): number[] =>
  dataArray
    .filter((record) => evalCondition(record, condition))
    .map((record) => record?.[variable])
    .filter((val) => val !== null && val !== undefined && !isNaN(Number(val)))
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
    const values = isConditional && variable
        ? filterByCondition(submissions, variable, condition!)
        : variable
        ? extractNumbers(submissions, variable)
        : [];
    let result: number | string;
    switch (operation) {
      case "SUMAR": case "SUMARSI": result = values.reduce((a, b) => a + b, 0); break;
      case "CONTAR": case "CONTARSI": result = values.length; break;
      case "PROMEDIAR": case "PROMEDIARSI":
        result = values.length ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0;
        break;
      case "MAX": case "MAXSI": result = values.length ? Math.max(...values) : 0; break;
      case "MIN": case "MINSI": result = values.length ? Math.min(...values) : 0; break;
      default: result = "Operación no reconocida";
    }
    return { label: config.label, result };
  });
};

/* =========================================================
   ======================= HOOKS ===========================
   ========================================================= */

const useFormSchema = (questionId: string | number | null) => {
  const [schema, setSchema]           = useState<questionschema | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([{}]);
  const [operations, setOperations]   = useState<OperationConfig[]>([]);
  const [meta, setMeta]               = useState<questionMeta | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const disableCalculatedFields = useCallback((components: any[]): any[] => {
    if (!Array.isArray(components)) return [];
    return components.map((comp: any) => {
      const c = { ...comp };
      if (c.calculateValue && typeof c.calculateValue === "string" && c.calculateValue.trim() !== "") {
        c.disabled = true;
      }
      if (Array.isArray(c.components)) c.components = disableCalculatedFields(c.components);
      return c;
    });
  }, []);

  const buildSubmissions = useCallback((repeatConfig?: RepeatConfig): any[] => {
    if (!repeatConfig?.repeat) return [{}];
    if (repeatConfig.data_repeat_type === "fixed") {
      const total = parseInt(String(repeatConfig.data_repeat_number ?? "1")) || 1;
      return Array.from({ length: total }, () => ({}));
    }
    if (repeatConfig.data_repeat_type === "array") {
      const items = repeatConfig.data_repeat_config;
      return Array.isArray(items) && items.length > 0 ? items.map((item: any) => ({ ...item })) : [{}];
    }
    return [{}];
  }, []);

  useEffect(() => {
    if (!questionId) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getquestionComponent(questionId, controller.signal)
      .then((res) => {
        if (!res?.question_structure) throw new Error("Estructura vacía.");
        let parsed: questionschema = typeof res.question_structure === "string" ? JSON.parse(res.question_structure) : { ...res.question_structure };
        parsed = sanitizeSchema(parsed);
        if (parsed.components) parsed = { ...parsed, components: disableCalculatedFields(parsed.components) };
        setSubmissions(buildSubmissions(parsed.repeat_config));
        setOperations(parsed.operations ?? []);
        setSchema(parsed);
      })
      .catch((err: any) => {
        if (err.name !== "AbortError" && err.message !== "canceled") {
            setError(err.message || "Error al cargar la estructura.");
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [questionId, disableCalculatedFields, buildSubmissions]);

  return { schema, submissions, setSubmissions, operations, meta, loading, error };
};

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
  }, [submissions.length]);

  const handleChange = useCallback((event: any) => {
    if (event?.changed) {
      currentDataRef.current = { ...event.data };
      setRenderTrigger((t) => t + 1);
    }
  }, []);

  const commitAndNavigate = useCallback((direction: 1 | -1) => {
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
    }, [currentIndex, submissions, setSubmissions]
  );

  const commitCurrent = useCallback((): any[] => {
    const final = [...submissions];
    final[currentIndex] = { ...currentDataRef.current };
    return final;
  }, [currentIndex, submissions]);

  return { currentIndex, renderTrigger, currentDataRef, handleChange, commitAndNavigate, commitCurrent, submissionForPage: { data: submissions[currentIndex] ?? {} } };
};

/* =========================================================
   ================= SUB-COMPONENTES =======================
   ========================================================= */

const NavigationFooter = ({
  currentIndex, total, onPrev, onNext, onSave, onBack, isSaving,
}: {
  currentIndex: number; total: number; onPrev: () => void; onNext: () => void;
  onSave?: () => void; onBack: () => void; isSaving?: boolean;
}) => {
  if (total <= 1) {
    return (
      <div className="flex justify-end items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
        {onSave ? (
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? "Guardando..." : "Guardar Registro"}
          </button>
        ) : (
          <button onClick={onBack} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <X size={16} /> Volver
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
      <button onClick={onPrev} disabled={currentIndex === 0} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg disabled:opacity-40">
        <ChevronLeft size={16} /> Anterior
      </button>
      <span className="text-sm font-semibold text-gray-500 bg-gray-200 px-3 py-1 rounded-full">{currentIndex + 1} / {total}</span>
      {currentIndex < total - 1 ? (
        <button onClick={onNext} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#9B2347] text-white rounded-lg">
          Siguiente <ChevronRight size={16} />
        </button>
      ) : onSave ? (
        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Guardando..." : "Guardar Registro"}
        </button>
      ) : (
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-gray-600 text-white rounded-lg">
          <X size={16} /> Volver
        </button>
      )}
    </div>
  );
};

/* =========================================================
   ================= COMPONENTE PRINCIPAL ==================
   ========================================================= */

export default function PreviewquestionPage({ onSave }: { onSave?: (submissions: any[]) => void | Promise<void> }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { schema, submissions, setSubmissions, operations, meta, loading, error } = useFormSchema(id ?? null);
  const { currentIndex, renderTrigger, currentDataRef, handleChange, commitAndNavigate, commitCurrent, submissionForPage } = useRepeatNavigation(submissions, setSubmissions);

  // Estado para deshabilitar el botón Guardar mientras se envía
  const [isSaving, setIsSaving] = useState(false);

  const evaluatedResults = useMemo(() => {
    const liveSubmissions = [...submissions];
    liveSubmissions[currentIndex] = { ...currentDataRef.current };
    return evaluateOperations(operations, liveSubmissions);
  }, [operations, submissions, renderTrigger, currentIndex]);

  // FIX: handleFinish es async y AWAITA onSave antes de navegar.
  // Sin await, navigate(-1) desmontaba el componente antes de que el
  // fetch terminara, cancelando la petición silenciosamente.
  const handleFinish = async () => {
    const finalData = commitCurrent();
    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(finalData);
      } finally {
        setIsSaving(false);
      }
    }
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#9B2347] text-white px-6 py-4 flex items-center gap-4 shadow-md">
        <button onClick={() => navigate(-1)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors"><ArrowLeft size={22} /></button>
        <h1 className="text-lg font-bold truncate">{meta?.question || "Responder pregunta"}</h1>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-5">
        {loading && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
                <Loader2 size={32} className="animate-spin text-[#9B2347]" />
                <p className="text-sm font-medium text-gray-400">Cargando maquetación...</p>
            </div>
        )}
        {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg">
                <AlertCircle size={20} className="shrink-0" />
                <p className="font-semibold text-sm">{error}</p>
            </div>
        )}

        {!loading && schema && !error && (
          <>
            <div className="bs overflow-x-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <FormAny
                  key={`form-${id}-${currentIndex}`}
                  form={schema}
                  submission={submissionForPage}
                  onChange={handleChange}
                  options={{ noAlerts: true, language: "es", noDefaultSubmitButton: true }}
                />
              </div>
            </div>
            {evaluatedResults.length > 0 && (
                <div className="bg-blue-50/60 p-5 rounded-xl border border-blue-100">
                    <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-sm uppercase"><Calculator size={16} /> Totales Generales</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {evaluatedResults.map((op, i) => (
                            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                                <span className="block text-[11px] font-semibold text-gray-400 uppercase mb-1">{op.label}</span>
                                <span className="text-2xl font-black text-blue-700">{op.result}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </>
        )}
      </div>

      {!loading && !error && (
        <div className="max-w-5xl mx-auto px-6 pb-10">
          <NavigationFooter
            currentIndex={currentIndex}
            total={submissions.length}
            onPrev={() => commitAndNavigate(-1)}
            onNext={() => commitAndNavigate(1)}
            onSave={onSave ? handleFinish : undefined}
            onBack={() => navigate(-1)}
            isSaving={isSaving}
          />
        </div>
      )}
    </div>
  );
}