import { X, ChevronLeft, ChevronRight, Save, Calculator } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getQuestionComponent } from "../Questions.service";
import { Form } from "@formio/react";



const FormAny = Form as any;

/* =========================================================
   ================= MOTOR MATEMÁTICO ======================
   ========================================================= */

type OperationConfig = {
  label: string;
  expression: string;
};

// Extrae la operación y la variable (ej. SUMAR(Almacenacadtb))
const parseExpression = (expression: string) => {
  const match = expression.match(/(\w+)\(([^)]*)\)/);
  if (!match) return null;
  return {
    operation: match[1].toUpperCase(),
    variable: match[2]?.trim()
  };
};

// Extrae los valores ignorando nulos o vacíos para hacer las matemáticas globales
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
        result = values.length ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0;
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

  // Buffer para el Formulario Actual (Evita que Form.io pierda el Foco)
  const currentDataRef = useRef<any>({});
  // Disparador para actualizar los "Totales Generales" en la UI
  const [trigger, setTrigger] = useState(0);

  /* ================= LIMPIEZA Y FETCH ================= */
  
  // Limpia el modal si se cierra
  useEffect(() => {
    if (!isOpen) {
      setSchema(null);
      setSubmissions([]);
      setOperations([]);
      setCurrentIndex(0);
      currentDataRef.current = {};
    }
  }, [isOpen]);

  // Carga la pregunta cuando se abre
  useEffect(() => {
    if (!isOpen || !questionId) return;

    setLoading(true);
    setError(null);
    setSchema(null); // Limpieza inmediata para evitar mostrar el anterior
    setSubmissions([]);
    setOperations([]);
    setCurrentIndex(0);
    currentDataRef.current = {};

    getQuestionComponent(questionId)
      .then(res => {
        if (!res || !res.question_structure) {
          throw new Error("El componente está vacío o no tiene estructura asignada.");
        }

        let parsed = res.question_structure;
        if (typeof parsed === "string") {
          try {
            parsed = JSON.parse(parsed);
          } catch (e) {
            throw new Error("El JSON del componente es inválido.");
          }
        }

        // ================================================================
        // MAGIA: Buscar campos calculados y bloquearlos (disabled = true)
        // ================================================================
        const disableCalculatedFields = (components: any[]) => {
          if (!Array.isArray(components)) return;
          components.forEach((comp: any) => {
            // Si el componente tiene la propiedad calculateValue, lo bloqueamos
            if (comp.calculateValue && typeof comp.calculateValue === 'string' && comp.calculateValue.trim() !== '') {
              comp.disabled = true;
            }
            
            // Navegamos por las posibles estructuras anidadas de Form.io
            if (comp.components) disableCalculatedFields(comp.components);
            if (comp.columns) comp.columns.forEach((col: any) => disableCalculatedFields(col.components));
            if (comp.rows) comp.rows.forEach((row: any[]) => row.forEach((cell: any) => disableCalculatedFields(cell.components)));
          });
        };

        if (parsed.components) {
          disableCalculatedFields(parsed.components);
        }

        parsed.display = "form";
        const repeatConfig = parsed?.repeat_config;
        let preloadedData: any[] = [{}];

        // Configurar si es pregunta repetitiva
        if (repeatConfig?.repeat) {
          if (repeatConfig.data_repeat_type === "fixed") {
            const total = parseInt(repeatConfig.data_repeat_number) || 1;
            preloadedData = new Array(total).fill({});
          } else if (repeatConfig.data_repeat_type === "array") {
            preloadedData = repeatConfig.data_repeat_config?.map((item: any) => ({ ...item })) || [{}];
          }
        }

        setSubmissions(preloadedData);
        setOperations(parsed.operations || []);
        setSchema(parsed);
        currentDataRef.current = preloadedData[0] || {};
      })
      .catch((err) => setError(err.message || "Error al cargar la estructura del componente."))
      .finally(() => setLoading(false));
  }, [isOpen, questionId]);

  /* ================= CHANGE (TIEMPO REAL) ================= */
  const handleChange = (schemaEvento: any) => {
    if (schemaEvento.changed) {
      // Guardamos la info en la referencia (no dispara re-render, mantiene foco)
      currentDataRef.current = { ...schemaEvento.data };
      
      // Disparamos re-render SOLO para la sección de los "Totales Generales"
      setTrigger(t => t + 1);
    }
  };

  /* ================= OPERACIONES (EVALUACIÓN) ================= */
  const evaluatedResults = useMemo(() => {
    const fullData = [...submissions];
    // Insertamos la data actual (la que se está escribiendo) en la posición correcta
    if (fullData.length > 0) {
      fullData[currentIndex] = currentDataRef.current;
    }
    return evaluateOperations(operations, fullData);
  }, [operations, submissions, currentIndex, trigger]);

  /* ================= PAGINADOR Y MEMOIZACIÓN ================= */
  
  // Garantizamos que Form.io reciba un objeto estable y no se vuelva loco
  const submissionForPage = useMemo(() => {
    return { data: submissions[currentIndex] || {} };
  }, [submissions, currentIndex]);

  const handleNavigation = (direction: 1 | -1) => {
    // 1. Guardar formalmente la data actual en el arreglo global
    setSubmissions(prev => {
      const copy = [...prev];
      copy[currentIndex] = currentDataRef.current;
      return copy;
    });

    // 2. Mover índice y preparar la data de la siguiente página
    const newIndex = currentIndex + direction;
    setCurrentIndex(newIndex);
    currentDataRef.current = submissions[newIndex] || {};
  };

  const handleFinish = () => {
    const finalSubmissions = [...submissions];
    finalSubmissions[currentIndex] = currentDataRef.current;
    
    console.log("✅ JSON listo para enviar al backend:", finalSubmissions);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[95vh] overflow-hidden">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 bg-[#9B2347] text-white">
          <h2 className="text-xl font-bold">Vista Previa del Componente</h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto p-6 bg-gray-50 flex-grow">
          {loading && (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500 font-medium animate-pulse">Cargando maquetación...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center font-semibold">
              {error}
            </div>
          )}

          {!loading && schema && !error && (
            <div className="space-y-6">
              
              {/* Form.io Contenedor */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <FormAny
                  key={`form-${questionId}-${currentIndex}`} // Asegura que se limpie por completo al cambiar de página
                  form={schema}
                  submission={submissionForPage}
                  onChange={handleChange}
                  options={{ noAlerts: true, language: 'es' }}
                />
              </div>

              {/* Resultados Matemáticos Generales */}
              {evaluatedResults.length > 0 && (
                <div className="bg-blue-50/50 p-5 rounded-lg border border-blue-100">
                  <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Calculator size={20} /> Totales Generales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {evaluatedResults.map((op, i) => (
                      <div key={i} className="bg-white p-4 rounded-md border border-gray-200 shadow-sm text-center">
                        <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          {op.label}
                        </span>
                        <div className="text-2xl font-black text-blue-700">
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

        {/* FOOTER (Paginador) */}
        {!loading && !error && submissions.length > 1 && (
          <div className="flex justify-between items-center p-4 bg-gray-100 border-t border-gray-200">
            <button
              onClick={() => handleNavigation(-1)}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={18} /> Anterior
            </button>

            <span className="text-sm font-semibold text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
              Página {currentIndex + 1} de {submissions.length}
            </span>

            {currentIndex < submissions.length - 1 ? (
              <button
                onClick={() => handleNavigation(1)}
                className="flex items-center gap-1 px-4 py-2 bg-[#9B2347] text-white rounded-md shadow-sm hover:bg-[#7a1b38] transition-colors"
              >
                Siguiente <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 transition-colors"
              >
                <Save size={18} /> Guardar Registro
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}