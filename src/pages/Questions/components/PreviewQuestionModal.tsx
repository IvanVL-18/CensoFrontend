import { X, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { getQuestionComponent } from "../Questions.service";
import { Form } from "@formio/react";

// Evitar error de TypeScript con src
const FormAny = Form as any;

export function PreviewQuestionModal({ isOpen, onClose, questionId }: { isOpen: boolean, onClose: () => void, questionId: string | number | null }) {
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === ESTADOS DEL PAGINADOR (Igual a `currentIteration` en formio_editor.js) ===
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paginatorData, setPaginatorData] = useState<any[]>([]);
  const [submissionsMap, setSubmissionsMap] = useState<{ [key: number]: any }>({});
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    if (isOpen && questionId) {
      setLoading(true);
      setError(null);
      setCurrentIndex(0);
      setSubmissionsMap({});
      setPaginatorData([]);
      setSchema(null);

      getQuestionComponent(questionId)
        .then(res => {
          let parsedSchema = res.question_structure;

          // Parseo robusto del JSON
          while (typeof parsedSchema === 'string') {
            try {
              parsedSchema = JSON.parse(parsedSchema);
            } catch (e) {
              console.error("Error al parsear JSON:", e);
              setError("El formato de la pregunta es inválido.");
              return;
            }
          }

          // Por si Laravel manda la data dentro de un array
          if (Array.isArray(parsedSchema) && parsedSchema.length > 0) {
            parsedSchema = parsedSchema[0];
          }

          // === MAGIA DE PAGINACIÓN EXTERNA (Como en formio_editor.js) ===
          // Buscamos las instituciones en repeat_config
          const repeatConfig = parsedSchema?.repeat_config || {};
          const instituciones = repeatConfig.data_repeat_config || parsedSchema?.data_repeat_config;

          if (repeatConfig.repeat && Array.isArray(instituciones) && instituciones.length > 0) {
            setPaginatorData(instituciones);
          } else {
            setPaginatorData([{ label: "Registro Único", value: "0" }]);
          }

          // Forzamos a que sea un formulario normal, NO WIZARD, para evitar que se rompan las sumas matemáticas
          if (parsedSchema && typeof parsedSchema === 'object') {
            parsedSchema.display = 'form';
          }

          setSchema(parsedSchema);
        })
        .catch(() => {
          setError("Error al obtener el componente desde el servidor.");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, questionId]);

  // Controles de Navegación (Igual a `changeIteration` en formio_editor.js)
  const handleNext = () => {
    if (currentIndex < paginatorData.length - 1) setCurrentIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const handleFinish = () => {
    console.log("Datos de todas las instituciones capturados: ", submissionsMap);
    onClose();
  };

  // Guardar datos de la iteración actual en tiempo real
  const handleChange = (e: any) => {
    setIsValid(e.isValid);
    if (e.data && Object.keys(e.data).length > 0) {
      setSubmissionsMap(prev => ({
        ...prev,
        [currentIndex]: { ...e.data }
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000ab] z-[60] flex items-center justify-center p-4">
      {/* INYECCIÓN DE CSS AISLADO: Solo se carga cuando el modal está abierto */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-iso/4.1.3/css/bootstrap-iso.min.css" />
      <link rel="stylesheet" href="https://cdn.form.io/formiojs/formio.full.min.css" />

      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl flex flex-col max-h-[90vh]">
        
        {/* Header (Usa Tailwind normal) */}
        <div className="flex justify-between items-center p-4 bg-red-900 text-white rounded-t-lg shrink-0">
          <div>
             <h2 className="text-xl font-bold">Vista Previa del Componente</h2>
             {paginatorData.length > 0 && (
               <p className="text-sm text-red-200 mt-1">
                  Institución: {paginatorData[currentIndex]?.label || paginatorData[currentIndex]?.value || "Desconocida"}
               </p>
             )}
          </div>
          <button onClick={onClose} className="hover:text-gray-300 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Body */}
        <div className="overflow-y-auto p-6 bg-gray-50 flex-grow min-h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-full">
               <p className="text-lg font-bold text-gray-500 animate-pulse">Cargando estructura y diseño...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          ) : schema ? (
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              
              {/* EL ENVOLTORIO MÁGICO: bootstrap-iso limita el CSS */}
              <div className="bootstrap-iso formio-clean-render">
                {/* ALERTA: El atributo key es obligatorio aquí. 
                   Fuerza a React a destruir y crear Form.io de cero al cambiar de página, 
                   permitiendo que las operaciones matemáticas funcionen perfectamente. 
                */}
                <FormAny 
                  key={`form-page-${currentIndex}`}
                  src={undefined as any}
                  form={schema} 
                  submission={{ data: submissionsMap[currentIndex] || {} }}
                  onChange={handleChange}
                  options={{ readOnly: false, noAlerts: true }} 
                />
              </div>

            </div>
          ) : (
            <p className="text-center text-gray-500 p-10">
              No hay estructura disponible para esta pregunta.
            </p>
          )}
        </div>

        {/* Footer: Paginador Externo */}
        {schema && !loading && paginatorData.length > 0 && (
          <div className="flex justify-between items-center p-4 bg-gray-100 border-t rounded-b-lg shrink-0">
             <button 
               onClick={handlePrev}
               disabled={currentIndex === 0}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                 currentIndex === 0 
                 ? "text-gray-400 bg-gray-200 cursor-not-allowed" 
                 : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
               }`}
             >
               <ChevronLeft size={20} /> Anterior
             </button>

             <span className="font-medium text-gray-600">
                Página {currentIndex + 1} de {paginatorData.length}
             </span>

             {currentIndex < paginatorData.length - 1 ? (
               <button 
                 onClick={handleNext}
                 className="flex items-center gap-2 px-6 py-2 bg-red-900 hover:bg-red-800 text-white rounded-lg font-medium shadow-md transition-all"
               >
                 Siguiente Institución <ChevronRight size={20} />
               </button>
             ) : (
               <button 
                 onClick={handleFinish}
                 className="flex items-center gap-2 px-6 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg font-medium shadow-md transition-all"
               >
                 <Save size={20} /> Finalizar
               </button>
             )}
          </div>
        )}

      </div>
    </div>
  );
}