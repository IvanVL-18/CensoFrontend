import { X, ChevronLeft, ChevronRight, Save, Calculator } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getQuestionComponent } from "../Questions.service";

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
  return dataArray
    .map(entry => entry?.[variable])
    .filter(val => val !== null && val !== undefined && val !== "")
    .map(val => Number(val))
    .filter(val => !isNaN(val));
};

const evaluateOperations = (operations: OperationConfig[], submissions: any[]) => {
  if (!operations?.length) return [];

  return operations.map(config => {
    const parsed = parseExpression(config.expression);
    if (!parsed) return { label: config.label, result: "Sintaxis inválida" };

    const values = parsed.variable ? extractValues(submissions, parsed.variable) : [];
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
          ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))
          : 0;
        break;
      case "MAX":
        result = values.length ? Math.max(...values) : 0;
        break;
      case "MIN":
        result = values.length ? Math.min(...values) : 0;
        break;
      default:
        result = "N/A";
    }

    return { label: config.label, result };
  });
};

/* =========================================================
   ================= COMPONENTE PRINCIPAL ==================
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

  const [schema, setSchema] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [operations, setOperations] = useState<OperationConfig[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentDataRef = useRef<any>({});
  const [trigger, setTrigger] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  /* ================= LIMPIEZA ================= */

  useEffect(() => {
    if (!isOpen) {
      setSchema(null);
      setSubmissions([]);
      setOperations([]);
      setCurrentIndex(0);
      currentDataRef.current = {};
    }
  }, [isOpen]);

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!isOpen || !questionId) return;

    setLoading(true);
    setError(null);

    getQuestionComponent(questionId)
      .then(res => {

        let parsed = res.question_structure;

        if (typeof parsed === "string") {
          parsed = JSON.parse(parsed);
        }

        const repeatConfig = parsed?.repeat_config;
        let preloadedData: any[] = [{}];

        if (repeatConfig?.repeat) {
          if (repeatConfig.data_repeat_type === "fixed") {
            const total = parseInt(repeatConfig.data_repeat_number) || 1;
            preloadedData = new Array(total).fill({});
          }

          if (repeatConfig.data_repeat_type === "array") {
            preloadedData =
              repeatConfig.data_repeat_config?.map((item: any) => ({ ...item })) || [{}];
          }
        }

        setSubmissions(preloadedData);
        setOperations(parsed.operations || []);
        setSchema(parsed);

        currentDataRef.current = preloadedData[0] || {};
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

  }, [isOpen, questionId]);

  /* ================= IFRAME ================= */

  useEffect(() => {

    if (!iframeRef.current) return;
    if (!schema) return;

    const iframe = iframeRef.current;

    iframe.onload = () => {
      iframe.contentWindow?.postMessage(
        {
          schema,
          submission: submissions[currentIndex]
        },
        "*"
      );
    };

  }, [schema, currentIndex]);

  /* ================= LISTENER ================= */

  useEffect(() => {

    const listener = (event: any) => {

      if (event.data?.type === "form-change") {

        currentDataRef.current = event.data.data;
        setTrigger(t => t + 1);

      }

    };

    window.addEventListener("message", listener);

    return () => window.removeEventListener("message", listener);

  }, []);

  /* ================= OPERACIONES ================= */

  const evaluatedResults = useMemo(() => {

    const fullData = [...submissions];

    fullData[currentIndex] = currentDataRef.current;

    return evaluateOperations(operations, fullData);

  }, [operations, submissions, currentIndex, trigger]);

  /* ================= NAV ================= */

  const handleNavigation = (direction: 1 | -1) => {

    setSubmissions(prev => {

      const copy = [...prev];
      copy[currentIndex] = currentDataRef.current;

      return copy;

    });

    const newIndex = currentIndex + direction;

    setCurrentIndex(newIndex);

  };

  const handleFinish = () => {

    const finalSubmissions = [...submissions];
    finalSubmissions[currentIndex] = currentDataRef.current;

    console.log("JSON FINAL:", finalSubmissions);

    onClose();

  };

  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">

      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden">

        {/* HEADER */}

        <div className="flex justify-between items-center p-4 bg-[#9B2347] text-white">

          <h2 className="text-xl font-bold">Vista Previa</h2>

          <button onClick={onClose}>
            <X size={24}/>
          </button>

        </div>

        {/* BODY */}

        <div className="p-6 overflow-y-auto bg-gray-50 flex-grow">

          {loading && <p>Cargando...</p>}

          {error && <p>{error}</p>}

          {schema && (

            <div className="space-y-6">

              <div className="bg-white border rounded-lg overflow-hidden">

                <iframe
                  ref={iframeRef}
                  src="/formio-preview.html"
                  className="w-full h-[450px]"
                />

              </div>

              {evaluatedResults.length > 0 && (

                <div className="bg-blue-50 p-4 rounded">

                  <h3 className="font-bold flex items-center gap-2 mb-4">

                    <Calculator size={18}/>
                    Totales

                  </h3>

                  <div className="grid grid-cols-2 gap-4">

                    {evaluatedResults.map((op,i)=>(
                      <div key={i} className="bg-white p-3 rounded shadow">

                        <div className="text-xs text-gray-500">
                          {op.label}
                        </div>

                        <div className="text-xl font-bold text-blue-700">
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

        {submissions.length > 1 && (

          <div className="flex justify-between p-4 bg-gray-100">

            <button
              disabled={currentIndex===0}
              onClick={()=>handleNavigation(-1)}
            >
              <ChevronLeft/>
            </button>

            <span>
              {currentIndex+1} / {submissions.length}
            </span>

            {currentIndex < submissions.length-1 ? (

              <button onClick={()=>handleNavigation(1)}>
                <ChevronRight/>
              </button>

            ) : (

              <button onClick={handleFinish}>
                <Save/>
              </button>

            )}

          </div>

        )}

      </div>

    </div>
  );
}