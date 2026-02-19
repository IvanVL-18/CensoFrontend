import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { getQuestionComponent } from "../Questions.service";
import { Form } from "@formio/react";

export function PreviewQuestionModal({ isOpen, onClose, questionId }: { isOpen: boolean, onClose: () => void, questionId: string | number | null }) {
  const [schema, setSchema] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && questionId) {
      setLoading(true);
      setError(null);

      getQuestionComponent(questionId)
        .then(res => {
          let parsedSchema = res.question_structure;

          if (typeof parsedSchema === 'string') {
            try {
              parsedSchema = JSON.parse(parsedSchema);
            } catch (e) {
              console.error("Error al parsear JSON:", e);
              setError("El formato de la pregunta es inválido.");
              return;
            }
          }

          // === MAGIA DE PAGINACIÓN (WIZARD) ===
          // Si el JSON trae la configuración de repetición, lo transformamos
          if (parsedSchema.repeat_config?.repeat && Array.isArray(parsedSchema.repeat_config.data_repeat_config)) {
            const wizardPages = parsedSchema.repeat_config.data_repeat_config.map((institucion: any) => {
              // Hacemos una copia profunda de los componentes para cada institución
              const pageComponents = JSON.parse(JSON.stringify(parsedSchema.components));
              
              return {
                title: institucion.label, // El título de la pestaña/página
                key: `page_${institucion.number}`,
                type: "panel",
                components: pageComponents,
                tree: true // Agrupa las respuestas de esta página por separado
              };
            });

            // Modificamos el esquema para que Form.io lo trate como un formulario paginado
            parsedSchema.display = "wizard";
            parsedSchema.components = wizardPages;
          }

          setSchema(parsedSchema);
        })
        .catch(() => {
          setError("Error al obtener el componente desde el servidor.");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, questionId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#000000ab] z-[60] flex items-center justify-center p-4">
      {/* INYECCIÓN DE CSS AISLADO: Solo se carga cuando el modal está abierto */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-iso/4.1.3/css/bootstrap-iso.min.css" />
      <link rel="stylesheet" href="https://cdn.form.io/formiojs/formio.full.min.css" />

      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl flex flex-col max-h-[90vh]">
        
        {/* Header (Usa Tailwind normal) */}
        <div className="flex justify-between items-center p-4 bg-red-900 text-white rounded-t-lg shrink-0">
          <h2 className="text-xl font-bold">Vista Previa del Componente</h2>
          <button onClick={onClose} className="hover:text-gray-300 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Body */}
        <div className="overflow-y-auto p-6 bg-gray-50 h-full min-h-[400px]">
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
              
              {/* EL ENVOLTORIO MÁGICO: bootstrap-iso limita el CSS de Bootstrap solo a lo que esté aquí adentro */}
              <div className="bootstrap-iso">
                <Form {...({ form: schema, options: { readOnly: false } } as any)} />
              </div>

            </div>
          ) : (
            <p className="text-center text-gray-500 p-10">
              No hay estructura disponible para esta pregunta.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}