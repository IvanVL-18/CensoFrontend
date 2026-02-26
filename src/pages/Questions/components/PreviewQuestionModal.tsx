import {
  X,
  ChevronLeft,
  ChevronRight,
  Save,
  Calculator
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { getQuestionComponent } from "../Questions.service";
import { Form } from "@formio/react";

import "bootstrap/dist/css/bootstrap.min.css";
import "formiojs/dist/formio.full.css";

const FormAny = Form as any;

/* =========================================================
   ================= MOTOR MATEMÁTICO ======================
   ========================================================= */

type OperationConfig = {
  label: string;
  expression: string;
};

const parseExpression = (expression: string) => {
  const match = expression.match(/(\w+)\(([^)]*)\)/);
  if (!match) return null;

  return {
    operation: match[1].toUpperCase(),
    variable: match[2]?.trim()
  };
};

const extractValues = (dataArray: any[], variable: string): number[] => {
  const path = variable.split(".");

  const resolve = (obj: any, parts: string[]): any[] => {
    if (obj == null) return [];

    if (Array.isArray(obj)) {
      return obj.flatMap(item => resolve(item, parts));
    }

    if (parts.length === 0) {
      if (Array.isArray(obj)) return obj;
      return [obj];
    }

    const [head, ...rest] = parts;

    if (!(head in obj)) return [];

    return resolve(obj[head], rest);
  };

  return dataArray.flatMap(entry =>
    resolve(entry, path)
      .map(v => Number(v))
      .filter(v => !isNaN(v))
  );
};

const evaluateOperations = (
  operations: OperationConfig[],
  submissions: any[]
) => {
  if (!operations?.length) return [];

  return operations.map(config => {
    const parsed = parseExpression(config.expression);
    if (!parsed) {
      return { label: config.label, result: "Sintaxis inválida" };
    }

    const values = parsed.variable
      ? extractValues(submissions, parsed.variable)
      : [];

    let result: number | string = 0;

    switch (parsed.operation) {
      case "SUMAR":
        result = values.reduce((a, b) => a + b, 0);
        break;

      case "CONTAR":
        result = values.length;
        break;

      case "PROMEDIAR":
        result = values.length
          ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
          : 0;
        break;

      case "MAX":
        result = values.length ? Math.max(...values) : 0;
        break;

      case "MIN":
        result = values.length ? Math.min(...values) : 0;
        break;

      default:
        result = "Operación no soportada";
    }

    return { label: config.label, result };
  });
};

/* =========================================================
   ================= UTILIDADES ============================
   ========================================================= */

const normalizeSchema = (raw: any) => {
  if (!raw) return null;

  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  return raw;
};

/* =========================================================
   ================= COMPONENTE ============================
   ========================================================= */

export function PreviewQuestionModal({
  isOpen,
  onClose,
  questionId
}: {
  isOpen: boolean;
  onClose: () => void;
  questionId: string | number | null;
}) {
  const formRef = useRef<any>(null);

  const [schema, setSchema] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [operations, setOperations] = useState<OperationConfig[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!isOpen || !questionId) return;

    setLoading(true);
    setError(null);
    setSchema(null);
    setSubmissions([]);
    setOperations([]);
    setCurrentIndex(0);

    getQuestionComponent(questionId)
      .then(res => {
        const parsed = normalizeSchema(res.question_structure);
        if (!parsed) throw new Error("Schema inválido");

        parsed.display = "form";

        const repeatConfig = parsed?.repeat_config;
        let preloadedData: any[] = [{}];

        if (repeatConfig?.repeat) {
          if (repeatConfig.data_repeat_type === "fixed") {
            const total = repeatConfig.data_repeat_number || 1;
            preloadedData = new Array(total).fill({});
          }

          if (repeatConfig.data_repeat_type === "array") {
            preloadedData =
              repeatConfig.data_repeat_config?.map((item: any) => ({
                ...item
              })) || [{}];
          }
        }

        setSubmissions(preloadedData);
        setOperations(parsed.operations || []);
        setSchema(parsed);
      })
      .catch(() => {
        setError("Error al cargar el componente.");
      })
      .finally(() => setLoading(false));
  }, [isOpen, questionId]);

  /* ================= SINCRONIZAR FORM.IO ================= */

  useEffect(() => {
    if (!formRef.current) return;

    const formInstance = formRef.current?.formio;

    if (!formInstance) return;

    const currentData = submissions[currentIndex] || {};

    formInstance.submission = { data: currentData };

    formInstance.redraw();
    formInstance.checkData(currentData); // 👈 fuerza evaluator
  }, [currentIndex]);

  /* ================= CHANGE ================= */

  const handleChange = (e: any) => {
    setSubmissions(prev => {
      const copy = [...prev];
      copy[currentIndex] = e.data;
      return copy;
    });
  };

  /* ================= OPERACIONES ================= */

  const evaluatedResults = useMemo(() => {
    return evaluateOperations(operations, submissions);
  }, [operations, submissions]);

  /* ================= PAGINADOR ================= */

  const handleNext = () => {
    if (currentIndex < submissions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    console.log("JSON listo para backend:", submissions);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl flex flex-col max-h-[95vh]">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 bg-red-900 text-white rounded-t-lg">
          <h2 className="text-xl font-bold">
            Vista Previa del Componente
          </h2>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto p-6 bg-gray-50 flex-grow min-h-[400px]">

          {loading && (
            <p className="text-center text-gray-500 animate-pulse">
              Cargando componente...
            </p>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded">
              {error}
            </div>
          )}

          {!loading && schema && (
            <div className="space-y-6">

              <div className="bg-white p-6 rounded shadow border">
                <FormAny
                  key={currentIndex}
                  ref={formRef}
                  form={schema}
                  submission={{ data: submissions[currentIndex] || {} }}
                  onChange={handleChange}
                  options={{ noAlerts: true }}
                />
              </div>

              {evaluatedResults.length > 0 && (
                <div className="bg-blue-50 p-4 rounded border">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Calculator size={18} /> Operaciones
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {evaluatedResults.map((op, i) => (
                      <div key={i} className="bg-white p-3 rounded border shadow-sm">
                        <span className="text-xs text-gray-500 uppercase">
                          {op.label}
                        </span>
                        <div className="text-lg font-bold text-blue-700">
                          {op.result}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* FOOTER */}
        {!loading && submissions.length > 1 && (
          <div className="flex justify-between items-center p-4 bg-gray-100 border-t rounded-b-lg">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 bg-white border rounded disabled:opacity-40"
            >
              <ChevronLeft size={18} /> Anterior
            </button>

            <span className="text-sm font-medium">
              {currentIndex + 1} de {submissions.length}
            </span>

            {currentIndex < submissions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-red-900 text-white rounded"
              >
                Siguiente <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="px-4 py-2 bg-green-700 text-white rounded"
              >
                <Save size={18} /> Finalizar
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}